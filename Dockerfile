# Dockerfile
# Use a versão mais recente do Ruby
ARG RUBY_VERSION=3.1.4
FROM ruby:$RUBY_VERSION

# Instala dependências essenciais
RUN apt-get update -qq && \
    apt-get install -y build-essential libvips libpq-dev

# Define o diretório de trabalho
WORKDIR /rails

# Instala o Bundler
ARG BUNDLER_VERSION=2.5.11
RUN gem install bundler -v $BUNDLER_VERSION

# Copia os arquivos do Gemfile para o contêiner
COPY Gemfile Gemfile.lock ./
# Instala as gems
RUN bundle install && rm -rf vendor/bundle/ruby/*/cache

# Copia o resto do código da aplicação
COPY . .

# Pré-compila os assets
RUN bundle exec bootsnap precompile --gemfile && \
    bundle exec rails assets:precompile

# Copia o nosso novo script de entrypoint para o contêiner e o torna executável
COPY bin/docker-entrypoint /usr/bin/
RUN chmod +x /usr/bin/docker-entrypoint
ENTRYPOINT ["docker-entrypoint"]


# Expõe a porta 3000 e define o comando para iniciar o servidor
EXPOSE 3000
CMD ["bin/rails", "server"]

