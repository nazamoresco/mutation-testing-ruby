#!/usr/bin/env ruby
# frozen_string_literal: true

require "prism"
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

method = Calculator.instance_method(:positive?)
source_path, source_line = method.source_location
source = File.binread(source_path)
tree = Prism.parse(source).value
nodes = ->(node) { [node] + node.compact_child_nodes.flat_map { |child| nodes.call(child) } }
definition = nodes.call(tree).find do |node|
  node.is_a?(Prism::DefNode) && node.name == :positive? && node.location.start_line == source_line
end

puts "Parsed: #{tree.class}"
puts "Selected: #{definition.class}"
puts "Method source: #{definition.location.slice.inspect}"
