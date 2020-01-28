set -e

npm run lint

npm run test

if [ "$TRAVIS_BRANCH" != "master" -o -n "$TRAVIS_TAG" -o "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo -e "Not sending coverage for a non master branch push - covering without sending."
  exit 0
fi

echo -e "Generating Coverage for a master branch push - covering and sending."

npm run test:coveralls
