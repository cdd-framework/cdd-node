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
    const writer = fs.createWriteStream(dest);

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 302) {
                https.get(response.headers.location, (res) => res.pipe(writer));
            } else {
                response.pipe(writer);
            }
            writer.on('finish', () => {
                console.log(`Downloaded: ${file.local}`);
                resolve();
            });
        }).on('error', reject);
    });
}

console.log(`Fetching CDD Binaries from GitHub ${VERSION}...`);
Promise.all(files.map(download))
    .then(() => console.log('All platforms ready for npm publish'))
    .catch(err => console.error('Download failed:', err));