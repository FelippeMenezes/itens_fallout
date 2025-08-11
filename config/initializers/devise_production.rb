# config/initializers/devise_production.rb

# Apenas execute este código em ambiente de produção
if Rails.env.production?
  # Verifica se a variável de ambiente para a chave do Devise existe
  if ENV['DEVISE_SECRET_KEY'].present?
    # Configura o Devise para usar a chave diretamente da variável de ambiente
    Devise.setup do |config|
      config.secret_key = ENV['DEVISE_SECRET_KEY']
    end
  else
    # Se a variável não for encontrada, lança um erro claro durante o deploy
    raise "A variável de ambiente DEVISE_SECRET_KEY não foi configurada para produção."
  end
end
