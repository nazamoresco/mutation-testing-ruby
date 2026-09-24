# frozen_string_literal: true

module MiniMutant
  # Rebuilds an immutable Prism tree and changes exactly one CallNode.
  class OperatorReplacement < Prism::MutationCompiler
    def self.call(ast, point, replacement)
      new(point.node.location, replacement.to_sym).visit(ast)
    end

    def initialize(target_location, replacement)
      @target_location = target_location
      @replacement = replacement
    end

    def visit_call_node(node)
      copy = super
      same_location = node.location.start_offset == @target_location.start_offset &&
        node.location.end_offset == @target_location.end_offset
      same_location ? copy.copy(name: @replacement) : copy
    end
  end
end
