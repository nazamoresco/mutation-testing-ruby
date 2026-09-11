# Baseline — Shipit Engine

Fecha: 2026-09-11  
Resultado: no aprobado; no se ejecutó Mutant

## Fuente fijada

- Repositorio: `https://github.com/Shopify/shipit-engine`
- SHA: `b880965b2768820bb87e07a402df1dc24576332d`
- Checkout fuente: limpio y separado; la suite se corrió sobre una copia temporal
  sin `.git` y sin artefactos de ejecuciones previas.

## Entorno reproducible

- Runner temporal: `ruby:3.4.5-slim`, Linux arm64.
- Rails 8.1.2; Minitest; SQLite y Redis 7 aislado.
- Dependencias de compilación necesarias: `libpq-dev`, `libyaml-dev` y el cliente
  MySQL. La suite además requiere Node.js y Git.
- Las gems se instalaron en un volumen temporal. No se modificó el checkout de
  terceros ni su Dockerfile.

## Ejecución válida

- Preparación: `bundle exec rake db:create db:schema:load test` con
  `RAILS_ENV=test` y Redis aislado.
- Resultado: código 1; 1.245 tests, 3.513 aserciones, 4 fallas, 0 errores,
  0 skips; 364,28 s.
- Las cuatro fallas son `Shipit::DeployCommandsTest` y esperan que un caché Git
  de fixture sea un repositorio válido. En el checkout aislado ese caché no está
  presente: el código toma la rama `git clone` en vez de la rama `git fetch`.

## Decisión

Shipit Engine no cumple el criterio de baseline verde de la cohorte y queda
marcado `baseline_failed`. No se ejecuta una segunda pasada ni Mutant: corregir
los fixtures o el supuesto de caché alteraría el proyecto de terceros y cambiaría
el objeto del estudio. La preparación queda registrada como fricción de setup,
separada de cualquier métrica de Mutant.
