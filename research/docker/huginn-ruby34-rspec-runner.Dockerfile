FROM ruby:3.4-bookworm

ENV BUNDLE_PATH=/gems \
    BUNDLE_WITHOUT="" \
    DATABASE_ADAPTER=postgresql \
    RAILS_ENV=test

RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    build-essential \
    chromium \
    chromium-driver \
    default-libmysqlclient-dev \
    git \
    jq \
    libpq-dev \
    nodejs \
    pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build from a Git archive context without the production .dockerignore so this
# research-only runner includes the RSpec suite.
COPY . /app

RUN cp .env.example .env \
  && bundle config set --local build.nokogiri --use-system-libraries \
  && bundle install -j 4 -r 3

RUN useradd --create-home --uid 1000 huginn \
  && chown -R huginn:huginn /app /gems

USER huginn
