#!/bin/bash

# KLARE-App Secret Cleanup Script
# This script removes sensitive files from git history

echo "🔒 KLARE-App Secret Cleanup"
echo "=========================="

# Backup current state
echo "📦 Creating backup..."
git branch backup-before-cleanup

# Remove sensitive files from git history
echo "🧹 Cleaning git history..."

# Remove .env.backup-working from all commits
git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch .env.backup-working" \
--prune-empty --tag-name-filter cat -- --all

# Remove AI_READY_OAUTH_SETUP.md from all commits  
git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch AI_READY_OAUTH_SETUP.md" \
--prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch backup/setup-docs/AI_READY_OAUTH_SETUP.md" \
--prune-empty --tag-name-filter cat -- --all

# Remove OAUTH_SETUP.md from all commits
git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch OAUTH_SETUP.md" \
--prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch backup/setup-docs/OAUTH_SETUP.md" \
--prune-empty --tag-name-filter cat -- --all

# Clean up filter-branch refs
echo "🗑️  Cleaning up..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Cleanup complete!"
echo "⚠️  Remember to:"
echo "   1. Revoke exposed API keys"
echo "   2. Generate new API keys"  
echo "   3. Force push: git push --force-with-lease origin main"
