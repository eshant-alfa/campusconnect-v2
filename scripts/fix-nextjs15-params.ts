#!/usr/bin/env tsx

/**
 * Next.js 15 Params Fix Script
 * 
 * This script helps identify and fix the params destructuring issue
 * that occurs when upgrading to Next.js 15.
 * 
 * The issue: params must be awaited before destructuring in Next.js 15
 */

import * as fs from 'fs';
import * as path from 'path';

// Function to fix params in a file
function fixParamsInFile(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix simple params patterns
    const patterns = [
      // Fix: { params: { id: string } } -> { params: Promise<{ id: string }> }
      {
        regex: /context: \{ params: \{ ([^}]+) \}/g,
        replacement: 'context: { params: Promise<{ $1 }> }'
      },
      // Fix: { params: { slug: string } } -> { params: Promise<{ slug: string }> }
      {
        regex: /\{ params: \{ ([^}]+) \}/g,
        replacement: '{ params: Promise<{ $1 }> }'
      },
      // Fix: const { id } = params; -> const { id } = await params;
      {
        regex: /const \{ ([^}]+) \} = params;/g,
        replacement: 'const { $1 } = await params;'
      },
      // Fix: const { slug } = context.params; -> const { slug } = await context.params;
      {
        regex: /const \{ ([^}]+) \} = context\.params;/g,
        replacement: 'const { $1 } = await context.params;'
      }
    ];

    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Function to recursively find and fix API route files
function fixApiRoutes(dir: string): void {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixApiRoutes(filePath);
    } else if (file.endsWith('.ts') && file.includes('route.ts')) {
      fixParamsInFile(filePath);
    }
  });
}

// Main execution
const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  console.log('🔧 Fixing Next.js 15 params issues in API routes...');
  fixApiRoutes(apiDir);
  console.log('✅ Done fixing API routes!');
} else {
  console.error('❌ API directory not found:', apiDir);
} 