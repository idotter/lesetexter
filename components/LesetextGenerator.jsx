"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Heart,
  Trash2,
  HelpCircle,
  ChevronRight,
  FileText,
  Search,
  Undo,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

export default function LesetextGenerator() {
  const [formData, setFormData] = useState({
    thema: "",
    klassenstufe: "5-6",
    niveau: "B1",
    laenge: "B1-B2",
    textsorte: "sachtext",
    zusatzinfo: "",
  });

  // States
  const [generatedText, setGeneratedText] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // UX Enhancement States
  const [toast, setToast] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [favoritesSearch, setFavoritesSearch] = useState("");
  const [deletedFavorite, setDeletedFavorite] = useState(null);
  const [autoGenerateQuestions, setAutoGenerateQuestions] = useState(false);

  const klassenstufen = [
    {
      value: "erstleser",
      label: "Erstleser:innen (Kindergarten)",
      empfohlenenNiveau: "A1",
      empfohlenenLaenge: "A1-A2",
      beschreibung: "Sehr einfach, Leseanfang",
    },
    {
      value: "1-2",
      label: "1.-2. Klasse",
      empfohlenenNiveau: "A1",
      empfohlenenLaenge: "A1-A2",
      beschreibung: "Leseerwerb",
    },
    {
      value: "3-4",
      label: "3.-4. Klasse",
      empfohlenenNiveau: "A2",
      empfohlenenLaenge: "A2-B1",
      beschreibung: "Grundlagen",
    },
    {
      value: "5-6",
      label: "5.-6. Klasse",
      empfohlenenNiveau: "B1",
      empfohlenenLaenge: "B1-B2",
      beschreibung: "Mittelstufe",
    },
    {
      value: "7-9",
      label: "7.-9. Klasse",
      empfohlenenNiveau: "B2",
      empfohlenenLaenge: "B1-B2",
      beschreibung: "Sekundarstufe",
    },
  ];

  const textsorten = [
    { value: "sachtext", label: "Sachtext", desc: "Informativ" },
    { value: "erzaehlung", label: "Erzählung", desc: "Narrativ" },
    { value: "bericht", label: "Bericht", desc: "Objektiv" },
    { value: "beschreibung", label: "Beschreibung", desc: "Detailliert" },
  ];

  const niveaus = [
    { value: "A1", label: "A1", desc: "Einstieg" },
    { value: "A2", label: "A2", desc: "Grundlagen" },
    { value: "B1", label: "B1", desc: "Mittelstufe" },
    { value: "B2", label: "B2", desc: "Fortgeschritten" },
    { value: "C1", label: "C1", desc: "Kompetent" },
    { value: "C2", label: "C2", desc: "Muttersprachlich" },
  ];

  const laengen = [
    { value: "A1-A2", label: "Sehr kurz", words: "50-100 Wörter" },
    { value: "A2-B1", label: "Kurz", words: "100-200 Wörter" },
    { value: "B1-B2", label: "Mittel", words: "200-350 Wörter" },
    { value: "B2-C1", label: "Lang", words: "350-500 Wörter" },
    { value: "C1-C2", label: "Sehr lang", words: "500-700 Wörter" },
  ];

  // Initial Load: Onboarding + Favoriten aus Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisited = window.localStorage.getItem("hasVisited");
      if (!hasVisited) {
        setShowOnboarding(true);
        window.localStorage.setItem("hasVisited", "true");
      }
    }

    const loadFavoritesFromApi = async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) throw new Error("Fehler beim Laden der Favoriten");
        const data = await res.json();
        setFavorites(data || []);
      } catch (e) {
        showToast(
          "Favoriten konnten nicht von der Datenbank geladen werden.",
          "error"
        );
      }
    };

    loadFavoritesFromApi();
  }, []);

  useEffect(() => {
    let progress = 0;
    if (formData.thema) progress += 50;
    if (formData.klassenstufe) progress += 50;
    setFormProgress(progress);
  }, [formData.thema, formData.klassenstufe]);

  useEffect(() => {
    if (generatedText) {
      const words = generatedText.trim().split(/\s+/).length;
      setWordCount(words);
      setReadingTime(Math.ceil(words / 200));
    }
  }, [generatedText]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "klassenstufe") {
      const selectedKlasse = klassenstufen.find((k) => k.value === value);
      setFormData((prev) => ({
        ...prev,
        klassenstufe: value,
        niveau: selectedKlasse.empfohlenenNiveau,
        laenge: selectedKlasse.empfohlenenLaenge,
      }));
      showToast(
        `Automatisch angepasst: Niveau ${selectedKlasse.empfohlenenNiveau} & Länge ${selectedKlasse.empfohlenenLaenge}`,
        "info"
      );
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generatePrompt = () => {
    const textsorte = textsorten.find((t) => t.value === formData.textsorte);
    const niveau = niveaus.find((n) => n.value === formData.niveau);
    const laenge = laengen.find((l) => l.value === formData.laenge);

    return `Erstelle einen Lesetext zum Thema "${formData.thema}" mit folgenden Anforderungen:

Textsorte: ${textsorte.label}
Sprachniveau (GER/CEFR): ${niveau.label}
Zielgruppe: ${
      klassenstufen.find((k) => k.value === formData.klassenstufe)?.label
    }
Textlänge: ${laenge.words}
${formData.zusatzinfo ? `Zusätzliche Anforderungen: ${formData.zusatzinfo}` : ""}

Wichtig:
- Verwende Schweizer Standarddeutsch (ss statt ß)
- Gestalte den Text altersgerecht und sprachlich passend zum Niveau ${
      niveau.label
    }
- Schreibe sachlich korrekt, verständlich und motivierend
- Gliedere den Text in Absätze`;
  };

  const generateText = async () => {
    if (!formData.thema.trim()) {
      showToast("Bitte gib ein Thema ein", "error");
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedText("");
    setGeneratedQuestions("");
    setIsSaved(false);

    const progressMessages = [
      "Thema analysieren...",
      "Text erstellen...",
      "Qualität prüfen...",
    ];
    let progressIndex = 0;

    const progressInterval = setInterval(() => {
      if (progressIndex < progressMessages.length) {
        setLoadingProgress(progressMessages[progressIndex]);
        progressIndex++;
      }
    }, 800);

    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: generatePrompt() }),
      });

      if (!response.ok) {
        throw new Error("API Error");
      }

      const data = await response.json();
      const text = data.text || "";

      setGeneratedText(text);
      showToast("Text erfolgreich generiert!", "success");

      if (autoGenerateQuestions) {
        setTimeout(() => generateQuestions(), 500);
      }
    } catch (err) {
      const errorMsg =
        "Die KI ist momentan überlastet oder nicht erreichbar. Bitte versuche es in 30 Sekunden erneut.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setLoadingProgress("");
    }
  };

  const generateQuestions = async () => {
    if (!generatedText) return;
    setIsLoadingQuestions(true);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: generatedText,
          klassenstufe: formData.klassenstufe,
          niveau: formData.niveau,
        }),
      });

      if (!response.ok) {
        throw new Error("API Error");
      }

      const data = await response.json();
      const questions = data.text || "";
      setGeneratedQuestions(questions);
      showToast("Fragen generiert!", "success");
    } catch {
      showToast("Fehler beim Generieren der Fragen", "error");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = generatedQuestions
      ? `${generatedText}\n\n--- Verständnisfragen ---\n\n${generatedQuestions}`
      : generatedText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast("In Zwischenablage kopiert", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const textToDownload = generatedQuestions
      ? `${generatedText}\n\n--- Verständnisfragen ---\n\n${generatedQuestions}`
      : generatedText;
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lesetext-${formData.thema
      .toLowerCase()
      .replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Als TXT heruntergeladen", "success");
  };

  const downloadPDF = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${
      formData.thema
    }</title>
    <style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.6;max-width:21cm;margin:2cm auto}
    h1{font-size:18pt;margin-bottom:1em}.meta{font-size:10pt;color:#666;margin-bottom:2em;padding-bottom:1em;border-bottom:1px solid #ccc}
    .questions{margin-top:3em;padding-top:2em;border-top:2px solid #333}
    .footer{margin-top:3em;padding-top:1em;border-top:1px solid #ccc;font-size:9pt;color:#999;text-align:center}</style>
    </head><body><h1>${formData.thema}</h1>
    <div class="meta"><strong>Klasse:</strong> ${formData.klassenstufe} | <strong>Niveau:</strong> ${
      formData.niveau
    }</div>
    <div>${generatedText
      .split("\n")
      .map((p) => `<p>${p}</p>`)
      .join("")}</div>
    ${
      generatedQuestions
        ? `<div class="questions"><h2>Verständnisfragen</h2>${generatedQuestions
            .split("\n")
            .map((l) => `<p>${l}</p>`)
            .join("")}</div>`
        : ""
    }
    <div class="footer">Erstellt mit LeseTextr – ${new Date().toLocaleDateString(
      "de-CH"
    )}</div>
    </body></html>`;
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const saveToFavorites = async () => {
    if (!generatedText.trim()) {
      showToast("Es gibt keinen Text zum Speichern.", "error");
      return;
    }

    const newFavorite = {
      ...formData,
      text: generatedText,
      questions: generatedQuestions,
    };

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFavorite),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern");
      const saved = await res.json();
      setFavorites((prev) => [saved, ...prev]);
      setIsSaved(true);
      showToast("Als Favorit gespeichert!", "success");
    } catch (e) {
      showToast("Favorit konnte nicht gespeichert werden.", "error");
    }
  };

  const loadFavorite = (fav) => {
    setFormData({
      thema: fav.thema,
      klassenstufe: fav.klassenstufe,
      niveau: fav.niveau,
      laenge: fav.laenge,
      textsorte: fav.textsorte,
      zusatzinfo: fav.zusatzinfo || "",
    });
    setGeneratedText(fav.text);
    setGeneratedQuestions(fav.questions || "");
    setIsSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Favorit geladen", "info");
  };

  const deleteFavorite = async (id) => {
    const toDelete = favorites.find((f) => f.id === id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    setDeletedFavorite(toDelete);

    try {
      const res = await fetch(`/api/favorites?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      showToast("Favorit gelöscht", "info");
    } catch (e) {
      showToast("Favorit konnte nicht gelöscht werden.", "error");
    }
  };

  const undoDeleteFavorite = async () => {
    if (!deletedFavorite) return;
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deletedFavorite),
      });
      if (!res.ok) throw new Error("Fehler bei Wiederherstellung");
      const restored = await res.json();
      setFavorites((prev) => [restored, ...prev]);
      setDeletedFavorite(null);
      showToast("Wiederhergestellt!", "success");
    } catch {
      showToast("Favorit konnte nicht wiederhergestellt werden.", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      thema: "",
      klassenstufe: "5-6",
      niveau: "B1",
      laenge: "B1-B2",
      textsorte: "sachtext",
      zusatzinfo: "",
    });
    setGeneratedText("");
    setGeneratedQuestions("");
    setError("");
    setIsSaved(false);
  };

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const filteredFavorites = favorites.filter((fav) =>
    fav.thema?.toLowerCase().includes(favoritesSearch.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #FFF5F7 0%, #F0F9FF 50%, #F5F3FF 100%)",
        padding: "2rem 1rem",
      }}
    >
      <style>
        {`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,107,157,0.4); } 70% { box-shadow: 0 0 0 10px rgba(255,107,157,0); } 100% { box-shadow: 0 0 0 0 rgba(255,107,157,0); } }
        .button-hover { transition: all 0.2s ease; }
        .button-hover:hover { transform: translateY(-2px); }
        .animate-in { animation: slideUp 0.5s ease; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}
      </style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "2rem",
            right: "2rem",
            zIndex: 2000,
            background:
              toast.type === "error"
                ? "#FEE2E2"
                : toast.type === "info"
                ? "#DBEAFE"
                : "#D1FAE5",
            color:
              toast.type === "error"
                ? "#991B1B"
                : toast.type === "info"
                ? "#1E40AF"
                : "#065F46",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "slideInRight 0.3s ease",
            maxWidth: "400px",
          }}
        >
          {toast.type === "error" ? <AlertCircle size={20} /> : <Check size={20} />}
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.95rem",
              fontWeight: "500",
            }}
          >
            {toast.message}
          </span>
        </div>
      )}

      {/* Undo Toast */}
      {deletedFavorite && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2000,
            background: "#334155",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            animation: "slideUp 0.3s ease",
          }}
        >
          <span style={{ fontFamily: "'Inter', sans-serif" }}>Favorit gelöscht</span>
          <button
            onClick={undoDeleteFavorite}
            style={{
              background: "#FF6B9D",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Undo size={16} /> Rückgängig
          </button>
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                background:
                  "linear-gradient(135deg, #FF6B9D 0%, #FF8BA7 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(255, 107, 157, 0.3)",
              }}
            >
              <BookOpen size={28} color="white" />
            </div>
            <h1
              style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: "1.8rem",
                fontWeight: "700",
                color: "#334155",
                margin: 0,
              }}
            >
              LeseTextr
            </h1>
          </div>
        </header>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              backdropFilter: "blur(4px)",
              animation: "fadeIn 0.3s ease",
            }}
            onClick={() => setShowOnboarding(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "24px",
                maxWidth: "600px",
                padding: "3rem",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                animation: "slideUp 0.3s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#334155",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                👋 Willkommen bei LeseTextr!
              </h2>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1.05rem",
                  color: "#64748B",
                  lineHeight: "1.7",
                  marginBottom: "2rem",
                }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  <strong style={{ color: "#FF6B9D" }}>
                    In 3 einfachen Schritten
                  </strong>{" "}
                  zu deinem perfekten Lesetext:
                </p>
                <ol
                  style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}
                >
                  <li style={{ marginBottom: "0.75rem" }}>
                    <strong>Thema wählen</strong> – klicke auf ein Beispiel oder
                    gib dein eigenes ein
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <strong>Klassenstufe anpassen</strong> – alles andere wird
                    automatisch gesetzt
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <strong>Text generieren</strong> – fertig in Sekunden!
                  </li>
                </ol>
                <div
                  style={{
                    background: "#FFF1F5",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid #FFC9D9",
                  }}
                >
                  <strong style={{ color: "#FF6B9D" }}>💡 Tipp:</strong> Nach
                  LP21 und CEFR-Standards (A1-C2)!
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOnboarding(false);
                  document
                    .getElementById("generator")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background:
                    "linear-gradient(135deg, #FF6B9D 0%, #FF8BA7 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(255, 107, 157, 0.3)",
                }}
              >
                Los geht&apos;s! 🚀
              </button>
            </div>
          </div>
        )}

        {/* Compact Hero */}
        <div className="animate-in" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: "700",
              color: "#334155",
              marginBottom: "1rem",
              lineHeight: "1.2",
            }}
          >
            Differenzierte Lesetexte{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 50%, #9333EA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              in Sekunden
            </span>
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { num: "6 Niveaus", desc: "A1-C2", color: "#FF6B9D" },
              { num: "4 Textsorten", desc: "Vielfältig", color: "#14B8A6" },
              { num: "+ Fragen", desc: "Automatisch", color: "#9333EA" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: stat.color,
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem",
                    color: "#94A3B8",
                  }}
                >
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>

          <a
            href="#generator"
            style={{ display: "inline-block", textDecoration: "none", marginBottom: "1rem" }}
          >
            <button
              className="button-hover"
              style={{
                padding: "1rem 2rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "1.05rem",
                fontWeight: "600",
                background:
                  "linear-gradient(135deg, #FF6B9D 0%, #FF8BA7 100%)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(255, 107, 157, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Sparkles size={20} /> Jetzt Text erstellen
            </button>
          </a>

          <div>
            <button
              onClick={() => setShowOnboarding(true)}
              style={{
                background: "none",
                border: "none",
                color: "#94A3B8",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                cursor: "pointer",
                textDecoration: "underline",
                padding: "0.5rem",
              }}
            >
              Wie funktioniert&apos;s?
            </button>
          </div>
        </div>

        {/* Generator Anchor */}
        <div id="generator" style={{ scrollMarginTop: "2rem" }}></div>

        {/* Progress Bar */}
        {formProgress > 0 && formProgress < 100 && (
          <div
            style={{
              background: "white",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              border: "2px solid #E0E7FF",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#64748B",
                  }}
                >
                  Fortschritt
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#FF6B9D",
                  }}
                >
                  {formProgress}%
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#F1F5F9",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #FF6B9D 0%, #FF8BA7 100%)",
                    width: `${formProgress}%`,
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Generator Form */}
        <div
          className="animate-in"
          style={{
            background: "white",
            padding: "2.5rem",
            borderRadius: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "2px solid #FFC9D9",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            <Sparkles size={24} color="#FF6B9D" />
            <h2
              style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#334155",
                margin: 0,
              }}
            >
              Text-Parameter
            </h2>
          </div>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            {/* Thema */}
            <div>
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#475569",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Thema des Lesetextes *
              </label>
              <input
                type="text"
                name="thema"
                value={formData.thema}
                onChange={handleInputChange}
                placeholder="z.B. Klimawandel, Schweizer Geschichte, Fotosynthese..."
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  border: "2px solid #E0E7FF",
                  borderRadius: "12px",
                  background: "#FAFCFE",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#FF6B9D")}
                onBlur={(e) => (e.target.style.borderColor = "#E0E7FF")}
              />
            </div>

            {/* Klassenstufe */}
            <div>
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#475569",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Klassenstufe (empfiehlt automatisch Niveau & Länge)
              </label>
              <select
                name="klassenstufe"
                value={formData.klassenstufe}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  border: "2px solid #E0E7FF",
                  borderRadius: "12px",
                  background: "#FAFCFE",
                  cursor: "pointer",
                }}
              >
                {klassenstufen.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  color: "#94A3B8",
                  margin: "0.5rem 0 0 0",
                  fontStyle: "italic",
                }}
              >
                {klassenstufen.find((k) => k.value === formData.klassenstufe)
                  ?.beschreibung}
              </p>
            </div>

            {/* Restliche Parameter */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                    display: "block",
                    marginBottom: "0.75rem",
                  }}
                >
                  Textsorte
                </label>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {textsorten.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, textsorte: t.value }))
                      }
                      style={{
                        padding: "0.75rem",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        border:
                          formData.textsorte === t.value
                            ? "2px solid #FF6B9D"
                            : "2px solid #E0E7FF",
                        borderRadius: "8px",
                        background:
                          formData.textsorte === t.value ? "#FFF1F5" : "white",
                        color:
                          formData.textsorte === t.value ? "#FF6B9D" : "#64748B",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div>{t.label}</div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                    display: "block",
                    marginBottom: "0.75rem",
                  }}
                >
                  Sprachniveau
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.5rem",
                  }}
                >
                  {niveaus.map((n) => (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, niveau: n.value }))
                      }
                      style={{
                        padding: "0.75rem",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        border:
                          formData.niveau === n.value
                            ? "2px solid #4ECDC4"
                            : "2px solid #E0E7FF",
                        borderRadius: "8px",
                        background:
                          formData.niveau === n.value ? "#F0FDFA" : "white",
                        color:
                          formData.niveau === n.value ? "#14B8A6" : "#64748B",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontWeight: "700" }}>{n.label}</div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                        {n.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                    display: "block",
                    marginBottom: "0.75rem",
                  }}
                >
                  Textlänge
                </label>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {laengen.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, laenge: l.value }))
                      }
                      style={{
                        padding: "0.75rem",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        border:
                          formData.laenge === l.value
                            ? "2px solid #C39BD3"
                            : "2px solid #E0E7FF",
                        borderRadius: "8px",
                        background:
                          formData.laenge === l.value ? "#FAF5FF" : "white",
                        color:
                          formData.laenge === l.value ? "#9333EA" : "#64748B",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div>{l.label}</div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                        {l.words}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Zusatzinfo */}
            <div>
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#475569",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Zusätzliche Anforderungen (optional)
              </label>
              <textarea
                name="zusatzinfo"
                value={formData.zusatzinfo}
                onChange={handleInputChange}
                placeholder="z.B. Schweizer Bezug, mit Fragen am Ende..."
                rows="2"
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.95rem",
                  border: "2px solid #E0E7FF",
                  borderRadius: "12px",
                  background: "#FAFCFE",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Auto-generate Questions Checkbox */}
            <div
              style={{
                background: "#F0FDFA",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid #C9E4DE",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <input
                type="checkbox"
                id="autoQuestions"
                checked={autoGenerateQuestions}
                onChange={(e) => setAutoGenerateQuestions(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label
                htmlFor="autoQuestions"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.95rem",
                  color: "#0F766E",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Verständnisfragen automatisch generieren
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button
                onClick={generateText}
                disabled={isLoading}
                className="button-hover"
                style={{
                  flex: 1,
                  padding: "1rem 1.5rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  fontWeight: "600",
                  background: isLoading
                    ? "#CCC"
                    : "linear-gradient(135deg, #FF6B9D 0%, #FF8BA7 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: isLoading
                    ? "none"
                    : "0 4px 12px rgba(255, 107, 157, 0.3)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    {loadingProgress || "Generiere..."}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Text generieren
                  </>
                )}
              </button>

              {generatedText && (
                <button
                  onClick={resetForm}
                  className="button-hover"
                  style={{
                    padding: "1rem",
                    fontFamily: "'Inter', sans-serif",
                    background: "white",
                    color: "#FF6B9D",
                    border: "2px solid #FFC9D9",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RefreshCw size={20} />
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "1rem",
                  background: "#FEE2E2",
                  border: "2px solid #FECACA",
                  borderRadius: "12px",
                  color: "#EF4444",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <AlertCircle size={20} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        {(generatedText || isLoading) && (
          <div
            className="animate-in"
            style={{
              background: "white",
              padding: "2.5rem",
              borderRadius: "24px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "2px solid #C9E4DE",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#334155",
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  Generierter Lesetext
                </h2>
                {wordCount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.85rem",
                      color: "#64748B",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>📊 {wordCount} Wörter</span>
                    <span>⏱️ ~{readingTime} Min. Lesezeit</span>
                    <span>📚 {formData.niveau}</span>
                  </div>
                )}
              </div>

              {generatedText && (
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <button
                    onClick={saveToFavorites}
                    className="button-hover"
                    style={{
                      padding: "0.75rem 1.25rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      background: isSaved ? "#D1FAE5" : "white",
                      color: isSaved ? "#059669" : "#FF6B9D",
                      border: `2px solid ${
                        isSaved ? "#A7F3D0" : "#FFC9D9"
                      }`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Heart size={16} fill={isSaved ? "#059669" : "none"} />
                    {isSaved ? "Gespeichert" : "Speichern"}
                  </button>

                  <button
                    onClick={() => setShowFavorites(true)}
                    className="button-hover"
                    style={{
                      padding: "0.75rem 1.25rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      background: "white",
                      color: "#FF6B9D",
                      border: "2px solid #FFC9D9",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Heart size={16} />
                    Favoriten ({favorites.length})
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="button-hover"
                    style={{
                      padding: "0.75rem 1.25rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      background: copied ? "#D1FAE5" : "white",
                      color: copied ? "#059669" : "#4ECDC4",
                      border: `2px solid ${
                        copied ? "#A7F3D0" : "#C9E4DE"
                      }`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Copy size={16} />
                    {copied ? "Kopiert" : "Kopieren"}
                  </button>

                  <button
                    onClick={downloadPDF}
                    className="button-hover"
                    style={{
                      padding: "0.75rem 1.25rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      background: "white",
                      color: "#9333EA",
                      border: "2px solid #E9D5FF",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FileText size={16} />
                    PDF
                  </button>

                  <button
                    onClick={downloadText}
                    className="button-hover"
                    style={{
                      padding: "0.75rem 1.25rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      background: "white",
                      color: "#64748B",
                      border: "2px solid #E0E7FF",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Download size={16} />
                    TXT
                  </button>
                </div>
              )}
            </div>

            <div
              style={{
                background: "#FAFCFE",
                padding: "2rem",
                borderRadius: "16px",
                border: "2px solid #E0E7FF",
                minHeight: "300px",
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                    gap: "1rem",
                  }}
                >
                  <Loader2
                    size={48}
                    color="#FF6B9D"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: "#64748B",
                      fontSize: "1.1rem",
                    }}
                  >
                    {loadingProgress || "Der Lesetext wird generiert..."}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.05rem",
                    lineHeight: "1.8",
                    color: "#1E293B",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {generatedText}
                </div>
              )}
            </div>

            {generatedText && !isLoading && (
              <div style={{ marginTop: "1.5rem" }}>
                {!autoGenerateQuestions && (
                  <button
                    onClick={generateQuestions}
                    disabled={isLoadingQuestions}
                    className="button-hover"
                    style={{
                      width: "100%",
                      padding: "1rem 1.5rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "1rem",
                      fontWeight: "600",
                      background: isLoadingQuestions
                        ? "#CCC"
                        : "linear-gradient(135deg, #4ECDC4 0%, #5FC3C9 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: isLoadingQuestions
                        ? "not-allowed"
                        : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      boxShadow: isLoadingQuestions
                        ? "none"
                        : "0 4px 12px rgba(78, 205, 196, 0.3)",
                      marginBottom: "1rem",
                    }}
                  >
                    {isLoadingQuestions ? (
                      <>
                        <Loader2
                          size={20}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Generiere Fragen...
                      </>
                    ) : (
                      <>
                        <HelpCircle size={20} />
                        {generatedQuestions
                          ? "Fragen neu generieren"
                          : "Verständnisfragen generieren"}
                      </>
                    )}
                  </button>
                )}

                {generatedQuestions && (
                  <div
                    style={{
                      background: "#F0FDFA",
                      padding: "2rem",
                      borderRadius: "16px",
                      border: "2px solid #C9E4DE",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <HelpCircle size={24} color="#14B8A6" />
                      <h3
                        style={{
                          fontFamily: "'Crimson Pro', serif",
                          fontSize: "1.3rem",
                          fontWeight: "600",
                          color: "#0F766E",
                          margin: 0,
                        }}
                      >
                        Verständnisfragen
                      </h3>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "1rem",
                        lineHeight: "1.8",
                        color: "#134E4A",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {generatedQuestions}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Favorites Modal */}
        {showFavorites && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              backdropFilter: "blur(4px)",
              animation: "fadeIn 0.3s ease",
            }}
            onClick={() => setShowFavorites(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "24px",
                maxWidth: "900px",
                width: "100%",
                maxHeight: "80vh",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                animation: "slideUp 0.3s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "2rem",
                  borderBottom: "2px solid #E0E7FF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Heart size={28} color="#FF6B9D" fill="#FF6B9D" />
                  <h2
                    style={{
                      fontFamily: "'Crimson Pro', serif",
                      fontSize: "1.8rem",
                      fontWeight: "600",
                      color: "#334155",
                      margin: 0,
                    }}
                  >
                    Meine Favoriten
                  </h2>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      color: "#94A3B8",
                      background: "#F1F5F9",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                    }}
                  >
                    {favorites.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowFavorites(false)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    border: "2px solid #E0E7FF",
                    background: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={20} color="#64748B" />
                </button>
              </div>

              {/* Search */}
              {favorites.length > 0 && (
                <div
                  style={{
                    padding: "1.5rem 2rem",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Search
                      size={20}
                      color="#94A3B8"
                      style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Favoriten durchsuchen..."
                      value={favoritesSearch}
                      onChange={(e) => setFavoritesSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem 0.75rem 3rem",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.95rem",
                        border: "2px solid #E0E7FF",
                        borderRadius: "12px",
                        background: "#FAFCFE",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#FF6B9D")}
                      onBlur={(e) => (e.target.style.borderColor = "#E0E7FF")}
                    />
                  </div>
                </div>
              )}

              {/* Modal Content */}
              <div
                style={{
                  padding: "2rem",
                  overflowY: "auto",
                  maxHeight: "calc(80vh - 200px)",
                }}
              >
                {filteredFavorites.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "4rem 2rem",
                      color: "#64748B",
                    }}
                  >
                    <Heart
                      size={64}
                      color="#FFC9D9"
                      style={{ marginBottom: "1.5rem" }}
                    />
                    <h3
                      style={{
                        fontFamily: "'Crimson Pro', serif",
                        fontSize: "1.3rem",
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {favoritesSearch
                        ? "Keine Ergebnisse gefunden"
                        : "Noch keine Favoriten gespeichert"}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "1rem",
                        color: "#94A3B8",
                      }}
                    >
                      {favoritesSearch
                        ? "Versuche einen anderen Suchbegriff"
                        : "Speichere deine generierten Texte, um sie hier wiederzufinden."}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {filteredFavorites.map((fav) => (
                      <div
                        key={fav.id}
                        style={{
                          background: "#FAFCFE",
                          padding: "1.5rem",
                          borderRadius: "16px",
                          border: "2px solid #E0E7FF",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          gap: "1rem",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(255,107,157,0.15)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontFamily: "'Crimson Pro', serif",
                              fontSize: "1.2rem",
                              fontWeight: "600",
                              color: "#334155",
                              marginBottom: "0.75rem",
                            }}
                          >
                            {fav.thema}
                          </h3>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                              marginBottom: "0.75rem",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.6rem",
                                background: "white",
                                border: "1px solid #FFC9D9",
                                borderRadius: "8px",
                                color: "#FF6B9D",
                                fontWeight: "500",
                              }}
                            >
                              {
                                klassenstufen.find(
                                  (k) => k.value === fav.klassenstufe
                                )?.label
                              }
                            </span>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.6rem",
                                background: "white",
                                border: "1px solid #C9E4DE",
                                borderRadius: "8px",
                                color: "#14B8A6",
                                fontWeight: "500",
                              }}
                            >
                              {fav.niveau}
                            </span>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.6rem",
                                background: "white",
                                border: "1px solid #E9D5FF",
                                borderRadius: "8px",
                                color: "#9333EA",
                                fontWeight: "500",
                              }}
                            >
                              {
                                textsorten.find(
                                  (t) => t.value === fav.textsorte
                                )?.label
                              }
                            </span>
                          </div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.8rem",
                              color: "#94A3B8",
                              margin: 0,
                            }}
                          >
                            {fav.savedAt &&
                              new Date(fav.savedAt).toLocaleDateString(
                                "de-CH",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => {
                              loadFavorite(fav);
                              setShowFavorites(false);
                            }}
                            className="button-hover"
                            style={{
                              padding: "0.75rem 1.25rem",
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              background:
                                "linear-gradient(135deg, #FF6B9D 0%, #FF8BA7 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Laden
                          </button>
                          <button
                            onClick={() => deleteFavorite(fav.id)}
                            className="button-hover"
                            style={{
                              padding: "0.75rem",
                              background: "white",
                              color: "#EF4444",
                              border: "2px solid #FECACA",
                              borderRadius: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div
          style={{
            marginTop: "4rem",
            background: "white",
            padding: "3rem 2rem",
            borderRadius: "24px",
            border: "2px solid #E0E7FF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h2
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: "2rem",
              fontWeight: "600",
              color: "#334155",
              textAlign: "center",
              marginBottom: "2.5rem",
            }}
          >
            Häufig gestellte Fragen
          </h2>

          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {[
              {
                q: "Wie genau sind die Texte auf das CEFR-Niveau abgestimmt?",
                a: "Die KI erhält detaillierte Anweisungen zu jedem CEFR-Niveau und passt Wortschatz und Komplexität an. Wir empfehlen dennoch, Texte vor dem Einsatz zu überprüfen.",
              },
              {
                q: "Kann ich die Texte kommerziell nutzen?",
                a: "Ja, alle generierten Texte können Sie frei im Unterricht verwenden und weitergeben. Die Texte gehören Ihnen.",
              },
              {
                q: "Werden meine Daten gespeichert?",
                a: "Favoriten werden in der Datenbank von Supabase gespeichert. Inhalte werden zur Verbesserung nicht automatisch ausgewertet.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  background: openFaq === i ? "#FAFCFE" : "white",
                  border: "2px solid #E0E7FF",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: "100%",
                    padding: "1.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    textAlign: "left",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "1.05rem",
                      fontWeight: "600",
                      color: "#334155",
                      margin: 0,
                    }}
                  >
                    {faq.q}
                  </h3>
                  <ChevronRight
                    size={24}
                    color="#64748B"
                    style={{
                      transform:
                        openFaq === i ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 1.5rem 1.5rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.95rem",
                      color: "#64748B",
                      lineHeight: "1.6",
                      animation: "slideDown 0.3s ease",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            marginTop: "4rem",
            padding: "3rem 2rem",
            background:
              "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
            borderRadius: "32px 32px 0 0",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2.5rem",
              marginBottom: "2.5rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background:
                      "linear-gradient(135deg, #FF6B9D 0%, #FF8BA7 100%)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen size={22} color="white" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "white",
                    margin: 0,
                  }}
                >
                  LeseTextr
                </h3>
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  color: "#CBD5E1",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Massgeschneiderte Lesetexte für differenzierten Unterricht –
                nach LP21 und CEFR-Standards.
              </p>
            </div>

            <div>
              <h4
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "white",
                  marginBottom: "1rem",
                }}
              >
                Rechtliches
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {["Datenschutzerklärung", "Impressum", "Nutzungsbedingungen"].map(
                  (link) => (
                    <a
                      key={link}
                      href={`#${link.toLowerCase()}`}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.9rem",
                        color: "#CBD5E1",
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#FF8BA7")}
                      onMouseLeave={(e) => (e.target.style.color = "#CBD5E1")}
                    >
                      {link}
                    </a>
                  )
                )}
              </div>
            </div>

            <div>
              <h4
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "white",
                  marginBottom: "1rem",
                }}
              >
                Kontakt & Support
              </h4>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  color: "#CBD5E1",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Fragen oder Feedback?
                <br />
                <a
                  href="mailto:support@lesetextr.ch"
                  style={{ color: "#FF8BA7", textDecoration: "none" }}
                >
                  support@lesetextr.ch
                </a>
              </p>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #475569",
              paddingTop: "1.5rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.85rem",
                color: "#94A3B8",
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} LeseTextr. Alle Rechte vorbehalten.
              Erstellt mit KI-Unterstützung.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}


