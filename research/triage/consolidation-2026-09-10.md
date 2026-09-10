# Consolidación — primera pasada de triage de Trailmix

Fecha: 2026-09-10  
Sesión: `01a086d0-7263-722f-add9-d7cc49a3ee18`

## Cobertura del triage

Se revisaron, con manifiestos compactos y en paralelo, los 37 sujetos sin tests
seleccionados (1.547 vivos) y 46 sujetos con tests seleccionados pero vivos (333).
Los lotes se solapan por superficie y cobertura, por lo que **no deben sumarse**
como una nueva cuenta de mutantes. La cola canónica sigue siendo
`research/mutants.csv`.

La conclusión común es que los vivos se explican principalmente por cobertura
ausente, selección incompleta de tests y límites de integración no especificados.
No hay bugs confirmados ni una base suficiente para etiquetar mutantes individuales
como `possible_real_bug`.

## Decisiones propuestas para revisión humana

| Orden | Decisión a aprobar | Motivo | Validación focalizada posterior | Riesgo |
| ---: | --- | --- | --- | --- |
| 1 | Definir tabla de estados pagados de `Subscription#paid?` | Es lógica pura, aislada y de bajo coste; 11 vivos sin tests seleccionados | Añadir un test temporal de tabla y reejecutar sólo `Subscription#paid?` | Bajo |
| 2 | Definir contrato de idempotencia de webhook/`StripeEvent` | Checkout y webhooks concentran 1.162 vivos sin tests seleccionados; importa más la semántica que el volumen | Evento firmado, duplicado y transición de suscripción en un entorno local controlado | Medio/alto: frontera Stripe |
| 3 | Definir semántica de `CheckoutSessionsController#success` | 572 vivos de checkout; hay que decidir si la redirección puede activar una suscripción | Caso de retorno de checkout y estados de suscripción, después de resolver la fuente de verdad | Alto: flujo externo y decisión de producto |
| 4 | Revisar selección de Mutant antes de duplicar features | Exports, Settings y EmailProcessor tienen coverage útil que Mutant no seleccionó | Inspección acotada de mapeo y reejecución de uno de esos sujetos | Bajo |
| 5 | Acordar alcance de uploaders y workers de correo | Son infraestructura y suman 85 vivos sin tests seleccionados | Ninguna ejecución hasta tener requisito de formatos, visibilidad y envío | Bajo |

## Secuencia recomendada

1. Aprobar la tabla de `Subscription#paid?` y validarla con una prueba local
   temporal: es la señal más limpia para comprobar el flujo de trabajo.
2. Aclarar por escrito la fuente de verdad e idempotencia de Stripe antes de
   escribir cualquier test de webhook o checkout.
3. Comprobar el mapeo de selección de un sujeto con feature existente
   (`ExportsController#new` es el candidato más representativo).
4. Reejecutar sólo los sujetos afectados después de cada decisión y actualizar
   filas individuales; no repetir la corrida completa.

## Salvaguardas

Esta consolidación propone decisiones, no cambios. Cualquier test será local,
temporal y posterior a aprobación humana. No se abrieron PRs, issues ni se
modificaron repositorios de terceros.
