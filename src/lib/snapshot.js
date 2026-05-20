'use strict';

function buildSnapshot({ installedRaw, blocklist, marketplaces, fromVersion }) {
  const plugins = Array.isArray(installedRaw.plugins)
    ? installedRaw.plugins
    : Object.keys(installedRaw.plugins || {});
  return {
    format:      'clacoroo-snapshot',
    version:     1,
    exportedAt:  new Date().toISOString(),
    fromVersion,
    marketplaces,
    plugins,
    blocklist:   (blocklist.plugins || []).map(b => b.plugin || b),
  };
}

function diffSnapshot(current, snap) {
  const currentMkts    = new Set(Object.keys(current.marketplaces));
  const currentPlugins = new Set(current.plugins);
  return {
    mktToAdd:         Object.entries(snap.marketplaces || {}).filter(([id]) => !currentMkts.has(id)),
    pluginsToInstall: (snap.plugins || []).filter(p => !currentPlugins.has(p)),
  };
}

module.exports = { buildSnapshot, diffSnapshot };
