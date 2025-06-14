const fs = require('fs');
const path = require('path');
const os = require('os');

const recordsDir = path.join(os.homedir(), 'Documents', 'Entry-Level', 'records');

function ensureDirExists() {
  if (!fs.existsSync(recordsDir)) {
    fs.mkdirSync(recordsDir, { recursive: true });
  }
}

function listRecords() {
  ensureDirExists();
  return fs.readdirSync(recordsDir).filter(file => file.endsWith('.json'));
}

function saveRecord(fileName, data) {
  ensureDirExists();
  const filePath = path.join(recordsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function loadRecord(fileName) {
  ensureDirExists();
  const filePath = path.join(recordsDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error('Record file not found');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { listRecords, saveRecord, loadRecord };
