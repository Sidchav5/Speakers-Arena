const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const XLSX = require('xlsx');

const REQUIRED_COLUMNS = ['ID', 'Topic Name'];
const HISTORY_FILE_NAME = 'topics-allocation-history.json';

function getTopicsDirectory() {
  return path.join(__dirname, 'Topics');
}

function getGeneratedDirectory() {
  return path.join(__dirname, 'generated');
}

function getHistoryFilePath() {
  return path.join(getGeneratedDirectory(), HISTORY_FILE_NAME);
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function listTopicSheets() {
  const topicsDirectory = getTopicsDirectory();
  ensureDirectory(topicsDirectory);

  return fs
    .readdirSync(topicsDirectory)
    .filter((fileName) => /\.(xlsx|xls)$/i.test(fileName))
    .sort((a, b) => a.localeCompare(b));
}

function parseTopicsFromSheet(fileName) {
  const topicsDirectory = getTopicsDirectory();
  const safeFileName = path.basename(fileName || '');
  const absolutePath = path.join(topicsDirectory, safeFileName);

  if (!safeFileName) {
    throw new Error('fileName is required.');
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error('Selected topic sheet does not exist in Backend/Topics.');
  }

  const workbook = XLSX.readFile(absolutePath);
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('Topic workbook does not contain any sheet.');
  }

  const firstSheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

  if (!rows.length) {
    throw new Error('Topic workbook sheet is empty.');
  }

  const columns = Object.keys(rows[0]);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));
  if (missingColumns.length) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  return rows.map((row) => ({
    ID: row.ID,
    'Topic Name': row['Topic Name']
  }));
}

function readHistory() {
  const generatedDir = getGeneratedDirectory();
  ensureDirectory(generatedDir);

  const historyPath = getHistoryFilePath();
  if (!fs.existsSync(historyPath)) {
    return { allocatedByFile: {}, allocationLog: [] };
  }

  try {
    const payload = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    return {
      allocatedByFile: payload.allocatedByFile || {},
      allocationLog: payload.allocationLog || []
    };
  } catch (_error) {
    return { allocatedByFile: {}, allocationLog: [] };
  }
}

function writeHistory(history) {
  const generatedDir = getGeneratedDirectory();
  ensureDirectory(generatedDir);
  fs.writeFileSync(getHistoryFilePath(), JSON.stringify(history, null, 2), 'utf-8');
}

function allocateRandomTopic(fileName) {
  const topics = parseTopicsFromSheet(fileName);
  const history = readHistory();

  const allocatedIds = new Set((history.allocatedByFile[fileName] || []).map((value) => String(value)));
  const availableTopics = topics.filter((topic) => !allocatedIds.has(String(topic.ID)));

  if (!availableTopics.length) {
    return {
      exhausted: true,
      fileName,
      totalTopics: topics.length,
      allocatedCount: allocatedIds.size,
      topic: null
    };
  }

  const picked = availableTopics[crypto.randomInt(0, availableTopics.length)];

  const nextAllocated = [
    ...(history.allocatedByFile[fileName] || []),
    picked.ID
  ];

  history.allocatedByFile[fileName] = nextAllocated;
  history.allocationLog.push({
    fileName,
    id: picked.ID,
    topicName: picked['Topic Name'],
    allocatedAt: new Date().toISOString()
  });

  writeHistory(history);

  return {
    exhausted: false,
    fileName,
    totalTopics: topics.length,
    allocatedCount: nextAllocated.length,
    topic: {
      ID: picked.ID,
      'Topic Name': picked['Topic Name']
    }
  };
}

function clearTopicHistory(fileName) {
  const history = readHistory();

  if (!fileName) {
    writeHistory({ allocatedByFile: {}, allocationLog: [] });
    return { clearedAll: true };
  }

  const nextHistory = {
    allocatedByFile: { ...history.allocatedByFile },
    allocationLog: history.allocationLog.filter((entry) => entry.fileName !== fileName)
  };

  delete nextHistory.allocatedByFile[fileName];
  writeHistory(nextHistory);

  return {
    clearedAll: false,
    fileName
  };
}

function getTopicHistoryStatus(fileName) {
  const topics = parseTopicsFromSheet(fileName);
  const history = readHistory();
  const allocated = history.allocatedByFile[fileName] || [];

  return {
    fileName,
    totalTopics: topics.length,
    allocatedCount: allocated.length,
    remainingCount: Math.max(topics.length - allocated.length, 0)
  };
}

module.exports = {
  listTopicSheets,
  allocateRandomTopic,
  clearTopicHistory,
  getTopicHistoryStatus
};
