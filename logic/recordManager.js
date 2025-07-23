const fs = require('fs');
const path = require('path');

function ensureDirsExist(userDataPath) {
  const recordsDir = path.join(userDataPath, 'records');
  if (!fs.existsSync(recordsDir)) {
    fs.mkdirSync(recordsDir, { recursive: true });
  }
}

function listRecords(userDataPath) {
  const recordsDir = path.join(userDataPath, 'records');
  ensureDirsExist(userDataPath);
  return fs.readdirSync(recordsDir).filter(file => file.endsWith('.json'));
}

function saveRecord(userDataPath, fileName, data) {
  const recordsDir = path.join(userDataPath, 'records');
  ensureDirsExist(userDataPath);
  const filePath = path.join(recordsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function deleteRecord(userDataPath, fileName, index) {
  const recordsDir = path.join(userDataPath, 'records');
  ensureDirsExist(userDataPath);
  const filePath = path.join(recordsDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  const indexToDelete = index;

  if (
    Array.isArray(data.entries) &&
    indexToDelete >= 0 &&
    indexToDelete < data.entries.length
  ) {
    data.entries.splice(indexToDelete, 1);
  } else {
    throw new Error('Invalid index or entry does not exist');
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadRecord(userDataPath, fileName) {
  const recordsDir = path.join(userDataPath, 'records');
  const filePath = path.join(recordsDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error('Record file not found');
  const recordData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log('Loaded record from file:', fileName, 'Structure:', JSON.stringify(recordData, null, 2)); // Debug log
  return recordData;
}

function getAllRecordTemplateInfo(userDataPath){
  const recordsDir = path.join(userDataPath, 'records'); // Adjust if needed
  const recordFiles = fs.readdirSync(recordsDir).filter(file => file.endsWith('.json'));
  let recordTemplates = []
  recordFiles.forEach(file => {
    const filePath = path.join(recordsDir, file);
    try {
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const recordTemplate = jsonData.template;
      if (recordTemplate) {
        recordTemplates.push(recordTemplate);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err);
    }
  });
  return recordTemplates;
}

module.exports = { listRecords, saveRecord, loadRecord, ensureDirsExist, getAllRecordTemplateInfo, deleteRecord };
