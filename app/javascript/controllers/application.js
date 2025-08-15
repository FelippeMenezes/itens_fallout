import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }

(function() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  function restoreScrollPosition() {
    const scrolledItemId = sessionStorage.getItem('scroll-to-item-id');
    if (scrolledItemId) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = document.getElementById(scrolledItemId);
          if (element) {
            // Safari iOS não aceita "instant"
            element.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
          sessionStorage.removeItem('scroll-to-item-id');
        }, isIOS ? 500 : 100); // no iOS dar mais tempo ajuda
      });
    }
  }

  function setupCollapsibles() {
    document.querySelectorAll('.collapsible').forEach(header => {
      if (header.dataset.listenerAttached === 'true') return;
      header.dataset.listenerAttached = 'true';

      const container = header.nextElementSibling;

      if (header.classList.contains('collapsed')) {
        container.style.maxHeight = '0px';
      } else {
        container.style.maxHeight = container.scrollHeight + "px";
      }

      function toggleCollapse(event) {
        event.preventDefault(); // ajuda no Safari iOS
        const isCollapsed = header.classList.toggle('collapsed');
        const content = header.nextElementSibling;
        content.classList.toggle('collapsed', isCollapsed);

        if (isCollapsed) {
          content.style.maxHeight = '0px';
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }

        setTimeout(() => {
          const parentContainer = header.closest('.items-container:not(.collapsed)');
          if (parentContainer) {
            parentContainer.style.maxHeight = parentContainer.scrollHeight + "px";
          }
        }, 300);
      }

      // click normal (desktop + Android)
      header.addEventListener('click', toggleCollapse);
      // suporte ao tap no iOS
      header.addEventListener('touchend', toggleCollapse);
    });
  }

  function setupSearchFilter() {
    const searchInput = document.getElementById('item-search-input');
    // Previne múltiplos listeners em re-renderizações do Turbo
    if (!searchInput || searchInput.dataset.searchAttached) {
      return;
    }
    searchInput.dataset.searchAttached = 'true';

    function filterItems() {
      const searchTerm = this.value.toLowerCase().trim();

      // Filtra itens individuais
      document.querySelectorAll('tr[data-item-name]').forEach(row => {
        const itemName = row.dataset.itemName.toLowerCase();
        const isVisible = searchTerm === '' || itemName.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
      });

      // Filtra grupos por raridade
      document.querySelectorAll('.group-wrapper[data-rarity-name]').forEach(rarityGroup => {
        const visibleItems = rarityGroup.querySelectorAll('tr[data-item-name]:not([style*="display: none"])').length;
        const isVisible = searchTerm === '' || visibleItems > 0;
        rarityGroup.style.display = isVisible ? '' : 'none';

        if (isVisible && searchTerm !== '') {
          const header = rarityGroup.querySelector('.rarity-header');
          const container = header.nextElementSibling;
          if (header.classList.contains('collapsed')) {
            header.classList.remove('collapsed');
            container.style.maxHeight = container.scrollHeight + "px";
          }
        }
      });

      // Filtra grupos por categoria
      document.querySelectorAll('.group-wrapper[data-category-name]').forEach(categoryGroup => {
        const visibleRarities = categoryGroup.querySelectorAll('.group-wrapper[data-rarity-name]:not([style*="display: none"])').length;
        const isVisible = searchTerm === '' || visibleRarities > 0;
        categoryGroup.style.display = isVisible ? '' : 'none';

        if (isVisible && searchTerm !== '') {
          const header = categoryGroup.querySelector('.category-header');
          const container = header.nextElementSibling;
          if (header.classList.contains('collapsed')) {
            header.classList.remove('collapsed');
            container.style.maxHeight = container.scrollHeight + "px";
          }
        }
      });
    }

    // Safari iOS pode falhar só com "input", então adicionamos "keyup"
    searchInput.addEventListener('input', filterItems);
    searchInput.addEventListener('keyup', filterItems);
  }

  function initializePage() {
    setupCollapsibles();
    restoreScrollPosition();
    setupSearchFilter();
  }

  document.addEventListener('turbo:load', initializePage);
  document.addEventListener('turbo:render', () => {
    // reseta flag para o campo de busca reanexar no iOS
    const searchInput = document.getElementById('item-search-input');
    if (searchInput) searchInput.dataset.searchAttached = '';
    initializePage();
  });
  document.addEventListener('DOMContentLoaded', initializePage);

  // Salvar posição antes de submit
  document.addEventListener('submit', function(event) {
    const form = event.target;
    const row = form.closest('tr');
    if (row && row.id && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('scroll-to-item-id', row.id);
    }
  }, true);

  // Fix para bug de teclado no iOS
  if (isIOS) {
    window.addEventListener('focusout', () => {
      setTimeout(() => { window.scrollTo(0, window.scrollY); }, 50);
    });
  }
})();
