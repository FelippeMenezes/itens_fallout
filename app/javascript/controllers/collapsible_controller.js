import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content"]

  connect() {
    // Garante que o estado visual inicial esteja correto
    this.update();
  }

  toggle() {
    this.element.classList.toggle("collapsed");
    this.update();

    // Dispara um evento para que um pai aninhado possa se reajustar
    this.dispatch("toggled", { bubbles: true });
  }

  // Ação que escuta o evento de um filho e se reajusta
  resize() {
    this.update();
  }

  // A função principal que ajusta a altura
  update() {
    if (this.element.classList.contains("collapsed")) {
      this.contentTarget.style.maxHeight = "0px";
    } else {
      this.contentTarget.style.maxHeight = this.contentTarget.scrollHeight + "px";
    }
  }

  // Usado pela busca para garantir que a seção está aberta
  show() {
    if (this.element.classList.contains("collapsed")) {
      this.element.classList.remove("collapsed");
      this.update();
      this.dispatch("toggled", { bubbles: true });
    }
  }
}