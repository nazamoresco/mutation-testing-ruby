#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../lib/mini_mutant", __dir__)
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
discoverer = MiniMutant::Discoverer.new(subject)
result = MiniMutant::Runner.new(discoverer).run(discoverer.mutations.first) do
  raise "0 became positive" if Calculator.new.positive?(0)
end

raise "expected the boundary assertion to kill the mutant" unless result.killed?
raise "the parent should remain original" if Calculator.new.positive?(0)

puts "child: #{result.status} (#{result.error_message})"
puts "parent: positive?(0) => #{Calculator.new.positive?(0)}"
