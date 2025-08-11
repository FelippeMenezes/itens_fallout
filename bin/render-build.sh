#!/usr/bin/env bash
# exit on error
set -o errexit

bundle install
bundle exec rails assets:precompile
bundle exec rails assets:clean
bundle exec rails db:migrate
# O comando abaixo irá popular o banco de dados.
# Se você não quiser que ele rode a cada deploy (para não duplicar dados),
# você pode comentá-lo (adicionar um # no início) após o primeiro deploy bem-sucedido.
bundle exec rails db:seed
