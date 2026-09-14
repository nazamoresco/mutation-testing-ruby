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
el primer padre como snapshot pre-fix. Cada fila describe un hunk Ruby cambiado
en el fix, su rango en el padre y un comando plantilla para Mutant. También
selecciona controles candidatos: commits no `fix` con cambios Ruby del mismo
historial. No hace checkouts, no instala gems y no ejecuta Mutant.

## Ejecución posterior

1. Revisar cada fila y resolver `mutant_subject` al método o clase que contiene
   el rango pre-fix. El script no infiere sujetos: hacerlo automáticamente en
   Ruby es frágil ante metaprogramación y daría falsos resultados.
2. Preparar un checkout temporal en `parent_sha` con el bootstrap, base y
   servicios documentados de esa aplicación.
3. Ejecutar el comando de Mutant del manifiesto sólo para el sujeto revisado.
4. Comparar el porcentaje de vivos y sujetos sin tests seleccionados entre
   `bug_fix` y `nonfix_control`, controlando tamaño, tipo de método y época.
5. Clasificar una muestra humana: el mutante vivo se parece al defecto, es
   equivalente o es irrelevante. No contar vivos como bugs confirmados.

Una corrida completa de proyecto puede aportar contexto de costo, pero el
análisis principal usa la suite y el código del padre: así los tests añadidos
por el fix no contaminan el resultado pre-fix.
