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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ist nicht gesetzt" },
        { status: 500 }
      );
    }

    const prompt = `Hier ist ein Lesetext:\n\n${text}\n\nErstelle 5-7 Verständnisfragen (gemischt: einfach, mittel, anspruchsvoll) für die Klassenstufe "${klassenstufe || "passend zum Text"}" auf dem Niveau "${niveau || "passend zum Text"}". Formatiere die Fragen als nummerierte Liste.`;

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
              "Du erstellst pädagogisch sinnvolle Verständnisfragen zu Lesetexten für den Unterricht.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Fehler (Fragen):", errorText);
      return NextResponse.json(
        { error: "Fehler bei der Fragengenerierung" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const questions =
      data?.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ text: questions });
  } catch (err) {
    console.error("API /generate-questions Fehler:", err);
    return NextResponse.json(
      { error: "Unerwarteter Serverfehler" },
      { status: 500 }
    );
  }
}



