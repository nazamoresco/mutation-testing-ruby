# Sonda histórica de Mutant — `JobsHelper#agent_from_job` de Huginn

Estado: válida como sonda focalizada; no apta todavía para un agregado global.

## Alcance

- Aplicación y snapshot pre-fix: `cantino/huginn` en
  `fe300ef5087f033cf4b6f2c538cc058c72d8872b`.
- Fix posterior evaluado: `838cf2c` (`fix: do not find agent from job when no
  job_data`).
- Sujeto único: `JobsHelper#agent_from_job` en
  `app/helpers/jobs_helper.rb:25`.
- Integración: RSpec, un worker, perfil `light`, timeout por mutación de 60 s y
  uso OSS. La base PostgreSQL de prueba y el checkout se mantuvieron aislados.
- No se modificó Gemfile, lockfile, código ni tests de Huginn. El Gemfile
  superpuesto y el bootstrap de eager-load pertenecen a
  `research/docker/` y sólo se copiaron al contenedor temporal.

## Preparación y controles de validez

1. El baseline nativo ya había pasado dos veces: 1.670 ejemplos, 0 fallas por
   pasada. Véase `baselines/huginn-fe300ef5087f-2026-09-20.md`.
2. Mutant 0.17.0 se descartó para este snapshot porque exige Ruby >= 3.3;
   Mutant y Mutant-RSpec 0.14.2 son compatibles con Ruby 3.2.
3. La instalación global de Mutant activó `ast` 2.4.3 y chocó con el lockfile
   histórico (2.4.2). Se usó un Gemfile superpuesto con una copia temporal del
   lockfile, preservando las revisiones Git históricas.
4. El entorno de Mutant descubrió los 1.670 tests de RSpec. El listado general
   informó 0 sujetos bajo Rails 6, pero el selector explícito enumeró
   correctamente el sujeto pedido y seleccionó cinco tests. Por eso sólo esta
   ejecución explícita se considera válida.

## Resultado

| Métrica | Valor |
| --- | ---: |
| Sujetos | 1 |
| Tests disponibles | 1.670 |
| Tests seleccionados | 5 |
| Mutaciones | 88 |
| Killed | 1 |
| Alive | 87 |
| Timeouts | 0 |
| Runtime | 12,44 s |
| Killtime | 6,39 s |
| Cobertura de mutación | 1,13 % |

Mutant devolvió código 1 porque detectó mutantes vivos; es el resultado normal
para una corrida completa de este sujeto, no un error de infraestructura. La
salida cruda fue de 91.422 bytes con SHA-256
`1d27a1ef3b060109038262cba35322e8fb7cdb50080dfaf0ceb5f5d822a3b2b6` y se
conserva fuera del repositorio en el área temporal de investigación. Mutant
0.14.2 no generó un identificador de sesión persistente.

## Interpretación limitada

Los cinco tests seleccionados pertenecen a `jobs_helper_spec.rb`, pero sus
descripciones cubren `status` y `relative_distance_of_time_in_words`, no el
caso `agent_from_job`. Los 87 vivos son por tanto una señal de especificación o
cobertura ausente para revisar, no 87 defectos ni una prueba de que el fix los
habría prevenido. Se dejan sin clasificación individual hasta contrastarlos con
el diff del fix y una muestra humana.

Esta fila usa `analysis_level=project` y el cohort separado
`historical-bug-fix-pilot`. No entra en ningún total `global`, ni permite aún
comparar `bug_fix` con `nonfix_control`: cada control requiere su propio
snapshot pre-fix y la misma puerta de baseline.

## Siguiente paso

Preparar y validar el baseline del padre de un control automático comparable,
ejecutar una sonda de un solo sujeto con la misma receta y sólo entonces
comparar proporciones con sus denominadores y límites explícitos.
