#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../examples/calculator/lib/calculator", __dir__)

method = Calculator.instance_method(:positive?)
source_path, source_line = method.source_location

puts "method: #{method.owner}##{method.name}"
puts "source_location: #{source_path}:#{source_line}"
