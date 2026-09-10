# Triage B — modelos, jobs y uploaders sin tests seleccionados

Fecha: 2026-09-10  
Sesión: `01a086d0-7263-722f-add9-d7cc49a3ee18`  
Alcance: 13 sujetos, 238 mutantes vivos y ningún test seleccionado.

## Patrones agrupados

| Familia | Sujetos / vivos | Hipótesis propuesta | Evidencia mínima | Pregunta pendiente | Acción propuesta |
| --- | ---: | --- | --- | --- | --- |
| Proyección Stripe de `Subscription` | 3 / 114 | `missing_test` con integración externa | `sync_from_stripe!` (81), `stripe_subscription` (21) y `stripe_customer` (12) no tienen tests seleccionados | ¿Stripe es la única fuente de verdad y qué campos/transiciones deben persistir? | Validar el flujo posterior a una confirmación antes de escribir tests |
| Workers de correo | 2 / 45 | `missing_test` de orquestación | `PromptWorker#perform` (25) y `WelcomeMailerWorker` (20) envían correo; los features sólo los cubren indirectamente | ¿Qué usuarios y condiciones deben recibir cada correo? | Mantener fuera del primer corte, salvo que una decisión de checkout lo necesite |
| `StripeEvent` | 2 / 28 | `missing_test` de idempotencia | registro del evento y marca `processed` no seleccionan tests | ¿"exactamente una vez" se aplica al registro, al efecto de negocio o a ambos? | Unir a la validación de webhook, con evento duplicado y colisión |
| `Subscription#paid?` | 1 / 11 | `missing_test`, lógica pura | Regla sobre estados de suscripción aislada de Stripe | ¿Qué estados cuentan como pagos según negocio? | Primer candidato de bajo coste: tabla explícita de estados |
| `PhotoUploader` | 5 / 40 | `out_of_scope` provisional | extensiones, nombre, hash, archivo y Fog son infraestructura de archivo | ¿Qué formatos y visibilidad son requisitos del producto? | Posponer hasta definir una política de uploads |

## Tres validaciones focalizadas propuestas

1. **Tabla de estados de `Subscription#paid?`.** Pequeña, pura y con semántica
   revisable; conviene aprobar los estados antes de implementarla.
2. **`StripeEvent` y webhook duplicado.** Debe especificar si el reintento evita
   solamente duplicar registros o también todo efecto de negocio.
3. **`Subscription#sync_from_stripe!` después de checkout.** Sólo después de
   acordar qué transición es autoritativa; de otro modo los tests fijarían una
   integración accidental.

## Límites

Las propuestas no alteran las clasificaciones de `research/mutants.csv` y no
afirman fallas de producción. No se ejecutó aplicación, job, proveedor de correo
ni almacenamiento de archivos.
