const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const XLSX = require('xlsx');
const AdmZip = require('adm-zip');

const REQUIRED_COLUMNS = ['ID', 'Name', 'Email', 'Mobile Number'];

function getGroupsDirectory() {
  return path.join(__dirname, 'groups');
}

function getGeneratedDirectory() {
  return path.join(__dirname, 'generated');
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function listExcelFiles() {
  const groupsDirectory = getGroupsDirectory();
  ensureDirectory(groupsDirectory);

  return fs
    .readdirSync(groupsDirectory)
    .filter((fileName) => /\.(xlsx|xls)$/i.test(fileName))
    .sort((a, b) => a.localeCompare(b));
}

function parseWorkbookRows(fileName) {
  const groupsDirectory = getGroupsDirectory();
  const safeFileName = path.basename(fileName);
  const absolutePath = path.join(groupsDirectory, safeFileName);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('Selected file does not exist in Backend/groups.');
  }

  const workbook = XLSX.readFile(absolutePath);
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('Workbook does not contain any sheet.');
  }

  const firstSheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

  if (!rows.length) {
    throw new Error('Workbook sheet is empty.');
  }

  const columns = Object.keys(rows[0]);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));

  if (missingColumns.length) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  return rows.map((row) => ({
    ID: row.ID,
    Name: row.Name,
    Email: row.Email,
    'Mobile Number': row['Mobile Number']
  }));
}

function validateAllocationInput(groupCount, groupSizes, participantCount) {
  if (!Number.isInteger(groupCount) || groupCount <= 0) {
    throw new Error('Total number of groups must be a positive integer.');
  }

  if (!Array.isArray(groupSizes) || groupSizes.length !== groupCount) {
    throw new Error('Group sizes must be provided for each group.');
  }

  const invalidSize = groupSizes.find((size) => !Number.isInteger(size) || size <= 0);
  if (invalidSize !== undefined) {
    throw new Error('Each group size must be a positive integer.');
  }

  const totalRequired = groupSizes.reduce((sum, value) => sum + value, 0);
  if (totalRequired !== participantCount) {
    throw new Error(
      `Sum of group sizes (${totalRequired}) must exactly match participant count (${participantCount}).`
    );
  }
}

function secureShuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const randomIndex = crypto.randomInt(0, i + 1);
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  return arr;
}

function allocateParticipants(participants, groupSizes) {
  const shuffled = secureShuffle(participants);
  const groups = [];
  let cursor = 0;

  for (let i = 0; i < groupSizes.length; i += 1) {
    const targetSize = groupSizes[i];
    const groupMembers = shuffled.slice(cursor, cursor + targetSize);
    groups.push({
      groupName: `Group-${i + 1}`,
      members: groupMembers
    });
    cursor += targetSize;
  }

  return groups;
}

function compareValuesAscending(a, b) {
  const aString = String(a ?? '').trim();
  const bString = String(b ?? '').trim();

  const aNumber = Number(aString);
  const bNumber = Number(bString);
  const aIsNumber = aString !== '' && Number.isFinite(aNumber);
  const bIsNumber = bString !== '' && Number.isFinite(bNumber);

  if (aIsNumber && bIsNumber) {
    return aNumber - bNumber;
  }

  return aString.localeCompare(bString, undefined, { numeric: true, sensitivity: 'base' });
}

function parseNumericId(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return null;
  }

  const directNumber = Number(normalized);
  if (Number.isFinite(directNumber)) {
    return directNumber;
  }

  const firstNumberMatch = normalized.match(/\d+/);
  if (!firstNumberMatch) {
    return null;
  }

  const parsed = Number(firstNumberMatch[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortGroupMembersAscending(members) {
  return [...members].sort((left, right) => {
    const leftId = parseNumericId(left.ID);
    const rightId = parseNumericId(right.ID);

    if (leftId !== null && rightId !== null && leftId !== rightId) {
      return leftId - rightId;
    }

    if (leftId !== null && rightId === null) {
      return -1;
    }

    if (leftId === null && rightId !== null) {
      return 1;
    }

    const byId = compareValuesAscending(left.ID, right.ID);
    if (byId !== 0) {
      return byId;
    }

    return compareValuesAscending(left.Name, right.Name);
  });
}

function createGroupWorkbook(group) {
  const sortedMembers = sortGroupMembersAscending(group.members);
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(sortedMembers, {
    header: REQUIRED_COLUMNS
  });
  XLSX.utils.book_append_sheet(workbook, sheet, group.groupName);
  return workbook;
}

function removeExpiredGeneratedFiles(maxAgeMs) {
  const generatedDir = getGeneratedDirectory();
  ensureDirectory(generatedDir);

  const now = Date.now();
  for (const fileName of fs.readdirSync(generatedDir)) {
    const absolutePath = path.join(generatedDir, fileName);
    const stats = fs.statSync(absolutePath);
    if (now - stats.mtimeMs > maxAgeMs) {
      fs.unlinkSync(absolutePath);
    }
  }
}

function generateAllocationZip(fileName, groupCount, groupSizes) {
  const participants = parseWorkbookRows(fileName);
  validateAllocationInput(groupCount, groupSizes, participants.length);

  const groups = allocateParticipants(participants, groupSizes);
  const generatedDir = getGeneratedDirectory();
  ensureDirectory(generatedDir);

  removeExpiredGeneratedFiles(24 * 60 * 60 * 1000);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const zipName = `groups-${path.parse(fileName).name}-${timestamp}.zip`;
  const zipPath = path.join(generatedDir, zipName);

  const zip = new AdmZip();

  for (const group of groups) {
    const workbook = createGroupWorkbook(group);
    const workbookBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });
    zip.addFile(`${group.groupName}.xlsx`, workbookBuffer);
  }

  zip.writeZip(zipPath);

  return {
    zipName,
    groupSummary: groups.map((group) => ({
      groupName: group.groupName,
      size: group.members.length
    })),
    participantCount: participants.length
  };
}

module.exports = {
  REQUIRED_COLUMNS,
  listExcelFiles,
  generateAllocationZip
};
