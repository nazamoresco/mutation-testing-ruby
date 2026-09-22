# Conclusiones del experimento de Mutant

Fecha de corte: 2026-09-22.

## Qué quedó medido de forma válida

| Alcance | Aplicación | Mutaciones | Killed | Alive | Resultado válido |
| --- | --- | ---: | ---: | ---: | --- |
| Aplicación completa | Trailmix | 3.098 | 1.218 | 1.880 | Sí |
| Aplicación completa | Speakerline | 1.206 | 612 | 594 | Sí |
| Sujeto focalizado | Huginn fix | 88 | 1 | 87 | Sí, sólo como sonda |
| Sujeto focalizado | Huginn control | 26 | 16 | 10 | Sí, sólo como sonda |

Las dos corridas completas muestran que Mutant produce señal adicional después
de una suite verde y que mutar toda una aplicación tiene un coste apreciable.
No muestran una tasa de bugs: los mutantes vivos pueden ser equivalentes,
comportamiento deliberado o especificación no cubierta.

## Qué no se puede concluir

No está demostrado que Mutant hubiera evitado bugs reales. El único par
histórico fix/control ejecutado, Huginn, no comparte versión de Ruby, Rails ni
Mutant. Sus 87 y 10 mutantes vivos no se comparan entre sí y quedan excluidos
de cualquier estimación de efecto o agregado global.

Tampoco se agrega Trailmix con Speakerline bajo el protocolo estricto nuevo:
comparten Mutant 0.16.3 y perfil `light`, pero corrieron con Ruby distintos.
Pueden ilustrar viabilidad y coste por proyecto, no una tasa conjunta.

## Regla de elegibilidad que rige desde ahora

Un par histórico entra al experimento causal sólo si comparte una
`compatibility_cell` exacta:

1. misma aplicación y snapshots cercanos;
2. misma versión de Ruby, Bundler, Rails, Mutant y Mutant-RSpec;
3. misma integración de test, perfil de operadores, workers y timeout;
4. dos baselines verdes en cada snapshot; y
5. un sujeto resuelto automáticamente en el fix y en el control.

Las filas de `pair-compatibility.csv` son la puerta antes de lanzar Mutant. Un
desajuste genera una fila `excluded_from_effect_estimate`, no una excepción.

## Conclusión para la presentación

La afirmación defendible hoy es: **Mutant entrega una señal semántica adicional
en suites Rails verdes, pero requiere una inversión operativa y revisión humana
para interpretar los vivos.** La afirmación más fuerte —que evita bugs— queda
pendiente de una cohorte de pares homogéneos y revisión de las diferencias
encontradas por cada fix.

El siguiente experimento no debe aumentar el número de aplicaciones todavía.
Debe seleccionar pares que pasen la celda de compatibilidad y, recién entonces,
ejecutar la misma receta para cada lado y contrastar los mutantes afectados por
el diff del fix.

Camaleon CMS fue el primer par que pasó la compatibilidad estática, pero falló
su baseline nativo por una dependencia de Chrome 125 no disponible en Linux
arm64. Se conserva como evidencia de viabilidad y no entra en Mutant ni en el
contraste histórico.
