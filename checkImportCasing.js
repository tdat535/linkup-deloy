import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('./src'); // điểm bắt đầu quét
const importRegex = /import\s+(?:[^'"]+\s+from\s+)?['"](.+)['"]/g;

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function getActualCasePath(p) {
  const segments = p.split(path.sep);
  let current = path.isAbsolute(p) ? path.sep : '';
  for (const segment of segments) {
    if (!segment) continue;
    const parent = current || '.';
    const files = fs.readdirSync(parent);
    const match = files.find(f => f.toLowerCase() === segment.toLowerCase());
    if (!match) return null;
    current = path.join(current, match);
  }
  return current;
}

function scanImports() {
  const files = walk(projectRoot);
  let hasIssue = false;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('.') && !importPath.endsWith('.css')) {
        const resolvedPath = path.resolve(path.dirname(file), importPath);
        const actualPath = getActualCasePath(resolvedPath);
        if (actualPath && resolvedPath !== actualPath) {
          hasIssue = true;
          console.log(`🚨 Casing mismatch in: ${file}`);
          console.log(`   👉 Import: '${importPath}'`);
          console.log(`   ⚠️  Resolved: '${resolvedPath}'`);
          console.log(`   ✅ Actual:   '${actualPath}'\n`);
        }
      }
    }
  }

  if (!hasIssue) {
    console.log('✅ All import paths casing look good!');
  }
}

console.log('🔍 Scanning import casing issues...\n');
scanImports();
