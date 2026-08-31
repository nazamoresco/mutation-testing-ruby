# Mutation Testing en Ruby: ¿vale la pena?

## Tesis

Mutation testing no es una métrica para perseguir al 100%. Es una forma de poner bajo revisión las decisiones semánticas de código que importan. Vale la pena cuando el valor de verificar esas decisiones supera el coste de ejecutar y revisar los resultados.

## Relato de la charla

1. **La pregunta.** Una suite verde no responde necesariamente si los tests distinguirían una implementación incorrecta de la correcta.
2. **El mecanismo.** Mutation testing cambia una semántica pequeña y ejecuta los tests. Un mutante vivo significa que ambas semánticas pasan; eso abre una decisión: especificar con un test, simplificar el código o justificar que son equivalentes.
3. **La comparación.** Line coverage registra ejecución; mutation testing pregunta si una diferencia semántica observable habría sido detectada.
4. **Ruby y Rails.** Mutant tiene operadores e integración orientados a Ruby, RSpec/Minitest y Rails. Hay alternativas a comparar de forma explícita, sin convertir la charla en un catálogo de gems.
5. **El trade-off.** Tiempo de ejecución, estabilidad, infraestructura de CI, dinero y revisión humana/LLM. La adopción responsable es acotada: código crítico, cambios recientes y una suite estable.
6. **La evidencia.** Un piloto en Real World Rails puede medir cuántos proyectos ya lo usan, qué tan difícil resulta integrarlo y qué clase de decisiones revelan los mutantes vivos.
7. **La reflexión.** Si los LLMs generan más código y tests, sube el valor de herramientas que verifican el significado de ese output. Mutation testing es una de esas herramientas de “metacódigo”.

## Afirmaciones a verificar

- Un mutante vivo es una decisión de diseño, no automáticamente un test faltante.
- El mutation score no debe ser una meta aislada.
- El coste operativo puede hacer que mutation testing no sea conveniente para toda la aplicación ni para todo commit.
- Los operadores específicos de Ruby/Rails pueden revelar huecos que un enfoque genérico no ve.
- Los LLMs pueden acelerar la clasificación de mutantes, pero no deben ser el veredicto final sobre comportamiento requerido.

## Elementos web deseados

- Simulación animada: original → mutante → suite → killed/alive.
- Comparador interactivo entre line coverage y cobertura semántica.
- Diagrama de decisión para un mutante vivo: test, simplificación, equivalente/descartado, error de ejecución.
- Calculadora cualitativa de adopción: criticidad × coste × estabilidad × volumen de cambios.
- Tablero de investigación con el piloto de Real World Rails y sus métricas.

## Material ya decidido

- Público: comunidad de desarrolladores Ruby.
- Duración: 40 minutos, con 35 minutos de contenido y 5 de preguntas.
- Formato: experiencia web interactiva con vista de presentador, no slides tradicionales.
- Posibilidad de mostrar código en vivo; sistema operativo de presentación: macOS.
