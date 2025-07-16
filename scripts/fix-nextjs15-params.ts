#!/usr/bin/env tsx

/**
 * Next.js 15 Params Fix Script
 * 
 * This script helps identify and fix the params destructuring issue
 * that occurs when upgrading to Next.js 15.
 * 
 * The issue: params must be awaited before destructuring in Next.js 15
 */

import fs from 'fs';
import path from 'path';

const API_DIR = './app/api';

function findApiFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (fs.existsSync(dir)) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findApiFiles(fullPath));
      } else if (item === 'route.ts' || item === 'route.js') {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

function fixParamsInFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix type annotation: { params: { ... } } -> { params: Promise<{ ... }> }
    const typePattern = /params\s*:\s*\{([^}]+)\}/g;
    content = content.replace(typePattern, (match, paramsContent) => {
      modified = true;
      return `params: Promise<{${paramsContent}}>`;
    });
    
    // Fix destructuring: const { ... } = params; -> const { ... } = await params;
    const destructurePattern = /const\s*\{([^}]+)\}\s*=\s*params\s*;/g;
    content = content.replace(destructurePattern, (match, destructureContent) => {
      modified = true;
      return `const {${destructureContent}} = await params;`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔍 Finding API route files...');
  const apiFiles = findApiFiles(API_DIR);
  
  console.log(`📁 Found ${apiFiles.length} API route files`);
  
  let fixedCount = 0;
  
  for (const file of apiFiles) {
    if (fixParamsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files with params issues`);
  
  if (fixedCount > 0) {
    console.log('\n📝 Manual Review Required:');
    console.log('Please review the following files to ensure the fixes are correct:');
    
    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('await params')) {
        console.log(`   - ${file}`);
      }
    }
  } else {
    console.log('\n✅ No files needed fixing!');
  }
  
  console.log('\n💡 Manual Fix Pattern:');
  console.log('1. Change type: { params: { id: string } } -> { params: Promise<{ id: string }> }');
  console.log('2. Change destructuring: const { id } = params; -> const { id } = await params;');
}

main(); 