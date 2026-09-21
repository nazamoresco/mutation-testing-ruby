# frozen_string_literal: true

module MiniMutant
  MutationPoint = Data.define(
    :operator,
    :replacements,
    :start_offset,
    :end_offset,
    :line,
    :column
  ) do
    def range
      start_offset...end_offset
    end
  end
end
