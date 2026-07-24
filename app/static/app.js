const state = {
  sessionId: "",
  documents: [],
  conversationId: null,
  messages: [],
  busy: false
};

const $ = (id) => document.getElementById(id);

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
  );

async function parseJson(response) {
  let data = {};

  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail || data);

    throw new Error(detail || "Request failed.");
  }

  return data;
}

function showError(message) {
  const errorBox = $("error");

  if (!errorBox) {
    return;
  }

  errorBox.textContent = message;
  errorBox.classList.remove("hidden");

  window.clearTimeout(showError.timer);

  showError.timer = window.setTimeout(() => {
    errorBox.classList.add("hidden");
  }, 8000);
}

async function startSession() {
  try {
    const response = await fetch("/api/session", {
      method: "POST"
    });

    const data = await parseJson(response);
    state.sessionId = data.session_id;
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Unable to start a guest session."
    );
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function renderDocuments() {
  const documentCount = $("docCount");
  const pageMetric = $("pageMetric");
  const ready = $("ready");
  const question = $("question");
  const docs = $("docs");

  if (documentCount) {
    documentCount.textContent = String(state.documents.length);
  }

  const indexedPages = state.documents.reduce(
    (total, document) =>
      total + Number(document.indexed_pages || 0),
    0
  );

  if (pageMetric) {
    pageMetric.textContent = `${indexedPages} indexed pages`;
  }

  if (ready) {
    ready.textContent = state.documents.length
      ? `✓ ${state.documents.length} document${
          state.documents.length > 1 ? "s" : ""
        } ready`
      : "";
  }

  if (question) {
    question.disabled =
      !state.documents.length || state.busy;

    question.placeholder = state.documents.length
      ? "Ask, summarize, solve, compare, or create study material…"
      : "Upload PDFs to begin…";
  }

  if (!docs) {
    return;
  }

  if (!state.documents.length) {
    docs.innerHTML =
      '<div class="empty">Uploaded PDFs appear here.</div>';

    return;
  }

  docs.innerHTML = state.documents
    .map(
      (document) => `
        <div class="doc">
          <div class="docIcon">▤</div>

          <div class="docMeta">
            <b title="${esc(document.name)}">
              ${esc(document.name)}
            </b>

            <small>
              ${Number(document.indexed_pages || 0)} indexed pages ·
              ${Number(document.chunk_count || 0)} chunks ·
              ${formatBytes(Number(document.size_bytes || 0))}
            </small>
          </div>

          <button
            class="trash"
            type="button"
            data-delete="${esc(document.document_id)}"
            aria-label="Delete ${esc(document.name)}"
          >
            ×
          </button>
        </div>
      `
    )
    .join("");

  document
    .querySelectorAll("[data-delete]")
    .forEach((button) => {
      button.onclick = () =>
        removeDocument(button.dataset.delete);
    });
}

async function removeDocument(documentId) {
  if (
    !state.sessionId ||
    !documentId ||
    state.busy
  ) {
    return;
  }

  try {
    await parseJson(
      await fetch(
        `/api/session/${encodeURIComponent(
          state.sessionId
        )}/document/${encodeURIComponent(documentId)}`,
        {
          method: "DELETE"
        }
      )
    );

    state.documents = state.documents.filter(
      (document) =>
        document.document_id !== documentId
    );

    renderDocuments();
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Unable to delete the document."
    );
  }
}

function validateFiles(files) {
  if (!files.length) {
    return null;
  }

  const invalid = files.find((file) => {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    return (
      !isPdf ||
      file.size > 20 * 1024 * 1024
    );
  });

  if (invalid) {
    return `${invalid.name}: only PDF files up to 20 MB are allowed.`;
  }

  return null;
}

