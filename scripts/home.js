/**
 * home.js
 * Handles homepage interactions and animations.
 */

document.addEventListener('DOMContentLoaded', () => {

  // If user is already logged in, adjust nav to show dashboard link
  const session = sessionStorage.getItem('daftarka_session');
  if (session) {
    const parsed = JSON.parse(session);
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.innerHTML = `
        <a href="dashboard.html" class="btn btn-primary">Go to Dashboard →</a>
      `;
    }
  }

  // Animate elements into view on scroll
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeUp 0.5s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.problem-card, .step').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

});
