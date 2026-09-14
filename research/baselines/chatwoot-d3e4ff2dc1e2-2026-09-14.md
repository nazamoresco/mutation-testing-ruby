# Chatwoot — baseline histórico en `d3e4ff2dc1e2`

## Alcance

Esta preparación corresponde al padre del fix `f452298a8fbe1fc7d7b6a6129b6009066336f239`
(`fix(filters): use local calendar dates in saved filters (#15784)`). El checkout
es temporal y separado del repositorio de terceros. Se excluyeron los directorios
`enterprise/` y `spec/enterprise/`, que no pertenecen a la distribución FOSS.

## Entorno aislado

- Fecha: 2026-09-14.
- Ruby 3.4.4 y Bundler 2.5.16.
- PostgreSQL 16 con pgvector y Redis en una red Docker exclusiva.
- Rails 7.2.3.1 y RSpec, según el SHA histórico.
- Dependencias JavaScript fijadas mediante `pnpm install --frozen-lockfile`.

No se modificó ni se publicó nada en Chatwoot.

## Resultado parcial y corrección de receta

El preflight del cambio relevante pasó antes del baseline completo:

```
spec/services/conversations/filter_service_spec.rb
42 examples, 0 failures
```

El primer baseline FOSS completo terminó en 10 min 20 s con **6.769 ejemplos,
47 fallas y 67 pendientes**. Ese intento es **inválido**: el runner no incluía
`pnpm`, por lo que los specs que renderizan vistas devolvían HTTP 500. La
reproducción de `spec/controllers/dashboard_controller_spec.rb` identificó la
causa exacta: `ViteRuby::MissingExecutableError` / `No such file or directory -
pnpm`.

Tras instalar npm, pnpm 10.2.0 y el lockfile dentro del runner aislado,
`spec/controllers/dashboard_controller_spec.rb` pasó con **4 ejemplos y 0
fallas**. El primer baseline completo con esa receta terminó en **15 min 55 s**
con **6.769 ejemplos, 1 falla y 67 pendientes**. La falla fue
`spec/builders/agent_builder_spec.rb:47`, cuya expectativa de argumentos para
`Devise::Mailer` recibió cero argumentos. El mismo ejemplo pasó aislado (1/1),
por lo que se trata como posible flakiness dependiente de la suite, no como una
falla reproducida del sujeto del estudio.

La segunda suite completa se inició desde un esquema de test limpio. La primera
repetición no permite ejecutar Mutant: el protocolo sigue exigiendo dos
baselines completos verdes.

El `package.json` de este SHA declara Node 24.x, mientras que la imagen Alpine
disponible para este runner aporta Node 22.23.2. La repetición se conserva como
evidencia de viabilidad en ese entorno; si quedan fallas no relacionadas con
Vite, se repetirá con Node 24 antes de atribuirlas al proyecto histórico.

## Regla de decisión

No se ejecutará Mutant para este padre hasta obtener dos baselines completos
verdes. Si la repetición falla, se documentarán las fallas restantes como
resultado de viabilidad, sin alterar Chatwoot para hacerlas pasar.