async function upload(fileList) {
  const files = Array.from(fileList || []);

  if (
    !files.length ||
    !state.sessionId ||
    state.busy
  ) {
    return;
  }

  const validationError = validateFiles(files);

  if (validationError) {
    showError(validationError);
    return;
  }

  const drop = $("drop");
  const title = $("dropTitle");
  const subtitle = $("dropSub");

  const stages = [
    "Validating PDFs",
    "Extracting page-wise text",
    "Cleaning document noise",
    "Creating page-aware chunks",
    "Generating semantic embeddings",
    "Indexing document knowledge"
  ];

  let stageIndex = 0;

  state.busy = true;
  renderDocuments();

  if (drop) {
    drop.classList.add("processing");
  }

  if (title) {
    title.textContent = stages[0];
  }

  if (subtitle) {
    subtitle.textContent =
      "Please keep this tab open";
  }

  const timer = window.setInterval(() => {
    stageIndex = Math.min(
      stageIndex + 1,
      stages.length - 1
    );

    if (title) {
      title.textContent =
        stages[stageIndex];
    }
  }, 1700);

  try {
    const form = new FormData();

    form.append(
      "session_id",
      state.sessionId
    );

    files.forEach((file) => {
      form.append("files", file);
    });

    const response = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: form
      }
    );

    const result =
      await parseJson(response);

    state.documents.push(
      ...(result.documents || [])
    );

    renderDocuments();

    if (result.errors?.length) {
      showError(
        result.errors
          .map(
            (item) =>
              `${item.name}: ${item.error}`
          )
          .join(" | ")
      );
    }
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Document upload failed."
    );
  } finally {
    window.clearInterval(timer);

    state.busy = false;

    if (drop) {
      drop.classList.remove("processing");
    }

    if (title) {
      title.textContent =
        "Drop PDFs here or browse";
    }

    if (subtitle) {
      subtitle.textContent =
        "Multiple files · maximum 20 MB each";
    }

    if ($("fileInput")) {
      $("fileInput").value = "";
    }

    renderDocuments();
  }
}

function addMessage(
  role,
  text,
  citations = [],
  metadata = {}
) {
  state.messages.push({
    role,
    text,
    citations,
    intent: metadata.intent || null,
    bestSimilarity:
      metadata.bestSimilarity ?? null
  });

  if ($("hero")) {
    $("hero").classList.add("hidden");
  }

  renderMessages();
}

