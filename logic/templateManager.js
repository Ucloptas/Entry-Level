const fs = require('fs');
const path = require('path');
const os = require('os');

const templatesDir = path.join(os.homedir(), 'Documents', 'Entry-Level', 'templates');

function ensureDirExists() {
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
}

function listTemplates() {
  ensureDirExists();
  return fs.readdirSync(templatesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'));
}

function loadTemplate(templateName) {
  ensureDirExists();
  const filePath = path.join(templatesDir, `${templateName}.json`);
  if (!fs.existsSync(filePath)) throw new Error('Template not found');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveTemplate(fileName, data) {
  ensureDirExists();
  const filePath = path.join(templatesDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { listTemplates, loadTemplate, saveTemplate };
