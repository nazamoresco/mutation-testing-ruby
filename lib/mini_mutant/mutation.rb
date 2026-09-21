# frozen_string_literal: true

module MiniMutant
  Mutation = Data.define(:point, :replacement) do
    def description
      "#{point.operator} -> #{replacement} at #{point.line}:#{point.column}"
    end
  end
end
