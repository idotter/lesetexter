"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, AlertCircle } from "lucide-react";
import { supabaseClient } from "../lib/supabaseClient";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!supabaseClient) {
      setError("Supabase ist nicht konfiguriert.");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      } else {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });
        if (error) throw error;
        showToast("Registrierung erfolgreich! Bitte prüfe deine E-Mails.", "success");
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (err) {
      setError(err.message || "Ein Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type) => {
    // Toast wird von Parent-Komponente gehandhabt
    if (onAuthSuccess) {
      onAuthSuccess({ toast: { message, type } });
    }
  };

  if (!isOpen) return null;

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          maxWidth: "450px",
          width: "100%",
          padding: "2.5rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#334155",
              margin: 0,
            }}
          >
            {isLogin ? "Anmelden" : "Registrieren"}
          </h2>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {!isLogin && (
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
                Name
              </label>
              <div style={{ position: "relative" }}>
                <User
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                  required={!isLogin}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem 0.875rem 3rem",
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
            </div>
          )}

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
              E-Mail
            </label>
            <div style={{ position: "relative" }}>
              <Mail
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.com"
                required
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem 0.875rem 3rem",
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
          </div>

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
              Passwort
            </label>
            <div style={{ position: "relative" }}>
              <Lock
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem 0.875rem 3rem",
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
          </div>

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

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
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
              boxShadow: isLoading
                ? "none"
                : "0 4px 12px rgba(255, 107, 157, 0.3)",
            }}
          >
            {isLoading
              ? "Lädt..."
              : isLogin
              ? "Anmelden"
              : "Registrieren"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            color: "#64748B",
          }}
        >
          {isLogin ? "Noch kein Konto? " : "Bereits ein Konto? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#FF6B9D",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            {isLogin ? "Jetzt registrieren" : "Jetzt anmelden"}
          </button>
        </div>
      </div>
    </div>
  );
}

