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
  --control-count 30
```

Selecciona commits con asunto Conventional Commit `fix:` o `fix(scope):` y usa
el primer padre como snapshot pre-fix. Cada fila describe un hunk Ruby de código
fuente cambiado en el fix (excluye `spec/` y `test/`), su rango en el padre y un
comando plantilla para Mutant. También
selecciona controles candidatos: commits no `fix` con cambios Ruby del mismo
historial. Por defecto no hace checkouts, no instala gems y no ejecuta Mutant.

## Ejecución automática

Con `--execute`, el script resuelve el método que contiene cada rango, crea un
worktree temporal en el padre pre-fix y ejecuta una receta de preparación seguida
de Mutant. La receta sigue siendo explícita por aplicación porque no es seguro
adivinar bases, colas ni secretos dummy de un proyecto Rails.

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
