#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

discoverer = discover(:positive?)
mutation = discoverer.mutations.first
MiniMutant::RuntimePatch.apply(
  discoverer.subject.source_path,
  MiniMutant::SourceRewriter.replace(discoverer.source, mutation)
)
puts "patched #{mutation.description}"
puts "positive?(0): #{Calculator.new.positive?(0)}"
