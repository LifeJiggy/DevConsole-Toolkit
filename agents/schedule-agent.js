/**
 * DevConsole Toolkit — Scheduled Task Agent
 * Schedule recurring scans and automated tasks.
 */

const DCTScheduleAgent = {
    _tasks: new Map(),
    _intervals: new Map(),

    // Schedule a recurring task
    schedule(name, fn, intervalMs = 60000) {
        if (this._intervals.has(name)) {
            clearInterval(this._intervals.get(name));
        }

        const task = {
            name,
            fn,
            intervalMs,
            created: Date.now(),
            lastRun: null,
            runCount: 0,
            errors: 0,
            enabled: true
        };

        this._tasks.set(name, task);

        const intervalId = setInterval(() => {
            if (!task.enabled) return;
            try {
                fn();
                task.lastRun = Date.now();
                task.runCount++;
            } catch (e) {
                task.errors++;
                console.warn(`Scheduled task "${name}" error:`, e.message);
            }
        }, intervalMs);

        this._intervals.set(name, intervalId);
        return task;
    },

    // Schedule a one-time delayed task
    scheduleOnce(name, fn, delayMs = 1000) {
        const task = { name, fn, delayMs, created: Date.now(), executed: false };
        this._tasks.set(name, task);

        setTimeout(() => {
            try {
                fn();
                task.executed = true;
                task.lastRun = Date.now();
            } catch (e) {
                console.warn(`Once task "${name}" error:`, e.message);
            }
        }, delayMs);

        return task;
    },

    // Cancel a task
    cancel(name) {
        if (this._intervals.has(name)) {
            clearInterval(this._intervals.get(name));
            this._intervals.delete(name);
        }
        this._tasks.delete(name);
        return true;
    },

    // Pause/Resume
    pause(name) {
        const task = this._tasks.get(name);
        if (task) { task.enabled = false; return true; }
        return false;
    },

    resume(name) {
        const task = this._tasks.get(name);
        if (task) { task.enabled = true; return true; }
        return false;
    },

    // Get status
    getStatus() {
        const tasks = [];
        this._tasks.forEach((task, name) => {
            tasks.push({
                name,
                enabled: task.enabled,
                intervalMs: task.intervalMs,
                runCount: task.runCount,
                errors: task.errors,
                lastRun: task.lastRun ? new Date(task.lastRun).toLocaleTimeString() : 'never'
            });
        });
        return tasks;
    },

    // Cancel all
    cancelAll() {
        this._intervals.forEach(id => clearInterval(id));
        this._intervals.clear();
        this._tasks.clear();
    }
};

if (typeof window !== 'undefined') window.DCTScheduleAgent = DCTScheduleAgent;
