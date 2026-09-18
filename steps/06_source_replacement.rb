#!/usr/bin/env ruby
# frozen_string_literal: true

require "prism"
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

method = Calculator.instance_method(:positive?)
source_path, source_line = method.source_location
source = File.binread(source_path)
tree = Prism.parse(source).value
nodes = ->(node) { [node] + node.compact_child_nodes.flat_map { |child| nodes.call(child) } }
definition = nodes.call(tree).find { |node| node.is_a?(Prism::DefNode) && node.name == :positive? && node.location.start_line == source_line }
call = nodes.call(definition).find { |node| node.is_a?(Prism::CallNode) && node.message_loc.slice == ">" }
range = call.message_loc
mutated_source = source.byteslice(0, range.start_offset) + ">=" + source.byteslice(range.end_offset..)

puts "before: #{source.lines[range.start_line - 1].strip}"
puts "after:  #{mutated_source.lines[range.start_line - 1].strip}"
