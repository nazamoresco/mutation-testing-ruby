# frozen_string_literal: true

module MiniMutant
  # Evaluating the changed source redefines the target method in this process.
  # Runner does this only in a child process, so the parent stays pristine.
  class RuntimePatch
    def self.apply(source_path, mutated_source)
      TOPLEVEL_BINDING.eval(mutated_source, source_path, 1)
    end
  end
end
