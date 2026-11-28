export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_ID || "").trim();

export function isAnalyticsEnabled() {
  return process.env.NODE_ENV === "production" && Boolean(GA_MEASUREMENT_ID);
}

function ensureGtag() {
  if (typeof window === "undefined") return false;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  return true;
}

export function trackPageView(url) {
  if (!isAnalyticsEnabled() || !ensureGtag()) return;

  window.gtag("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
    page_title: typeof document !== "undefined" ? document.title : "",
  });
}

export function trackEvent(action, params = {}) {
  if (!isAnalyticsEnabled() || !ensureGtag()) return;

  window.gtag("event", action, params);
}

export function trackContactClick(location = "unknown") {
  trackEvent("contact_click", {
    event_category: "engagement",
    event_label: location,
  });
}

export function trackWhatsAppClick(location = "unknown") {
  trackEvent("whatsapp_click", {
    event_category: "engagement",
    event_label: location,
  });
}

export function trackEmailClick(location = "unknown") {
  trackEvent("email_click", {
    event_category: "engagement",
    event_label: location,
  });
}

export function trackEnquirySubmit(formSource = "unknown", service = "General Inquiry") {
  trackEvent("enquiry_submit", {
    event_category: "lead",
    event_label: formSource,
    service_type: service,
  });
}
