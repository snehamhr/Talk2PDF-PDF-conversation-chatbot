# Talk2PDF

Talk2PDF is a multi-document PDF assistant built with FastAPI, Groq, Hugging Face Inference API, semantic retrieval, and a responsive web interface.

The application extracts text from uploaded PDFs, creates page-aware chunks, retrieves relevant document sections, and uses them as context to generate clear, document-grounded responses with page citations.

## Features

- Upload and process multiple PDF documents
- Ask questions about uploaded PDFs
- Generate summaries in simple language
- Create revision notes and study guides
- Generate practice questions, quizzes, and flashcards
- Compare concepts across multiple documents
- Solve document-related calculations and problems
- Page-wise PDF text extraction
- Repeated header, footer, and page-number cleanup
- Page-aware overlapping text chunks
- Semantic retrieval using Hugging Face embeddings
- Groq-powered language-model responses
- Short-term conversation memory
- Source citations with document names and page numbers
- Random chunk inspection
- Cleaned-page and chunk export
- Responsive light and dark user interface
- No permanent backend conversation storage

## Technology Stack

### Backend

- Python
- FastAPI
- Uvicorn
- PyMuPDF
- NumPy
- Groq API
- Hugging Face Inference API
- Pydantic
- Pydantic Settings

### Retrieval

- Hugging Face Inference API
- `sentence-transformers/all-MiniLM-L6-v2`
- Normalized embedding vectors
- Cosine-similarity retrieval
- Page-aware document chunks

### Frontend

- HTML
- CSS
- JavaScript

## How Talk2PDF Works

```text
PDF upload
    ↓
Page-wise text extraction
    ↓
Text cleaning
    ↓
Page-aware chunking
    ↓
Hugging Face embedding generation
    ↓
Semantic retrieval
    ↓
Relevant document context
    ↓
Groq language model
    ↓
Answer with page citations
```

For direct questions, Talk2PDF converts the user query into an embedding and compares it with the stored document-chunk embeddings.

For broad tasks such as summaries, revision notes, quizzes, flashcards, or comparisons, the application selects context from different parts of the uploaded documents before generating the response.

## Document Processing

The PDF-processing pipeline:

1. Validates each uploaded file
2. Opens the PDF with PyMuPDF
3. Extracts text page by page
4. Identifies blank or image-only pages
5. Removes repeated headers and footers
6. Removes isolated page numbers and unnecessary document noise
7. Divides the cleaned text into overlapping chunks
8. Preserves the page numbers connected to each chunk
9. Generates normalized semantic embeddings
10. Stores the documents, pages, chunks, embeddings, and messages in the active server session

Current configuration:

```text
Maximum PDF size: 20 MB
Maximum uploaded files: 5
Maximum pages per PDF: 250
Maximum chunks per session: 1200
Chunk size: approximately 900 characters
Chunk overlap: approximately 150 characters
Minimum chunk size: 80 characters
```

## Supported Tasks

Talk2PDF can handle requests such as:

### Ask

```text
What is the main conclusion of this paper?
```

### Summarize

```text
Summarize this PDF in simple language.
```

### Study

```text
Create exam-ready revision notes from this chapter.
```

### Generate Questions

```text
Generate ten practice questions from the uploaded documents.
```

### Create a Quiz

```text
Create a multiple-choice quiz with answers.
```

### Create Flashcards

```text
Make flashcards from the most important concepts.
```

### Compare Documents

```text
Compare the main arguments in these two PDFs.
```

### Solve Problems

```text
Explain this formula step by step.
```

## Project Structure

```text
talk2pdf/
│
├── app/
│   ├── main.py
│   ├── config.py
│   │
│   └── static/
│       ├── index.html
│       ├── styles.css
│       └── app.js
│
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## Local Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Activate it on macOS or Linux:

```bash
source .venv/bin/activate
```

Install the required packages:

```bash
python -m pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the project root.

