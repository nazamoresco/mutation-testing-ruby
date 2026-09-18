# MiniMutant: mutation testing in Ruby, from scratch

This repository includes a small, runnable implementation of mutation testing
for a workshop. It is deliberately narrow: the goal is to make each mechanism
visible, not to replace [mutant](https://github.com/mbj/mutant).

It needs Ruby 3.3 or later and Prism. The committed `.ruby-version` selects
Ruby 3.3.8 for asdf users.

```sh
bundle install
bin/run-steps
bundle exec ruby -Ilib test/mini_mutant_test.rb
bundle exec ruby examples/calculator/test/calculator_test.rb
```

## The nine executable steps

Each `steps/01_*.rb` through `steps/09_*.rb` is executable on its own; the
runner above runs them in order.

| Step | What it makes explicit |
| --- | --- |
| 01 | A mutation **subject** is `Calculator#positive?`. |
| 02 | Ruby reflection gives the method's `source_location`. |
| 03 | Prism parses the file and finds the method's `DefNode`. |
| 04 | Operator calls in that node become mutation points. |
| 05 | Prism's byte range replaces just the operator in source text. |
| 06 | The changed source redefines the method at runtime. |
| 07 | The redefinition happens in a forked child, not the parent. |
| 08 | A boundary assertion kills the `>` → `>=` and `>` → `<` mutants. |
| 09 | Without that boundary assertion, `>` → `>=` remains alive. |

## How the miniature engine works

1. `MiniMutant::Subject.instance_method(Calculator, :positive?)` starts with a
   real Ruby method, then calls `source_location` to identify its file and
   starting line.
2. `MiniMutant::Discoverer` parses that source file using Prism and finds the
   matching `Prism::DefNode`.
3. It walks only that method's AST. Supported operator `CallNode`s become
   `MutationPoint`s, retaining Prism's exact byte offsets and candidate
   replacements.
4. `SourceRewriter` replaces the source range of the operator token, for
   example `>` with `>=`. This preserves all surrounding source text.
5. `RuntimePatch` evaluates the altered source and therefore redefines the
   Ruby method at runtime. `Runner` performs that patch in a child created by
   `fork`.
6. The child runs the supplied checks. An exception (normally an assertion)
   makes the mutant **killed**; a clean run makes it **alive**. The child sends
   the result back over a pipe, then exits, leaving the parent unmodified.

The `examples/calculator` directory contains conventional Minitest tests and a
small callable suite used inside forked mutation runs. It covers comparison,
arithmetic, and division; the tutorial subjects `positive?` so the boundary is
easy to see.

## Intentional scope

This first version is **AST-guided source mutation**, not a complete
AST → AST → unparser pipeline. Prism tells us exactly which syntactic token is
safe to target; source-range replacement creates the changed program text. That
choice keeps the teaching path short and avoids the harder concerns of
format-preserving unparsing, comments, arbitrary Ruby syntax, test selection,
timeouts, parallelism, equivalent-mutant analysis, and cross-platform process
isolation. `fork` specifically makes the runtime-isolation demonstration
POSIX-oriented.
