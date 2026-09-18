#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

discoverer = discover(:positive?)
result = MiniMutant::Runner.new(discoverer).run(discoverer.mutations.first) { CalculatorMutationSuite.verify! }
puts "child result: #{result.status}"
puts "parent positive?(0): #{Calculator.new.positive?(0)}"
