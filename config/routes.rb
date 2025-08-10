Rails.application.routes.draw do
  devise_for :users

  resources :items, only: [:index, :new, :create, :destroy]

  post 'items/:id/toggle_found', to: 'items#toggle_found', as: :toggle_found_item

  authenticated :user do
    root 'items#index', as: :authenticated_root
  end

  devise_scope :user do
    root to: "devise/sessions#new"
  end
end

