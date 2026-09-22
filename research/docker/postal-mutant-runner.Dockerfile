# Temporary Mutant layer for Postal historical snapshots.
# Build with --build-arg BASE_IMAGE=<snapshot baseline image>.
# The Postal checkout remains unmodified; the overlay and its lockfile exist
# only in this image.
ARG BASE_IMAGE
FROM ${BASE_IMAGE}

USER root
COPY postal-mutant.Gemfile /tmp/Gemfile.mutant
RUN cp /opt/postal/app/Gemfile.lock /tmp/Gemfile.mutant.lock \
 && BUNDLE_GEMFILE=/tmp/Gemfile.mutant bundle lock \
 && BUNDLE_GEMFILE=/tmp/Gemfile.mutant bundle install
ENV BUNDLE_GEMFILE="/tmp/Gemfile.mutant"
ENV PATH="/usr/local/bundle/bin:${PATH}"
USER postal
