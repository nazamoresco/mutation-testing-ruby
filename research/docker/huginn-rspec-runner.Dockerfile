FROM ruby:3.2-bookworm

ENV BUNDLE_PATH=/gems \
    BUNDLE_WITHOUT="" \
    DATABASE_ADAPTER=postgresql \
    RAILS_ENV=test

RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    build-essential \
    chromium \
    default-libmysqlclient-dev \
    git \
    libpq-dev \
    nodejs \
    pkg-config \
  && gem install bundler -v 2.4.22 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use a named build context so the application's production .dockerignore does
# not omit the RSpec suite from this research-only test runner.
COPY --from=source . /app

RUN cp .env.example .env \
  && bundle config set --local build.nokogiri --use-system-libraries \
  && bundle install -j 4 -r 3
