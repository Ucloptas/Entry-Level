const fs = require('fs');
const path = require('path');

/**
 * Export a record as JSON to a custom location
 * @param {Object} recordData - The record data to export
 * @param {string} defaultFileName - Default filename for the save dialog
 * @returns {Promise<Object>} - Result with success status and file path
 */
function exportRecordAsJson(recordData, defaultFileName) {
  try {
    const jsonString = JSON.stringify(recordData, null, 2);
    
    // Generate filename based on record name if not provided
    if (!defaultFileName) {
      const recordName = recordData.name || (recordData.template && recordData.template.name) || 'record';
      const safeName = recordName.replace(/[^a-zA-Z0-9-_]/g, '_');
      defaultFileName = `${safeName}.json`;
    }
    
    return {
      success: true,
      data: jsonString,
      defaultFileName: defaultFileName,
      mimeType: 'application/json'
    };
  } catch (error) {
    console.error('Error preparing JSON export:', error);
    return {
      success: false,
      error: 'Failed to prepare JSON export: ' + error.message
    };
  }
}

/**
 * Convert record data to CSV format
 * @param {Object} recordData - The record data to convert
 * @returns {Promise<Object>} - Result with success status and CSV data
 */
function exportRecordAsCsv(recordData) {
  try {
    if (!recordData || !recordData.entries || !Array.isArray(recordData.entries)) {
      throw new Error('Invalid record data: missing entries array');
    }

    if (recordData.entries.length === 0) {
      throw new Error('No entries to export');
    }

    // Get field names from the first entry
    const firstEntry = recordData.entries[0];
    const fieldNames = Object.keys(firstEntry);
    
    // Create CSV header
    const csvHeader = fieldNames.map(field => `"${field}"`).join(',');
    
    // Create CSV rows
    const csvRows = recordData.entries.map(entry => {
      return fieldNames.map(field => {
        const value = entry[field];
        // Handle different data types and escape quotes
        if (value === null || value === undefined) {
          return '""';
        }
        const stringValue = String(value);
        // Escape quotes and wrap in quotes
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    // Create metadata comments
    const recordName = recordData.name || (recordData.template && recordData.template.name) || 'record';
    const fields = recordData.template && recordData.template.fields ? 
      recordData.template.fields.map(f => `${f.name} (${f.type})`).join(', ') : 
      fieldNames.join(', ');
    
    const metadataComments = [
      `# Record: ${recordName}`,
      `# Fields: ${fields}`,
      `# Exported: ${new Date().toISOString()}`,
      ''
    ];
    
    // Combine metadata, header and rows
    const csvContent = [...metadataComments, csvHeader, ...csvRows].join('\n');
    
    // Generate filename based on record name
    const safeName = recordName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const defaultFileName = `${safeName}.csv`;
    
    return {
      success: true,
      data: csvContent,
      defaultFileName: defaultFileName,
      mimeType: 'text/csv'
    };
  } catch (error) {
    console.error('Error preparing CSV export:', error);
    return {
      success: false,
      error: 'Failed to prepare CSV export: ' + error.message
    };
  }
}

/**
 * Validate record data before export
 * @param {Object} recordData - The record data to validate
 * @returns {Object} - Validation result
 */
function validateRecordForExport(recordData) {
  if (!recordData) {
    return { valid: false, error: 'No record data provided' };
  }
  
  // Check for both old format (recordData.name) and new format (recordData.template.name)
  const recordName = recordData.name || (recordData.template && recordData.template.name);
  if (!recordName) {
    return { valid: false, error: 'Record has no name' };
  }
  
  if (!recordData.entries || !Array.isArray(recordData.entries)) {
    return { valid: false, error: 'Record has no entries array' };
  }
  
  if (recordData.entries.length === 0) {
    return { valid: false, error: 'Record has no entries to export' };
  }
  
  return { valid: true };
}

/**
 * Parse CSV content and convert to record format
 * @param {string} csvContent - The CSV content to parse
 * @param {string} recordName - Name for the new record
 * @returns {Object} - Result with success status and parsed data
 */
function parseCsvToRecord(csvContent, recordName) {
  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }
    
    // Parse metadata comments (lines starting with #)
    let metadata = {};
    let dataStartIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#')) {
        // Parse metadata
        if (line.startsWith('# Record:')) {
          metadata.recordName = line.substring(9).trim();
        } else if (line.startsWith('# Fields:')) {
          metadata.fields = line.substring(9).trim();
        }
        dataStartIndex = i + 1;
      } else if (line === '') {
        // Skip empty lines
        dataStartIndex = i + 1;
      } else {
        // Found data, stop parsing metadata
        break;
      }
    }
    
    // Use metadata record name if available, otherwise use provided name
    const finalRecordName = metadata.recordName || recordName;
    
    // Parse header row (first non-comment, non-empty line)
    const headerLine = lines[dataStartIndex];
    if (!headerLine) {
      throw new Error('No header row found in CSV');
    }
    const headers = parseCsvLine(headerLine);
    
    // Parse data rows
    const entries = [];
    for (let i = dataStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#')) { // Skip empty lines and comments
        const values = parseCsvLine(line);
        const entry = {};
        
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        
        entries.push(entry);
      }
    }
    
    if (entries.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }
    
    // Parse field types from metadata if available
    let fieldTypes = {};
    if (metadata.fields) {
      const fieldMatches = metadata.fields.match(/(\w+)\s*\(([^)]+)\)/g);
      if (fieldMatches) {
        fieldMatches.forEach(match => {
          const nameMatch = match.match(/(\w+)\s*\(([^)]+)\)/);
          if (nameMatch) {
            fieldTypes[nameMatch[1]] = nameMatch[2];
          }
        });
      }
    }
    
    return {
      success: true,
      data: {
        template: {
          name: finalRecordName,
          fields: headers.map(header => ({ 
            name: header, 
            type: fieldTypes[header] || 'text' 
          }))
        },
        entries: entries
      }
    };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return {
      success: false,
      error: 'Failed to parse CSV: ' + error.message
    };
  }
}

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array} - Array of values
 */
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last value
  values.push(current.trim());
  
  return values;
}

module.exports = {
  exportRecordAsJson,
  exportRecordAsCsv,
  validateRecordForExport,
  parseCsvToRecord
}; 