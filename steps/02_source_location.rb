#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
puts "source_location: #{subject.source_path}:#{subject.source_line}"
puts File.readlines(subject.source_path)[subject.source_line - 1, 3]
