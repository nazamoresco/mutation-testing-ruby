#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../lib/mini_mutant", __dir__)
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
discoverer = MiniMutant::Discoverer.new(subject)
point = discoverer.mutation_points.first
mutation = MiniMutant::SemanticSimplification.call(discoverer.definition, point)
result = MiniMutant::Runner.new(discoverer).run(mutation) do
  raise "zero became positive" if Calculator.new.positive?(0)
end

puts "Semantic simplification:"
puts MiniMutant::Deparser.call(mutation.ast)
puts "Result: #{result.status} (#{result.error_message})"
