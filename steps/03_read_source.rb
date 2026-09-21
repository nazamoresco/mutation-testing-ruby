#!/usr/bin/env ruby
# frozen_string_literal: true

require File.expand_path("../examples/calculator/lib/calculator", __dir__)

method = Calculator.instance_method(:positive?)
source_path, source_line = method.source_location
source = File.binread(source_path)

puts "Source at #{source_path}:#{source_line}"
puts source.lines[source_line - 1, 3]
