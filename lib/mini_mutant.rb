# frozen_string_literal: true

require "prism"

require_relative "mini_mutant/subject"
require_relative "mini_mutant/mutation_point"
require_relative "mini_mutant/mutation"
require_relative "mini_mutant/discoverer"
require_relative "mini_mutant/source_rewriter"
require_relative "mini_mutant/runtime_patch"
require_relative "mini_mutant/runner"

# A deliberately small mutation-testing engine for teaching the moving parts.
module MiniMutant
end
