# Mutant completo — Trailmix

Estado: completada el 2026-09-09T15:46:09Z

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

El contenedor de fondo se identificó como `trailmix-mutant-full-rerun-20260909`.

## Resultado final

| Medida | Resultado |
| --- | ---: |
| Sujetos | 111 |
| Mutaciones | 3.098 |
| Killed | 1.218 |
| Alive | 1.880 |
| Timeouts | 0 |
| Runtime de Mutant | 561,28 s |
| Killtime | 391,21 s |
| Duración de contenedor | 570 s |
| Código de salida | 1 |

- Sesión: `01a086d0-7263-722f-add9-d7cc49a3ee18`.
- El código 1 corresponde a mutaciones vivas; no hubo error del runner ni timeout.
- La sesión reportó 39,31 % de cobertura de mutación. Es una medida de esta muestra y configuración, no line coverage ni una estimación de bugs.
- `research/mutants.csv` contiene las 1.880 mutaciones vivas de esta sesión como `unreviewed`, más la fila ya revisada del piloto acotado.

## Lectura inicial, sin clasificación automática

De los 111 sujetos, 37 no tuvieron ninguna prueba seleccionada. Esos 37 explican 1.547 mutantes vivos. Los sujetos con mayor volumen de vivos sin pruebas seleccionadas incluyen `CheckoutSessionsController#success` (233), `CheckoutSessionsController#create` (141) y `StripeWebhooksController#handle_checkout_session_completed` (109).

Esto identifica superficies para priorizar; no permite etiquetar los mutantes como bugs, tests faltantes o equivalentes sin revisión humana. En particular, los flujos de checkout, Stripe y workers pueden depender de integración externa y merecen una revisión de alcance antes de modificar pruebas.

## Trazabilidad del reporte crudo

El JSON de sesión ocupó 20.003.840 bytes y tiene SHA-256 `717d9fba8bf81174c0ec20a497b03bf96d596555456a642538e180714967b165`. Se conserva en el checkout temporal aislado y no se versiona para no incorporar un reporte masivo de un repositorio de terceros.

## Próximo paso

Hacer triage por lotes, empezando por los 37 sujetos sin pruebas seleccionadas, y clasificar solo los resultados revisados en `research/mutants.csv`. Mantener separados los mutantes vivos, los tests nuevos, las simplificaciones aceptadas y los bugs confirmados.
