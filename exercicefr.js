/* ============================================================
   EXERCICEFR.JS — Logique de la page exercicefr.html (français)
   (dépend de commun.js et data-exercices.js)
   ============================================================ */

(function initExercicesFr() {
  const questionCard = document.getElementById('questionCard');
  if (!questionCard) return;

  const questionType = document.getElementById('questionType');
  const questionConsigne = document.getElementById('questionConsigne');
  const questionText = document.getElementById('questionText');
  const answersContainer = document.getElementById('answersContainer');
  const feedback = document.getElementById('feedback');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnValidate = document.getElementById('btnValidate');
  const navButtons = document.querySelector('.nav-buttons');
  const progressWrapper = document.querySelector('.progress-wrapper');
  const progressLabel = document.getElementById('progressLabel');
  const progressScore = document.getElementById('progressScore');
  const progressFill = document.getElementById('progressFill');
  const resultCard = document.getElementById('resultCard');
  const finalScore = document.getElementById('finalScore');
  const recap = document.getElementById('recap');
  const btnRestart = document.getElementById('btnRestart');
  const btnSuivant = document.getElementById('btnNiveauSuivant');
  const btnsNiveaux = document.querySelectorAll('.btn-onglet-langue[data-niveau]');

  const TYPES = {
    qcm:    { badge: 'QCM', consigne: 'Choisis la bonne réponse.' },
    vf:     { badge: 'Vrai ou faux', consigne: 'Cette affirmation est-elle vraie ou fausse ?' },
    saisie: { badge: 'À compléter', consigne: 'Écris le mot ou la forme qui manque.' },
    ordre:  { badge: 'Remettre dans l\'ordre', consigne: 'Clique sur les mots pour reconstruire la phrase.' }
  };

  // ---------- Stockage spécifique au français ----------
  const CLE_SCORES_FR = 'scoresExercicesFr';

  function lireScoresFr() {
    try { return JSON.parse(localStorage.getItem(CLE_SCORES_FR) || '{}'); }
    catch (e) { return {}; }
  }

  function ecrireScoresFr(scores) {
    try { localStorage.setItem(CLE_SCORES_FR, JSON.stringify(scores)); }
    catch (e) { /* stockage indisponible */ }
  }

  // ---------- Sécurité : dépendances externes ----------
  const niveauxFr = (typeof NIVEAUX_FR !== 'undefined' && Array.isArray(NIVEAUX_FR))
    ? NIVEAUX_FR
    : ['fr_debutant', 'fr_intermediaire', 'fr_avance', 'fr_professionnel'];

  const baseExercices = (typeof EXERCICES !== 'undefined' && EXERCICES) ? EXERCICES : {};

  const params = new URLSearchParams(window.location.search);
  let niveau = niveauxFr.includes(params.get('niveau')) ? params.get('niveau') : niveauxFr[0];
  let questions = [];
  let etat = [];
  let index = 0;

  // ---------- Démarrage d'un niveau ----------
  function demarrer(nouveauNiveau) {
    niveau = nouveauNiveau;
    questions = Array.isArray(baseExercices[niveau]) ? baseExercices[niveau] : [];

    etat = questions.map(q => {
      const e = { valide: false, juste: false, reponse: null, construit: [], banque: [] };
      if (q.type === 'saisie') e.reponse = '';
      if (q.type === 'ordre') {
        const indices = q.mots.map((_, i) => i);
        let melange = melanger(indices);
        let essais = 0;
        while (
          essais++ < 10 &&
          q.correct.some(c =>
            normaliser(melange.map(i => q.mots[i]).join(' ')) === normaliser(c)
          )
        ) {
          melange = melanger(indices);
        }
        e.banque = melange;
      }
      return e;
    });

    index = 0;
    btnsNiveaux.forEach(b => b.classList.toggle('active', b.dataset.niveau === niveau));

    questionCard.classList.remove('cache');
    navButtons.classList.remove('cache');
    progressWrapper.classList.remove('cache');
    resultCard.classList.add('cache');

    // Cas où le niveau ne contient aucune question
    if (!questions.length) {
      questionType.textContent = '';
      questionConsigne.textContent = '';
      questionText.textContent = 'Aucune question disponible pour ce niveau.';
      answersContainer.replaceChildren();
      feedback.replaceChildren();
      feedback.className = 'feedback warning';
      feedback.textContent = 'Ajoute des questions dans data-exercices.js pour ce niveau.';
      btnPrev.disabled = true;
      btnNext.disabled = true;
      btnValidate.disabled = true;
      progressLabel.textContent = 'Question 0 / 0';
      progressScore.textContent = 'Score : 0';
      progressFill.style.width = '0%';
      return;
    }

    btnValidate.disabled = false;
    afficherQuestion();
  }

  // ---------- Évaluation ----------
  function aRepondu(q, e) {
    if (q.type === 'saisie') return e.reponse.trim() !== '';
    if (q.type === 'ordre') return e.construit.length === q.mots.length;
    return e.reponse !== null;
  }

  function estJuste(q, e) {
    switch (q.type) {
      case 'qcm':    return e.reponse === q.correct;
      case 'vf':     return e.reponse === (q.correct ? 0 : 1);
      case 'saisie': return q.reponses.some(r => normaliser(r) === normaliser(e.reponse));
      case 'ordre': {
        const phrase = normaliser(e.construit.map(i => q.mots[i]).join(' '));
        return q.correct.some(c => normaliser(c) === phrase);
      }
    }
    return false;
  }

  function texteBonneReponse(q) {
    switch (q.type) {
      case 'qcm':    return q.options[q.correct];
      case 'vf':     return q.correct ? 'Vrai' : 'Faux';
      case 'saisie': return q.reponses[0];
      case 'ordre': {
        const p = q.correct[0];
        return p.charAt(0).toUpperCase() + p.slice(1);
      }
    }
    return '';
  }

  function nbBonnes()   { return etat.filter(e => e.juste).length; }
  function nbValidees() { return etat.filter(e => e.valide).length; }

  // ---------- Rendu des types de questions ----------
  function rendreChoix(q, e, options, indexBon, classeConteneur) {
    answersContainer.className = 'answers' + (classeConteneur ? ' ' + classeConteneur : '');
    options.forEach((texte, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = texte;

      if (e.valide) {
        btn.disabled = true;
        if (i === indexBon) btn.classList.add('correct');
        else if (i === e.reponse) btn.classList.add('wrong');
        else btn.classList.add('disabled');
      } else {
        if (e.reponse === i) btn.classList.add('selected');
        btn.addEventListener('click', () => {
          e.reponse = i;
          answersContainer.querySelectorAll('.answer-btn')
            .forEach((b, k) => b.classList.toggle('selected', k === i));
          effacerFeedback();
        });
      }
      answersContainer.appendChild(btn);
    });
  }

  function rendreSaisie(q, e) {
    answersContainer.className = 'answers';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'answer-input';
    input.placeholder = 'Ta réponse…';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', 'Ta réponse');
    input.value = e.reponse;

    if (e.valide) {
      input.disabled = true;
      input.classList.add(e.juste ? 'correct' : 'wrong');
    } else {
      input.addEventListener('input', () => {
        e.reponse = input.value;
        effacerFeedback();
      });
      input.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); valider(); }
      });
    }
    answersContainer.appendChild(input);
    if (!e.valide) setTimeout(() => input.focus(), 0);
  }

  function rendreOrdre(q, e) {
    answersContainer.className = 'answers';
    const zoneReponse = document.createElement('div');
    zoneReponse.className = 'ordre-zone ordre-reponse';
    zoneReponse.setAttribute('aria-label', 'Ta phrase');
    const banque = document.createElement('div');
    banque.className = 'ordre-zone ordre-banque';
    banque.setAttribute('aria-label', 'Mots disponibles');

    if (e.valide) zoneReponse.classList.add(e.juste ? 'correct' : 'wrong');

    function creerMot(i, versReponse) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mot';
      btn.textContent = q.mots[i];
      if (e.valide) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => {
          if (versReponse) {
            e.banque = e.banque.filter(k => k !== i);
            e.construit.push(i);
          } else {
            e.construit = e.construit.filter(k => k !== i);
            e.banque.push(i);
          }
          effacerFeedback();
          afficherQuestion();
        });
      }
      return btn;
    }

    e.construit.forEach(i => zoneReponse.appendChild(creerMot(i, false)));
    e.banque.forEach(i => banque.appendChild(creerMot(i, true)));
    answersContainer.appendChild(zoneReponse);
    if (!e.valide) answersContainer.appendChild(banque);
  }

  // ---------- Feedback ----------
  function effacerFeedback() {
    feedback.replaceChildren();
    feedback.className = 'feedback';
  }

  function afficherFeedback(q, e) {
    feedback.replaceChildren();
    feedback.className = 'feedback ' + (e.juste ? 'success' : 'error');

    const titre = document.createElement('strong');
    titre.textContent = e.juste
      ? ' Bonne réponse !'
      : ' Mauvaise réponse. Bonne réponse : ' + texteBonneReponse(q);
    feedback.appendChild(titre);

    if (q.explication) {
      const p = document.createElement('p');
      p.className = 'explication';
      p.textContent = q.explication;
      feedback.appendChild(p);
    }
    if (q.lecon) {
      const lien = document.createElement('a');
      lien.className = 'lien-lecon';
      lien.href = 'francais.html#' + q.lecon;
      lien.innerHTML = '<i class="fas fa-book-open-reader"></i> Revoir la leçon';
      feedback.appendChild(lien);
    }
  }

  // ---------- Affichage de la question ----------
  function afficherQuestion() {
    const q = questions[index];
    const e = etat[index];
    const infos = TYPES[q.type] || TYPES.qcm;

    questionType.textContent = infos.badge;
    questionConsigne.textContent = infos.consigne;
    questionText.textContent = q.q;
    answersContainer.replaceChildren();

    if (q.type === 'qcm') rendreChoix(q, e, q.options, q.correct);
    else if (q.type === 'vf') rendreChoix(q, e, ['Vrai', 'Faux'], q.correct ? 0 : 1, 'answers-vf');
    else if (q.type === 'saisie') rendreSaisie(q, e);
    else if (q.type === 'ordre') rendreOrdre(q, e);

    if (e.valide) afficherFeedback(q, e); else effacerFeedback();

    majProgression();
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === questions.length - 1;
    btnValidate.textContent = e.valide
      ? (index === questions.length - 1 ? 'Voir le résultat' : 'Question suivante')
      : 'Valider';
  }

  function majProgression() {
    progressLabel.textContent = `Question ${index + 1} / ${questions.length}`;
    progressScore.textContent = `Score : ${nbBonnes()}`;
    progressFill.style.width = `${(nbValidees() / questions.length) * 100}%`;
  }

  // ---------- Validation ----------
  function valider() {
    const q = questions[index];
    const e = etat[index];

    if (e.valide) { avancer(); return; }

    if (!aRepondu(q, e)) {
      feedback.replaceChildren();
      feedback.textContent = q.type === 'ordre'
        ? 'Place tous les mots avant de valider.'
        : q.type === 'saisie'
          ? 'Écris ta réponse avant de valider.'
          : 'Choisis une réponse avant de valider.';
      feedback.className = 'feedback warning';
      return;
    }

    e.valide = true;
    e.juste = estJuste(q, e);
    afficherQuestion();
  }

  function avancer() {
    if (index < questions.length - 1) { index++; afficherQuestion(); }
    else afficherResultat();
  }

  btnValidate.addEventListener('click', valider);
  btnPrev.addEventListener('click', () => { if (index > 0) { index--; afficherQuestion(); } });
  btnNext.addEventListener('click', () => { if (index < questions.length - 1) { index++; afficherQuestion(); } });

  // ---------- Résultat final ----------
  function afficherResultat() {
    const total = questions.length;
    const score = nbBonnes();
    const sansReponse = total - nbValidees();
    const pourcentage = Math.round((score / total) * 100);

    questionCard.classList.add('cache');
    navButtons.classList.add('cache');
    progressWrapper.classList.add('cache');
    resultCard.classList.remove('cache');

    const message = pourcentage >= 80 ? ' Excellent travail !'
      : pourcentage >= 50 ? 'Continue comme ça !'
      : ' Entraîne-toi encore !';
    finalScore.innerHTML = `Tu as obtenu <strong>${score} / ${total}</strong> (${pourcentage}%).<br>${message}`;
    if (sansReponse > 0) {
      finalScore.innerHTML +=
        `<br><small>${sansReponse} question${sansReponse > 1 ? 's' : ''} sans réponse.</small>`;
    }

    // Questions à revoir
    recap.replaceChildren();
    const aRevoir = questions
      .map((q, i) => ({ q, e: etat[i] }))
      .filter(({ e }) => !e.juste);

    if (aRevoir.length) {
      const titre = document.createElement('li');
      titre.className = 'recap-titre';
      titre.textContent = 'À revoir';
      recap.appendChild(titre);

      aRevoir.forEach(({ q, e }) => {
        const li = document.createElement('li');
        const enonce = document.createElement('span');
        enonce.textContent = q.q + (e.valide ? ' → ' + texteBonneReponse(q) : ' (sans réponse)');
        li.appendChild(enonce);
        if (q.lecon) {
          const lien = document.createElement('a');
          lien.href = 'francais.html#' + q.lecon;
          lien.className = 'lien-lecon';
          lien.textContent = 'Revoir la leçon';
          li.appendChild(lien);
        }
        recap.appendChild(li);
      });
    }

    // Niveau suivant
    const suivant = niveauxFr[niveauxFr.indexOf(niveau) + 1];
    btnSuivant.classList.toggle('cache', !suivant);
    btnSuivant.dataset.niveau = suivant || '';

    // Sauvegarde du meilleur score du niveau
    const scores = lireScoresFr();
    if (pourcentage > (Number(scores[niveau]) || 0)) {
      scores[niveau] = pourcentage;
      ecrireScoresFr(scores);
    }
    majBadges();
  }

  // ---------- Badges de meilleur score sur les onglets ----------
  function majBadges() {
    const scores = lireScoresFr();
    document.querySelectorAll('.badge-score[data-niveau]').forEach(b => {
      const s = scores[b.dataset.niveau];
      b.textContent = s !== undefined ? ` ${s}%` : '';
    });
  }

  // ---------- Événements ----------
  btnRestart.addEventListener('click', () => demarrer(niveau));
  btnSuivant.addEventListener('click', () => {
    if (btnSuivant.dataset.niveau) demarrer(btnSuivant.dataset.niveau);
  });
  btnsNiveaux.forEach(btn => btn.addEventListener('click', () => demarrer(btn.dataset.niveau)));

  majBadges();
  demarrer(niveau);
})();