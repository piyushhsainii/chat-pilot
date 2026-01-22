
# KnovaAI System Architecture

## Overview
KnovaAI is a multi-tenant SaaS designed for high-performance knowledge retrieval.

## Data Flow
1. **Ingestion**: n8n triggers on file upload/URL submit -> text extraction -> chunking (300-500 tokens) -> embedding via `text-embedding-004` -> storage in Vector DB (Pinecone/Supabase Vector).
2. **Retrieval**: User query -> Embedding -> Similarity Search -> Top-K Context Selection.
3. **Execution**: Context + System Prompt -> Gemini 3 Pro -> Response.

## Multi-Tenancy
Each `bot_id` acts as a hard boundary for data retrieval, ensuring cross-customer data leakage is impossible.
