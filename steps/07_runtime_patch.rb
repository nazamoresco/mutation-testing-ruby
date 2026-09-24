#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../lib/mini_mutant", __dir__)
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
mutation = MiniMutant::Discoverer.new(subject).mutations.first
mutated_source = MiniMutant::Deparser.call(mutation.ast)

MiniMutant::Inserter.apply(subject, mutated_source)
puts "Deparsed mutant:\n#{mutated_source}"
puts "Runtime patch applied: positive?(0) => #{Calculator.new.positive?(0)}"
