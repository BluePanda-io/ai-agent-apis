#!/bin/bash

# Get the current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

# Only run tests if merging to dev
if [ "$CURRENT_BRANCH" != "dev" ]; then
    echo "Not merging to dev branch, skipping QA tests"
    exit 0
fi

echo "Running QA tests before merge to dev..."
node qa-test.js

# Check the exit status of the tests
if [ $? -ne 0 ]; then
    echo "❌ QA tests failed. Merge aborted."
    exit 1
fi

echo "✅ QA tests passed. Proceeding with merge..."
exit 0 