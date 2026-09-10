# Triage A — controladores sin tests seleccionados

Fecha: 2026-09-10  
Sesión: `01a086d0-7263-722f-add9-d7cc49a3ee18`  
Alcance: 24 sujetos, 1.309 mutantes vivos y ningún test seleccionado.

## Lectura del lote

La señal predominante es de cobertura ausente, no de bugs de producto. Los 24
sujetos no seleccionan tests y los mutantes vivos se concentran en límites de
integración y en acciones de controlador. La clasificación siguiente es una
hipótesis para priorizar validaciones, no una clasificación final de las filas
de `research/mutants.csv`.

| Familia | Sujetos / vivos | Hipótesis propuesta | Evidencia mínima | Pregunta pendiente | Acción propuesta |
| --- | ---: | --- | --- | --- | --- |
| Checkout | 8 / 572 | `missing_test` con dependencia externa | `CheckoutSessionsController` concentra `create`, `success`, portal, activación y gestión de sesión; no hay spec de controlador | ¿La página `success` sólo informa estado o activa una suscripción de forma autoritativa? | Validar un flujo de checkout con estados explícitos antes de añadir tests |
| Stripe y webhooks | 9 / 590 | `missing_test` con frontera externa | endpoint, verificación de firma, dispatch de eventos y búsquedas de suscripción no tienen specs dedicados | ¿Qué orden, reintento y duplicación de eventos debe preservar el sistema? | Diseñar un contrato de webhook e idempotencia, no tests de implementación aislados |
| CRUD de entradas | 5 / 75 | `missing_test` o problema de selección | Hay features de entradas, pero Mutant no seleccionó tests para `index`, `edit`, `update` y parámetros | ¿Qué debe ocurrir ante parámetros inválidos y acceso a entradas ajenas? | Revisar primero el mapeo de selección; luego un request test de pertenencia y parámetros |
| Pages y Application | 2 / 72 | `out_of_scope` provisional | Superficie transversal sin una decisión de dominio aislada | ¿Aporta señal para el piloto o es sólo infraestructura de navegación? | No cambiar hasta cerrar los tres focos anteriores |

## Prioridades representativas

1. **Checkout `success` y activación de suscripción.** Es la mayor concentración
   de vivos y contiene una decisión de producto potencialmente sensible. Requiere
   aclarar fuente de verdad entre redirección de Stripe y webhook.
2. **Webhook de Stripe.** Una validación debe comprobar firma, evento duplicado y
   al menos una transición de checkout/suscripción. Su propósito es especificar
   el contrato externo, no aumentar un porcentaje.
3. **Actualización de entradas.** Un caso autenticado de propietario, no
   propietario y parámetros inválidos puede comprobar una decisión acotada y
   revelar si la selección de Mutant está dejando fuera features existentes.

## Límites

No se ejecutó la aplicación ni se cambió código de Trailmix. Ningún mutante de
este lote se considera `possible_real_bug` ni `confirmed_real_bug` sin una
especificación y una reproducción revisable.
