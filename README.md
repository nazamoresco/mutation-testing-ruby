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
| 01 | Run the original program and state the boundary contract. |
| 02 | Ruby reflection gives the method's `source_location`. |
| 03 | Read the exact source text at that location. |
| 04 | Prism parses the file and finds the method's `DefNode`. |
| 05 | A `CallNode` supplies the `>` token and its exact source range. |
| 06 | That range replaces just `>` with `>=` in source text. |
| 07 | Evaluating the altered source redefines the method at runtime. |
| 08 | A forked child runs the boundary assertion and kills the mutant. |
| 09 | Without the boundary assertion, the same mutant remains alive. |

## How the miniature engine works

The steps deliberately use local variables and repeat the preceding setup.
They start with a real method and its `source_location`, parse its source with
Prism, locate the operator's range, replace that source range, then evaluate
the result. A `fork` isolates the runtime patch: a raised boundary assertion
makes the mutant **killed**, while a clean run makes it **alive**.

After that imperative walkthrough, `lib/mini_mutant` is the reusable refactor:
`Subject`, `Discoverer`, `SourceRewriter`, and `Runner` give names to the same
operations. The library is useful application code; the steps are the teaching
material that makes its behavior visible.

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
