# Tools — Utility Functions

Core utility functions for the DevConsole Toolkit ecosystem.

## Usage

Paste `tools/utils.js` into browser console, then use `DCTUtils.*`

```js
// URL utilities
DCTUtils.parseURL('https://example.com/path?q=test#hash')
DCTUtils.getQueryParams()
DCTUtils.getParam('q')
DCTUtils.setParam('page', '2')
DCTUtils.removeParam('q')

// Encoding/Decoding
DCTUtils.b64Encode('hello world')
DCTUtils.b64Decode('aGVsbG8gd29ybGQ=')
DCTUtils.urlEncode('hello world')
DCTUtils.htmlEncode('<script>alert(1)</script>')
DCTUtils.hexEncode('hello')

// Hashing
await DCTUtils.sha256('hello')
await DCTUtils.sha1('hello')

// Validation
DCTUtils.isURL('https://example.com')
DCTUtils.isEmail('test@example.com')
DCTUtils.isJWT('eyJ...')
DCTUtils.isBase64('aGVsbG8=')

// Analysis
DCTUtils.shannonEntropy('abc123')
DCTUtils.classifyString('eyJhbGciOiJIUzI1NiJ9...')

// DOM
DCTUtils.getSelectedText()
DCTUtils.getCookie('session')
DCTUtils.setCookie('lang', 'en')
DCTUtils.getStorage('local')

// Export
DCTUtils.downloadJSON({ data: 'test' })
DCTUtils.downloadCSV(['Name', 'Value'], [['a', '1'], ['b', '2']])
DCTUtils.downloadMarkdown('# Report\n\nContent here')
```

## Functions

| Category | Function | Description |
|----------|----------|-------------|
| URL | `parseURL(url)` | Parse URL into components |
| URL | `getQueryParams(url)` | Get all query parameters |
| URL | `getParam(name, url)` | Get single parameter |
| URL | `setParam(name, value, url)` | Add/update parameter |
| URL | `removeParam(name, url)` | Remove parameter |
| Encode | `b64Encode(str)` | Base64 encode |
| Encode | `b64Decode(str)` | Base64 decode |
| Encode | `urlEncode/Decode(str)` | URL encode/decode |
| Encode | `htmlEncode/Decode(str)` | HTML entity encode/decode |
| Encode | `hexEncode/Decode(str)` | Hex encode/decode |
| Hash | `sha256(str)` | SHA-256 hash |
| Hash | `sha1(str)` | SHA-1 hash |
| Validate | `isURL/isEmail/isIP/isBase64/isJWT/isJSON/isHex` | Type validators |
| Analysis | `shannonEntropy(str)` | Calculate Shannon entropy |
| Analysis | `classifyString(str)` | Auto-classify string type |
| DOM | `getSelectedText()` | Get currently selected text |
| DOM | `getCookie/setCookie/deleteCookie` | Cookie management |
| DOM | `getStorage(type)` | Get localStorage/sessionStorage |
| Export | `download(content, filename)` | Download file |
| Export | `downloadJSON/data/CSV/Markdown` | Typed export helpers |
