import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }

(function() {
  // --- DETECÇÃO DE IOS MELHORADA ---
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // --- FUNÇÃO DE ROLAGEM CORRIGIDA ---
  function restoreScrollPosition() {
    const scrolledItemId = sessionStorage.getItem('scroll-to-item-id');
    if (scrolledItemId) {
      // Usar um timeout um pouco maior para dar tempo ao iOS para renderizar
      setTimeout(() => {
        const element = document.getElementById(scrolledItemId);
        if (element) {
          // 'instant' é mais confiável que 'smooth' em restaurações automáticas
          element.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        sessionStorage.removeItem('scroll-to-item-id');
      }, isIOS ? 350 : 100); // Aumentado o tempo para iOS
    }
  }

  // --- FUNÇÃO DE RECOLHER/EXPANDIR CORRIGIDA ---
  function setupCollapsibles() {
    document.querySelectorAll('.collapsible').forEach(header => {
      // Previne adicionar múltiplos listeners
      if (header.dataset.listenerAttached === 'true') return;
      header.dataset.listenerAttached = 'true';

      const container = header.nextElementSibling;

      // Define o estado inicial baseado na classe
      if (header.classList.contains('collapsed')) {
        container.style.maxHeight = '0px';
      } else {
        container.style.maxHeight = container.scrollHeight + "px";
      }

      // Adiciona um evento de clique que funciona de forma mais confiável no iOS
      header.addEventListener('click', function() {
        this.classList.toggle('collapsed');
        const content = this.nextElementSibling;
        
        if (this.classList.contains('collapsed')) {
          content.style.maxHeight = '0px';
        } else {
          // Expande para a altura total do conteúdo
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  }

  // --- FUNÇÃO DE BUSCA OTIMIZADA ---
  // A lógica original está boa, mas depende do setupCollapsibles funcionar.
  // Vamos garantir que a expansão na busca também seja robusta.
  function setupSearchFilter() {
    const searchInput = document.getElementById('item-search-input');
    if (!searchInput || searchInput.dataset.searchAttached) {
      return;
    }
    searchInput.dataset.searchAttached = 'true';

    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      const isSearching = searchTerm !== '';

      document.querySelectorAll('tr[data-item-name]').forEach(row => {
        const itemName = row.dataset.itemName.toLowerCase();
        row.style.display = isSearching && !itemName.includes(searchTerm) ? 'none' : '';
      });

      document.querySelectorAll('.group-wrapper[data-rarity-name]').forEach(rarityGroup => {
        const visibleItems = rarityGroup.querySelectorAll('tr[data-item-name]:not([style*="display: none"])').length;
        rarityGroup.style.display = isSearching && visibleItems === 0 ? 'none' : '';
        
        // Expande o grupo se estiver pesquisando e tiver itens visíveis
        if (isSearching && visibleItems > 0) {
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
        categoryGroup.style.display = isSearching && visibleRarities === 0 ? 'none' : '';

        // Expande o grupo se estiver pesquisando e tiver subgrupos visíveis
        if (isSearching && visibleRarities > 0) {
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

  // --- INICIALIZADOR PRINCIPAL ---
  function initializePage() {
    setupCollapsibles();
    restoreScrollPosition();
    setupSearchFilter();
  }

  // Usar 'turbo:frame-render' pode ser mais confiável para re-aplicar JS após ações
  document.addEventListener('turbo:load', initializePage);
  document.addEventListener('turbo:render', initializePage);
  
  // Salvar a posição do scroll antes da navegação do Turbo
  document.addEventListener('submit', function(event) {
    const form = event.target.closest('form');
    if (form) {
      const row = form.closest('tr');
      if (row && row.id) {
        sessionStorage.setItem('scroll-to-item-id', row.id);
      }
    }
  }, true);

})();