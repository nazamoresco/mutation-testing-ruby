# Mutant completo — Trailmix

Estado: en ejecución desde 2026-09-09T15:36:39Z

## Alcance autorizado

- Repositorio y SHA: `https://github.com/codecation/trailmix.git` en `3565d61e451a39c76ec952acf7e9196c810c5ea6`.
- Alcance: los 111 sujetos que Mutant descubre al cargar la aplicación y filtrar por `source:app/**/*.rb` y `source:lib/**/*.rb`.
- Checkout: copia temporal de la rama local de experimento; no habrá commit, push, PR ni cambio al repositorio de terceros.

## Entorno y límite

- Docker `ruby:3.4.2-slim`, PostgreSQL 16 aislado, Bundler 2.6.2, Rails 8.0.5.1 y Mutant/Mutant-RSpec 0.16.3.
- Un worker (`-j 1`) para evitar concurrencia sobre la base de pruebas.
- Límite global: 14.400 s (4 h). El timeout por mutación sigue en 5 s, según configuración de Mutant.
- Base temporal: `trailmix_mutant_full_test`; no contiene datos ni credenciales de producción.

## Validación previa

- El primer lanzamiento de las 13:33 UTC terminó sin error técnico pero con 0 sujetos y 0 mutaciones. Mutant no asume un matcher universal cuando no se provee selector ni `matcher.subjects`; ese intento no cuenta como análisis completo.
- Se añadió al archivo de configuración local y no versionado el matcher por rutas `app/**/*.rb` y `lib/**/*.rb`.
- `bundle exec mutant environment subject list` confirmó 111 sujetos.
- `bundle exec mutant test -j 1` pasó las 94 pruebas: 94 éxitos, 0 fallas, 5,27 s de runtime.

## Comando de fondo válido

```sh
bundle exec rails db:prepare && \
  bundle exec mutant run --usage opensource -j 1
```

El contenedor de fondo se identifica como `trailmix-mutant-full-rerun-20260909`. Al terminar, registrar aquí la salida, duración, sesiones, mutaciones, killed/alive/error/timeout y las filas revisables en `research/mutants.csv`. No inferir un score ni clasificar resultados antes de tener una corrida completa.
