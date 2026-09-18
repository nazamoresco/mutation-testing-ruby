# frozen_string_literal: true

module MiniMutant
  # A subject is the method whose source and mutation points we inspect.
  class Subject
    attr_reader :owner, :method_name, :source_location

    def self.instance_method(owner, method_name)
      new(owner, method_name, owner.instance_method(method_name))
    end

    def initialize(owner, method_name, method)
      @owner = owner
      @method_name = method_name.to_sym
      @source_location = method.source_location
      raise ArgumentError, "#{owner}##{method_name} has no Ruby source location" unless @source_location
    end

    def source_path
      source_location.first
    end

    def source_line
      source_location.last
    end

    def display_name
      "#{owner}##{method_name}"
    end
  end
end
