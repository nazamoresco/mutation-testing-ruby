# A temporary, common runtime for comparing two historical dev.to snapshots.
#
# Build with the snapshot and the selected common lockfile passed as named
# contexts.  This deliberately leaves those third-party worktrees unchanged.
FROM ghcr.io/forem/ruby:3.3.0@sha256:9cda49a45931e9253d58f7d561221e43bd0d47676b8e75f55862ce1e9997ab5c

USER root

RUN rm -f /etc/apt/sources.list.d/nodesource.list && \
    sed -i \
      -e 's|^deb http://deb.debian.org/debian bullseye main|deb http://snapshot.debian.org/archive/debian/20240311T000000Z bullseye main|' \
      -e 's|^deb http://deb.debian.org/debian-security bullseye-security main|deb http://snapshot.debian.org/archive/debian-security/20240311T000000Z bullseye-security main|' \
      -e 's|^deb http://deb.debian.org/debian bullseye-updates main|deb http://snapshot.debian.org/archive/debian/20240311T000000Z bullseye-updates main|' \
      /etc/apt/sources.list && \
    apt-get -o Acquire::Check-Valid-Until=false update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libcurl4-openssl-dev \
      libffi-dev \
      libxml2-dev \
      libxslt-dev \
      libpcre3-dev \
      libpq-dev \
      pkg-config \
      libpixman-1-dev \
      libcairo2-dev \
      libpango1.0-dev && \
    rm -rf /var/lib/apt/lists/*

ENV BUNDLER_VERSION=2.4.17 \
    BUNDLE_SILENCE_ROOT_WARNING=true \
    BUNDLE_SILENCE_DEPRECATIONS=true \
    APP_USER=forem \
    APP_UID=1000 \
    APP_GID=1000 \
    APP_HOME=/opt/apps/forem \
    BUNDLE_APP_CONFIG=/opt/apps/forem/.bundle

RUN gem install -N bundler:${BUNDLER_VERSION} && \
    groupadd -g ${APP_GID} ${APP_USER} && \
    adduser --uid ${APP_UID} --gid ${APP_GID} --home ${APP_HOME} ${APP_USER} && \
    mkdir -p ${APP_HOME} ${BUNDLE_APP_CONFIG} && \
    chown -R ${APP_UID}:${APP_GID} ${APP_HOME}

USER ${APP_USER}
WORKDIR ${APP_HOME}

COPY --from=app --chown=${APP_UID}:${APP_GID} . ${APP_HOME}
# This makes the two historical source snapshots use one resolved dependency
# cell. `commonlock` is a read-only build context supplied by the caller.
COPY --from=commonlock --chown=${APP_UID}:${APP_GID} Gemfile.lock ${APP_HOME}/Gemfile.lock

RUN bundle config --local build.sassc --disable-march-tune-native && \
    bundle config --delete without && \
    BUNDLE_FROZEN=true bundle install --deployment --jobs 4 --retry 5 && \
    yarn install --immutable && \
    RAILS_ENV=test NODE_ENV=test bundle exec rails assets:precompile && \
    rm -rf node_modules

ENTRYPOINT ["./scripts/entrypoint.sh"]
CMD ["bundle", "exec", "rspec"]
