#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

results = MiniMutant::Runner.new(discover(:positive?)).run_all { CalculatorMutationSuite.verify! }
results.each { |result| puts "#{result.mutation.description}: #{result.status}" }
raise "expected every positive? mutant to be killed" unless results.all?(&:killed?)
