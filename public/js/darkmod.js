/**
 * Betroverse Theme Handler
 * Detects, applies, and persists the dark/light mode preference.
 */
(function () {
  // Check local storage or system preference
  const savedTheme = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  if (savedTheme === "light" || (!savedTheme && prefersLight)) {
    document.documentElement.classList.add("light-mode");
    // Ensure body also gets the class once parsed
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("light-mode");
    });
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.classList.toggle("light-mode");
      document.body.classList.toggle("light-mode", isLight);
      
      // Persist user preference
      localStorage.setItem("theme", isLight ? "light" : "dark");
      
      // Add a subtle click/rotate animation to the toggle button
      themeToggle.classList.add("clicked");
      setTimeout(() => {
        themeToggle.classList.remove("clicked");
      }, 500);
    });
  }
});
