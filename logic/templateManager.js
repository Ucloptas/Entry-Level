const fs = require('fs');
const path = require('path');

// Utility to safely read a JSON file
function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
  }
  return [];
}

function listTemplates(userDataPath) {
  const defaultPath = path.join(userDataPath, 'templates', 'defaultTemplates.json');
  const userPath = path.join(userDataPath, 'templates', 'userTemplates.json');

  const defaultTemplates = readJsonSafe(defaultPath).map(t => ({
    ...t,
    source: 'Default'
  }));

  const userTemplates = readJsonSafe(userPath).map(t => ({
    ...t,
    source: 'User'
  }));

  return [...defaultTemplates, ...userTemplates];
}


function loadTemplate(userDataPath, templateName) {
  const allTemplates = listTemplates(userDataPath);
  return allTemplates.find(t => t.name === templateName);
}

function saveTemplate(userDataPath, templateName, data) {
  const userPath = path.join(userDataPath, 'templates', 'userTemplates.json');
  let existingTemplates = readJsonSafe(userPath);

  const existingIndex = existingTemplates.findIndex(t => t.name === templateName);

  if (existingIndex !== -1) {
    existingTemplates[existingIndex] = data;
  } else {
    existingTemplates.push(data);
  }

  fs.writeFileSync(userPath, JSON.stringify(existingTemplates, null, 2), 'utf-8');
}

// Ensures an empty userTemplates.json exists if missing
function ensureUserTemplatesFile(userDataPath) {
  const userTemplatesPath = path.join(userDataPath, 'templates', 'userTemplates.json');
  if (!fs.existsSync(userTemplatesPath)) {
    try {
      fs.writeFileSync(userTemplatesPath, '[]', 'utf-8');
      console.log('Created empty userTemplates.json.');
    } catch (err) {
      console.error('Failed to create userTemplates.json:', err);
    }
  }
}

module.exports = {
  listTemplates,
  loadTemplate,
  saveTemplate,
  ensureUserTemplatesFile
};
