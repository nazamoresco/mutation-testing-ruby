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
    raise "1 stopped being positive" unless Calculator.new.positive?(1)
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

raise "expected the mutant to survive without the boundary assertion" unless result == :alive

puts "child: #{result.inspect}"
puts "Without the boundary assertion, > -> >= is alive."
