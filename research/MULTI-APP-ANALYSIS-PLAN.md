# Plan comparativo de Mutant en Real World Rails

## Propósito

La investigación no intenta mejorar, corregir ni maximizar el score de las
aplicaciones estudiadas. Busca medir, con un protocolo repetible, qué señal
ofrece Mutant en aplicaciones Rails reales y cuánto cuesta obtener y revisar
esa señal.

La pregunta para la charla es: **¿cuándo compensa el coste operativo y humano
de mutation testing frente a la información adicional que da sobre una suite?**

## Unidad de análisis y alcance

- La unidad primaria es una corrida válida por aplicación y SHA fijado.
- Cada checkout de terceros es temporal; no se publican commits, PRs ni issues.
- El resultado principal por app es la corrida completa de los sujetos cargados
  por la configuración válida. Las validaciones focalizadas con tests temporales
  se guardan como `focused_validation` y no se mezclan en los totales entre apps.
- Los JSON crudos permanecen fuera del repositorio, con sesión y checksum
  registrados. El repositorio conserva CSVs derivados y reportes reproducibles.

## Cohorte propuesta

No conviene lanzar las 199 aplicaciones legibles como si fueran una muestra
homogénea. La primera cohorte debe ser de **8 aplicaciones ejecutables**, tomada
del inventario y estratificada por versión de Rails, framework de tests y
complejidad de infraestructura. Se intentan en orden de viabilidad; si una app
no pasa el baseline, se registra como resultado de viabilidad y se reemplaza,
sin modernizarla.

Antes de cada ejecución se fija URL, SHA, Ruby, Bundler, Rails, SO, servicios,
versión de Mutant, perfil de operadores y número de workers. Una app sólo entra
en la cohorte comparativa si su suite pasa dos veces y la prevalidación de
Mutant pasa.

## Protocolo por aplicación

1. Clonar en un checkout aislado y fijar SHA.
2. Ejecutar la suite normal dos veces, con duración, fallas y flakiness.
3. Añadir sólo configuración local y reversible de Mutant; nunca código fuente
   ni tests del proyecto externo.
4. Ejecutar `mutant test` como preflight y guardar cantidad de tests y resultado.
5. Hacer una sonda sobre un sujeto pequeño para verificar carga, selección y
   formato de resultados.
6. Ejecutar la corrida completa con un worker y un límite de tiempo explícito.
7. Conservar el JSON crudo fuera del repo y actualizar los tres CSVs de datos.
8. Elegir una muestra estratificada y acotada de mutantes vivos para revisión;
   clasificar decisiones, no bugs, con el vocabulario de `research/HANDOFF.md`.

Una falla de instalación, baseline, preflight, timeout o selección de cero
sujetos se registra como resultado, no se oculta ni se repara en la aplicación.

## Métricas que sí responderán la pregunta

| Dimensión | Medida | Fuente |
| --- | --- | --- |
| Viabilidad | apps intentadas, baseline verde, preflight válido, bloqueo y tiempo de setup | `apps.csv` y reportes de baseline |
| Coste de cómputo | duración de suite, runtime/killtime de Mutant, mutaciones por segundo, timeouts | `mutation-runs.csv` |
| Señal de cobertura | sujetos, tests seleccionados, killed/alive/timeouts y cobertura de mutación | `mutation-runs.csv`, `mutants.csv` |
| Tipo de mutación | perfil de operadores y conteos por `mutation_type` y resultado | `mutation-operator-summary.csv` |
| Coste humano | tamaño y categorías de la muestra revisada; decisiones accionables, equivalentes y fuera de alcance | `mutants.csv` y triage por app |
| Valor | proporción de muestras que termina en requisito explícito, test candidato, simplificación o ninguna acción | consolidación por app |

No se presentará el porcentaje de mutantes vivos como tasa de bugs, ni un score
como una medida de calidad general. Para cada número se mostrará denominador,
configuración y alcance.

## Operadores y comparabilidad

Trailmix se ejecutó con el perfil `light`: su JSON contiene 2.987 resultados
`evil` y 111 `neutral`. Por eso aún no permite afirmar cómo se comportan otros
operadores. Antes de la segunda app se hará una sonda de capacidades de la misma
versión de Mutant y se fijará un perfil común. Si se usa un perfil diferente,
se registrará como una cohorte distinta y no se mezclarán sus porcentajes.

`neutral` se reporta por separado: no es evidencia de que un test detecte una
diferencia semántica. El análisis de tipos se basará en los tipos emitidos en el
JSON, no en una etiqueta inferida por un LLM.

## Plan de revisión humana

Por cada corrida completa se muestrean como máximo 30 vivos, estratificados por
superficie (modelo/controlador/infraestructura), tipo de mutación y cantidad de
tests seleccionados. Para cada uno se registra evidencia mínima, hipótesis y
acción propuesta. Sólo se cuenta una acción si una persona la acepta; sólo se
cuenta un bug con reproducción, corrección validada o especificación explícita.

La salida para la charla será una tabla por app y una distribución agregada con
intervalos descriptivos. Con ocho apps se hablará de evidencia exploratoria,
no de prevalencia del ecosistema Rails.

## Decisiones necesarias antes de lanzar la cohorte

1. Aprobar el tamaño inicial de 8 apps y un presupuesto máximo por app
   (recomendación: 30 minutos de setup y 60 minutos de Mutant antes de marcar
   `environment_error` o `timeout`).
2. Aprobar el perfil común de operadores después de la sonda de capacidades.
3. Aprobar que los checkouts y contenedores locales sean temporales y que no se
   modifique ni publique nada en los repositorios de las aplicaciones.
4. Elegir si se prioriza diversidad histórica de Rails o máxima viabilidad
   moderna para la primera cohorte.
