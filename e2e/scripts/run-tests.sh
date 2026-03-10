#!/bin/bash

# This script is intended to be invoked via npm scripts. It reads the
# HEADLESS environment variable (set by package.json scripts) and defaults
# to headless=true when not provided.

# If you need to override locally, set HEADLESS=false for headed mode:
#   HEADLESS=false npm run test

if [ ! -z "${HEADLESS+x}" ]; then
  # normalize to true/false
  if [ "$HEADLESS" = "false" ] || [ "$HEADLESS" = "0" ]; then
    HEADLESS=false
  else
    HEADLESS=true
  fi
else
  HEADLESS=true
fi

export HEADLESS

# initialize exit code trackers
PUBLIC_EXIT=0
INTERNAL_EXIT=0

echo "🧹 Cleaning up old test results..."
rm -rf _results_

echo ""
echo "🧪 Running public tests (excluding @internal)... (HEADLESS=$HEADLESS)"
npm run test:public || PUBLIC_EXIT=$?

echo ""
echo "🧪 Running internal tests (@internal and @both)... (HEADLESS=$HEADLESS)"
npm run test:internal || INTERNAL_EXIT=$?

echo ""
if [ "$PUBLIC_EXIT" -eq 0 ] && [ "$INTERNAL_EXIT" -eq 0 ]; then
  echo "✅ All tests completed successfully!"
else
  echo "⚠️ Tests completed with failures:"
  [ "$PUBLIC_EXIT" -ne 0 ] && echo "  - Public tests failed (exit code: $PUBLIC_EXIT)"
  [ "$INTERNAL_EXIT" -ne 0 ] && echo "  - Internal tests failed (exit code: $INTERNAL_EXIT)"
fi

echo ""
echo "📊 Generating Allure report..."
npm run allure:generate

if [ -z "$CI" ]; then
  echo "👀 Opening Allure report..."
  npm run allure:open
else
  echo "ℹ️  In CI mode - skipping report viewer"
fi

# Exit with error if any tests failed
if [ "$PUBLIC_EXIT" -ne 0 ] || [ "$INTERNAL_EXIT" -ne 0 ]; then
  exit 1
fi
