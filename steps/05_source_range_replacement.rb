#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

discoverer = discover(:positive?)
mutation = discoverer.mutations.first
puts "mutation: #{mutation.description}"
puts "before: #{discoverer.source.lines[mutation.point.line - 1].strip}"
changed = MiniMutant::SourceRewriter.replace(discoverer.source, mutation)
puts "after:  #{changed.lines[mutation.point.line - 1].strip}"
