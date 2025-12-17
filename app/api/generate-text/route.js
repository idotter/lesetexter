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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ist nicht gesetzt" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein Assistent, der didaktisch hochwertige Lesetexte für den Unterricht auf Deutsch erstellt.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Fehler:", errorText);
      return NextResponse.json(
        { error: "Fehler bei der Textgenerierung" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("API /generate-text Fehler:", err);
    return NextResponse.json(
      { error: "Unerwarteter Serverfehler" },
      { status: 500 }
    );
  }
}



