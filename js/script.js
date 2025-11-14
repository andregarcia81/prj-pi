// script.js

document.addEventListener("DOMContentLoaded", () => {
  // === FORMULÁRIO DE CONTATO ===
  const form = document.querySelector("form");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      // Simula envio e redireciona para página de agradecimento
      setTimeout(() => {
        window.location.href = "agradecimento.html";
      }, 500); // Delay para melhor experiência do usuário
    });
  }

  // === ANIMAÇÃO AO ROLAR ===
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    section.classList.add("fade-in-init");
    observer.observe(section);
  });

});