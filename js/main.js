/* ===========================================================
   ISOLA DÉNEIGEMENT — script partagé
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Année dans le footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }

  /* ---------- Lien de nav actif ---------- */
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('is-active');
    }
  });

  /* ---------- Neige animée (décorative, légère) ---------- */
  document.querySelectorAll('.snowfall').forEach(field => {
    const count = window.innerWidth < 700 ? 18 : 34;
    for (let i = 0; i < count; i++) {
      const flake = document.createElement('i');
      const size = 2 + Math.random() * 4;
      flake.style.width = size + 'px';
      flake.style.height = size + 'px';
      flake.style.left = Math.random() * 100 + '%';
      flake.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
      flake.style.animationDuration = (8 + Math.random() * 10) + 's';
      flake.style.animationDelay = (Math.random() * -18) + 's';
      field.appendChild(flake);
    }
  });

  /* ---------- Jauge à neige : remplissage au scroll ---------- */
  const gauges = document.querySelectorAll('.gauge');
  if (gauges.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    gauges.forEach(g => io.observe(g));
  } else {
    gauges.forEach(g => g.classList.add('is-visible'));
  }

  /* ---------- QR code dynamique ----------
     Génère un QR code pointant vers l'URL réelle du site une fois hébergé.
     Tant que le site est testé en local (file://), un domaine de
     remplacement est utilisé pour que le QR code reste visible.
     ⚠️ Remplacez SITE_URL_FALLBACK par votre vrai nom de domaine. */
  const SITE_URL_FALLBACK = 'https://isoladeneigement.com';
  document.querySelectorAll('[data-qr]').forEach(box => {
    const base = location.protocol.indexOf('http') === 0
      ? (location.origin + location.pathname.replace(/[^/]+$/, ''))
      : SITE_URL_FALLBACK + '/';
    const target = base.endsWith('/') ? base : base + '/';
    const src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&color=0E2238&data=' + encodeURIComponent(target);
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Code QR vers le site Isola Déneigement';
    img.loading = 'lazy';
    box.appendChild(img);
  });

  /* ---------- Formulaires → envoi par courriel ---------- */
  const DEST_EMAIL = 'isoladeneigement@gmail.com';

  function buildMailto(subject, lines) {
    const body = lines.filter(Boolean).join('\n');
    return 'mailto:' + DEST_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function showMsg(form, type, text) {
    let msg = form.querySelector('.form-msg');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-msg';
      form.appendChild(msg);
    }
    msg.className = 'form-msg ' + (type === 'success' ? 'is-success' : 'is-error');
    msg.textContent = text;
  }

  function getChecked(form, name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(i => i.value);
  }
  function getRadio(form, name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  }
  function getVal(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : '';
  }

  /* --- Formulaire de réservation --- */
  const reservationForm = document.getElementById('reservation-form');
  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = ['prenom', 'nom', 'telephone', 'email', 'adresse'];
      const missing = required.filter(name => !getVal(reservationForm, name));
      if (missing.length) {
        showMsg(reservationForm, 'error', 'Merci de remplir tous les champs obligatoires (marqués d\'un *) avant d\'envoyer votre demande.');
        return;
      }

      const lines = [
        'NOUVELLE DEMANDE DE RÉSERVATION — ISOLA DÉNEIGEMENT',
        '',
        '— Coordonnées —',
        'Nom : ' + getVal(reservationForm, 'prenom') + ' ' + getVal(reservationForm, 'nom'),
        'Téléphone : ' + getVal(reservationForm, 'telephone'),
        'Courriel : ' + getVal(reservationForm, 'email'),
        'Adresse du service : ' + getVal(reservationForm, 'adresse'),
        '',
        '— Propriété —',
        'Type de propriété : ' + (getRadio(reservationForm, 'type_propriete') || 'non précisé'),
        '',
        '— Services souhaités —',
        (getChecked(reservationForm, 'services').join(', ') || 'non précisé'),
        '',
        '— Formule —',
        'Formule : ' + (getRadio(reservationForm, 'formule') || 'non précisée'),
        'Date souhaitée (si service ponctuel) : ' + (getVal(reservationForm, 'date_souhaitee') || 'non précisée'),
        '',
        '— Disponibilités —',
        'Jours préférés : ' + (getChecked(reservationForm, 'jours').join(', ') || 'flexible'),
        'Plage horaire préférée : ' + (getChecked(reservationForm, 'horaires').join(', ') || 'flexible'),
        'Contraintes d\'horaire : ' + (getVal(reservationForm, 'contraintes') || 'aucune'),
        '',
        '— Instructions particulières —',
        (getVal(reservationForm, 'instructions') || 'aucune'),
      ];

      window.location.href = buildMailto('Demande de réservation — ' + getVal(reservationForm, 'prenom') + ' ' + getVal(reservationForm, 'nom'), lines);
      showMsg(reservationForm, 'success', 'Votre logiciel de courriel va s\'ouvrir avec votre demande déjà remplie, à envoyer à ' + DEST_EMAIL + '. Si rien ne s\'ouvre, écrivez-nous directement à cette adresse.');
    });
  }

  /* --- Formulaire de contact --- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = ['nom', 'email', 'message'];
      const missing = required.filter(name => !getVal(contactForm, name));
      if (missing.length) {
        showMsg(contactForm, 'error', 'Merci de remplir votre nom, votre courriel et votre message.');
        return;
      }
      const lines = [
        'NOUVEAU MESSAGE — FORMULAIRE DE CONTACT',
        '',
        'Nom : ' + getVal(contactForm, 'nom'),
        'Courriel : ' + getVal(contactForm, 'email'),
        'Sujet : ' + (getVal(contactForm, 'sujet') || 'non précisé'),
        '',
        'Message :',
        getVal(contactForm, 'message'),
      ];
      window.location.href = buildMailto('Message du site — ' + (getVal(contactForm, 'sujet') || 'Contact'), lines);
      showMsg(contactForm, 'success', 'Votre logiciel de courriel va s\'ouvrir avec votre message déjà rempli, à envoyer à ' + DEST_EMAIL + '.');
    });
  }

});
