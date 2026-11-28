"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-mode");
      }
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid username or password.");
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem("betro_admin_logged_in", "true");
        localStorage.setItem(
          "betro_admin_email",
          data.user?.email || data.user?.username || username.trim()
        );
      } catch {}

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErrorMsg("Connection error: " + (err.message || "Please try again."));
      setLoading(false);
    }
  };

  return (
    <div id="app-container" className="app-container">
      <div id="login-view" className="auth-view">
        <div className="glass-card auth-card">
          <div className="auth-header">
            <img
              src="/images/logo.png"
              alt="Betroverse Logo"
              className="auth-logo"
            />
            <h2>Admin CMS Portal</h2>
            <p>
              Sign in to manage agency case studies, client media assets, and
              live website branding.
            </p>
          </div>

          {errorMsg && (
            <div id="login-error-alert" className="alert-box error">
              <i className="ri-error-warning-line"></i>
              <span className="alert-message">{errorMsg}</span>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Username or Email</label>
              <div className="input-wrapper">
                <i className="ri-user-line input-icon"></i>
                <input
                  type="text"
                  id="login-email"
                  placeholder="admin or admin@betroverse.in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <i className="ri-lock-line input-icon"></i>
                <input
                  type="password"
                  id="login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn primary-btn"
              disabled={loading}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              <span>{loading ? "Signing In..." : "Sign In to Dashboard"}</span>
              <i
                className={
                  loading
                    ? "ri-loader-4-line ri-spin"
                    : "ri-arrow-right-line"
                }
              ></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
