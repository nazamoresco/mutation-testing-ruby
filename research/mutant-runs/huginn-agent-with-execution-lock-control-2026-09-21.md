# Sonda de Mutant — control `Agent#with_execution_lock` de Huginn

Sonda focalizada válida, no agregable globalmente ni evidencia de defectos.

- Snapshot: `52cda2bc83657b7ddef402d31ac0731b73f109f6`.
- Sujeto: `Agent#with_execution_lock` (`app/models/agent.rb:105`).
- RSpec, un worker, perfil `light`, timeout 60 s, OSS; 1.866 tests disponibles
  y 98 seleccionados.
- Mutant/Mutant-RSpec 0.17.0 sobre Ruby 3.4. Gemfile, lockfile y bootstrap
  fueron superpuestos dentro del contenedor, sin modificar el snapshot.

| Métrica | Valor |
| --- | ---: |
| Mutaciones | 26 |
| Killed | 16 |
| Alive | 10 |
| Timeouts | 0 |
| Runtime | 38,85 s |
| Killtime | 36,97 s |
| Cobertura | 61,53 % |

El exit 1 es normal al haber mutantes vivos. La salida cruda (SHA-256
`18cb6ceff3072cd56363701f2f201b9ef67b7a2a485b5f94702113983cb2e395`) queda
en el área temporal. Los 10 vivos no son bugs. Esta sonda usa Mutant 0.17/Ruby
3.4, mientras la del fix usa Mutant 0.14/Ruby 3.2: son señales focalizadas,
pero no una estimación directa fix-versus-control.
