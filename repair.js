const fs = require('fs');
const path = require('path');

// 1. Extract paths from mr/translation.json (our stack-based approach)
const mrPath = path.join(__dirname, 'client', 'src', 'i18n', 'locales', 'mr', 'translation.json');
const mrLines = fs.readFileSync(mrPath, 'utf8').split('\n');

const mrPathMap = {};
const stack = [];

for (let i = 0; i < mrLines.length; i++) {
  const line = mrLines[i].trim();
  if (!line) continue;

  if (line === '}' || line === '},' || line === ']' || line === '],') {
    stack.pop();
    continue;
  }

  const objMatch = line.match(/^"([^"]+)":\s*\{/);
  if (objMatch) {
    stack.push(objMatch[1]);
    continue;
  }

  const arrMatch = line.match(/^"([^"]+)":\s*\[/);
  if (arrMatch) {
    stack.push(arrMatch[1]);
    continue;
  }

  const kvMatch = line.match(/^"([^"]+)":\s*"([^"]+)"/);
  if (kvMatch) {
    const key = kvMatch[1];
    const val = kvMatch[2];
    const fullPath = stack.concat(key).join('.');
    mrPathMap[fullPath] = val;
    continue;
  }
}

// 2. Extract paths from en/translation.json
const enPath = path.join(__dirname, 'client', 'src', 'i18n', 'locales', 'en', 'translation.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (let k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], prefix + k + '.'));
    } else {
      keys.push(prefix + k);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
console.log('Total English keys:', enKeys.length);

const missingInMr = enKeys.filter(k => !(k in mrPathMap));
console.log('Missing keys in Marathi:', missingInMr.length);
console.log('Missing keys list:');
console.log(missingInMr);
