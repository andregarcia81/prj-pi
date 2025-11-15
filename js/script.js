// script.js

document.addEventListener('DOMContentLoaded', () => {
  // === FORMULÁRIO DE CONTATO ===
  const form = document.querySelector('#contact-form');
  const feedbackEl = document.querySelector('#form-feedback');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Limpa feedback anterior
      if (feedbackEl) {
        feedbackEl.textContent = 'Enviando...';
        feedbackEl.className = 'small mt-2 text-muted';
      }

      // Coleta dados
      const formData = new FormData(form);

      try {
        // Envio para Formspree
        const response = await fetch(form.getAttribute('action'), {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          if (feedbackEl) {
            feedbackEl.textContent =
              'Mensagem enviada com sucesso! Redirecionando...';
            feedbackEl.className = 'small mt-2 text-success';
          }
          setTimeout(() => {
            window.location.href = 'agradecimento.html';
          }, 1200);
          form.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          const errMsg = data.errors
            ? data.errors.map((e) => e.message).join('; ')
            : 'Falha no envio.';
          if (feedbackEl) {
            feedbackEl.textContent = errMsg;
            feedbackEl.className = 'small mt-2 text-danger';
          }
        }
      } catch (e) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Erro de conexão. Tente novamente.';
          feedbackEl.className = 'small mt-2 text-danger';
        }
      }
    });
  }

  // === ANIMAÇÃO AO ROLAR ===
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
});
