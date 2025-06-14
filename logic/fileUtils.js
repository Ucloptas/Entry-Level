const fs = require('fs');

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

function writeJson(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJson, writeJson };
