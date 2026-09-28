/* ============================================================
   ANGLAIS.JS — Logique de navigation pour anglais.html
   (dépend de commun.js)
   ============================================================ */

(function initAnglais() {
  const btnsOnglets = document.querySelectorAll('.btn-onglet-anglais[data-target]');
  if (!btnsOnglets.length) return;

  const btnToggleModules = document.getElementById('btn-fab');
  const tousLesModules = document.querySelectorAll('.coursModules');

  function majLienPratique(idNiveau) {
    const lien = document.getElementById('lienPratique');
    if (lien && idNiveau) lien.href = 'exercice.html?niveau=' + idNiveau;
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

    // Remonter en haut de page quand on change de niveau
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function afficherLecon(zoneCoursActive, targetId) {
    if (!zoneCoursActive || !targetId) return;
    const toutesLesLecons = zoneCoursActive.querySelectorAll('[class^="coursModule"]');
    toutesLesLecons.forEach(lecon => lecon.classList.remove('active'));
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

        // Remonter en haut après sélection d'un module
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

  // Ouverture directe via #hash
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

  // FAB collapse au scroll
  const btnFab = document.getElementById('btn-fab');
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (btnFab) {
      if (window.scrollY > lastScrollY) btnFab.classList.add('collapsed');
      else btnFab.classList.remove('collapsed');
    }
    lastScrollY = window.scrollY;
  });

  // ---------- RECHERCHE ----------
  function highlightTextInElement(element, searchTerm) {
    const originalContent = element.dataset.originalContent;
    if (!originalContent) return;
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = originalContent.split(/(<[^>]*>)/);
    const highlightedParts = parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) return part;
      const normalizedPart = normalizeText(part);
      const normalizedTerm = normalizeText(searchTerm);
      if (normalizedPart.includes(normalizedTerm)) {
        return part.replace(regex, '<mark class="highlight">$1</mark>');
      }
      return part;
    });
    element.innerHTML = highlightedParts.join('');
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
      btnsOnglets.forEach(btn => btn.classList.remove('active'));
      boutonCorrespondant.classList.add('active');
      document.querySelectorAll('.contenu-cours, .coursModules').forEach(el => el.classList.remove('active', 'visible'));
      if (btnToggleModules) btnToggleModules.classList.remove('active');
      const [idCours, idModule] = boutonCorrespondant.dataset.target.split(',').map(id => id.trim());
      const zone = document.getElementById(idCours);
      const mod = document.getElementById(idModule);
      if (zone) zone.classList.add('active');
      if (mod) mod.classList.add('active');
    }

    const leconActive = zoneCours.querySelector(`#${courseElement.id}`);
    if (leconActive) {
      zoneCours.querySelectorAll('[class^="coursModule"]').forEach(l => l.classList.remove('active'));
      leconActive.classList.add('active');
    }

    const idModuleActif = boutonCorrespondant?.dataset.target.split(',')[1]?.trim();
    const moduleMenu = document.getElementById(idModuleActif);
    if (moduleMenu) {
      const itemCorrespondant = moduleMenu.querySelector(`.cours[data-target="${courseElement.id}"]`);
      if (itemCorrespondant) {
        moduleMenu.querySelectorAll('.cours').forEach(p => p.classList.remove('active'));
        itemCorrespondant.classList.add('active');
      }
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
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (normalizeText(plainText).includes(normalizedSearchTerm)) {
        highlightTextInElement(course, searchTerm);
        if (!firstMatch) firstMatch = course;
      } else {
        course.innerHTML = originalContent;
      }
    });
    
    if (firstMatch) activerContexteDuCours(firstMatch);
  }

  const globalSearchInput = document.getElementById('searchAnglais');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', e => searchInActiveCourses(e.target.value.trim()));
  }

  document.querySelectorAll('.searchList').forEach(input => {
    input.addEventListener('input', function (e) {
      const searchTerm = normalizeText(e.target.value);
      const moduleContainer = e.target.closest('.coursModules');
      if (!moduleContainer) return;
      const courses = moduleContainer.querySelectorAll('.cours');
      courses.forEach(course => {
        course.style.display = normalizeText(course.textContent).includes(searchTerm) ? '' : 'none';
      });
      moduleContainer.querySelectorAll('h3').forEach(heading => {
        let next = heading.nextElementSibling;
        let hasVisible = false;
        while (next && next.tagName !== 'H3') {
          if (next.classList.contains('cours') && next.style.display !== 'none') { hasVisible = true; break; }
          next = next.nextElementSibling;
        }
        heading.style.display = hasVisible ? '' : 'none';
      });
    });
  });
})();