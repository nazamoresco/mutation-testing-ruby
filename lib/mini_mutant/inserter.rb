# frozen_string_literal: true

module MiniMutant
  # Redefines the selected method inside the isolated mutation process.
  class Inserter
    def self.apply(subject, mutated_source)
      subject.owner.class_eval(mutated_source, subject.source_path, subject.source_line)
    end
  end
end
