import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt } = body || {};

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt fehlt" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY ist nicht gesetzt" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API Fehler:", errorText);
      return NextResponse.json(
        { error: "Fehler bei der Textgenerierung" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data?.content
        ?.filter((item) => item.type === "text")
        ?.map((item) => item.text)
        ?.join("\n") || "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("API /generate-text Fehler:", err);
    return NextResponse.json(
      { error: "Unerwarteter Serverfehler" },
      { status: 500 }
    );
  }
}


