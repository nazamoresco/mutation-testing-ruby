#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

discoverer = discover(:positive?)
result = MiniMutant::Runner.new(discoverer).run(discoverer.mutations.first) do
  raise "1 must be positive" unless Calculator.new.positive?(1)
end
puts "#{result.mutation.description}: #{result.status}"
raise "expected an alive mutant with no boundary assertion" unless result.alive?
