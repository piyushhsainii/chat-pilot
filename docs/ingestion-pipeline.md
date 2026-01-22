
# Ingestion Pipeline (n8n)

## Workflow Steps
1. **Webhook Trigger**: Receives `bot_id`, `source_type`, and the payload.
2. **Cleaning**: HTML tags stripped, whitespace normalized.
3. **Chunking**: Overlapping chunks to maintain context across boundaries.
4. **Vector Sync**: Metadata includes `source_url`, `timestamp`, and `bot_id`.

## Retry Logic
Failed documents are moved to a `status: failed` state in the DB and queued for a 3-tier exponential backoff retry.
