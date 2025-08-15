import { Application } from "@hotwired/stimulus"

const application = Application.start()

application.debug = false
window.Stimulus   = application

export { application }

(function() {
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  const eventType = isTouchDevice ? 'touchstart' : 'click';

  function restoreScrollPosition() {
    const scrolledItemId = sessionStorage.getItem('scroll-to-item-id');
    if (scrolledItemId) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = document.getElementById(scrolledItemId);
          if (element) {
            element.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
          sessionStorage.removeItem('scroll-to-item-id');
        }, 150);
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

      header.addEventListener(eventType, function(event) {
        event.preventDefault();

        const isCollapsed = this.classList.toggle('collapsed');
        const content = this.nextElementSibling;
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
      });
    });
  }

  function setupSearchFilter() {
    const searchInput = document.getElementById('item-search-input');
    if (!searchInput || searchInput.dataset.searchAttached) {
      return;
    }
    searchInput.dataset.searchAttached = 'true';

    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();

      document.querySelectorAll('tr[data-item-name]').forEach(row => {
        const itemName = row.dataset.itemName.toLowerCase();
        const isVisible = searchTerm === '' || itemName.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
      });

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
    });
  }

  function initializePage() {
    setupCollapsibles();
    restoreScrollPosition();
    setupSearchFilter();
  }

  document.addEventListener('turbo:load', initializePage);
  document.addEventListener('turbo:render', initializePage);
  document.addEventListener('DOMContentLoaded', initializePage);

  document.addEventListener('submit', function(event) {
    const form = event.target;
    const row = form.closest('tr');
    if (row && row.id && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('scroll-to-item-id', row.id);
    }
  }, true);

  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    window.addEventListener('focusout', () => {
      setTimeout(() => { window.scrollTo(0, window.scrollY); }, 50);
    });
  }
})();
