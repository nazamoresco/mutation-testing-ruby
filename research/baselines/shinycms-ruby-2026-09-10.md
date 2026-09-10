# Baseline — ShinyCMS-ruby

Fecha: 2026-09-10  
Resultado: no aprobado; no se ejecutó Mutant

## Fuente fijada

- Repositorio: `https://github.com/denny/ShinyCMS-ruby.git`
- SHA: `84bc860cf81dad94e8f20019b7409f84c6571527`
- Estado del checkout tras la ejecución: limpio y detached en el SHA fijado.

## Entorno aislado

- Runner: imagen temporal basada en `ruby:3.4.5-slim`, arm64 Linux.
- Ruby: 3.4.5; Rails: 8.1.3.1; RSpec.
- Servicios: PostgreSQL 16 aislado; `DATABASE_URL` de prueba sin credenciales
  reales.
- El checkout original se montó de solo lectura. La ejecución usó un sandbox
  temporal sin `.git`, un volumen de gems y otro de `node_modules`.

## Preparación y fricción observada

La guía de instalación exige `bundle install` y `yarn install`. La primera
ejecución reveló dos requisitos adicionales de la suite:

1. La validación de plantillas usa `node_modules/mjml/bin/mjml`; se instaló el
   árbol JavaScript en un volumen temporal.
2. `mjml-rails` descubre el binario por `npm`; se añadieron Node/npm al runner
   temporal. El preflight final resolvió `/app/node_modules/.bin/mjml`.

La instalación de gems completó 272 gems. Estos pasos no modificaron el
checkout ni se consideran resultados de Mutant.

## Ejecución de baseline

- Preparación de base: `bundle exec rails db:prepare` en PostgreSQL nuevo.
- Corrida: `bundle exec rspec`.
- Resultado: código 1; 687 ejemplos, 1 falla; RSpec 3 min 8 s; contenedor
  3 min 51 s.
- Falla única: `plugins/ShinyCMS/spec/other/i18n_spec.rb:20`, con 84 claves de
  i18n faltantes.

## Decisión

La suite no pasó, por lo que ShinyCMS-ruby queda como `baseline_failed` en la
cohorte. No se modifica la aplicación ni se ejecuta Mutant. Su resultado queda
visible para medir viabilidad y costo de adopción, pero se excluye de los
agregados `global` de mutación. `klaxon` se incorpora como reemplazo Rails 8.1
RSpec para que la cohorte alcance ocho corridas comparables si pasa su baseline.
