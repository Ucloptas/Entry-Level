const fs = require('fs');
const path = require('path');
const os = require('os');

function listTemplates(userDataPath) {
  return fs.readdirSync(path.join(userDataPath, "templates")).filter(file => file.endsWith('.json')).map(file => path.basename(file, '.json'));
}

function loadTemplate(userDataPath, templateName) { //returns the name of all json files in the templates folder without the ".json"
  const filePath = path.join(userDataPath, "templates", `${templateName}.json`);
  if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8')); //returns entire json object if exists
  else return {};
}

function saveTemplate(userDataPath, templateName, data) {
  const filePath = path.join(userDataPath, "templates", `${templateName}.json`);
  const newFileContent = JSON.stringify(data, null, 2);
  if (fs.existsSync(filePath)) {//if file already exists, see if any changes were made.
    const currentFileContent = fs.readFileSync(filePath, 'utf-8');
    if (currentFileContent === newFileContent) return; // If there are no changes, skip writing
  }
  fs.writeFileSync(filePath, newFileContent, 'utf-8');
}

module.exports = { listTemplates, loadTemplate, saveTemplate };
