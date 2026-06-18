#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 3000;

function killPortWindows(port) {
    try {
        const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
        const lines = out.split(/\r?\n/).filter(Boolean);
        const pids = new Set();
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) pids.add(pid);
        }
        for (const pid of pids) {
            try {
                console.log(`Killing PID ${pid} (port ${port}) ...`);
                execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            } catch (e) {
                console.warn(`Failed to kill PID ${pid}: ${e.message}`);
            }
        }
    } catch (e) {
        // no output -> no listeners
    }
}

function killPortUnix(port) {
    try {
        // lsof -t returns PIDs only
        const out = execSync(`lsof -t -i :${port} || true`, { encoding: 'utf8' });
        const pids = out.split(/\r?\n/).filter(Boolean);
        for (const pid of pids) {
            try {
                console.log(`Killing PID ${pid} (port ${port}) ...`);
                process.kill(parseInt(pid), 'SIGKILL');
            } catch (e) {
                console.warn(`Failed to kill PID ${pid}: ${e.message}`);
            }
        }
    } catch (e) {
        // ignore
    }
}

function killPort(port) {
    if (os.platform() === 'win32') {
        killPortWindows(port);
    } else {
        killPortUnix(port);
    }
}

function startDev() {
    try {
        console.log('Starting dev server: npx nodemon server.js');
        // execSync keeps behavior simple and works across platforms
        execSync('npx nodemon server.js', { stdio: 'inherit' });
    } catch (e) {
        console.error('Failed to start dev server:', e.message);
        process.exit(1);
    }
}

(async function main() {
    try {
        console.log(`Checking port ${PORT}...`);
        killPort(PORT);
        // small delay to allow OS to cleanup
        await new Promise((res) => setTimeout(res, 1000));
        startDev();
    } catch (err) {
        console.error('Error during clean start:', err);
        process.exit(1);
    }
})();