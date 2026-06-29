# Memory — Persistent State

Store and recall scan results, preferences, and history across sessions.

## Usage

Paste `memory/memory.js` into browser console, then use `DCTMemory.*`

```js
// Store data
DCTMemory.set('lastScan', { findings: 12, critical: 3 })
DCTMemory.set('token', 'abc123', 3600000)  // TTL: 1 hour

// Retrieve data
DCTMemory.get('lastScan')        // { findings: 12, critical: 3 }
DCTMemory.get('missing', null)   // null (default)
DCTMemory.has('lastScan')        // true

// History
DCTMemory.pushHistory('scans', { tool: 'js-hunter', findings: 5 })
DCTMemory.getHistory('scans', 10)  // Last 10 entries

// Scan comparison
DCTMemory.saveScanResult('js-hunter', { totalFindings: 10 })
// ... later ...
DCTMemory.saveScanResult('js-hunter', { totalFindings: 8 })
DCTMemory.compareScans('js-hunter')  // { newFindings: -2, improved: true }

// Preferences
DCTMemory.setPref('theme', 'dark')
DCTMemory.getPref('theme')

// Management
DCTMemory.keys()       // List all stored keys
DCTMemory.clear()      // Clear all memory
DCTMemory.getStats()   // { totalKeys, historyEntries, preferences, estimatedSize }
```

## Features

- **Namespaced storage** — All data stored under `dct-memory:` prefix
- **TTL support** — Auto-expire entries after specified time
- **Scan history** — Track scan results over time with comparison
- **Preferences** — Store user preferences with defaults
- **Export/Import** — Full data portability
- **Statistics** — Monitor memory usage
