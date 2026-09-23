# frozen_string_literal: true

module MiniMutant
  # Prism finds syntax. We keep only operator calls inside the selected DefNode.
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
      @source_file = SourceFile.load(subject.source_path)
    end

    attr_reader :source_file, :subject

    def source
      source_file.source
    end

    def ast
      source_file.ast
    end

    def definition
      @definition ||= MethodFinder.call(ast, subject)
    end

    def mutation_points
      nodes(definition).filter_map do |node|
        next unless node.is_a?(Prism::CallNode)

        operator = node.message_loc.slice
        replacements = REPLACEMENTS[operator]
        next unless replacements

        location = node.message_loc
        MutationPoint.new(
          node: node,
          operator: operator,
          replacements: replacements,
          line: location.start_line,
          column: location.start_column
        )
      end
    end

    def mutations
      mutation_points.flat_map do |point|
        point.replacements.map do |replacement|
          Mutation.new(
            point:,
            replacement:,
            ast: OperatorReplacement.call(definition, point, replacement)
          )
        end
      end
    end

    private

    def nodes(node)
      MethodFinder.nodes(node)
    end
  end
end
