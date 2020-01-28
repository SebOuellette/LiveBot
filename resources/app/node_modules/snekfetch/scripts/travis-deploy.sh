#!/bin/bash
# Based on https://github.com/hydrabolt/discord.js-site/blob/master/deploy/deploy.sh

set -e

if [ "$TRAVIS_BRANCH" != "master" -o -n "$TRAVIS_TAG" -o "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo -e "Not building for a non master branch push - building without deploying."
  npm run docs
  exit 0
fi

echo -e "Building for a master branch push - building and deploying."

REPO=$(git config remote.origin.url)
SHA=$(git rev-parse --verify HEAD)

TARGET_BRANCH="gh-pages"
git clone $REPO dist -b $TARGET_BRANCH

npm run docs

rsync -vau docs/ dist/

cd dist
git add --all .
git config user.name "Travis CI"
git config user.email "${COMMIT_EMAIL}"
git commit -m "Docs build: ${SHA}" || true
git push "https://${GH_TOKEN}@${GH_REF}" $TARGET_BRANCH
