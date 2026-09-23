# frozen_string_literal: true

module MiniMutant
  Result = Data.define(:mutation, :status, :error_message) do
    def killed?
      status == :killed
    end

    def alive?
      status == :alive
    end
  end

  # Each mutant runs in a fork. A raised assertion kills it; a clean test run
  # means it survived. This is intentionally POSIX-oriented for the workshop.
  class Runner
    def initialize(discoverer)
      @discoverer = discoverer
    end

    def run(mutation, &test_suite)
      raise ArgumentError, "a test suite block is required" unless test_suite

      reader, writer = IO.pipe
      pid = fork do
        reader.close
        result = begin
          mutated_source = Deparser.call(mutation.ast)
          Inserter.apply(@discoverer.subject, mutated_source)
          test_suite.call
          Result.new(mutation:, status: :alive, error_message: nil)
        rescue Exception => error # assertions and load failures both kill a mutant
          Result.new(mutation:, status: :killed, error_message: "#{error.class}: #{error.message}")
        end
        Marshal.dump(result, writer)
        writer.close
        exit! 0
      end
      writer.close
      payload = reader.read
      reader.close
      Process.wait(pid)
      Marshal.load(payload)
    end

    def run_all(&test_suite)
      @discoverer.mutations.map { |mutation| run(mutation, &test_suite) }
    end
  end
end
