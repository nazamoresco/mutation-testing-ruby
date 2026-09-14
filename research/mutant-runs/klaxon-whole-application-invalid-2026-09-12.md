# Klaxon — intento de corrida completa inválido

Fecha: 2026-09-12  
Sesión: `01a09798-3caa-7637-9d0a-cfcb57d74690`  
Estado: inválida; excluida de métricas de mutación.

El bootstrap temporal de Rails con eager loading expuso 91 tests a Mutant, pero
no registró ningún sujeto instrumentable. La sesión terminó con 0 sujetos,
0 mutaciones y código 0 en 0,11 s. Es un problema de carga/instrumentación de
Mutant con este sandbox, no evidencia de cobertura de tests ni de calidad de
Klaxon. El siguiente intento debe cargar de forma explícita el código de la
aplicación antes de solicitar una corrida amplia.
