import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }

(function() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isOldIOS = isIOS && /OS [1-9]/.test(navigator.userAgent); // iOS 9 or earlier

  function restoreScrollPosition() {
    const scrolledItemId = sessionStorage.getItem('scroll-to-item-id');
    if (scrolledItemId) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        // Add extra delay for older iOS devices
        const delay = isOldIOS ? 1000 : (isIOS ? 500 : 100);
        setTimeout(() => {
          const element = document.getElementById(scrolledItemId);
          if (element) {
            // Use different scroll methods for better compatibility
            if (isOldIOS || isSafari) {
              // Fallback for older Safari versions
              const rect = element.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              window.scrollTo(0, rect.top + scrollTop - (window.innerHeight / 2));
            } else {
              // Modern scroll method
              element.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
          }
          sessionStorage.removeItem('scroll-to-item-id');
        }, delay);
      });
    }
  }

  function setupCollapsibles() {
    document.querySelectorAll('.collapsible').forEach(header => {
      // Use a more robust check for attached listeners
      if (header.dataset.listenerAttached) return;
      header.dataset.listenerAttached = 'true';

      const container = header.nextElementSibling;

      // Ensure initial state is properly set
      if (header.classList.contains('collapsed')) {
        container.style.maxHeight = '0px';
        container.style.overflow = 'hidden';
      } else {
        container.style.maxHeight = container.scrollHeight + "px";
      }

      function toggleCollapse(event) {
        // Prevent default behavior for all events
        event.preventDefault();
        event.stopPropagation();
        
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          const isCollapsed = header.classList.toggle('collapsed');
          const content = header.nextElementSibling;
          content.classList.toggle('collapsed', isCollapsed);

          // Use different animation methods for better compatibility
          if (isOldIOS || isSafari) {
            // Fallback for older Safari versions
            content.style.transition = 'none';
            content.style.maxHeight = isCollapsed ? '0px' : content.scrollHeight + "px";
            content.style.overflow = isCollapsed ? 'hidden' : 'visible';
            
            // Force reflow
            content.offsetHeight;
            
            // Re-enable transition after a frame
            setTimeout(() => {
              content.style.transition = 'max-height 0.3s ease-out';
            }, 50);
          } else {
            // Modern approach
            content.style.maxHeight = isCollapsed ? '0px' : content.scrollHeight + "px";
          }

          // Update parent containers
          setTimeout(() => {
            const parentContainer = header.closest('.items-container:not(.collapsed)');
            if (parentContainer) {
              if (isOldIOS || isSafari) {
                parentContainer.style.transition = 'none';
                parentContainer.style.maxHeight = parentContainer.scrollHeight + "px";
                parentContainer.offsetHeight;
                setTimeout(() => {
                  parentContainer.style.transition = 'max-height 0.3s ease-out';
                }, 50);
              } else {
                parentContainer.style.maxHeight = parentContainer.scrollHeight + "px";
              }
            }
          }, 300);
        }, 10);
      }

      // Add multiple event listeners for better compatibility
      header.addEventListener('click', toggleCollapse);
      header.addEventListener('touchend', toggleCollapse);
      
      // Additional events for older Safari
      if (isOldIOS || isSafari) {
        header.addEventListener('touchstart', function(e) {
          e.preventDefault();
        });
        header.addEventListener('mousedown', toggleCollapse);
      }
    });
  }

  function setupSearchFilter() {
    const searchInput = document.getElementById('item-search-input');
    // More robust check for existing listeners
    if (!searchInput || searchInput.dataset.searchInitialized) {
      return;
    }
    searchInput.dataset.searchInitialized = 'true';

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
            // Better compatibility for expanding containers
            if (isOldIOS || isSafari) {
              container.style.transition = 'none';
              container.style.maxHeight = container.scrollHeight + "px";
              container.style.overflow = 'visible';
              container.offsetHeight;
              setTimeout(() => {
                container.style.transition = 'max-height 0.3s ease-out';
              }, 50);
            } else {
              container.style.maxHeight = container.scrollHeight + "px";
            }
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
            // Better compatibility for expanding containers
            if (isOldIOS || isSafari) {
              container.style.transition = 'none';
              container.style.maxHeight = container.scrollHeight + "px";
              container.style.overflow = 'visible';
              container.offsetHeight;
              setTimeout(() => {
                container.style.transition = 'max-height 0.3s ease-out';
              }, 50);
            } else {
              container.style.maxHeight = container.scrollHeight + "px";
            }
          }
        }
      });
    }

    // Multiple event listeners for better compatibility with older Safari
    searchInput.addEventListener('input', filterItems);
    searchInput.addEventListener('keyup', filterItems);
    searchInput.addEventListener('search', filterItems); // For search cancel button
    
    // Additional events for older Safari
    if (isOldIOS || isSafari) {
      searchInput.addEventListener('compositionend', filterItems); // For CJK input
      searchInput.addEventListener('paste', function() {
        setTimeout(filterItems.bind(this), 100); // Delay for paste operations
      });
    }
  }

  function initializePage() {
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      setupCollapsibles();
      restoreScrollPosition();
      setupSearchFilter();
    }, 50);
  }

  // Multiple event listeners for better compatibility
  document.addEventListener('turbo:load', initializePage);
  document.addEventListener('turbo:render', () => {
    // Reset flags for re-initialization
    const searchInput = document.getElementById('item-search-input');
    if (searchInput) {
      searchInput.dataset.searchInitialized = '';
      // Remove all collapsible listener flags
      document.querySelectorAll('.collapsible').forEach(header => {
        header.dataset.listenerAttached = '';
      });
    }
    initializePage();
  });
  document.addEventListener('DOMContentLoaded', initializePage);
  
  // Additional initialization for older browsers
  if (document.readyState === 'loading') {
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'interactive') {
        initializePage();
      }
    });
  } else {
    initializePage();
  }

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
      setTimeout(() => {
        window.scrollTo(0, window.scrollY);
      }, 50);
    });
    
    // Additional fix for older iOS versions
    if (isOldIOS) {
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 500);
      });
    }
  }
  
  // Fallback for browsers that don't support some features
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 16);
    };
  }
})();
