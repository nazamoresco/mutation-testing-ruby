# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/calculator"

class CalculatorTest < Minitest::Test
  def setup
    @calculator = Calculator.new
  end

  def test_positive_numbers_and_the_boundary
    assert @calculator.positive?(1)
    refute @calculator.positive?(0)
  end

  def test_premium_discount
    assert_equal 80.0, @calculator.discount(100, premium: true)
    assert_equal 100, @calculator.discount(100, premium: false)
  end

  def test_division
    assert_equal 3, @calculator.divide(9, 3)
  end
end
