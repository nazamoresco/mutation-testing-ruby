# frozen_string_literal: true

ROOT = File.expand_path("..", __dir__)
$LOAD_PATH.unshift(File.join(ROOT, "lib"))

require "mini_mutant"
require File.join(ROOT, "examples/calculator/lib/calculator")
require File.join(ROOT, "examples/calculator/test/mutation_suite")

def discover(method_name)
  subject = MiniMutant::Subject.instance_method(Calculator, method_name)
  MiniMutant::Discoverer.new(subject)
end
