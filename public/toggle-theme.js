const primaryColorScheme = ""; // "light" | "dark"

function getPreferTheme() {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  if (primaryColorScheme) return primaryColorScheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let themeValue = getPreferTheme();

function reflectPreference() {
  document.firstElementChild.setAttribute("data-theme", themeValue);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);
}

function setPreference() {
  localStorage.setItem("theme", themeValue);
  reflectPreference();
}

// set early so no page flashes / CSS is made aware
reflectPreference();

// single delegated listener: survives client-side page swaps, never doubles up
document.addEventListener("click", e => {
  if (!e.target.closest("#theme-btn")) return;
  themeValue = themeValue === "light" ? "dark" : "light";
  setPreference();
});

// carry the current theme onto the incoming page before it is swapped in
document.addEventListener("astro:before-swap", e => {
  e.newDocument.documentElement.setAttribute("data-theme", themeValue);
});

document.addEventListener("astro:after-swap", reflectPreference);
document.addEventListener("astro:page-load", reflectPreference);

// sync with system changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    themeValue = isDark ? "dark" : "light";
    setPreference();
  });
