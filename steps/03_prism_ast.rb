#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

discoverer = discover(:positive?)
puts "root: #{discoverer.ast.class}"
puts "method node: #{discoverer.definition.class}"
puts "method source: #{discoverer.definition.location.slice.inspect}"
