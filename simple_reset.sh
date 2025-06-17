#!/bin/bash

# Simple Reset Solution
# This resets to the last clean commit and you can re-commit clean changes

echo "🔄 Simple Reset Solution"
echo "======================"

# Create backup
git branch backup-before-reset

# Reset to commit before the problematic ones
echo "⏪ Resetting to clean commit..."
git reset --soft HEAD~3

# Show status
echo "📊 Current status after reset:"
git status

echo "✅ Reset complete!"
echo "📝 Next steps:"
echo "   1. Review staged changes"
echo "   2. Remove any sensitive data manually"
echo "   3. Commit clean changes"
echo "   4. Push to origin"
