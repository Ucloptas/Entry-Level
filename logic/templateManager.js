const fs = require('fs');
const path = require('path');

// Path to local templates file in the repo
const templatesPath = path.join(__dirname, '..', 'EntryLevelData', 'templates', 'defaultTemplates.json');

function listTemplates() {
  if (!fs.existsSync(templatesPath)) return [];
  const data = fs.readFileSync(templatesPath, 'utf-8');
  return JSON.parse(data);
}

function loadTemplate(name) {
  const templates = listTemplates();
  return templates.find(t => t.name === name);
}

module.exports = { listTemplates, loadTemplate };
