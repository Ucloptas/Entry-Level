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




// Mi codigo
function deleteRecord(userDataPath, fileName) {
  const recordsDir = path.join(userDataPath, 'records');
  ensureDirsExist(userDataPath);
  const filePath = path.join(recordsDir, fileName);
  fs.unlinkSync(filePath, (err) => {
    if(err){
      console.error(`There was an error deleting the file, ${err}`);
      return;
    }
    else {
      console.log(`File deleted successfully`);
    }
  });
}





function loadRecord(userDataPath, fileName) {
  const recordsDir = path.join(userDataPath, 'records');
  const filePath = path.join(recordsDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error('Record file not found');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { listRecords, saveRecord, loadRecord, ensureDirsExist, deleteRecord };