function formatInlineText(text) {
  let output = esc(text);

  output = output.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  output = output.replace(
    /__(.*?)__/g,
    "<strong>$1</strong>"
  );

  output = output.replace(
    /`([^`]+)`/g,
    "<code>$1</code>"
  );

  output = output.replace(
    /\[(\d+)\]/g,
    '<span class="inlineCitation">[$1]</span>'
  );

  return output;
}

function isSectionHeading(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.length > 90) {
    return false;
  }

  if (
    trimmed.startsWith("•") ||
    /^\d+[.)]\s/.test(trimmed)
  ) {
    return false;
  }

  if (trimmed.endsWith(":")) {
    return true;
  }

  const commonHeadings = [
    "overview",
    "summary",
    "key points",
    "main ideas",
    "important concepts",
    "definitions",
    "examples",
    "solution",
    "steps",
    "final answer",
    "conclusion",
    "revision points",
    "easy questions",
    "medium questions",
    "challenging questions",
    "answer key",
    "flashcards",
    "similarities",
    "differences"
  ];

  return commonHeadings.includes(
    trimmed.toLowerCase()
  );
}

function renderStructuredText(text) {
  const normalized = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n");

  let html = "";
  let paragraphLines = [];
  let listType = null;
  let listItems = [];

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    const paragraph = paragraphLines
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (paragraph) {
      html += `<p>${formatInlineText(
        paragraph
      )}</p>`;
    }

    paragraphLines = [];
  }

  function flushList() {
    if (
      !listType ||
      !listItems.length
    ) {
      listType = null;
      listItems = [];
      return;
    }

    const tag =
      listType === "ordered"
        ? "ol"
        : "ul";

    html += `<${tag}>`;

    listItems.forEach((item) => {
      html += `<li>${formatInlineText(
        item
      )}</li>`;
    });

    html += `</${tag}>`;

    listType = null;
    listItems = [];
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const bulletMatch = line.match(
      /^(?:•|[-*+])\s*(.+)$/
    );

    const numberedMatch = line.match(
      /^(\d+)[.)]\s+(.+)$/
    );

    if (bulletMatch) {
      flushParagraph();

      if (listType !== "unordered") {
        flushList();
        listType = "unordered";
      }

      listItems.push(
        bulletMatch[1].trim()
      );

      return;
    }

    if (numberedMatch) {
      flushParagraph();

      if (listType !== "ordered") {
        flushList();
        listType = "ordered";
      }

      listItems.push(
        numberedMatch[2].trim()
      );

      return;
    }

    if (isSectionHeading(line)) {
      flushParagraph();
      flushList();

      html += `<h4>${formatInlineText(
        line.replace(/:$/, "")
      )}</h4>`;

      return;
    }

    flushList();
    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();

  return html;
}

function renderMessages() {
  const messages = $("messages");

  if (!messages) {
    return;
  }

  messages.innerHTML = state.messages
    .map(
      (message, messageIndex) => `
        <article class="message ${message.role}">
          <div class="avatar">
            ${
              message.role === "assistant"
                ? "✦"
                : "You"
            }
          </div>

          <div class="messageContent">
            <div class="msgLabel">
              ${
                message.role === "assistant"
                  ? "Talk2PDF"
                  : "You"
              }

              ${
                message.role === "assistant" &&
                message.intent
                  ? `
                    <span class="intentBadge">
                      ${esc(message.intent)}
                    </span>
                  `
                  : ""
              }
            </div>

            <div class="msgText">
              ${renderStructuredText(
                message.text
              )}
            </div>

            ${
              message.citations?.length
                ? `
                  <div class="citations">
                    ${message.citations
                      .map(
                        (citation) => `
                          <button
                            type="button"
                            data-cite="${messageIndex}:${citation.citation_id}"
                          >
                            [${citation.citation_id}]
                            ${esc(
                              citation.document_name
                            )} ·
                            ${
                              citation.page_start ===
                              citation.page_end
                                ? `p. ${citation.page_start}`
                                : `pp. ${citation.page_start}-${citation.page_end}`
                            }
                          </button>
                        `
                      )
                      .join("")}
                  </div>
                `
                : ""
            }
          </div>
        </article>
      `
    )
    .join("");

  document
    .querySelectorAll("[data-cite]")
    .forEach((button) => {
      button.onclick = () => {
        const [
          messageIndex,
          citationId
        ] = button.dataset.cite
          .split(":")
          .map(Number);

        const message =
          state.messages[messageIndex];

        const citation =
          message?.citations?.find(
            (item) =>
              item.citation_id === citationId
          );

        if (citation) {
          openSource(citation);
        }
      };
    });

  if ($("chat")) {
    $("chat").scrollTop =
      $("chat").scrollHeight;
  }
}

function thinking(enabled) {
  const existing = $("thinking");

  if (enabled && !existing) {
    $("messages")?.insertAdjacentHTML(
      "beforeend",
      `
        <article
          id="thinking"
          class="message assistant"
        >
          <div class="avatar">✦</div>

          <div class="messageContent">
            <div class="msgLabel">
              Talk2PDF
            </div>

            <div class="thinking">
              <i></i>
              <i></i>
              <i></i>
              Reading context and preparing a clear answer
            </div>
          </div>
        </article>
      `
    );
  }

  if (!enabled && existing) {
    existing.remove();
  }

  if ($("chat")) {
    $("chat").scrollTop =
      $("chat").scrollHeight;
  }
}

async function ask(text) {
  const questionElement = $("question");

  const question = String(
    text ||
      questionElement?.value ||
      ""
  ).trim();

  if (
    !question ||
    !state.documents.length ||
    !state.sessionId ||
    state.busy
  ) {
    return;
  }

  if (questionElement) {
    questionElement.value = "";
  }

  state.busy = true;

  if ($("send")) {
    $("send").disabled = true;
  }

  renderDocuments();

  addMessage(
    "user",
    question
  );

  thinking(true);

  try {
    const response = await fetch(
      "/api/ask",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          session_id:
            state.sessionId,
          question,
          conversation_id:
            state.conversationId
        })
      }
    );

    const result =
      await parseJson(response);

    state.conversationId =
      result.conversation_id;

    thinking(false);

    addMessage(
      "assistant",
      result.answer,
      result.citations || [],
      {
        intent: result.intent,
        bestSimilarity:
          result.best_similarity
      }
    );
  } catch (error) {
    thinking(false);

    showError(
      error instanceof Error
        ? error.message
        : "Unable to generate an answer."
    );
  } finally {
    state.busy = false;

    renderDocuments();

    if ($("send")) {
      $("send").disabled =
        !String(
          $("question")?.value || ""
        ).trim();
    }
  }
}

function openSource(citation) {
  if (!citation) {
    return;
  }

  $("sourceName").textContent =
    citation.document_name;

  $("sourcePage").textContent =
    citation.page_start ===
    citation.page_end
      ? `Page ${citation.page_start}`
      : `Pages ${citation.page_start}–${citation.page_end}`;

  $("sourceScore").textContent =
    `${Math.round(
      Number(
        citation.similarity || 0
      ) * 100
    )}% relevance`;

  $("sourceText").textContent =
    citation.excerpt;

  $("sourcePanel").classList.remove(
    "hidden"
  );
}

function newConversation() {
  state.messages = [];
  state.conversationId = null;

  if ($("messages")) {
    $("messages").innerHTML = "";
  }

  if ($("hero")) {
    $("hero").classList.remove(
      "hidden"
    );
  }

  if ($("question")) {
    $("question").value = "";
  }

  if ($("send")) {
    $("send").disabled = true;
  }

  if ($("sourcePanel")) {
    $("sourcePanel").classList.add(
      "hidden"
    );
  }
}

function toggleTheme() {
  const html =
    document.documentElement;

  const isDark =
    html.dataset.theme === "dark";

  html.dataset.theme = isDark
    ? "light"
    : "dark";

  if ($("themeBtn")) {
    $("themeBtn").textContent =
      isDark ? "☾" : "☀";
  }
}

function downloadSessionData(type) {
  if (!state.sessionId) {
    showError(
      "Session is not ready."
    );

    return;
  }

  const endpoint =
    type === "pages"
      ? `/api/session/${encodeURIComponent(
          state.sessionId
        )}/pages/export`
      : `/api/session/${encodeURIComponent(
          state.sessionId
        )}/chunks/export`;

  window.open(
    endpoint,
    "_blank",
    "noopener,noreferrer"
  );
}

async function inspectRandomChunk() {
  if (
    !state.sessionId ||
    !state.documents.length
  ) {
    showError(
      "Upload at least one PDF first."
    );

    return;
  }

  try {
    const result = await parseJson(
      await fetch(
        `/api/session/${encodeURIComponent(
          state.sessionId
        )}/chunks?limit=1&random_sample=true`
      )
    );

    const chunk =
      result.chunks?.[0];

    if (!chunk) {
      throw new Error(
        "No chunk is available."
      );
    }

    $("inspectTitle").textContent =
      `${chunk.document_name} · chunk ${
        chunk.chunk_index + 1
      }`;

    $("inspectMeta").textContent =
      `${
        chunk.pages.length === 1
          ? `Page ${chunk.pages[0]}`
          : `Pages ${chunk.pages[0]}–${
              chunk.pages[
                chunk.pages.length - 1
              ]
            }`
      } · ${chunk.word_count} words · ${
        chunk.character_count
      } characters`;

    $("inspectText").textContent =
      chunk.text;

    $("inspectModal").classList.remove(
      "hidden"
    );
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Unable to inspect a chunk."
    );
  }
}

if ($("fileInput")) {
  $("fileInput").onchange = (event) => {
    upload(event.target.files);
  };
}

if ($("attach")) {
  $("attach").onclick = () => {
    $("fileInput")?.click();
  };
}

if ($("drop")) {
  $("drop").ondragover = (event) => {
    event.preventDefault();

    $("drop").style.borderStyle =
      "solid";
  };

  $("drop").ondragleave = () => {
    $("drop").style.borderStyle =
      "dashed";
  };

  $("drop").ondrop = (event) => {
    event.preventDefault();

    $("drop").style.borderStyle =
      "dashed";

    upload(
      event.dataTransfer.files
    );
  };
}

if ($("askForm")) {
  $("askForm").onsubmit = (event) => {
    event.preventDefault();
    ask();
  };
}

if ($("question")) {
  $("question").oninput = (event) => {
    $("send").disabled =
      !event.target.value.trim() ||
      state.busy;
  };

  $("question").onkeydown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      ask();
    }
  };
}

document
  .querySelectorAll(".prompts button")
  .forEach((button) => {
    button.onclick = () => {
      ask(
        button.dataset.prompt ||
          button.textContent
      );
    };
  });

if ($("newChat")) {
  $("newChat").onclick =
    newConversation;
}

if ($("themeBtn")) {
  $("themeBtn").onclick =
    toggleTheme;
}

if ($("closeSource")) {
  $("closeSource").onclick = () => {
    $("sourcePanel").classList.add(
      "hidden"
    );
  };
}

if ($("inspectChunk")) {
  $("inspectChunk").onclick =
    inspectRandomChunk;
}

if ($("downloadChunks")) {
  $("downloadChunks").onclick = () => {
    downloadSessionData("chunks");
  };
}

if ($("downloadPages")) {
  $("downloadPages").onclick = () => {
    downloadSessionData("pages");
  };
}

if ($("closeInspect")) {
  $("closeInspect").onclick = () => {
    $("inspectModal").classList.add(
      "hidden"
    );
  };
}

startSession();