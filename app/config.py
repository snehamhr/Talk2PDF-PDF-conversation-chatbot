from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DocMind AI"

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"

    hf_api_key: str = ""
    hf_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    similarity_threshold: float = 0.30
    related_topic_threshold: float = 0.18

    top_k: int = 6
    solve_top_k: int = 8
    broad_context_chunks: int = 30
    max_summary_chunks: int = 80
    memory_messages: int = 8

    chunk_size: int = 900
    chunk_overlap: int = 150
    minimum_chunk_size: int = 80

    max_file_size_mb: int = 20
    max_files: int = 5
    max_pages: int = 250
    max_chunks: int = 1200

    max_question_length: int = 4000
    max_generation_tokens: int = 1400
    generation_temperature: float = 0.15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def settings() -> Settings:
    return Settings()