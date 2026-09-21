# frozen_string_literal: true

module MiniMutant
  class SourceRewriter
    def self.replace(source, mutation)
      point = mutation.point
      source.byteslice(0, point.start_offset) + mutation.replacement + source.byteslice(point.end_offset..)
    end
  end
end
