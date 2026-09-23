# frozen_string_literal: true

module MiniMutant
  # Joins runtime reflection with the exact DefNode in a parsed source file.
  class MethodFinder
    def self.call(ast, subject)
      nodes(ast).find do |node|
        node.is_a?(Prism::DefNode) &&
          node.name == subject.method_name &&
          node.location.start_line == subject.source_line
      end || raise("Could not find #{subject.display_name} in #{subject.source_path}")
    end

    def self.nodes(node)
      [node] + node.compact_child_nodes.flat_map { |child| nodes(child) }
    end
  end
end
