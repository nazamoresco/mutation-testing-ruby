#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../lib/mini_mutant", __dir__)
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
discoverer = MiniMutant::Discoverer.new(subject)
mutation = discoverer.mutations.first
mutated_call = discoverer.send(:nodes, mutation.ast).find do |node|
  node.is_a?(Prism::CallNode) && node.name == mutation.replacement.to_sym
end

puts "Original AST operator: #{mutation.point.node.name.inspect}"
puts "Mutated AST operator:  #{mutated_call.name.inspect}"
puts "Original still intact: #{mutation.point.node.name.inspect}"
