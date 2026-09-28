/* ============================================================
   PROFIL.JS — Logique de la page profil.html
   Supporte l'anglais ET le français
   (dépend de commun.js)
   ============================================================ */

(function initModale() {
  const overlay = document.getElementById('overlay');
  const connexion = document.getElementById('connexion');
  const closeBtn = document.getElementById('closeBtn');
  if (!overlay || !connexion) return;

  function fermerModale() {
    overlay.classList.add('hidden');
    connexion.classList.add('hidden');
    setTimeout(() => {
      overlay.style.display = 'none';
      connexion.style.display = 'none';
    }, 300);
  }

  if (closeBtn) closeBtn.addEventListener('click', fermerModale);
  overlay.addEventListener('click', fermerModale);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerModale(); });
})();

(function initProfil() {
  const barres = document.querySelectorAll('.progress-bar-fill[data-niveau]');
  if (!barres.length) return;

  // Lecture des 2 bases de scores
  let scoresEn = {};
  let scoresFr = {};
  try { scoresEn = JSON.parse(localStorage.getItem('scoresExercices') || '{}'); } catch (e) {}
  try { scoresFr = JSON.parse(localStorage.getItem('scoresExercicesFr') || '{}'); } catch (e) {}

  barres.forEach(b => {
    const niveau = b.dataset.niveau;
    // Si le niveau commence par "fr_", on lit dans les scores français
    const scores = niveau.startsWith('fr_') ? scoresFr : scoresEn;
    b.style.width = (Number(scores[niveau]) || 0) + '%';
  });

  document.querySelectorAll('.progress-text[data-niveau]').forEach(t => {
    const niveau = t.dataset.niveau;
    const scores = niveau.startsWith('fr_') ? scoresFr : scoresEn;
    t.textContent = (Number(scores[niveau]) || 0) + '%';
  });

  // Redirection vers la bonne page d'exercices selon le préfixe
  document.querySelectorAll('.begin[data-niveau]').forEach(carte => {
    const niveau = carte.dataset.niveau;
    const page = niveau.startsWith('fr_') ? 'exercicefr.html' : 'exercice.html';
    const ouvrir = () => { window.location.href = page + '?niveau=' + niveau; };
    carte.addEventListener('click', ouvrir);
    carte.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ouvrir(); }
    });
  });
})();