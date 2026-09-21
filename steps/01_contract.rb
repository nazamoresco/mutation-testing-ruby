#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../examples/calculator/lib/calculator", __dir__)

calculator = Calculator.new
raise "1 should be positive" unless calculator.positive?(1)
raise "0 should not be positive" if calculator.positive?(0)

puts "Program under test: Calculator#positive?"
puts "Contract: 1 => #{calculator.positive?(1)}, 0 => #{calculator.positive?(0)}"
