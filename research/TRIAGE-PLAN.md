# Plan de triage — corrida completa de Trailmix

Fecha: 2026-09-10

## Punto de partida

La corrida completa produjo 3.098 mutaciones en 111 sujetos: 1.218 killed, 1.880 alive y 0 timeouts. Los 1.880 vivos son candidatos de revisión, no bugs. Antes de generar o ejecutar nuevos tests, hay que reducirlos a decisiones de dominio revisables.

## Orden de trabajo

1. Agrupar por sujeto y superficie, no revisar 1.880 diffs de forma lineal.
2. Triage de los 37 sujetos sin tests seleccionados: explican 1.547 vivos y son la señal de cobertura más clara.
3. Revisar los sujetos que sí tienen tests seleccionados: buscar mutaciones equivalentes, tests poco específicos y posibles requisitos no cubiertos.
4. Elegir como máximo tres decisiones de alto valor para validar. Una decisión puede ser agregar un test, aceptar una simplificación o descartar una zona como fuera de alcance.
5. Reejecutar solamente los sujetos afectados después de cada decisión. No repetir la corrida completa salvo que cambie la configuración o la suite.
6. Preparar la evidencia para la charla: coste de 9,35 minutos de Mutant, distribución de cobertura y una o dos decisiones revisadas. Mantener separados mutantes vivos, tests agregados, simplificaciones y bugs confirmados.

## Lotes para agentes

| Lote | Superficie | Sujetos | Vivos | Sin tests seleccionados | Encargo |
| --- | --- | ---: | ---: | ---: | --- |
| A | Controladores | 45 | 1.541 | 24 / 1.309 vivos | Agrupar checkout, Stripe/webhooks y CRUD. Identificar por sujeto si falta test, depende de integración externa o está fuera de alcance. |
| B | Modelos, workers y uploaders | 54 | 320 | 13 / 238 vivos | Separar lógica de dominio testeable de infraestructura de correo, archivos y jobs. Proponer los tres mejores candidatos para test focalizado. |
| C | Sujetos con tests seleccionados y mutantes vivos | 46 | 333 | 0 | Detectar patrones repetidos de mutantes vivos y elegir diffs representativos. Buscar equivalentes plausibles y tests poco específicos. |
| D | Integración y revisión | — | — | — | Consolidar los informes A–C, deduplicar patrones y preparar una lista de decisiones para aprobación humana. Solo este rol actualiza la clasificación final. |

Los totales de los lotes A–C se solapan en la vista de superficie y de cobertura; la cola de trabajo canónica sigue siendo `research/mutants.csv`.

## Contrato de salida para cada agente

Cada agente recibe solo un manifiesto de su lote, el código y los specs relevantes, y como máximo diez diffs representativos por patrón. No recibe el JSON de 20 MB ni las 1.880 filas completas.

Para cada sujeto o patrón debe devolver una tabla compacta con:

- sujeto y cantidad de vivos;
- tests seleccionados y archivos relevantes;
- hipótesis: `missing_test`, `simplification`, `equivalent`, `environment_error`, `flaky`, `possible_real_bug` u `out_of_scope`;
- evidencia mínima y pregunta de dominio pendiente;
- acción propuesta: ningún cambio, test candidato o simplificación candidata;
- confianza de la hipótesis y razón.

Las categorías son propuestas. La decisión final y cualquier cambio de test requieren revisión humana. No abrir PRs, issues ni modificar el checkout de terceros.

## Orquestación recomendada

1. Un coordinador prepara tres manifiestos filtrados desde `research/mutants.csv` y apunta a la sesión cruda por ID y hash.
2. Los agentes A, B y C trabajan en paralelo y escriben solo informes derivados en `research/triage/`.
3. El agente D compara los informes, elimina duplicados y propone una lista de hasta diez decisiones. No ejecuta cambios de código.
4. Una persona aprueba qué una a tres decisiones se validan con tests locales temporales.
5. Un agente de verificación ejecuta RSpec y Mutant solo para esos sujetos, actualiza la fila correspondiente y prepara el resumen para la charla.

Así cada contexto queda acotado a una familia de código y unas pocas mutaciones representativas, mientras que la evidencia completa conserva su trazabilidad en el CSV y el reporte de sesión.

## Condición de salida de esta fase

- Los 37 sujetos sin pruebas seleccionadas están agrupados y tienen una explicación o decisión de alcance.
- Hay hasta diez hipótesis priorizadas y hasta tres decisiones aprobadas para validación.
- Ningún mutante se cuenta como bug sin test de reproducción, corrección validada o especificación explícita.
