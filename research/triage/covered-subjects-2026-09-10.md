# Triage C — sujetos con tests seleccionados y mutantes vivos

Fecha: 2026-09-10  
Sesión: `01a086d0-7263-722f-add9-d7cc49a3ee18`  
Alcance: 46 sujetos, 333 mutantes vivos. Distribución: controladores 232,
modelos 82, mailers 10 y transiciones 9.

## Patrones y prioridades

| Prioridad | Sujeto / vivos | Hipótesis propuesta | Evidencia mínima | Acción candidata |
| ---: | --- | --- | --- | --- |
| 1 | `ExportsController#new` / 21 | `missing_test` o selección incompleta | Sólo se selecciona el caso signed-out; sobreviven eliminar `send_data`, cambiar JSON y filename. Una feature de contenido existe pero no se seleccionó. | Caso autenticado: contenido JSON, descarga, filename y pertenencia exclusiva |
| 2 | `SettingsController#update` / 29 | `missing_test` o selección incompleta | El test seleccionado cubre autenticación de `edit`, no persistencia, flash ni redirect de `update`. | Request/feature de actualización que aserte el estado persistido |
| 3 | `SearchesController` params / 41 | `missing_test` | Sólo se ejecuta `show` sin sesión; sobreviven cambios de `permit`, `fetch`, `user`, `nil` y `raise`. | Casos autenticados con término válido, ausente y parámetro no permitido |
| 4 | `CreditCardsController#update` / 11 | `missing_test` de efecto externo | Flash/redirect pasan aunque se elimine `Stripe::Customer.update`. | Aserción del payload de Stripe en un límite controlado |
| 5 | `EmailProcessor#attachment` / 9 | `missing_test` o selección incompleta | La feature verifica una foto, pero quedó fuera de la selección del sujeto. | Ejecutar y localizar el caso de adjunto; comprobar foto persistida |
| 6 | `PromptEntry.best` / 9 | `missing_test` | Se prueba la instancia, no el delegado de clase. | Caso directo del delegado |
| 7 | `ReplyToken.generate` / 15 | `missing_test` | Sólo se asertan prefijo y unicidad; no tamaño ni alfabeto del sufijo. | Contrato explícito de longitud/formato |
| 8 | `AdminDashboard#trial_status_for` / 6 | `missing_test` de borde | Sólo se prueban 0,3 y 0,5; `<=` a `==` no se distingue. | Tabla con 0,2; 0,3; 0,4; 0,5 y >0,5 |
| 9 | `Entry.random` / 4 | `missing_test` o contrato indefinido | Una sola fila no distingue orden ni selección aleatoria. | Definir si la aleatoriedad es requisito y probar una colección no degenerada |
| 10 | `Entry#for_today?` / 1 | `equivalent` plausible, ya revisado | La diferencia de zona sólo se observa con una frontera temporal y zona no UTC. | Mantener la decisión equivalente ya registrada; no duplicar test sin cambiar el contrato |

## Patrones transversales

- Tests de autenticación se seleccionan como sustituto de flujos completos y no
  observan la acción protegida.
- Efectos externos se cubren por respuesta superficial, no por el contrato del
  colaborador.
- Hay features relevantes fuera de la selección de Mutant; antes de duplicar
  specs, conviene investigar ese mapeo.
- Delegadores, representación y límites se prueban de manera demasiado débil.

## Equivalencias plausibles que requieren revisión humana

- Eliminar `to_i` en `User#prompt_delivery_hour=` puede ser equivalente para
  entradas válidas tipadas, pero no para entradas inválidas.
- `Arel.sql("RANDOM()")` frente a `"RANDOM()"` en `Entry.random` podría ser
  equivalente en la base de datos, condicionado por la política de Rails.
- El tamaño por defecto de `ReplyToken#random_suffix` no parece equivalente al
  contrato implícito de ocho bytes; la supervivencia apunta a una aserción ausente.

No se modificó ninguna clasificación final ni se infirió un bug de producción.