```env
APP_NAME=Talk2PDF

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

HF_API_KEY=your_huggingface_token
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

SIMILARITY_THRESHOLD=0.30
RELATED_TOPIC_THRESHOLD=0.18

TOP_K=6
SOLVE_TOP_K=8
BROAD_CONTEXT_CHUNKS=30
MAX_SUMMARY_CHUNKS=80
MEMORY_MESSAGES=8

CHUNK_SIZE=900
CHUNK_OVERLAP=150
MINIMUM_CHUNK_SIZE=80

MAX_FILE_SIZE_MB=20
MAX_FILES=5
MAX_PAGES=250
MAX_CHUNKS=1200

MAX_QUESTION_LENGTH=4000
MAX_GENERATION_TOKENS=1400
GENERATION_TEMPERATURE=0.15
```

The actual `.env` file must not be committed to GitHub.

The Groq and Hugging Face API keys must remain private and must not be exposed in frontend files.

## Run the Application Locally

```bash
python -m uvicorn app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

## Conversation Memory

Talk2PDF keeps a limited number of recent messages as short-term conversation context.

The current implementation does not permanently store conversations in a database.

This means:

- Conversation memory exists only in the active server session
- Clicking **New conversation** clears the visible conversation and starts a new context
- Refreshing the page starts a new temporary browser session
- Restarting the backend removes uploaded documents, chunks, embeddings, and chat history
- Conversations are not shared between users
- Conversations are not saved permanently

## Data Inspection

Talk2PDF includes developer-facing inspection tools.

Users can:

- Inspect a random extracted chunk
- Download all document chunks as JSON
- Download cleaned pages as JSON
- Review document names, page numbers, word counts, and character counts

These tools help verify that the PDF text was extracted and chunked correctly.

## Citation Behavior

Talk2PDF attaches citation IDs to document-supported responses.

Each citation can include:

- Citation number
- Document name
- Page number or page range
- Retrieved text excerpt
- Semantic-retrieval score

The retrieval score represents similarity between the user request and the selected document chunk. It does not guarantee that every generated statement is fully accurate.

## Supported Documents

Talk2PDF works best with:

- Text-based PDFs
- Research papers
- Lecture notes
- Textbooks
- Reports
- Articles
- Study guides
- Technical documents
- PDFs with selectable text

## Limitations

- Scanned or image-only PDFs are not supported because OCR is not included
- Handwritten notes are not supported
- Tables, figures, diagrams, and complex visual layouts may not be interpreted correctly
- PDF extraction quality depends on the internal document structure
- Multi-column PDFs may produce imperfect reading order
- Large files may take longer to process
- Uploaded documents and embeddings are stored only in temporary server memory
- Refreshing or restarting the application clears the current session
- User authentication is not included
- Saved chat history is not included
- Persistent document storage is not included
- A vector database is not currently used
- Groq API availability affects response generation
- Hugging Face API availability affects embedding generation
- API rate limits may affect response time
- Generated answers may contain mistakes or incomplete interpretations
- Citation relevance does not guarantee factual correctness
- Broad summaries may use selected document sections when the complete context is too large
- Conversation memory is limited to a fixed number of recent messages
- Word files, PowerPoint files, spreadsheets, images, and websites are not currently supported
- Clearly unrelated questions may receive an out-of-scope response

## Privacy

Talk2PDF does not intentionally store uploaded documents or conversations in a permanent backend database.

PDF text, document chunks, embeddings, and chat messages remain inside the active in-memory server session.

Users should avoid uploading confidential, personal, medical, financial, legal, or otherwise sensitive documents to a public instance.

API keys are stored as environment variables and are not exposed in the frontend.

## Project Purpose

Talk2PDF was created as a portfolio project to demonstrate practical AI-engineering skills, including:

- Retrieval-Augmented Generation
- Multi-document ingestion
- PDF text extraction
- Semantic search
- Embedding APIs
- Prompt design
- LLM integration
- FastAPI development
- Multi-document question answering
- Citation-aware responses
- Intent detection
- Short-term conversation memory
- Frontend and backend integration
- Document-processing workflows
- AI application error handling

## Disclaimer

Talk2PDF is an educational and productivity tool.

Generated responses should be checked against the original documents, especially for academic, medical, legal, financial, or other high-stakes use cases.
