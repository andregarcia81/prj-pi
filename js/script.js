// script.js

// Função reutilizável para inicializar o formulário
function initContactForm() {
  const form = document.querySelector('#contact-form');
  const feedbackEl = document.querySelector('#form-feedback');

  // Função para mostrar toaster
  function showToaster(message, type, autoHide = true) {
    if (feedbackEl) {
      feedbackEl.textContent = message;
      feedbackEl.className = `${type} show`;

      // Auto-hide após 5 segundos (exceto para "enviando")
      if (autoHide && type !== 'text-muted') {
        setTimeout(() => {
          feedbackEl.classList.remove('show');
        }, 5000);
      }
    }
  }

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
        showToaster(
          'Por favor, preencha todos os campos obrigatórios.',
          'text-danger'
        );
        return;
      }

      console.log('Validação passou - prosseguindo com envio');

      // Mostra feedback de envio
      showToaster('Enviando...', 'text-muted', false); // Coleta dados
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
          showToaster(
            'Mensagem enviada com sucesso! Redirecionando...',
            'text-success',
            false
          );
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

          showToaster(errorMessage, 'text-danger');
        }
      } catch (e) {
        console.error('Erro no envio:', e);
        showToaster(
          'Erro de conexão. Verifique sua internet e tente novamente.',
          'text-danger'
        );
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
