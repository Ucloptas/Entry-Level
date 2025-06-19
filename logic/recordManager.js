const fs = require('fs');
const path = require('path');
const os = require('os');



function ensureDirsExist(path_to_userData) { //this function gets called once on appready, ensures records and templates subfolders exist in userdata folder
  const recordsDir = path.join(path_to_userData, 'records');
  const templatesDir = path.join(path_to_userData, 'templates');
  if (!fs.existsSync(recordsDir)) {
    fs.mkdirSync(recordsDir, { recursive: true });
  }
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
}

function listRecords(userDataPath) { //returns the name of all json files in the records folder without the ".json"
  return fs.readdirSync(path.join(userDataPath, "records")).filter(file => file.endsWith('.json')).map(file => path.basename(file, '.json'));
}

function saveRecord(userDataPath, recordName, data) {
  const filePath = path.join(userDataPath, "records", `${recordName}.json`);
  const newFileContent = JSON.stringify(data, null, 2);
  if (fs.existsSync(filePath)) {//if file already exists, see if any changes were made.
    const currentFileContent = fs.readFileSync(filePath, 'utf-8');
    if (currentFileContent === newFileContent) return; // If there are no changes, skip writing
  }
  fs.writeFileSync(filePath, newFileContent, 'utf-8');
}

function loadRecord(userDataPath, recordName) {
  const filePath = path.join(userDataPath, "records", `${recordName}.json`);
  if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8')); //returns entire json object if 
  else return {};
}

module.exports = { listRecords, saveRecord, loadRecord, ensureDirsExist };
