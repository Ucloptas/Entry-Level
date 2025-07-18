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
function deleteRecord(userDataPath, fileName, indexToDelete) {
  const recordsDir = path.join(userDataPath, 'records');
  ensureDirsExist(userDataPath);
  const filePath = path.join(recordsDir, fileName);

  const content = fs.readFileSync(filePath, 'utf8');

  // 2. Convertir a objeto JS
  const data = JSON.parse(content);

  // 3. Verifica que el índice existe
  const indexABorrar = indexToDelete;
  if (
    Array.isArray(data.entries) &&
    indexABorrar >= 0 &&
    indexABorrar < data.entries.length
  ) {
    data.entries.splice(indexABorrar, 1);
    console.log(`Elemento en índice ${indexABorrar} eliminado.`);
  } else {
    console.log('Índice inválido o entries no existe');
  }

  // 4. Escribir de nuevo al archivo
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}





function loadRecord(userDataPath, fileName) {
  const recordsDir = path.join(userDataPath, 'records');
  const filePath = path.join(recordsDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error('Record file not found');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { listRecords, saveRecord, loadRecord, ensureDirsExist, deleteRecord };
