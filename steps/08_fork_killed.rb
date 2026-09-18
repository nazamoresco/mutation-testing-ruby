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
reader, writer = IO.pipe

pid = fork do
  reader.close
  result = begin
    TOPLEVEL_BINDING.eval(mutated_source, source_path, 1)
    raise "0 became positive" if Calculator.new.positive?(0)
    :alive
  rescue StandardError => error
    [:killed, error.message]
  end
  Marshal.dump(result, writer)
  writer.close
  exit! 0
end
writer.close
result = Marshal.load(reader.read)
reader.close
Process.wait(pid)

raise "expected the boundary assertion to kill the mutant" unless result.first == :killed
raise "the parent should remain original" if Calculator.new.positive?(0)

puts "child: #{result.inspect}"
puts "parent: positive?(0) => #{Calculator.new.positive?(0)}"
