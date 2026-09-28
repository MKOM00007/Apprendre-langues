/* ============================================================
   COMMUN.JS — Logique partagée entre toutes les pages
   ============================================================ */

// ---------- MENU HAMBURGER ----------
(function initMenu() {
  const ouvreMenu = document.querySelectorAll(".ouvreMenu");
  const menu = document.querySelectorAll(".menu");
  if (!ouvreMenu.length) return;

  ouvreMenu.forEach(bouton => {
    bouton.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.forEach(m => {
        m.classList.toggle("show");
        bouton.innerHTML = m.classList.contains("show")
          ? "<span>&#10005;</span>"
          : "<span>&#9776;</span>";
      });
    });
  });

  document.addEventListener("click", (e) => {
    menu.forEach(m => {
      if (!m.contains(e.target) && !e.target.closest(".ouvreMenu")) {
        m.classList.remove("show");
        ouvreMenu.forEach(b => b.innerHTML = "<span>&#9776;</span>");
      }
    });
  });
})();

// ---------- MODE SOMBRE ----------
(function initTheme() {
  const modeSombre = document.querySelectorAll(".modeSombre");
  if (!modeSombre.length) return;

  function appliquerTheme(sombre) {
    document.body.classList.toggle("dark", sombre);
    modeSombre.forEach(d => d.classList.toggle("active", sombre));
  }

  try { appliquerTheme(localStorage.getItem("theme") === "dark"); } catch (e) {}

  modeSombre.forEach(d => {
    d.addEventListener("click", () => {
      const sombre = !document.body.classList.contains("dark");
      appliquerTheme(sombre);
      try { localStorage.setItem("theme", sombre ? "dark" : "light"); } catch (e) {}
    });
  });
})();

// ---------- UTILITAIRES PARTAGÉS ----------
const CLE_SCORES = "scoresExercices";

function lireScores() {
  try { return JSON.parse(localStorage.getItem(CLE_SCORES) || "{}"); }
  catch (e) { return {}; }
}

function ecrireScores(scores) {
  try { localStorage.setItem(CLE_SCORES, JSON.stringify(scores)); }
  catch (e) {}
}

function normaliser(texte) {
  return String(texte)
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// ---------- NORMALISATION POUR RECHERCHE ----------
function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ---------- COMPTEUR DE VUES PAR PAGE (espace admin) ----------
const CLE_VUES = "vuesPages";

function lireVues() {
  try { return JSON.parse(localStorage.getItem(CLE_VUES) || "{}"); }
  catch (e) { return {}; }
}

function ecrireVues(vues) {
  try { localStorage.setItem(CLE_VUES, JSON.stringify(vues)); }
  catch (e) {}
}

(function compterVuePage() {
  let page = window.location.pathname.split("/").pop();
  if (!page) page = "index.html";
  const vues = lireVues();
  vues[page] = (Number(vues[page]) || 0) + 1;
  ecrireVues(vues);
})();