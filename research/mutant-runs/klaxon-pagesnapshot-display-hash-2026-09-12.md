# Klaxon — validación acotada de `PageSnapshot#display_hash`

Fecha: 2026-09-12  
Sesión: `01a09797-8bc1-7085-8b45-03562d3ffe88`  
Estado: válida como verificación de integración; no es una corrida de aplicación completa.

## Fuente y entorno

- Repositorio: `https://github.com/themarshallproject/klaxon`
- SHA: `ad2cb6ca1219b94ee7b2a032308f72a3997469fc`
- Ruby 3.4.8, Rails 8.1.3.1, RSpec y PostgreSQL 16 aislado.
- Mutant y Mutant-RSpec 0.16.3; licencia `opensource`, perfil `light`, un
  worker y timeout por mutación de 5 s.
- `PageSnapshot` se cargó explícitamente desde `app/models` en un sandbox
  temporal. No se modificó el checkout de terceros.

## Resultado

- Sujetos: 1 (`PageSnapshot#display_hash`).
- Tests disponibles: 91; tests seleccionados: 4.
- Mutaciones: 15; killed: 1; vivos: 14; timeouts: 0.
- Runtime: 3,17 s; killtime: 2,38 s.

Los vivos no se interpretan como bugs ni se agregan a estadísticas globales.
La sesión demostró selección de tests y ejecución de mutaciones en el entorno
Rails, pero la revisión individual queda pendiente.
