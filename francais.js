/* ============================================================
   FRANCAIS.JS — Logique de navigation pour francais.html
   (dépend de commun.js)
   ============================================================ */

(function initFrancais() {
  const btnsOnglets = document.querySelectorAll('.btn-onglet-langue[data-target]');
  if (!btnsOnglets.length) return;

  const btnToggleModules = document.getElementById('btn-fab-fr');
  const tousLesModules = document.querySelectorAll('.coursModules');

  function majLienPratique(idNiveau) {
    const lien = document.getElementById('lienPratiqueFr');
    if (lien && idNiveau) lien.href = 'exercicefr.html?niveau=' + idNiveau;
  }

  // Ferme le menu latéral s'il est ouvert
  function fermerMenuLateral() {
    const menu = document.querySelector('.menu');
    const ouvreMenu = document.querySelector('.ouvreMenu');
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
      if (ouvreMenu) ouvreMenu.innerHTML = "<span>&#9776;</span>";
    }
  }

  // Ferme le conteneur des modules s'il est ouvert
  function fermerConteneurModules() {
    tousLesModules.forEach(m => m.classList.remove('visible'));
    if (btnToggleModules) btnToggleModules.classList.remove('active');
  }

  function activerOnglet(bouton) {
    btnsOnglets.forEach(btn => btn.classList.remove('active'));
    bouton.classList.add('active');
    bouton.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });

    document.querySelectorAll('.contenu-cours, .coursModules').forEach(el => {
      el.classList.remove('active', 'visible');
    });
    if (btnToggleModules) btnToggleModules.classList.remove('active');

    const [idCours, idModule] = bouton.dataset.target.split(',').map(id => id.trim());
    majLienPratique(idCours);

    const zoneCours = document.getElementById(idCours);
    const menuModule = document.getElementById(idModule);

    if (zoneCours) zoneCours.classList.add('active');
    if (menuModule) {
      menuModule.classList.add('active');
      const premierItem = menuModule.querySelector('.cours');
      if (premierItem) {
        menuModule.querySelectorAll('.cours').forEach(p => p.classList.remove('active'));
        premierItem.classList.add('active');
        afficherLecon(zoneCours, premierItem.dataset.target);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function afficherLecon(zoneCoursActive, targetId) {
    if (!zoneCoursActive || !targetId) return;
    zoneCoursActive.querySelectorAll('[class^="coursModule"]').forEach(l => l.classList.remove('active'));
    const leconCible = zoneCoursActive.querySelector(`#${targetId}`);
    if (leconCible) leconCible.classList.add('active');
  }

  btnsOnglets.forEach(bouton => bouton.addEventListener('click', () => activerOnglet(bouton)));

  tousLesModules.forEach(module => {
    module.addEventListener('click', (e) => {
      if (e.target.classList.contains('cours')) {
        module.querySelectorAll('.cours').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        const zoneCoursActive = document.querySelector('.contenu-cours.active');
        afficherLecon(zoneCoursActive, e.target.dataset.target);
        module.classList.remove('visible');
        if (btnToggleModules) btnToggleModules.classList.remove('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  if (btnToggleModules) {
    btnToggleModules.addEventListener('click', (e) => {
      e.stopPropagation();
      const moduleActif = document.querySelector('.coursModules.active');
      if (moduleActif) {
        // Fermer le menu latéral s'il est ouvert
        fermerMenuLateral();
        moduleActif.classList.toggle('visible');
        btnToggleModules.classList.toggle('active');
      }
    });
  }

  document.addEventListener('click', (e) => {
    const moduleActif = document.querySelector('.coursModules.active.visible');
    if (moduleActif) {
      if (!moduleActif.contains(e.target) && (!btnToggleModules || !btnToggleModules.contains(e.target))) {
        moduleActif.classList.remove('visible');
        if (btnToggleModules) btnToggleModules.classList.remove('active');
      }
    }
  });

  // Observer l'ouverture du menu latéral pour fermer le conteneur des modules
  const menuObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const menu = mutation.target;
        if (menu.classList.contains('menu') && menu.classList.contains('show')) {
          fermerConteneurModules();
        }
      }
    });
  });

  const menuElement = document.querySelector('.menu');
  if (menuElement) {
    menuObserver.observe(menuElement, { attributes: true });
  }

  if (btnsOnglets.length > 0) activerOnglet(btnsOnglets[0]);

  // Ouverture via hash
  function ouvrirLeconDepuisHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const lecon = document.getElementById(id);
    const zone = lecon && lecon.closest('.contenu-cours');
    if (!zone) return;

    const bouton = Array.from(btnsOnglets).find(b => b.dataset.target.split(',')[0].trim() === zone.id);
    if (!bouton) return;
    activerOnglet(bouton);
    const menuModule = document.getElementById(bouton.dataset.target.split(',')[1].trim());
    const item = menuModule && menuModule.querySelector(`.cours[data-target="${id}"]`);
    if (item) {
      menuModule.querySelectorAll('.cours').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
    }
    afficherLecon(zone, id);
    window.scrollTo({ top: 0 });
  }
  ouvrirLeconDepuisHash();

  // Recherche
  function highlightTextInElement(element, searchTerm) {
    const originalContent = element.dataset.originalContent;
    if (!originalContent) return;
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = originalContent.split(/(<[^>]*>)/);
    element.innerHTML = parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) return part;
      if (normalizeText(part).includes(normalizeText(searchTerm))) {
        return part.replace(regex, '<mark class="highlight">$1</mark>');
      }
      return part;
    }).join('');
  }

  function activerContexteDuCours(courseElement) {
    const zoneCours = courseElement.closest('.contenu-cours');
    if (!zoneCours) return;
    const idZone = zoneCours.id;
    majLienPratique(idZone);
    let boutonCorrespondant = null;
    btnsOnglets.forEach(btn => {
      const [idCours] = btn.dataset.target.split(',').map(id => id.trim());
      if (idCours === idZone) boutonCorrespondant = btn;
    });
    if (boutonCorrespondant && !boutonCorrespondant.classList.contains('active')) {
      activerOnglet(boutonCorrespondant);
    }
    const leconActive = zoneCours.querySelector(`#${courseElement.id}`);
    if (leconActive) {
      zoneCours.querySelectorAll('[class^="coursModule"]').forEach(l => l.classList.remove('active'));
      leconActive.classList.add('active');
    }
  }

  // Recherche globale limitée au contenu actif uniquement
  function searchInActiveCourses(searchTerm) {
    const zoneCoursActive = document.querySelector('.contenu-cours.active');
    if (!zoneCoursActive) return;

    const allCourses = zoneCoursActive.querySelectorAll('.coursModule, .coursModule1, .coursModule2, .coursModule3');
    
    if (!searchTerm || searchTerm.length < 1) {
      allCourses.forEach(course => {
        if (course.dataset.originalContent) {
          course.innerHTML = course.dataset.originalContent;
          delete course.dataset.originalContent;
        }
      });
      return;
    }

    const normalizedSearchTerm = normalizeText(searchTerm);
    let firstMatch = null;
    
    allCourses.forEach(course => {
      if (!course.dataset.originalContent) course.dataset.originalContent = course.innerHTML;
      const originalContent = course.dataset.originalContent;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalContent;
      
      if (normalizeText(tempDiv.textContent || '').includes(normalizedSearchTerm)) {
        highlightTextInElement(course, searchTerm);
        if (!firstMatch) firstMatch = course;
      } else {
        course.innerHTML = originalContent;
      }
    });
    
    if (firstMatch) activerContexteDuCours(firstMatch);
  }

  const globalSearchInput = document.getElementById('searchCours');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', e => searchInActiveCourses(e.target.value.trim()));
  }

  document.querySelectorAll('.searchList').forEach(input => {
    input.addEventListener('input', function (e) {
      const searchTerm = normalizeText(e.target.value);
      const moduleContainer = e.target.closest('.coursModules');
      if (!moduleContainer) return;
      moduleContainer.querySelectorAll('.cours').forEach(c => {
        c.style.display = normalizeText(c.textContent).includes(searchTerm) ? '' : 'none';
      });
      moduleContainer.querySelectorAll('h3').forEach(h => {
        let next = h.nextElementSibling, hasVisible = false;
        while (next && next.tagName !== 'H3') {
          if (next.classList.contains('cours') && next.style.display !== 'none') { hasVisible = true; break; }
          next = next.nextElementSibling;
        }
        h.style.display = hasVisible ? '' : 'none';
      });
    });
  });
})();