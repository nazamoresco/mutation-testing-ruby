# frozen_string_literal: true

module MiniMutant
  # Prism finds syntax. We keep only operator calls inside the selected DefNode.
  # No AST is re-serialized: offsets from Prism are used to patch the source text.
  class Discoverer
    REPLACEMENTS = {
      ">" => [">=", "<"],
      ">=" => [">"],
      "<" => ["<=", ">"],
      "<=" => ["<"],
      "==" => ["!="],
      "!=" => ["=="],
      "+" => ["-"],
      "-" => ["+"],
      "*" => ["/"],
      "/" => ["*"]
    }.freeze

    def initialize(subject)
      @subject = subject
      @source = File.binread(subject.source_path)
    end

    attr_reader :source, :subject

    def ast
      @ast ||= begin
        result = Prism.parse(source)
        raise SyntaxError, result.errors.map(&:message).join(", ") unless result.success?

        result.value
      end
    end

    def definition
      @definition ||= nodes(ast).find do |node|
        node.is_a?(Prism::DefNode) &&
          node.name == subject.method_name &&
          node.location.start_line == subject.source_line
      end || raise("Could not find #{subject.display_name} in #{subject.source_path}")
    end

    def mutation_points
      nodes(definition).filter_map do |node|
        next unless node.is_a?(Prism::CallNode)

        operator = node.message_loc.slice
        replacements = REPLACEMENTS[operator]
        next unless replacements

        location = node.message_loc
        MutationPoint.new(
          operator: operator,
          replacements: replacements,
          start_offset: location.start_offset,
          end_offset: location.end_offset,
          line: location.start_line,
          column: location.start_column
        )
      end
    end

    def mutations
      mutation_points.flat_map do |point|
        point.replacements.map { |replacement| Mutation.new(point:, replacement:) }
      end
    end

    private

    def nodes(node)
      [node] + node.compact_child_nodes.flat_map { |child| nodes(child) }
    end
  end
end
