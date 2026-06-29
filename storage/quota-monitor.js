/**
 * DevConsole Toolkit — Storage Quota Monitor
 * Monitor storage usage and quotas across all storage types.
 */

const DCTQuotaMonitor = {
    async getQuota() {
        const results = { localStorage: { used: 0, quota: 0 }, sessionStorage: { used: 0, quota: 0 } };

        // Estimate localStorage usage
        try {
            let totalSize = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const val = localStorage.getItem(key);
                totalSize += (key.length + (val ? val.length : 0)) * 2;
            }
            results.localStorage.used = totalSize;
            results.localStorage.quota = 5 * 1024 * 1024; // 5MB typical
        } catch (e) {}

        // Estimate sessionStorage usage
        try {
            let totalSize = 0;
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const val = sessionStorage.getItem(key);
                totalSize += (key.length + (val ? val.length : 0)) * 2;
            }
            results.sessionStorage.used = totalSize;
            results.sessionStorage.quota = 5 * 1024 * 1024;
        } catch (e) {}

        // IndexedDB quota (if available)
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                results.indexedDB = { used: estimate.usage || 0, quota: estimate.quota || 0 };
            } catch (e) {
                results.indexedDB = { used: 0, quota: 0 };
            }
        }

        return results;
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    async report() {
        const quota = await this.getQuota();
        const report = [];

        Object.entries(quota).forEach(([type, data]) => {
            const usedPercent = data.quota > 0 ? ((data.used / data.quota) * 100).toFixed(1) : 0;
            report.push({
                type,
                used: this.formatBytes(data.used),
                quota: this.formatBytes(data.quota),
                usedPercent: usedPercent + '%',
                status: usedPercent > 90 ? 'CRITICAL' : usedPercent > 70 ? 'WARNING' : 'OK'
            });
        });

        return report;
    }
};

if (typeof window !== 'undefined') window.DCTQuotaMonitor = DCTQuotaMonitor;
