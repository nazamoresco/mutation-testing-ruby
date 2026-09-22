# Research-only runner. The source context is a Git archive of a fixed
# Camaleon CMS snapshot; no third-party checkout is changed.
FROM ruby:3.4.9-slim

ENV RAILS_ENV=test \
    BUNDLE_PATH=/gems

RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    build-essential \
    chromium \
    chromium-driver \
    git \
    imagemagick \
    libsqlite3-dev \
    nodejs \
    pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN bundle config set --local build.nokogiri --use-system-libraries \
  && bundle install -j 4 -r 3 \
  && useradd --create-home --uid 1000 research \
  && chown -R research:research /app /gems

USER research
