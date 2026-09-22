#!/usr/bin/env ruby
# frozen_string_literal: true

# Read-only static pre-screen for the historical bug-fix mutation study.
#
# It deliberately does not clone a target application, install dependencies,
# create a worktree, or run its tests. It combines the existing Real World
# Rails inventory with GitHub commit metadata to find projects worth a later
# baseline gate. "potential_pair_candidate" means only that a candidate has:
#   * an available, not-yet-run RSpec inventory entry;
#   * a declared Ruby >= 3.2 and declared Rails >= 6.1 (including ranges);
#   * a clear license; and
#   * in its latest commit window, a Conventional Commit fix that changes a
#     production Ruby file, plus at least one non-bug-like non-fix commit.
#
# It is not evidence that a project has a comparable control method, a green
# baseline, or an identical runtime compatibility cell. Those remain explicit
# gates before any Mutant run.

require "csv"
require "date"
require "json"
require "open3"
require "optparse"
require "uri"

class HistoricalPairCandidateScreen
  FIX_PATTERN = /\Afix(?:\([^)]+\))?!?:\s+/.freeze
  BUG_LIKE_PATTERN = /\b(?:fix(?:e[ds])?|bug|regression|security|vulnerabilit(?:y|ies))\b/i.freeze
  MINIMUM_RUBY = Gem::Version.new("3.2.0")
  MINIMUM_RAILS = Gem::Version.new("6.1.0")

  def initialize(options)
    @input = options.fetch(:input)
    @output = options.fetch(:output)
    @commit_window = options.fetch(:commit_window)
    @prior_pairs = CSV.read(options.fetch(:prior_screening), headers: true).each_with_object({}) do |row, pairs|
      pairs[row.fetch("app_id")] = row
    end
  end

  def call
    input_rows = CSV.read(@input, headers: true).select { |row| eligible_inventory_row?(row) }
    results = input_rows.map { |row| screen(row) }

    CSV.open(@output, "w") do |csv|
      csv << headers
      results.each { |result| csv << headers.map { |header| result.fetch(header) } }
    end

    summary = results.group_by { |result| result.fetch("eligibility") }.transform_values(&:length)
    warn "Screened #{results.length} not-run inventory entries: #{summary.sort.to_h}"
  end

  private

  def headers
    %w[
      screened_on app_id repository_url revision source_branch license ruby_version rails_version test_framework prior_pair_screening
      static_gate github_status commits_examined conventional_fix_commits nonbug_nonfix_commits
      representative_fix_sha representative_fix_subject representative_fix_ruby_source_files
      eligibility reason next_gate
    ]
  end

  def eligible_inventory_row?(row)
    row["inventory_status"] == "found" && row["baseline_status"] == "not_run"
  end

  def screen(row)
    result = base_result(row)
    static_reason = static_gate_reason(row)
    unless static_reason.nil?
      return result.merge(
        "static_gate" => "rejected",
        "eligibility" => "static_ineligible",
        "reason" => static_reason,
        "next_gate" => "None; excluded before GitHub history scan."
      )
    end

    result["static_gate"] = "passed"
    owner_repo = github_owner_repo(row.fetch("repository_url"))
    unless owner_repo
      return result.merge(
        "github_status" => "unsupported_repository_url",
        "eligibility" => "history_unavailable",
        "reason" => "Repository URL is not a parseable GitHub repository.",
        "next_gate" => "Resolve a read-only GitHub source before screening history."
      )
    end

    commits, error = github_json("repos/#{owner_repo}/commits?sha=#{URI.encode_www_form_component(row.fetch("source_branch"))}&per_page=#{@commit_window}")
    if error
      return result.merge(
        "github_status" => error,
        "eligibility" => "history_unavailable",
        "reason" => "GitHub commit metadata could not be read.",
        "next_gate" => "Retry the static history scan; do not run the application."
      )
    end

    result["github_status"] = "ok"
    result["commits_examined"] = commits.length.to_s
    fixes = commits.select { |commit| FIX_PATTERN.match?(commit.dig("commit", "message").to_s.lines.first.to_s.strip) }
    controls = commits.reject { |commit| BUG_LIKE_PATTERN.match?(commit.dig("commit", "message").to_s.lines.first.to_s.strip) }
    result["conventional_fix_commits"] = fixes.length.to_s
    result["nonbug_nonfix_commits"] = controls.length.to_s

    if fixes.empty?
      return result.merge(
        "eligibility" => "no_conventional_fix_in_window",
        "reason" => "No Conventional Commit fix: subject appeared in the latest #{@commit_window} commits.",
        "next_gate" => "Expand the read-only history window only if this project becomes strategically interesting."
      )
    end

    fix, ruby_files, detail_error = first_fix_with_ruby_source(owner_repo, fixes)
    if detail_error
      return result.merge(
        "github_status" => detail_error,
        "eligibility" => "history_unavailable",
        "reason" => "GitHub file metadata for a candidate fix could not be read.",
        "next_gate" => "Retry the static history scan; do not run the application."
      )
    end

    if fix.nil?
      return result.merge(
        "eligibility" => "fix_without_production_ruby_change",
        "reason" => "Conventional fixes were found, but none changed a production .rb file in the inspected window.",
        "next_gate" => "Exclude from the automatic-method study unless manually reviewed."
      )
    end

    result["representative_fix_sha"] = fix.fetch("sha")
    result["representative_fix_subject"] = fix.dig("commit", "message").to_s.lines.first.to_s.strip
    result["representative_fix_ruby_source_files"] = ruby_files.join("; ")

    if controls.empty?
      return result.merge(
        "eligibility" => "no_nonbug_control_in_window",
        "reason" => "A suitable fix exists, but the inspected window has no non-bug-like non-fix commit to screen as a control.",
        "next_gate" => "Expand the read-only history window before considering a baseline."
      )
    end

    prior_screening = @prior_pairs[row.fetch("app_id")]
    if prior_screening && prior_screening.fetch("screening_decision") == "rejected_for_now"
      return result.merge(
        "prior_pair_screening" => prior_screening.fetch("screening_decision"),
        "eligibility" => "excluded_by_prior_pair_screening",
        "reason" => "Prior static pair review rejected this project: #{prior_screening.fetch("notes")}",
        "next_gate" => "None; use another project unless a new comparable method control is identified."
      )
    end

    result.merge(
      "eligibility" => "potential_pair_candidate",
      "reason" => "Passes static metadata and history gates; comparability is still unverified.",
      "next_gate" => "Resolve one fix/control method pair and verify an identical compatibility cell plus two green baselines on each parent."
    )
  end

  def base_result(row)
    {
      "screened_on" => Date.today.iso8601,
      "app_id" => row.fetch("app_id"),
      "repository_url" => row.fetch("repository_url"),
      "revision" => row.fetch("revision"),
      "source_branch" => row.fetch("source_branch"),
      "license" => row.fetch("license"),
      "ruby_version" => row.fetch("ruby_version"),
      "rails_version" => row.fetch("rails_version"),
      "test_framework" => row.fetch("test_framework"),
      "prior_pair_screening" => @prior_pairs.key?(row.fetch("app_id")) ? @prior_pairs.fetch(row.fetch("app_id")).fetch("screening_decision") : "none",
      "static_gate" => "not_checked",
      "github_status" => "not_queried",
      "commits_examined" => "0",
      "conventional_fix_commits" => "0",
      "nonbug_nonfix_commits" => "0",
      "representative_fix_sha" => "",
      "representative_fix_subject" => "",
      "representative_fix_ruby_source_files" => "",
      "eligibility" => "",
      "reason" => "",
      "next_gate" => ""
    }
  end

  def static_gate_reason(row)
    return "No clear open-source license in the inventory." if ["NOASSERTION", "not_declared", "unavailable", ""].include?(row.fetch("license"))
    return "No RSpec integration declared in the inventory." unless row.fetch("test_framework").include?("RSpec")
    return "Ruby version does not declare support at or above 3.2." unless version_at_least?(row.fetch("ruby_version"), MINIMUM_RUBY)
    return "Rails version does not declare support at or above 6.1." unless version_at_least?(row.fetch("rails_version"), MINIMUM_RAILS)
  end

  def version_at_least?(value, minimum)
    match = value.match(/(?:ruby-)?(\d+\.\d+(?:\.\d+)?)/)
    match && Gem::Version.new(match[1]) >= minimum
  end

  def github_owner_repo(url)
    uri = URI.parse(url.sub(/\.git\z/, ""))
    return unless uri.host == "github.com"

    parts = uri.path.split("/").reject(&:empty?)
    return unless parts.length == 2

    parts.join("/")
  rescue URI::InvalidURIError
    nil
  end

  def first_fix_with_ruby_source(owner_repo, fixes)
    fixes.each do |fix|
      detail, error = github_json("repos/#{owner_repo}/commits/#{fix.fetch("sha")}")
      return [nil, [], error] if error

      ruby_files = detail.fetch("files", []).map do |file|
        filename = file.fetch("filename")
        filename if production_ruby_file?(filename)
      end.compact
      return [fix, ruby_files, nil] unless ruby_files.empty?
    end
    [nil, [], nil]
  end

  def production_ruby_file?(path)
    path.end_with?(".rb") && !path.start_with?("spec/", "test/")
  end

  def github_json(endpoint)
    output, status = Open3.capture2e("gh", "api", "--method", "GET", "-H", "Accept: application/vnd.github+json", endpoint)
    return [JSON.parse(output), nil] if status.success?

    [nil, "github_api_error: #{output.lines.first.to_s.strip}"]
  rescue JSON::ParserError => error
    [nil, "github_json_error: #{error.message}"]
  end
end

options = {
  input: "research/apps.csv",
  output: "research/historical-pair-candidates.csv",
  prior_screening: "research/pair-screening.csv",
  commit_window: 100
}

OptionParser.new do |parser|
  parser.banner = "Usage: screen_historical_pair_candidates.rb [options]"
  parser.on("--input PATH", "Inventory CSV (default: research/apps.csv)") { |value| options[:input] = value }
  parser.on("--output PATH", "Derived screening CSV") { |value| options[:output] = value }
  parser.on("--prior-screening PATH", "Existing pair-screening CSV") { |value| options[:prior_screening] = value }
  parser.on("--commit-window N", Integer, "Latest commits to inspect per eligible app (default: 100)") { |value| options[:commit_window] = value }
  parser.on("-h", "--help", "Show help") { puts parser; exit }
end.parse!

abort "--commit-window must be 1..100" unless (1..100).cover?(options[:commit_window])
HistoricalPairCandidateScreen.new(options).call
