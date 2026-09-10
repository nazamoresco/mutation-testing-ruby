# Baseline — Speakerline

Fecha: 2026-09-10  
Resultado: aprobado; dos corridas verdes y sin flakiness observada

## Fuente fijada

- Repositorio: `https://github.com/nodunayo/speakerline.git`
- SHA: `b71559f0fbe7c7a0e4a0bada91d6c900258e118e`
- Estado del checkout tras la preparación: limpio y detached en el SHA fijado.

## Entorno reproducible

- Runner temporal: `ruby:3.3.5-slim`, Linux arm64.
- Ruby 3.3.5; Rails 8.0.5.1; RSpec 8.0.4.
- PostgreSQL 16 aislado con la base `speakerline_test`.
- Valores dummy para las variables de administración y reCAPTCHA requeridas por
  el README; no se usaron credenciales reales.
- Gems en volumen Docker temporal. El Dockerfile del proyecto se dejó intacto:
  declara Ruby 2.6.5, que no coincide con su `.ruby-version` 3.3.5 ni con el
  Gemfile actual.

## Ejecución

- Preparación: `bundle exec rails db:prepare` contra PostgreSQL aislado.
- Corrida 1: `bundle exec rspec` — código 0; 66 ejemplos, 0 fallas; RSpec
  10,04 s; contenedor 22,99 s.
- Corrida 2: `bundle exec rspec` — código 0; 66 ejemplos, 0 fallas; RSpec
  2,94 s; contenedor 6,01 s.
- Flakiness observada: ninguna en dos corridas verdes.

## Decisión

Speakerline cumple el criterio de baseline para la cohorte. La integración de
Mutant se configura sólo en un sandbox temporal: Mutant/Mutant-RSpec 0.16.3,
perfil `light`, un worker y timeout por mutación de 5 s. No se modifica ni se
publica código del repositorio de origen.
