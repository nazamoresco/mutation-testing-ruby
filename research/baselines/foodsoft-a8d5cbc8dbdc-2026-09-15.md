# Foodsoft — baseline histórico en `a8d5cbc8dbdc`

## Alcance

Esta preparación corresponde al padre del fix `a892cf5dd1759dad38ec950888d52230229a7f58`
(`fix: delta input was broken`). El checkout histórico y los servicios se
ejecutaron fuera de este repositorio y en redes Docker exclusivas. No se
modificó ni publicó nada en Foodsoft.

## Receta intentada

- Ruby 3.4.6, Bundler 2.5.22, Rails 7.2.2.1 y RSpec, según el lockfile del SHA.
- MariaDB 11 y Redis 7 en contenedores aislados.
- Configuración de prueba derivada de los samples del proyecto, seguida de
  `foodsoft:setup:stock_config` y `db:schema:load`.
- Comando de CI del proyecto: `bundle exec rake rspec-rerun:spec`.
- El runner temporal incluye Chromium, requisito que el workflow de CI prepara
  para los specs de Capybara/Apparition.

## Resultado

El primer intento produjo 505 fallas antes de ejecutar ejemplos: DatabaseCleaner
rechazó el hostname interno de la base Docker como remoto. Es una configuración
del runner, no un resultado de Foodsoft, y se corrigió en un segundo entorno
aislado usando un hostname terminado en `.local`, que DatabaseCleaner reconoce
como local.

Sin Chromium, ese segundo entorno llegó a 76 ejemplos y 76 fallas: todos los
errores eran `Unable to find Chrome executeable`. Tras reconstruir el runner con
Chromium y reinicializar una base nueva, la suite avanzó por los ejemplos iniciales
sin esos fallos, pero quedó sin progreso tras las pruebas de sincronización de
proveedores. Durante más de dos minutos no hubo actividad de CPU ni proceso de
navegador; se terminó manualmente como timeout de infraestructura y no produjo un
resumen final de RSpec.

## Regla de decisión

No hay dos baselines verdes ni siquiera una baseline completa terminada. Foodsoft
queda clasificado como `baseline_failed` para el estudio histórico y no se
ejecutará Mutant. La receta y los diagnósticos se conservan para una posible
investigación específica del bloqueo, pero no se cuentan como evidencia de
mutantes ni de prevención de bugs.
