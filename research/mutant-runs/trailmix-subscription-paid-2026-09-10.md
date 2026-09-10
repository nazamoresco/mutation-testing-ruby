# Validación focalizada — `Subscription#paid?` de Trailmix

Fecha de ejecución: 2026-09-10

## Decisión y alcance

La primera decisión aprobada tras el triage fue hacer explícita la regla local
de acceso pagado. El código original define una lista permitida de dos estados:
`active` y `trialing`. La validación no decide cómo Stripe produce esos estados
ni si otros estados deben cambiar de significado en el futuro.

Se creó únicamente en un checkout temporal de `codecation/trailmix` en el SHA
`3565d61e451a39c76ec952acf7e9196c810c5ea6` una spec no publicada para
`Subscription#paid?`. La tabla comprobó:

| Estado | `paid?` esperado |
| --- | --- |
| `active` | `true` |
| `trialing` | `true` |
| `past_due` | `false` |
| `canceled` | `false` |
| ausente (`nil`) | `false` |

No se cambió código de aplicación, no hubo commit ni push en Trailmix y la spec
no se propone como un parche para el repositorio externo.

## Entorno reproducible

- Docker `ruby:3.4.2-slim` y PostgreSQL 16 efímero.
- Bundler 2.6.2; Rails 8.0.5.1; Mutant y Mutant-RSpec 0.16.3.
- Un worker, integración RSpec, timeout por mutación de 5 s y uso OSS.
- Valores ficticios de `.env.sample` sólo como variables del contenedor.
- Configuración local de Mutant: carga `./config/environment`, eager-load de
  Rails y selector único `Subscription#paid?`.

La imagen Ruby mínima no traía compilador para extensiones nativas y el primer
`bundle install` falló. Se instaló `build-essential` y `libpq-dev` sólo dentro
del contenedor efímero y se repitió la instalación. Un primer preflight de
Mutant también reveló que `config/environment` no estaba en el load path; se
usó `./config/environment`. Son ajustes de entorno local, no resultados sobre
la semántica de Trailmix.

## Resultados

| Paso | Resultado |
| --- | --- |
| RSpec de la spec temporal | 5 ejemplos, 0 fallas, 0,049 s de ejecución de ejemplos |
| Preflight `mutant test -j 1` | 99 tests, 99 éxitos, 4,86 s |
| Mutant sobre `Subscription#paid?` | 1 sujeto, 5 tests seleccionados, 12 mutaciones, 12 killed, 0 alive, 0 timeouts |
| Runtime de Mutant | 2,62 s; killtime 1,68 s; cobertura 100 % |

- Sesión: `01a08af9-9e81-74a8-b2ed-34d986ea688a`.
- JSON crudo: 90.916 bytes, SHA-256
  `6d2f2af09f7bc2023d4c24815a1445ea4894c5653dce01b04029bffe10bcf065`.
  Se conserva de forma recuperable fuera del repositorio, en el checkout
  temporal archivado; no se versionó.

## Interpretación

La hipótesis `missing_test` queda respaldada para los 11 vivos de este sujeto
en la corrida completa anterior: una tabla pequeña, aprobada explícitamente,
convierte la regla existente en comportamiento observable y elimina todos los
mutantes de la repetición focalizada. El conteo de la repetición fue 12, no 11,
por lo que se conserva la sesión y la evidencia en vez de forzar una relación
uno-a-uno de identificadores entre corridas.

Esto no confirma un bug de producción ni valida el contrato de Stripe: sólo
confirma que la aplicación tiene una política local de acceso cuya especificación
faltaba. El siguiente corte debe tratar por separado el origen e idempotencia de
los estados de Stripe.
