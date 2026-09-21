# frozen_string_literal: true

class Calculator
  def positive?(number)
    number > 0
  end

  def discount(total, premium:)
    premium ? total * 0.8 : total
  end

  def divide(total, count)
    total / count
  end
end
