type GenerateChatHTMLParams = {
  botId: string;
  name: string;
  theme: "light" | "dark";
  primary: string; // hex without #
  textColor: string; // hex without #
  welcomeMessage: string;
  embedded: boolean;
};

export function generateChatHTML({
  botId,
  name,
  theme,
  primary,
  textColor,
  welcomeMessage,
  embedded,
}: GenerateChatHTMLParams) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body style="margin:0;padding:0;">
    <script>
      window.__CHAT_WIDGET__ = {
        botId: "${botId}",
        name: "${name}",
        theme: "${theme}",
        primary: "#${primary}",
        textColor: "#${textColor}",
        welcomeMessage: "${welcomeMessage}",
        embedded: ${embedded}
      };
    </script>

    <script
      src="${process.env.NEXT_PUBLIC_APP_URL}/widget.js"
      async
    ></script>
  </body>
</html>
`;
}
