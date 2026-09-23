#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../lib/mini_mutant", __dir__)
require File.expand_path("../examples/calculator/lib/calculator", __dir__)

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
point = MiniMutant::Discoverer.new(subject).mutation_points.first

puts "Mutation point: #{point.node.class}(#{point.node.name.inspect})"
puts "Alternatives: #{point.replacements.inspect}, line #{point.line}"
