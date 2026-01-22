
# Supabase Database Setup

Follow these steps to initialize your SaaS backend:

## 1. Create a New Project
Go to the [Supabase Dashboard](https://app.supabase.com) and create a new project.

## 2. Run the Schema Script
Copy the contents of `supabase_schema.sql` and paste them into the **SQL Editor** in your Supabase dashboard. Run the script to generate all tables and the vector search function.

## 3. Vector Embeddings
The `documents` table is configured with a `VECTOR(768)` column. 
- If using **Gemini text-embedding-004**, keep it at `768`.
- If using **OpenAI text-embedding-3-small**, use `1536`.

## 4. Connecting your Dashboard
Update your environment variables in your frontend:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for ingestion)
```

## 5. Deployment
The `match_documents` function is what the Chat Runtime API calls to perform retrieval-augmented generation.
