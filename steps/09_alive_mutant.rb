#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../lib/mini_mutant", __dir__)
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
discoverer = MiniMutant::Discoverer.new(subject)
result = MiniMutant::Runner.new(discoverer).run(discoverer.mutations.first) do
  raise "1 stopped being positive" unless Calculator.new.positive?(1)
end

raise "expected the mutant to survive without the boundary assertion" unless result.alive?

puts "child: #{result.status}"
puts "Without the boundary assertion, > -> >= is alive."
