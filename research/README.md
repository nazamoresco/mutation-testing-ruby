# Investigación: Mutation Testing en Real World Rails

## Objetivo

Obtener evidencia práctica para la charla y una base reutilizable de datos: adopción actual de mutation testing, coste de puesta en marcha, tipos de mutación emitidos y clasificación de mutantes vivos en aplicaciones Rails reales. No es una campaña para corregir aplicaciones ajenas ni para maximizar mutation coverage.

## Datos comparables

- `apps.csv`: inventario estático del corpus y candidatos.
- `mutation-runs.csv`: una fila por corrida válida o invalidada, con alcance,
  coste y resultados agregados.
- `mutation-operator-summary.csv`: distribución de tipos de mutación por
  corrida y resultado.
- `mutants.csv`: cola de resultados vivos o no concluyentes y su revisión
  humana; no es un contador de bugs.
- `MULTI-APP-ANALYSIS-PLAN.md`: protocolo para extender el estudio a una
  cohorte de aplicaciones comparables.

## Corpus

[`eliotsykes/real-world-rails`](https://github.com/eliotsykes/real-world-rails) reúne más de 100 aplicaciones y engines Rails de código abierto. Es un índice de repositorios: cada aplicación deberá analizarse en su checkout original y en una revisión fijada.

## Fases

1. Inventario estático: detectar `mutant`, `mutant-rspec`, `mutant-minitest`, `evilution`, `mutineer` y configuraciones asociadas.
2. Selección del piloto: aplicación con licencia compatible, Ruby/Rails soportados, suite que corre localmente y superficie acotada.
3. Línea de base: registrar tiempo de instalación, duración y estabilidad de la suite sin mutación.
4. Ejecución acotada: elegir 1–3 sujetos de dominio; nunca mutar todo el repositorio como primer experimento.
5. Clasificación humana asistida por LLM: test faltante, simplificación posible, equivalente, falla del entorno/flakiness, o posible bug real.
6. Confirmación: para cada posible bug real, escribir/revisar el test o la corrección antes de contar el resultado.
7. Reporte: conservar datos crudos, decisión, evidencia y coste. No convertir la clasificación de un LLM en “ground truth”.

## Métricas

- Apps inventariadas y compatibles/incompatibles.
- Herramienta y configuración preexistente.
- Tiempo de setup y baseline de la suite.
- Sujetos mutados, mutantes generados, killed/alive/error/timeout.
- Clasificación y resolución de cada mutante vivo.
- Tests agregados, simplificaciones aceptadas y bugs confirmados.
- Tiempo humano y consumo estimado del proceso de revisión con LLM.

## Fuentes iniciales

- Real World Rails: <https://github.com/eliotsykes/real-world-rails>
- Mutant: <https://github.com/mbj/mutant>
- Just et al., *Are Mutants a Valid Substitute for Real Faults in Software Testing?*: <https://homes.cs.washington.edu/~rjust/publ/mutants_real_faults_tr_2014.pdf>
- Google Research, *Long Term Effects of Mutation Testing*: <https://research.google/pubs/long-term-effects-of-mutation-testing/>

## Regla de seguridad y atribución

Los proyectos de terceros se analizan en checkouts aislados. No se envían cambios ni se abren issues/PRs sin una decisión explícita del usuario. Los resultados se atribuyen a una versión y una configuración reproducibles.
