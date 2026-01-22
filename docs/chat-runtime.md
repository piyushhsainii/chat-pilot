
# Chat Runtime (Vercel AI SDK)

## Overview
The chat runtime is built on the **Vercel AI SDK** to provide a provider-agnostic interface that supports streaming, tool calling, and structured outputs.

## LLM Configuration
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.1` (optimized for RAG consistency)
- **Runtime**: Edge Compatible

## Prompt assembly
The pipeline follows this flow:
1. **Embedding**: Convert user query to vector.
2. **Retrieval**: Query Supabase `match_documents` for top 3-5 chunks.
3. **Augmentation**: Inject chunks into the `system` instruction block.
4. **Generation**: Stream the response back to the widget.

## Example Implementation
```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages, botId } = await req.json();
  // 1. Fetch Bot Config & Context
  // 2. Stream Response
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });
  return result.toDataStreamResponse();
}
```
