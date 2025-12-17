import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, klassenstufe, niveau } = body || {};

    if (!text) {
      return NextResponse.json(
        { error: "Text für Fragen fehlt" },
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

    const prompt = `Text: ${text}

Erstelle 5-7 Verständnisfragen (gemischt: einfach, mittel, anspruchsvoll) für ${klassenstufe || "die passende"} Klasse, Niveau ${niveau || "passend zum Text"}.

Formatiere die Fragen als nummerierte Liste.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API Fehler (Fragen):", errorText);
      return NextResponse.json(
        { error: "Fehler bei der Fragengenerierung" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const questions =
      data?.content
        ?.filter((item) => item.type === "text")
        ?.map((item) => item.text)
        ?.join("\n") || "";

    return NextResponse.json({ text: questions });
  } catch (err) {
    console.error("API /generate-questions Fehler:", err);
    return NextResponse.json(
      { error: "Unerwarteter Serverfehler" },
      { status: 500 }
    );
  }
}


