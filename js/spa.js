(function () {
  const CONTENT_SELECTOR = '#spa-content';
  const FADE_OUT_CLASS = 'spa-fade-out';
  const FADE_IN_CLASS = 'spa-fade-in';
  const TRANSITION_TIMEOUT = 400;

  function isModifiedClick(event) {
    return (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    );
  }

  function sameOrigin(url) {
    try {
      const u = new URL(url, window.location.href);
      return u.origin === window.location.origin;
    } catch (_) {
      return false;
    }
  }

  function getContentEl(doc) {
    return doc.querySelector(CONTENT_SELECTOR);
  }

  function updateFooterOffset() {
    try {
      const footer = document.querySelector('.site-footer');
      const root = document.documentElement;
      const fixed = document.body.classList.contains('has-fixed-footer');
      if (fixed && footer) {
        root.style.setProperty('--footer-offset', footer.offsetHeight + 'px');
      } else {
        root.style.removeProperty('--footer-offset');
      }
    } catch (_) {}
  }

  function scheduleFooterOffsetAdjustments() {
    updateFooterOffset();

    // Reinicializa o ajuste do rodapé após mudanças de layout

    setTimeout(updateFooterOffset, 250);
    setTimeout(updateFooterOffset, 1000);
  }

  function waitForTransition(el, timeoutMs) {
    return new Promise((resolve) => {
      let done = false;
      const cleanup = () => {
        if (done) return;
        done = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = (e) => {
        if (e.target === el) cleanup();
      };
      el.addEventListener('transitionend', onEnd, { once: true });
      setTimeout(cleanup, timeoutMs);
    });
  }

  function normalizePath(p) {
    if (!p || p === '/') return '/index.html';
    const pl = p.toLowerCase();
    if (pl.endsWith('agradecimento.html')) return '/contato.html';
    return p;
  }

  function setActiveNav(pathname) {
    const current = normalizePath(pathname);
    const links = document.querySelectorAll('nav a');
    links.forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== location.origin) return;
        const isActive = normalizePath(url.pathname) === current;
        a.classList.toggle('active', isActive);
        if (a.parentElement && a.parentElement.classList.contains('nav-item')) {
          a.parentElement.classList.toggle('active', isActive);
        }
      } catch (_) {}
    });
  }

  async function navigateTo(target, addToHistory = true) {
    let url;
    try {
      url =
        target instanceof URL ? target : new URL(target, window.location.href);
    } catch (_) {
      window.location.href = target;
      return;
    }

    if (!sameOrigin(url)) {
      window.location.href = url.href;
      return;
    }

    const currentContent = document.querySelector(CONTENT_SELECTOR);
    if (!currentContent) {
      window.location.href = url.href;
      return;
    }

    try {
      currentContent.classList.add(FADE_OUT_CLASS);
      await waitForTransition(currentContent, TRANSITION_TIMEOUT);

      const res = await fetch(url.href, {
        headers: { 'X-Requested-With': 'spa' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = getContentEl(doc);
      if (!newContent) throw new Error('No spa-content in target');

      document.title = doc.title || document.title;
      currentContent.innerHTML = newContent.innerHTML;

      // Cabecalho Fixo

      try {
        const wantsFixedFooter =
          doc.body && doc.body.classList.contains('has-fixed-footer');
        document.body.classList.toggle('has-fixed-footer', !!wantsFixedFooter);
        scheduleFooterOffsetAdjustments();
      } catch (_) {}

      if (addToHistory) {
        window.history.pushState({ url: url.href }, '', url.href);
      }

      window.scrollTo({
        top: 0,
        behavior: 'instant' in window ? 'instant' : 'auto',
      });
      currentContent.classList.remove(FADE_OUT_CLASS);
      currentContent.classList.add(FADE_IN_CLASS);
      // Force reflow to ensure the fade-in applies
      void currentContent.offsetWidth;
      setActiveNav(url.pathname);

      // Reinicializar event listeners após carregar novo conteúdo
      reinitializeScripts();
    } catch (err) {
      window.location.href = url.href;
    }
  }

  function reinitializeScripts() {
    // Reinicializa o formulário de contato
    const form = document.querySelector('form');
    if (form) {
      // Remove event listeners antigos
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      // Adiciona novo event listener
      newForm.addEventListener('submit', (event) => {
        event.preventDefault();
        setTimeout(() => {
          navigateTo('agradecimento.html', true);
        }, 500);
      });
    }

    // Reinicializa animações ao rolar
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => {
      section.classList.add('fade-in-init');
      observer.observe(section);
    });
  }

  function onLinkClick(e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.hasAttribute('download')) return;
    if (isModifiedClick(e)) return;

    try {
      const url = new URL(href, window.location.href);
      if (!sameOrigin(url)) return;
      // Let the browser handle same-page hash navigation
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      navigateTo(url, true);
    } catch (_) {}
  }

  window.addEventListener('popstate', (e) => {
    const url = e.state && e.state.url ? e.state.url : window.location.href;
    navigateTo(url, false);
  });

  document.addEventListener('click', onLinkClick);
  setActiveNav(location.pathname);
  scheduleFooterOffsetAdjustments();
  window.addEventListener('resize', scheduleFooterOffsetAdjustments);
  window.addEventListener('load', scheduleFooterOffsetAdjustments);

  // Inicializa scripts na primeira carga
  reinitializeScripts();
})();
