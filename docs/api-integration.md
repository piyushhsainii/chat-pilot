
# Integration Docs

## 1. JavaScript Widget
Add this to your site's `<head>` or `<body>`:
```html
<script 
  src="https://knova.ai/widget.js" 
  data-bot-id="YOUR_BOT_ID"
  data-theme="dark">
</script>
```

## 2. REST API (Premium)
**Endpoint**: `POST /api/v1/chat`
**Headers**: `Authorization: Bearer [API_KEY]`
**Body**:
```json
{
  "bot_id": "uuid",
  "message": "Hello world",
  "stream": true
}
```
