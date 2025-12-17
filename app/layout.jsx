"use client";

import React from "react";

export const metadata = {
  title: "LeseTextr – Differenzierte Lesetexte mit KI",
  description:
    "Erstelle differenzierte Lesetexte nach CEFR-Niveaus und LP21 – inklusive Verständnisfragen und Favoriten.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background:
            "linear-gradient(135deg, #FFF5F7 0%, #F0F9FF 50%, #F5F3FF 100%)",
        }}
      >
        {children}
      </body>
    </html>
  );
}


