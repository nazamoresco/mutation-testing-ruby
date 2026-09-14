#!/usr/bin/env ruby
# frozen_string_literal: true

# Build a read-only manifest for the bug-fix mutation study. It never checks out,
# modifies, or executes the target repository. Each `fix:` commit is evaluated
# from its first parent, where the defect still exists.

require "csv"
require "open3"
require "optparse"
require "pathname"
require "set"

class ManifestBuilder
  FIX_PATTERN = /\Afix(?:\([^)]+\))?!?:\s+/.freeze
  DEFAULT_MUTANT_COMMAND = "bundle exec mutant run --usage opensource"

  def initialize(options)
    @repo = Pathname(options.fetch(:repo)).realpath
    @output = Pathname(options.fetch(:output))
    @max_fixes = options.fetch(:max_fixes)
    @control_count = options.fetch(:control_count)
    @since = options[:since]
    @until = options[:until]
    @mutant_command = options.fetch(:mutant_command)
  end

  def call
    verify_repository!

    commits = log_commits
    fixes = []
    controls = []

    commits.each do |commit|
      if fix?(commit[:subject])
        fixes << commit if fixes.length < @max_fixes && usable?(commit)
      elsif controls.length < @control_count && usable?(commit)
        controls << commit
      end

      break if fixes.length == @max_fixes && controls.length == @control_count
    end

    rows = fixes.flat_map { |commit| rows_for(commit, "bug_fix") } +
           controls.flat_map { |commit| rows_for(commit, "nonfix_control") }

    @output.dirname.mkpath
    CSV.open(@output, "w") do |csv|
      csv << headers
      rows.each { |row| csv << row }
    end

    warn "Selected #{fixes.length} bug fixes, #{controls.length} controls and #{rows.length} Ruby change regions."
    warn "No target repository files were modified."
  end

  private

  def headers
    %w[
      cohort_role commit_sha parent_sha commit_subject source_file
      parent_changed_lines fix_changed_lines snapshot_ref
      mutant_subject manual_target_required mutant_command notes
    ]
  end

  def rows_for(commit, role)
    ruby_hunks(commit).map do |hunk|
      [
        role,
        commit[:sha],
        commit[:parents].first,
        commit[:subject],
        hunk[:path],
        hunk[:old_lines].join(" "),
        hunk[:new_lines].join(" "),
        commit[:parents].first,
        "",
        "yes",
        mutant_template(commit[:parents].first),
        "Resolve mutant_subject to the enclosing method/class before execution; run against parent_sha, not fix commit."
      ]
    end
  end

  def mutant_template(parent_sha)
    "git worktree add --detach /tmp/mutant-study-#{parent_sha[0, 12]} #{parent_sha} && " \
      "cd /tmp/mutant-study-#{parent_sha[0, 12]} && #{@mutant_command} '$SUBJECT'"
  end

  def ruby_hunks(commit)
    output = git("diff", "--unified=0", commit[:parents].first, commit[:sha], "--", "*.rb")
    path = nil
    hunks = []

    output.each_line do |line|
      if (match = line.match(%r{^\+\+\+ b/(.+)$}))
        path = match[1]
      elsif (match = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/))
        old_start, old_count, new_start, new_count = match.captures.map { |value| value&.to_i }
        next unless path && path.end_with?(".rb") && source_path?(path)

        hunks << {
          path: path,
          old_lines: line_range(old_start, old_count || 1),
          new_lines: line_range(new_start, new_count || 1)
        }
      end
    end

    hunks
  end

  def line_range(start, count)
    return [] if count.zero?

    (start...(start + count)).to_a
  end

  def ruby_changes?(commit)
    !ruby_hunks(commit).empty?
  end

  def source_path?(path)
    !path.start_with?("spec/", "test/")
  end

  def usable?(commit)
    commit[:parents].length == 1 && !ruby_hunks(commit).empty?
  end

  def fix?(subject)
    FIX_PATTERN.match?(subject)
  end

  def log_commits
    args = ["log", "--format=%H%x1f%P%x1f%s%x1e"]
    args << "--since=#{@since}" if @since
    args << "--until=#{@until}" if @until

    git(*args).split("\x1e").map do |record|
      sha, parents, subject = record.strip.split("\x1f", 3)
      next if sha.nil? || parents.nil? || subject.nil?

      { sha: sha, parents: parents.split, subject: subject }
    end.compact
  end

  def verify_repository!
    git("rev-parse", "--is-inside-work-tree") == "true\n" || raise("--repo is not a Git worktree")
  end

  def git(*arguments)
    output, status = Open3.capture2e("git", "-C", @repo.to_s, *arguments)
    raise "git #{arguments.join(" ")} failed:\n#{output}" unless status.success?

    output
  end
end

options = {
  max_fixes: 50,
  control_count: 50,
  mutant_command: ManifestBuilder::DEFAULT_MUTANT_COMMAND
}

OptionParser.new do |parser|
  parser.banner = "Usage: build_bug_fix_mutation_manifest.rb --repo PATH --output FILE [options]"
  parser.on("--repo PATH", "Local Git repository to inspect (read-only)") { |value| options[:repo] = value }
  parser.on("--output FILE", "CSV manifest to write") { |value| options[:output] = value }
  parser.on("--max-fixes N", Integer, "Maximum conventional fix commits (default: 50)") { |value| options[:max_fixes] = value }
  parser.on("--control-count N", Integer, "Maximum non-fix controls (default: 50)") { |value| options[:control_count] = value }
  parser.on("--since DATE", "Only commits on/after DATE") { |value| options[:since] = value }
  parser.on("--until DATE", "Only commits on/before DATE") { |value| options[:until] = value }
  parser.on("--mutant-command COMMAND", "Command prefix placed in the manifest") { |value| options[:mutant_command] = value }
  parser.on("-h", "--help", "Show this help") { puts parser; exit }
end.parse!

abort "--repo is required" unless options[:repo]
abort "--output is required" unless options[:output]
abort "--max-fixes must be positive" unless options[:max_fixes].positive?
abort "--control-count must be non-negative" if options[:control_count].negative?

ManifestBuilder.new(options).call
