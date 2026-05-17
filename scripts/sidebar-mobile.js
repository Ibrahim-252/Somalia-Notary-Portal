/**
 * sidebar-mobile.js
 * Wires up the mobile sidebar toggle, close button, and backdrop on every page.
 * Include this on dashboard.html, documents.html, and settings.html
 * BEFORE the page-specific script.
 */

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Create backdrop element once
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    // Create close button inside the sidebar if not present
    let closeBtn = sidebar.querySelector('.sidebar-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'sidebar-close';
      closeBtn.setAttribute('aria-label', 'Close menu');
      closeBtn.innerHTML = '✕';
      sidebar.insertBefore(closeBtn, sidebar.firstChild);
    }

    function openSidebar() {
      sidebar.classList.add('open');
      backdrop.classList.add('show');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
    }

    // Hamburger button
    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        openSidebar();
      });
    }

    // Close button
    closeBtn.addEventListener('click', closeSidebar);

    // Tap backdrop to close
    backdrop.addEventListener('click', closeSidebar);

    // Tap a sidebar link to close (so the next page doesn't open with sidebar still showing)
    sidebar.querySelectorAll('.sidebar-link, [data-nav]').forEach(link => {
      link.addEventListener('click', () => {
        // Small delay so the navigation/action runs first
        setTimeout(closeSidebar, 50);
      });
    });

    // ESC key closes sidebar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });
  });
})();