# Storage — Browser Storage Manager

Audit, monitor, and manage browser storage (localStorage, sessionStorage, cookies).

## Modules

| File | Module | Description |
|------|--------|-------------|
| `storage.js` | `DCTStorage` | Core storage audit, monitoring, export |
| `IndexedDB-manager.js` | `DCTIndexedDB` | Simplified IndexedDB CRUD operations |
| `cookie-parser.js` | `DCTCookieParser` | Advanced cookie parsing and security audit |
| `quota-monitor.js` | `DCTQuotaMonitor` | Storage quota monitoring and reporting |
| `migrate.js` | `DCTMigrate` | Storage migration and export/import |

## Usage

Paste `storage/storage.js` into browser console, then use `DCTStorage.*`

```js
// Audit
DCTStorage.auditLocalStorage()    // Find issues in localStorage
DCTStorage.auditSessionStorage()  // Find issues in sessionStorage
DCTStorage.auditCookies()         // Find cookie security issues
DCTStorage.auditAll()             // Audit everything

// Read
DCTStorage.getLocalStorageItems() // [{ key, value }]
DCTStorage.getSessionStorageItems()
DCTStorage.getCookieItems()

// Write
DCTStorage.setItem('key', 'value', 'local')
DCTStorage.getItem('key', 'session')
DCTStorage.removeItem('key')

// Monitor (tracks changes in real-time)
DCTStorage.startMonitoring()
DCTStorage.getChanges()  // [{ timestamp, storage, action, key, ... }]
DCTStorage.stopMonitoring()

// Export
DCTStorage.exportJSON()  // Download full storage audit as JSON
```

## Features

- **Security audit** — Find sensitive data, passwords, API keys in storage
- **Cookie analysis** — Check for missing Secure/HttpOnly/SameSite flags
- **Real-time monitoring** — Track all storage changes
- **Change history** — Full change log with timestamps
- **JSON export** — Download complete storage state
