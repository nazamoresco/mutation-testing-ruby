# frozen_string_literal: true

module MiniMutant
  MutationPoint = Data.define(
    :node,
    :operator,
    :replacements,
    :line,
    :column
  )
end
