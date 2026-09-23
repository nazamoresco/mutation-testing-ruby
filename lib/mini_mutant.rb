# frozen_string_literal: true

require "prism"

require_relative "mini_mutant/subject"
require_relative "mini_mutant/source_file"
require_relative "mini_mutant/method_finder"
require_relative "mini_mutant/mutation_point"
require_relative "mini_mutant/mutation"
require_relative "mini_mutant/operator_replacement"
require_relative "mini_mutant/semantic_simplification"
require_relative "mini_mutant/deparser"
require_relative "mini_mutant/discoverer"
require_relative "mini_mutant/inserter"
require_relative "mini_mutant/runner"

# A deliberately small mutation-testing engine for teaching the moving parts.
module MiniMutant
end
