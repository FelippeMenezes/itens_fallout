# app/controllers/items_controller.rb
class ItemsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_item, only: [:destroy]
  def index
    @items = Item.all.order(:category, :rarity, :name)
    @found_item_ids = current_user.found_items.pluck(:id)
  end

  def new
    @item = Item.new
  end

  def create
    @item = Item.new(item_params)

    if @item.save
      # Se salvar com sucesso, redireciona para a lista de itens
      # e mostra uma mensagem de sucesso.
      redirect_to items_path, notice: "Item '#{@item.name}' criado com sucesso!"
    else
      # Se houver erro (ex: campo em branco), renderiza o formulário novamente
      # para que o usuário possa corrigir.
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    @item.destroy
    redirect_to items_path, notice: "Item '#{@item.name}' foi removido com sucesso.", status: :see_other
  end

  def toggle_found
    item = Item.find(params[:id])
    user_item = current_user.user_items.find_by(item: item)

    if user_item
      user_item.destroy
    else
      current_user.user_items.create(item: item)
    end

    redirect_to items_path
  end

  private # Métodos abaixo desta linha são privados

  # MÉTODO PRIVADO: Garante que apenas os parâmetros permitidos sejam aceitos.
  def set_item
    @item = Item.find(params[:id])
  end

  # Isso é uma proteção de segurança essencial do Rails (Strong Parameters).
  def item_params
    params.require(:item).permit(:name, :category, :rarity)
  end
end

