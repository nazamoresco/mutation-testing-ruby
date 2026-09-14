FROM ruby:3.4.4-alpine3.21

ENV BUNDLE_PATH=/gems \
    BUNDLE_WITHOUT="" \
    BUNDLE_FORCE_RUBY_PLATFORM=1 \
    RAILS_ENV=test

RUN apk add --no-cache \
    build-base \
    git \
    imagemagick \
    linux-headers \
    nodejs \
    npm \
    postgresql-client \
    postgresql-dev \
    tzdata \
    vips \
    xz \
  && gem install bundler -v 2.5.16 \
  && npm install --global pnpm@10.2.0

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN bundle config set --local force_ruby_platform true \
  && bundle install -j 4 -r 3

COPY . /app
