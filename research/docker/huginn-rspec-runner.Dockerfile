FROM ruby:3.2-bookworm

ENV BUNDLE_PATH=/gems \
    BUNDLE_WITHOUT="" \
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

COPY . /app

RUN cp .env.example .env \
  && bundle config set --local build.nokogiri --use-system-libraries \
  && bundle install -j 4 -r 3
