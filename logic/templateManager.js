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
  const templatesDir = path.join(userDataPath, 'templates');
  const defaultPath = path.join(templatesDir, 'defaultTemplates.json');
  const userPath = path.join(templatesDir, 'userTemplates.json');

  // Ensure templates directory exists
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

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
  const templatesDir = path.join(userDataPath, 'templates');
  const userPath = path.join(templatesDir, 'userTemplates.json');
  
  // Ensure templates directory exists
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
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
  const templatesDir = path.join(userDataPath, 'templates');
  const userTemplatesPath = path.join(templatesDir, 'userTemplates.json');
  
  try {
    // Ensure templates directory exists
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      console.log('Created templates directory:', templatesDir);
    }
    
    if (!fs.existsSync(userTemplatesPath)) {
      fs.writeFileSync(userTemplatesPath, '[]', 'utf-8');
      console.log('Created empty userTemplates.json.');
    }
  } catch (err) {
    console.error('Failed to create userTemplates.json:', err);
    throw err;
  }
}

//create Template logic
function createTemplate(userDataPath, { name, fields }) {
  try {
    const templatesDir = path.join(userDataPath, 'templates');
    const userPath = path.join(templatesDir, 'userTemplates.json');
    
    // Ensure templates directory exists
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    let existingTemplates = readJsonSafe(userPath);

    if (existingTemplates.find(t => t.name === name)) {
      throw new Error(`Template with name "${name}" already exists.`);
    }

    const newTemplate = { name, fields };
    existingTemplates.push(newTemplate);

    fs.writeFileSync(userPath, JSON.stringify(existingTemplates, null, 2), 'utf-8');
    return newTemplate;
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error(`Failed to create template: ${error.message}`);
  }
}
//this checks if the template already exisits
function templateExists(userDataPath, name) {
  const allTemplates = listTemplates(userDataPath);
  return allTemplates.some(t => t.name === name);
}

function deleteTemplate(userDataPath, templateName) {
  const templatesDir = path.join(userDataPath, 'templates');
  const userPath = path.join(templatesDir, 'userTemplates.json');

  if (!fs.existsSync(userPath)) {
    throw new Error('User templates file does not exist');
  }

  let existingTemplates = readJsonSafe(userPath);

  const index = existingTemplates.findIndex(t => t.name === templateName);
  if (index === -1) {
    throw new Error(`Template "${templateName}" not found in user templates`);
  }

  // Remove the template
  existingTemplates.splice(index, 1);

  // Save updated array
  fs.writeFileSync(userPath, JSON.stringify(existingTemplates, null, 2), 'utf-8');

  return true;
}

module.exports = {
  listTemplates,
  loadTemplate,
  saveTemplate,
  createTemplate,
  templateExists,
  ensureUserTemplatesFile,
  deleteTemplate
};
