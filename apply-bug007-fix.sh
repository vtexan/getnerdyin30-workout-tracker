#!/bin/bash
# BUG-007 Fix: Planned workout duplication when editing
# Run from your project root: bash apply-bug007-fix.sh

FILE="public/app.jsx"

if [ ! -f "$FILE" ]; then
  echo "❌ $FILE not found. Run this from your project root."
  exit 1
fi

# Backup
cp "$FILE" "$FILE.bak-bug007"
echo "✅ Backup created: $FILE.bak-bug007"

# Fix 1: Guard the "PLAN WORKOUT FOR THIS DAY" button
# When editingPlan is active, don't show the "plan new" button
sed -i 's/{!planningDate && (/{!planningDate \&\& !editingPlan \&\& (/' "$FILE"

# Fix 2: Guard the inline planning view render
# When editingPlan is active, don't render the inline planner
# This is the line: {planningDate && selectedKey && (() => {
# We need to be careful to only match the one inside the calendar section
# It appears after "PLAN WORKOUT FOR THIS DAY" button
sed -i 's/{planningDate && selectedKey && (() => {/{planningDate \&\& !editingPlan \&\& selectedKey \&\& (() => {/' "$FILE"

echo "✅ BUG-007 fix applied to $FILE"
echo ""
echo "Changes made:"
echo "  1. Added !editingPlan guard to 'Plan Workout For This Day' button"
echo "  2. Added !editingPlan guard to inline planning view render"
echo ""
echo "Next steps:"
echo "  firebase deploy --only hosting"
echo "  git add -A && git commit -m 'BUG-007: Fix planned workout duplication on edit'"
echo "  git push"
