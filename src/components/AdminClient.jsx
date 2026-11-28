"use client";

import { useEffect } from "react";
import { ADMIN_BODY_HTML } from "@/data/admin-markup";

export default function AdminClient({ initialUser }) {
  useEffect(() => {
    let cancelled = false;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-betro-src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.setAttribute("data-betro-src", src);
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      });

    async function bootAdmin() {
      try {
        // Set user display immediately
        if (initialUser?.username) {
          const el = document.getElementById("user-display-email");
          if (el) el.textContent = initialUser.username;
        }

        if (!window.BetroDB) {
          await loadScript("/js/mongo-client.js?v=2");
        }
        if (cancelled) return;

        if (typeof window.__initAdminApp !== "function") {
          await loadScript("/js/admin.js?v=3");
        }
        if (cancelled) return;

        if (
          typeof window.__initAdminApp === "function" &&
          !window.__betroAdminInitialized
        ) {
          window.__initAdminApp();
        }
      } catch (err) {
        console.error("[AdminClient] Boot error:", err);
      } finally {
        const pre = document.getElementById("admin-preloader");
        if (pre) pre.classList.add("hide");
      }
    }

    bootAdmin();

    return () => {
      cancelled = true;
      window.__betroAdminInitialized = false;
      document.body.classList.remove("admin-light-mode", "light-mode");
    };
  }, [initialUser]);

  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: ADMIN_BODY_HTML }}
    />
  );
}
