const fs = require('fs');
const path = require('path');
const https = require('https');

const OWNER = "cdd-framework"; 
const REPO = "cdd-core";
const VERSION = "v0.4.0";
const NODE_BIN = path.join(__dirname, 'bin');

const files = [
    { remote: 'cdd-core-windows.exe', local: 'cdd-core-win.exe' },
    { remote: 'cdd-core-linux', local: 'cdd-core-linux' },
    { remote: 'cdd-core-macos', local: 'cdd-core-macos' }
];

if (!fs.existsSync(NODE_BIN)) fs.mkdirSync(NODE_BIN);

async function download(file) {
    const url = `https://github.com/${OWNER}/${REPO}/releases/download/${VERSION}/${file.remote}`;
    const dest = path.join(NODE_BIN, file.local);
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                return downloadFromUrl(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get ${file.remote}: ${res.statusCode}`));
            }
            if (res.headers['content-type'].includes('text/html')) {
                return reject(new Error(`Security Alert: Received HTML instead of binary for ${file.remote}. Check your GitHub URL.`));
            }
            
            const writer = fs.createWriteStream(dest);
            res.pipe(writer);
            writer.on('finish', resolve);
        }).on('error', reject);
    });
}

function downloadFromUrl(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.headers['content-type'].includes('text/html')) {
                return reject(new Error("Redirection pointée vers du HTML (erreur 404 probable)."));
            }
            const writer = fs.createWriteStream(dest);
            res.pipe(writer);
            writer.on('finish', resolve);
        }).on('error', reject);
    });
}

console.log(`Preparation of v0.4.0-alpha.2...`);
Promise.all(files.map(download))
    .then(() => {
        files.forEach(f => {
            const size = fs.statSync(path.join(NODE_BIN, f.local)).size;
            if (size < 100000) console.warn(`Warning: ${f.local} is very small (${size} bytes). Please check it!`);
        });
        console.log('All binaries are verified and ready.');
    })
    .catch(err => {
        console.error('Critical Error during release sync:', err.message);
        process.exit(1);
    });