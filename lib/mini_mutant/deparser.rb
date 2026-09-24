# frozen_string_literal: true

module MiniMutant
  # A deliberately small Prism AST -> Ruby compiler for the workshop examples.
  # It emits code from node values; it never edits the original source string.
  class Deparser
    BINARY_OPERATORS = %i[> >= < <= == != + - * /].freeze

    def self.call(node)
      new.visit(node)
    end

    def visit(node)
      case node
      when Prism::DefNode then visit_def(node)
      when Prism::StatementsNode then node.body.map { |child| visit(child) }.join("\n")
      when Prism::CallNode then visit_call(node)
      when Prism::LocalVariableReadNode then node.name.to_s
      when Prism::IntegerNode, Prism::FloatNode then node.value.to_s
      when Prism::TrueNode then "true"
      when Prism::FalseNode then "false"
      when Prism::IfNode then visit_if(node)
      else
        raise ArgumentError, "Cannot deparse #{node.class} yet"
      end
    end

    private

    def visit_def(node)
      parameters = deparse_parameters(node.parameters)
      body = indent(visit(node.body))
      "def #{node.name}(#{parameters})\n#{body}\nend"
    end

    def visit_call(node)
      arguments = node.arguments&.arguments || []

      if node.receiver && BINARY_OPERATORS.include?(node.name) && arguments.one?
        "#{visit(node.receiver)} #{node.name} #{visit(arguments.first)}"
      elsif node.receiver
        "#{visit(node.receiver)}.#{node.name}(#{arguments.map { |argument| visit(argument) }.join(", ")})"
      else
        "#{node.name}(#{arguments.map { |argument| visit(argument) }.join(", ")})"
      end
    end

    def visit_if(node)
      if node.then_keyword_loc&.slice == "?"
        consequent = node.subsequent.statements
        "#{visit(node.predicate)} ? #{visit(node.statements)} : #{visit(consequent)}"
      else
        raise ArgumentError, "Only ternary conditionals are supported"
      end
    end

    def deparse_parameters(node)
      return "" unless node

      positional = node.requireds.map { |parameter| parameter.name.to_s }
      keywords = node.keywords.map { |parameter| "#{parameter.name}:" }
      (positional + keywords).join(", ")
    end

    def indent(source)
      source.lines.map { |line| "  #{line}" }.join
    end
  end
end
