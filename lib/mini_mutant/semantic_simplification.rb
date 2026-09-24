# frozen_string_literal: true

module MiniMutant
  # Removes a decision by replacing the selected expression with `true`.
  class SemanticSimplification < Prism::MutationCompiler
    def self.call(ast, point)
      replacement = Prism.parse("true").value.statements.body.first
      mutated = new(point.node.location, replacement).visit(ast)
      Mutation.new(point:, replacement: "true", ast: mutated)
    end

    def initialize(target_location, replacement)
      @target_location = target_location
      @replacement = replacement
    end

    def visit_call_node(node)
      same_location = node.location.start_offset == @target_location.start_offset &&
        node.location.end_offset == @target_location.end_offset
      return @replacement if same_location

      super
    end
  end
end
