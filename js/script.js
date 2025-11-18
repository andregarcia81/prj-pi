// script.js

// Função reutilizável para inicializar o formulário
function initContactForm() {
  const form = document.querySelector('#contact-form');
  const feedbackEl = document.querySelector('#form-feedback');

  if (form && !form.dataset.initialized) {
    // Marca como inicializado para evitar duplicação
    form.dataset.initialized = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Validação: verifica se os campos obrigatórios estão preenchidos
      const nome = form.querySelector('[name="nome"]');
      const email = form.querySelector('[name="email"]');
      const mensagem = form.querySelector('[name="mensagem"]');

      console.log('Validação - Nome:', nome?.value);
      console.log('Validação - Email:', email?.value);
      console.log('Validação - Mensagem:', mensagem?.value);

      if (
        !nome?.value.trim() ||
        !email?.value.trim() ||
        !mensagem?.value.trim()
      ) {
        console.log('VALIDAÇÃO FALHOU - Campos vazios detectados');
        if (feedbackEl) {
          feedbackEl.textContent =
            'Por favor, preencha todos os campos obrigatórios.';
          feedbackEl.className = 'text-danger show';
        }
        return;
      }

      console.log('Validação passou - prosseguindo com envio');

      // Limpa feedback anterior
      if (feedbackEl) {
        feedbackEl.textContent = 'Enviando...';
        feedbackEl.className = 'text-muted show';
      } // Coleta dados
      const formData = new FormData(form);

      // Debug: Log da action URL
      const actionUrl = form.getAttribute('action');
      console.log('Enviando para:', actionUrl);

      try {
        // Envio para Formspree
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          if (feedbackEl) {
            feedbackEl.textContent =
              'Mensagem enviada com sucesso! Redirecionando...';
            feedbackEl.className = 'text-success show';
          }
          form.reset();
          setTimeout(() => {
            window.location.href = 'agradecimento.html';
          }, 1200);
        } else {
          // Tenta ler o JSON de erro
          let errorMessage = 'Falha no envio.';
          try {
            const data = await response.json();
            console.log('Error data:', data);
            if (data.errors && Array.isArray(data.errors)) {
              errorMessage = data.errors.map((e) => e.message).join('; ');
            } else if (data.error) {
              errorMessage = data.error;
            }
          } catch (jsonError) {
            console.error('Erro ao parsear JSON:', jsonError);
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }

          if (feedbackEl) {
            feedbackEl.textContent = errorMessage;
            feedbackEl.className = 'text-danger show';
          }
        }
      } catch (e) {
        console.error('Erro no envio:', e);
        if (feedbackEl) {
          feedbackEl.textContent =
            'Erro de conexão. Verifique sua internet e tente novamente.';
          feedbackEl.className = 'text-danger show';
        }
      }
    });
  }
}

// Função reutilizável para inicializar animações
function initScrollAnimations() {
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
}

// Inicializa na primeira carga
document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initScrollAnimations();
});

// Expõe funções globalmente para o SPA poder chamar
window.reinitScripts = function () {
  initContactForm();
  initScrollAnimations();
};
