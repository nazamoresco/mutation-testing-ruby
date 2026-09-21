# Research-only overlay for the Ruby 3.4 Huginn runner.  The base image is
# built from the exact archived snapshot; keeping this dependency separate
# avoids rebuilding the browser and Ruby bundle merely to satisfy `npm run`.
FROM mutation-study-huginn-rspec-52cda2:ruby34-trixie

USER root

RUN apt-get update \
  && apt-get install --no-install-recommends -y npm \
  && rm -rf /var/lib/apt/lists/*

USER huginn
