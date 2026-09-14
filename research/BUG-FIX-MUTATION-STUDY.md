# Estudio histórico: mutantes alrededor de bug fixes

Este protocolo busca evidencia de prevención potencial, no probar que Mutant
habría evitado de forma causal cada bug. El script
`scripts/build_bug_fix_mutation_manifest.rb` transforma historial Git local en
un manifiesto reproducible y de sólo lectura.

## Uso

```sh
ruby research/scripts/build_bug_fix_mutation_manifest.rb \
  --repo /ruta/al/proyecto \
  --output research/bug-fix-manifests/proyecto.csv \
  --max-fixes 30 \
  --control-count 30 \
  --exclude-path-prefix enterprise/
```

Selecciona commits con asunto Conventional Commit `fix:` o `fix(scope):` y usa
el primer padre como snapshot pre-fix. Cada fila describe un hunk Ruby de código
fuente cambiado en el fix (excluye `spec/` y `test/`), su rango en el padre y un
comando plantilla para Mutant. También
selecciona controles candidatos: commits no `fix` con cambios Ruby del mismo
historial. Por defecto no hace checkouts, no instala gems y no ejecuta Mutant.
`--exclude-path-prefix` puede repetirse para omitir código que la edición o la
receta de pruebas elegida no carga.

## Ejecución automática

Con `--execute`, el script resuelve el método que contiene cada rango, crea un
worktree temporal en el padre pre-fix, ejecuta una receta de preparación seguida
de Mutant y elimina ese worktree al finalizar. La receta sigue siendo explícita
por aplicación porque no es seguro adivinar bases, colas ni secretos dummy de un
proyecto Rails.

```sh
ruby research/scripts/build_bug_fix_mutation_manifest.rb \
  --repo /ruta/al/proyecto --output research/bug-fix-manifests/proyecto.csv \
  --max-fixes 30 --control-count 30 --execute \
  --prepare-command 'bundle install && bundle exec rails db:prepare' \
  --mutant-command 'bundle exec mutant run --usage opensource "%{subject}"'
```

Escribe el resultado de cada sujeto en un archivo `*.results.csv` junto al
manifiesto.

## Ejecución posterior

1. Revisar sólo filas con `manual_target_required=yes`; no contienen un método
   Ruby reconocible y no se ejecutan de forma automática.
2. Preparar una receta temporal de bootstrap, base y servicios de la aplicación.
3. Ejecutar el modo `--execute` y revisar los resultados producidos.
4. Comparar el porcentaje de vivos y sujetos sin tests seleccionados entre
   `bug_fix` y `nonfix_control`, controlando tamaño, tipo de método y época.
5. Clasificar una muestra humana: el mutante vivo se parece al defecto, es
   equivalente o es irrelevante. No contar vivos como bugs confirmados.

Una corrida completa de proyecto puede aportar contexto de costo, pero el
análisis principal usa la suite y el código del padre: así los tests añadidos
por el fix no contaminan el resultado pre-fix.

## Candidato encontrado: Chatwoot

La exploración estática identifica a `chatwoot` como el candidato principal para
esta línea histórica: Rails 7.2.3.1, Ruby 3.4.4 y RSpec, con 510 asuntos
Conventional Commit `fix:` entre sus 1.000 commits más recientes. El manifiesto
inicial reproducible (`bug-fix-manifests/chatwoot-initial.csv`) toma cinco fixes
y cinco controles, omitiendo `enterprise/`: 18 regiones de fix (15 con sujeto
resuelto automáticamente) y 55 regiones de control (35 automáticas).

Es un candidato de **historial fuerte e infraestructura pesada**, no aún una
corrida válida: su CI requiere PostgreSQL con pgvector, Redis, Node/pnpm y
divide RSpec en 16 nodos. Antes de usarlo para resultados, hay que probar un
baseline aislado del padre de uno de los cinco fixes y documentar la receta de
bootstrap. No se ejecutó Rails ni Mutant durante la selección.
