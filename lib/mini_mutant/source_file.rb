# frozen_string_literal: true

module MiniMutant
  # Reads and parses one Ruby file once so its AST can feed many mutations.
  class SourceFile
    attr_reader :path, :source, :ast

    def self.load(path)
      new(path)
    end

    def initialize(path)
      @path = path
      @source = File.binread(path)
      result = Prism.parse(source)
      raise SyntaxError, result.errors.map(&:message).join(", ") unless result.success?

      @ast = result.value
    end
  end
end
