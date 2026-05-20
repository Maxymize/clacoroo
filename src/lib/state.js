'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const STATE_DIR    = path.join(os.homedir(), '.claude-control-room');
const ACTIVITY_LOG = path.join(STATE_DIR, 'activity-log.json');
const STATE_FILE   = path.join(STATE_DIR, 'state.json');
const ACTIVITY_MAX = 50;

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
}

function safeReadJson(filePath, fallback) {
  try   { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

function readState() {
  return safeReadJson(STATE_FILE, {});
}

function writeState(patch) {
  try {
    ensureStateDir();
    const current = readState();
    fs.writeFileSync(STATE_FILE, JSON.stringify({ ...current, ...patch }, null, 2), 'utf8');
    return true;
  } catch { return false; }
}

function readActivityLog() {
  return safeReadJson(ACTIVITY_LOG, []);
}

function appendActivity(entry) {
  try {
    ensureStateDir();
    const log = readActivityLog();
    log.unshift({ timestamp: Date.now(), ...entry });
    fs.writeFileSync(ACTIVITY_LOG, JSON.stringify(log.slice(0, ACTIVITY_MAX), null, 2), 'utf8');
  } catch { /* fail silently — activity log is non-critical */ }
}

function clearActivityLog() {
  try { fs.unlinkSync(ACTIVITY_LOG); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
}

module.exports = {
  STATE_DIR, ACTIVITY_LOG, STATE_FILE,
  readState, writeState,
  readActivityLog, appendActivity, clearActivityLog,
};
