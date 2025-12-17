import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { supabaseClient } from "../../../lib/supabaseClient";

export async function GET(req) {
  if (!supabaseAdmin) {
    return NextResponse.json([], { status: 200 });
  }

  // User-ID aus Authorization Header extrahieren
  const authHeader = req.headers.get("authorization");
  let userId = null;

  if (authHeader && supabaseClient) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabaseClient.auth.getUser(token);
      userId = user?.id;
    } catch (e) {
      console.error("Auth error:", e);
    }
  }

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const { data, error } = await supabaseAdmin
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("savedAt", { ascending: false });

  if (error) {
    console.error("Supabase GET favorites error:", error);
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data || [], { status: 200 });
}

export async function POST(req) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 500 }
    );
  }

  // User-ID aus Authorization Header extrahieren
  const authHeader = req.headers.get("authorization");
  let userId = null;

  if (authHeader && supabaseClient) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabaseClient.auth.getUser(token);
      userId = user?.id;
    } catch (e) {
      console.error("Auth error:", e);
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht angemeldet" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const {
    id,
    thema,
    klassenstufe,
    niveau,
    laenge,
    textsorte,
    zusatzinfo,
    text,
    questions,
  } = body || {};

  const payload = {
    user_id: userId,
    thema,
    klassenstufe,
    niveau,
    laenge,
    textsorte,
    zusatzinfo: zusatzinfo || "",
    text,
    questions: questions || "",
    savedAt: body.savedAt || new Date().toISOString(),
  };

  // Optional: ID übernehmen, falls wir ein gelöschtes Element wiederherstellen
  if (id) {
    payload.id = id;
  }

  const { data, error } = await supabaseAdmin
    .from("favorites")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Supabase POST favorites error:", error);
    return NextResponse.json(
      { error: "Favorit konnte nicht gespeichert werden" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(req) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 500 }
    );
  }

  // User-ID aus Authorization Header extrahieren
  const authHeader = req.headers.get("authorization");
  let userId = null;

  if (authHeader && supabaseClient) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabaseClient.auth.getUser(token);
      userId = user?.id;
    } catch (e) {
      console.error("Auth error:", e);
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht angemeldet" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID fehlt" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("favorites")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase DELETE favorites error:", error);
    return NextResponse.json(
      { error: "Favorit konnte nicht gelöscht werden" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}


