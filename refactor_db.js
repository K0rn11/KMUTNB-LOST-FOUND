const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'server');

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  let originalCode = code;

  // Add async to routes
  code = code.replace(/router\.(get|post|put|delete|patch)\(([^,]+),\s*(?:([^,]+),\s*)?(?:([^,]+),\s*)?\(req, res\)\s*=>\s*\{/g, (match, method, pathArg, m1, m2) => {
    let args = [pathArg];
    if (m1) args.push(m1);
    if (m2) args.push(m2);
    args.push('async (req, res) => {');
    return `router.${method}(${args.join(', ')})`;
  });

  // Add async to middleware
  code = code.replace(/function authenticate\(req, res, next\) \{/, 'async function authenticate(req, res, next) {');

  // Add await before db.prepare
  code = code.replace(/(?<!await\s+)db\.prepare/g, 'await db.prepare');
  
  // Add await before db.exec
  code = code.replace(/(?<!await\s+)db\.exec/g, 'await db.exec');

  if (code !== originalCode) {
    fs.writeFileSync(filePath, code);
    console.log('Refactored:', filePath);
  }
}

function walk(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const f of files) {
    const p = path.join(dirPath, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules') walk(p);
    } else if (p.endsWith('.js')) {
      processFile(p);
    }
  }
}

walk(path.join(dir, 'routes'));
walk(path.join(dir, 'middleware'));
