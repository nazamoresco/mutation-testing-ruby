#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "support"

subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
puts "subject: #{subject.display_name}"
puts "owner: #{subject.owner}"
puts "method: #{subject.method_name}"
