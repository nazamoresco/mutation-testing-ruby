#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

discover(:positive?).mutation_points.each do |point|
  puts "#{point.operator.inspect} at #{point.line}:#{point.column} -> #{point.replacements.join(', ')}"
end
