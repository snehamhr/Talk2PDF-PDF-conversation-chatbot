Talk2PDF AI

Talk2PDF AI is a multi-document PDF assistant that turns uploaded PDFs into an interactive learning workspace.

Users can upload one or more PDF files, ask questions, generate summaries, create revision notes, solve document-related problems, compare concepts, and generate quizzes or flashcards. Answers are supported with page-aware evidence from the uploaded documents.


Key Capabilities
Upload and process multiple PDF documents
Extract text page by page
Clean repeated headers, footers, page numbers, and document noise
Divide document content into page-aware chunks
Generate semantic embeddings for document retrieval
Ask factual questions about uploaded PDFs
Generate full-document summaries
Explain complex content in simple language
Create exam-ready revision notes
Generate practice questions and quizzes
Create flashcards
Compare concepts across multiple documents
Solve calculations and document-related problems
Maintain short-term conversational context
Show supporting document citations
Display source document names and page numbers
Inspect randomly selected extracted chunks
Export cleaned pages and document chunks
Support light and dark interface themes
Technology Stack
Backend
Python
FastAPI
PyMuPDF
NumPy
Groq API
Hugging Face Inference API
Pydantic
Frontend
HTML
CSS
Vanilla JavaScript
Models
LLM: openai/gpt-oss-20b through Groq
Embeddings: sentence-transformers/all-MiniLM-L6-v2
Basic Application Flow
PDF Upload
    ↓
Page-wise Text Extraction
    ↓
Text Cleaning
    ↓
Page-aware Chunking
    ↓
Embedding Generation
    ↓
Semantic Retrieval
    ↓
Relevant Document Context
    ↓
LLM Response
    ↓
Answer with Page Citations
How It Works
The user uploads one or more PDF files.
Talk2PDF extracts text separately from every page.
Repeated document noise such as page numbers, headers, and footers is removed.
Cleaned text is divided into overlapping chunks.
Each chunk is converted into a semantic embedding.
When the user asks a question, Talk2PDF retrieves the most relevant chunks.
The selected document evidence is sent to the language model.
The generated response is displayed with supporting document and page references.

For broad requests such as summaries, study notes, quizzes, or document comparisons, Talk2PDF samples context from different portions of the uploaded documents instead of relying only on a single retrieved section.

Project Structure
Talk2PDF/
│
├── app/
│   ├── main.py
│   ├── config.py
│   │
│   └── static/
│       ├── index.html
│       ├── app.js
│       └── styles.css
│
├── .env
├── .env.example
├── requirements.txt
└── README.md
Local Run Instructions
1. Clone or open the project
git clone <your-repository-url>
cd Talk2PDF
2. Create a virtual environment
python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Activate it on macOS or Linux:

source venv/bin/activate
3. Install dependencies
pip install -r requirements.txt
4. Create the environment file

Create a .env file in the project root.

APP_NAME=Talk2PDF AI

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

HF_API_KEY=your_huggingface_api_key
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
5. Start the application
uvicorn app.main:app --reload
6. Open Talk2PDF
http://127.0.0.1:8000
Example Prompts
Summarize this PDF in simple language.
What are the most important concepts in this chapter?
Create exam-ready revision notes.
Generate ten practice questions from the uploaded documents.
Create a multiple-choice quiz with answers.
Compare the main arguments in the two PDFs.
Explain this formula step by step.
What does the author conclude?
Supported Document Behavior

Talk2PDF currently works best with:

Text-based PDFs
Research papers
Lecture notes
Textbooks
Reports
Articles
Study material
Technical documents
Documents with selectable text
Current Limitations
Scanned or image-only PDFs are not supported because OCR is not included.
Tables, diagrams, handwritten notes, and complex visual layouts may not be fully interpreted.
Extracted text quality depends on the internal structure of the PDF.
Very large PDFs may take longer to process.
Each PDF is currently limited to the configured maximum file size and page count.
Uploaded documents and conversations are stored only in temporary server memory.
Refreshing or restarting the application clears the current session.
User authentication and saved chat history are not included.
Document embeddings are not stored permanently.
The system relies on external Groq and Hugging Face APIs.
API availability and rate limits may affect response time.
Generated answers may still contain mistakes or incomplete interpretations.
Citation relevance indicates retrieval similarity, not guaranteed factual correctness.
Broad summaries use sampled document sections when the total document context is too large.
The application does not currently support Word files, PowerPoint files, spreadsheets, or websites.
Conversation memory is limited to a fixed number of recent messages.
Unrelated questions may be refused when sufficient document context is not available.
Privacy

Talk2PDF currently operates in temporary guest mode.

Uploaded PDF text, generated embeddings, and chat messages remain in the active server session only. The information is removed when the application restarts or the session is lost.

Users should avoid uploading confidential, personal, medical, financial, or otherwise sensitive documents to a public instance.

Project Purpose

Talk2PDF was developed as a portfolio project demonstrating practical AI engineering skills, including:

Retrieval-Augmented Generation
Document ingestion
Semantic search
Prompt design
LLM integration
Embedding APIs
FastAPI development
Multi-document question answering
Citation-aware responses
Frontend and backend integration
Temporary conversational memory
Document-processing workflows
AI application error handling
Future Improvements
OCR support for scanned PDFs
Persistent vector database
User authentication
Saved conversations
Permanent document workspaces
Streaming responses
PDF page previews
Improved table extraction
Reranking retrieved chunks
Automated retrieval evaluation
Citation accuracy testing
Additional file formats
Local embedding model support
Document-level filters
Chat export
Improved mobile navigation
Disclaimer

Talk2PDF is an educational and productivity tool. Generated answers should be reviewed against the original documents, especially when the content relates to academic assessment, medicine, law, finance, or other high-stakes topics.