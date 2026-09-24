# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/mini_mutant"
require_relative "../examples/calculator/lib/calculator"

class MiniMutantTest < Minitest::Test
  def setup
    @subject = MiniMutant::Subject.instance_method(Calculator, :positive?)
    @discoverer = MiniMutant::Discoverer.new(@subject)
  end

  def test_subject_keeps_the_reflective_source_location
    assert_equal Calculator, @subject.owner
    assert_equal :positive?, @subject.method_name
    assert_equal File.expand_path("../examples/calculator/lib/calculator.rb", __dir__), @subject.source_path
  end

  def test_prism_discovers_operator_mutations_inside_the_selected_method
    points = @discoverer.mutation_points

    assert_equal [">"], points.map(&:operator)
    assert_equal [[">=", "<"]], points.map(&:replacements)
    assert_equal @subject.source_line + 1, points.first.line
  end

  def test_discovery_is_limited_to_the_subject_method
    discount = MiniMutant::Discoverer.new(MiniMutant::Subject.instance_method(Calculator, :discount))

    assert_equal ["*"], discount.mutation_points.map(&:operator)
  end

  def test_operator_replacement_changes_the_ast_and_deparser_emits_ruby
    mutation = @discoverer.mutations.first
    changed = MiniMutant::Deparser.call(mutation.ast)
    mutated_call = @discoverer.send(:nodes, mutation.ast).find do |node|
      node.is_a?(Prism::CallNode) && node.name == :>=
    end

    assert mutated_call
    assert_includes changed, "number >= 0"
    assert_equal "number > 0", @discoverer.definition.body.body.first.location.slice
  end

  def test_semantic_simplification_replaces_the_decision_with_true
    point = @discoverer.mutation_points.first
    mutation = MiniMutant::SemanticSimplification.call(@discoverer.definition, point)

    assert_equal "def positive?(number)\n  true\nend", MiniMutant::Deparser.call(mutation.ast)
    assert_equal :>, point.node.name
  end

  def test_forked_runner_marks_a_boundary_mutant_killed_and_leaves_parent_intact
    result = MiniMutant::Runner.new(@discoverer).run(@discoverer.mutations.first) do
      raise "zero became positive" if Calculator.new.positive?(0)
    end

    assert_predicate result, :killed?
    refute Calculator.new.positive?(0)
  end

  def test_forked_runner_marks_a_mutant_alive_when_the_boundary_is_not_tested
    result = MiniMutant::Runner.new(@discoverer).run(@discoverer.mutations.first) do
      raise "one stopped being positive" unless Calculator.new.positive?(1)
    end

    assert_predicate result, :alive?
  end
end
