# Ephemeral bootstrap for Mutant against historical Huginn.
# It is copied into the isolated runner; no Huginn source file is changed.
ENV["RAILS_ENV"] ||= "test"

require "/app/config/environment"

Rails.application.eager_load!
