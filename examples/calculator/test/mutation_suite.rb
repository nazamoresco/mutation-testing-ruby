# frozen_string_literal: true

module CalculatorMutationSuite
  module_function

  def verify!
    calculator = Calculator.new
    raise "1 must be positive" unless calculator.positive?(1)
    raise "0 must not be positive" if calculator.positive?(0)
    raise "premium discount is wrong" unless calculator.discount(100, premium: true) == 80.0
    raise "regular total is wrong" unless calculator.discount(100, premium: false) == 100
    raise "division is wrong" unless calculator.divide(9, 3) == 3
  end
end
