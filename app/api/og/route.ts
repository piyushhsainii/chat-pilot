import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") ?? "Chat Pilot";
  const description =
    searchParams.get("description") ??
    "Turn your knowledge and tools into reliable assistants.";

  const logoUrl = new URL("../../../public/logo.png", import.meta.url);

  const h = React.createElement;

  const root = h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        color: "#F8FAFC",
        background: "linear-gradient(135deg, #0B1220 0%, #063239 55%, #0B1220 100%)",
        padding: 64,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      },
    },
    h("div", {
      style: {
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(900px 500px at 20% 15%, rgba(34, 211, 238, 0.22), rgba(0,0,0,0) 60%), radial-gradient(900px 500px at 85% 20%, rgba(250, 204, 21, 0.14), rgba(0,0,0,0) 55%)",
      },
    }),
    h(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 36,
          width: "100%",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 22,
          },
        },
        h(
          "div",
          {
            style: {
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            },
          },
          h("img", {
            src: logoUrl.toString(),
            width: 56,
            height: 56,
            alt: "Chat Pilot logo",
            style: { display: "block" },
          })
        ),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 6 } },
          h(
            "div",
            {
              style: {
                fontSize: 28,
                letterSpacing: 2,
                textTransform: "uppercase",
                opacity: 0.85,
              },
            },
            "Chat Pilot"
          ),
          h("div", { style: { fontSize: 18, opacity: 0.8 } }, "AI agents for your product")
        )
      ),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 18 } },
        h(
          "div",
          {
            style: {
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1050,
            },
          },
          title
        ),
        h(
          "div",
          {
            style: {
              fontSize: 30,
              lineHeight: 1.35,
              opacity: 0.92,
              maxWidth: 1050,
            },
          },
          description
        )
      ),
      h(
        "div",
        {
          style: {
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            fontSize: 22,
            opacity: 0.9,
          },
        },
        h("div", null, "chat-pilot"),
        h("div", { style: { opacity: 0.8 } }, "Build, deploy, and embed assistants")
      )
    )
  );

  return new ImageResponse(
    root,
    {
      width: 1200,
      height: 630,
    }
  );
}
