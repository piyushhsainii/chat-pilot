type GenerateChatHTMLParams = {
  botId: string;
  name: string;
  theme: "light" | "dark";
  primary: string; // hex with or without #
  textColor: string; // hex with or without #
  welcomeMessage: string;
  embedded: boolean;
  launcherSurface?: "solid" | "glass" | "liquid";
  panelSurface?: "solid" | "glass";
};

function normalizeHexNoHash(input: string, fallback: string) {
  const raw = String(input ?? "").trim();
  const cleaned = raw.replace(/^#+/, "");
  return cleaned || fallback;
}

export function generateChatHTML({
  botId,
  name,
  theme,
  primary,
  textColor,
  welcomeMessage,
  embedded,
  launcherSurface = "glass",
  panelSurface = "solid",
}: GenerateChatHTMLParams) {
  const primaryNoHash = normalizeHexNoHash(primary, "");
  const textNoHash = normalizeHexNoHash(textColor, "ffffff");

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
        primary: "#${primaryNoHash}",
        textColor: "#${textNoHash}",
        welcomeMessage: "${welcomeMessage}",
        launcherSurface: "${launcherSurface}",
        panelSurface: "${panelSurface}",
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
