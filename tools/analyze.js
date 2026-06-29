/**
 * DevConsole Toolkit — Code Analysis Utilities
 * Lightweight code analysis helpers for browser console.
 */

const DCTAnalyze = {
    // Extract URLs from code
    extractURLs(code) {
        const urlRegex = /https?:\/\/[^\s"'`<>\)]+/gi;
        return [...new Set((code.match(urlRegex) || []).map(u => u.replace(/[.,;:)\]"']+$/, '')))];
    },

    // Extract function names
    extractFunctions(code) {
        const patterns = [
            /(?:function\s+)(\w+)\s*\(/g,
            /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\()/g,
            /(\w+)\s*:\s*(?:async\s+)?(?:function|\()/g
        ];
        const names = new Set();
        patterns.forEach(p => { let m; while ((m = p.exec(code)) !== null) names.add(m[1]); });
        return Array.from(names);
    },

    // Extract variable names
    extractVariables(code) {
        const regex = /(?:const|let|var)\s+(\w+)\s*=/g;
        const vars = new Set();
        let m; while ((m = regex.exec(code)) !== null) vars.add(m[1]);
        return Array.from(vars);
    },

    // Calculate cyclomatic complexity
    complexity(code) {
        const branches = (code.match(/\b(?:if|else if|elif|case|&&|\|\||\?|catch)\b/g) || []).length;
        const loops = (code.match(/\b(?:for|while|do)\b/g) || []).length;
        return 1 + branches + loops;
    },

    // Estimate code length metrics
    metrics(code) {
        const lines = code.split('\n');
        return {
            lines: lines.length,
            nonEmpty: lines.filter(l => l.trim()).length,
            chars: code.length,
            functions: this.extractFunctions(code).length,
            variables: this.extractVariables(code).length,
            urls: this.extractURLs(code).length,
            complexity: this.complexity(code)
        };
    },

    // Find potential dead code
    findDeadCode(code) {
        const functions = this.extractFunctions(code);
        const unused = functions.filter(fn => {
            const regex = new RegExp(`\\b${fn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g');
            return (code.match(regex) || []).length <= 1;
        });
        return unused;
    },

    // Check for minified code
    isMinified(code) {
        const lines = code.split('\n');
        const avgLineLength = code.length / Math.max(lines.length, 1);
        return avgLineLength > 500 || lines.length < 5;
    },

    // Count patterns
    countPatterns(code, patterns) {
        const results = {};
        Object.entries(patterns).forEach(([name, regex]) => {
            const matches = code.match(regex);
            results[name] = matches ? matches.length : 0;
        });
        return results;
    }
};

if (typeof window !== 'undefined') window.DCTAnalyze = DCTAnalyze;
