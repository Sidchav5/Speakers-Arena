const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { listExcelFiles, generateAllocationZip } = require('./groupB');
const {
  listTopicSheets,
  allocateRandomTopic,
  clearTopicHistory,
  getTopicHistoryStatus
} = require('./topicB');

const app = express();
const port = process.env.PORT || 5000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

// Simple request log with response code to track running endpoints.
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const elapsedMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsedMs}ms)`);
  });

  next();
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    statusCode: 200,
    status: 'ok',
    service: 'arena-backend'
  });
});

app.get('/api/status', (_req, res) => {
  const groupsDir = path.join(__dirname, 'groups');
  const topicsDir = path.join(__dirname, 'Topics');
  const generatedDir = path.join(__dirname, 'generated');

  res.status(200).json({
    statusCode: 200,
    service: 'arena-backend',
    running: true,
    checks: {
      groupsDirectoryExists: fs.existsSync(groupsDir),
      topicsDirectoryExists: fs.existsSync(topicsDir),
      generatedDirectoryExists: fs.existsSync(generatedDir)
    },
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.get('/api/groups/files', (_req, res, next) => {
  try {
    const files = listExcelFiles();
    res.status(200).json({
      statusCode: 200,
      files
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/groups/generate', (req, res, next) => {
  try {
    const { fileName, groupCount, groupSizes } = req.body;
    if (!fileName) {
      return res.status(400).json({
        statusCode: 400,
        error: 'fileName is required.'
      });
    }

    const normalizedCount = Number(groupCount);
    const normalizedSizes = Array.isArray(groupSizes)
      ? groupSizes.map((size) => Number(size))
      : [];

    const result = generateAllocationZip(fileName, normalizedCount, normalizedSizes);

    return res.status(201).json({
      statusCode: 201,
      message: 'Groups generated successfully.',
      downloadUrl: `/api/groups/download/${encodeURIComponent(result.zipName)}`,
      participantCount: result.participantCount,
      groups: result.groupSummary
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/groups/download/:zipName', (req, res, next) => {
  try {
    const safeName = path.basename(req.params.zipName);
    const absolutePath = path.join(__dirname, 'generated', safeName);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        statusCode: 404,
        error: 'Requested ZIP file was not found.'
      });
    }

    res.download(absolutePath, safeName, (error) => {
      if (error) {
        next(error);
      }
    });
    return undefined;
  } catch (error) {
    next(error);
  }
});

app.get('/api/topics/files', (_req, res, next) => {
  try {
    const files = listTopicSheets();
    res.status(200).json({
      statusCode: 200,
      files
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/topics/allocate', (req, res, next) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({
        statusCode: 400,
        error: 'fileName is required.'
      });
    }

    const result = allocateRandomTopic(fileName);
    if (result.exhausted) {
      return res.status(409).json({
        statusCode: 409,
        message: 'All topics are already allocated for this sheet. Clear history to re-allocate.',
        fileName: result.fileName,
        totalTopics: result.totalTopics,
        allocatedCount: result.allocatedCount
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Topic allocated successfully.',
      fileName: result.fileName,
      totalTopics: result.totalTopics,
      allocatedCount: result.allocatedCount,
      remainingCount: Math.max(result.totalTopics - result.allocatedCount, 0),
      topic: result.topic
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/topics/history/status', (req, res, next) => {
  try {
    const fileName = req.query.fileName;
    if (!fileName) {
      return res.status(400).json({
        statusCode: 400,
        error: 'fileName query parameter is required.'
      });
    }

    const status = getTopicHistoryStatus(fileName);
    return res.status(200).json({
      statusCode: 200,
      ...status
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/topics/history/clear', (req, res, next) => {
  try {
    const { fileName, confirmClear } = req.body;
    if (confirmClear !== true) {
      return res.status(400).json({
        statusCode: 400,
        error: 'confirmClear=true is required to clear topic history.'
      });
    }

    const cleared = clearTopicHistory(fileName);
    return res.status(200).json({
      statusCode: 200,
      message: cleared.clearedAll
        ? 'Topic allocation history cleared for all files.'
        : `Topic allocation history cleared for ${cleared.fileName}.`,
      ...cleared
    });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({
    statusCode: 404,
    error: 'Route not found.'
  });
});

app.use((error, req, res, _next) => {
  const message = error.message || 'Unexpected server error.';
  const badRequestPatterns = ['must', 'Missing', 'does not', 'required', 'empty'];
  const notFoundPatterns = ['not found', 'does not exist'];

  let statusCode = 500;
  if (notFoundPatterns.some((pattern) => message.includes(pattern))) {
    statusCode = 404;
  } else if (badRequestPatterns.some((pattern) => message.includes(pattern))) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    statusCode,
    error: message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
