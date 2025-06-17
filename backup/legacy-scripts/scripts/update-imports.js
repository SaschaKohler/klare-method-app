#!/usr/bin/env node

/**
 * This script updates imports in .tsx and .ts files to use the barrel exports
 * Run it with: node scripts/update-imports.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to search and replace
const importPatterns = [
  {
    search: /import\s+{?\s*useUserStore\s*}?\s+from\s+["']\.\.\/store\/useUserStore["'];?/g,
    replace: 'import { useUserStore } from "../store";'
  },
  {
    search: /import\s+{?\s*useThemeStore\s*}?\s+from\s+["']\.\.\/store\/useThemeStore["'];?/g,
    replace: 'import { useThemeStore } from "../store";'
  },
  {
    search: /import\s+(?:{\s*(\w+)\s*}|(\w+))\s+from\s+["']\.\.\/components\/(\w+)\/\1["'];?/g,
    replace: (match, p1, p2, p3) => {
      const component = p1 || p2;
      return `import { ${component} } from "../components";`;
    }
  },
  {
    search: /import\s+{?\s*KlareLogo\s*}?\s+from\s+["']\.\.\/components\/KlareLogo["'];?/g,
    replace: 'import { KlareLogo } from "../components";'
  },
  {
    search: /import\s+{?\s*CustomHeader\s*}?\s+from\s+["']\.\.\/components\/CustomHeader["'];?/g,
    replace: 'import { CustomHeader } from "../components";'
  },
  {
    search: /import\s+{?\s*KlareMethodCards\s*}?\s+from\s+["']\.\.\/components\/KlareMethodCards["'];?/g,
    replace: 'import { KlareMethodCards } from "../components";'
  },
];

// File paths to process (ts and tsx files in src directory)
const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['src/types/**', 'src/constants/**', '**/index.ts'] });

console.log(`Found ${files.length} files to process`);

let totalUpdates = 0;

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  let wasUpdated = false;
  
  // Apply each pattern
  importPatterns.forEach(pattern => {
    const newContent = content.replace(pattern.search, pattern.replace);
    if (newContent !== content) {
      content = newContent;
      wasUpdated = true;
      totalUpdates++;
    }
  });
  
  // Save the file if it was updated
  if (wasUpdated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
});

console.log(`Done. Updated ${totalUpdates} imports across all files.`);
