const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const VERSION = 'v0.3.0';
const REPO = 'cdd-framework/cdd-core';
const BIN_DIR = path.join(__dirname, '../bin');

const PLATFORM_MAP = {
    'win32': 'windows.exe',
    'darwin': 'macos',
    'linux': 'linux'
};

const platformKey = PLATFORM_MAP[os.platform()];
if (!platformKey) {
    console.error(`Unsupported platform: ${os.platform()}`);
    process.exit(1);
}


const binaryName = `cdd-core-${platformKey}`;
const downloadUrl = `https://github.com/${REPO}/releases/download/${VERSION}/${binaryName}`;
console.log(`https://github.com/${REPO}/releases/tags/${VERSION}/${binaryName}`);
// return;

const localBinaryName = os.platform() === 'win32' ? 'cdd-core.exe' : 'cdd-core';
const destPath = path.join(BIN_DIR, localBinaryName);

console.log(`Downloading ${downloadUrl} to ${destPath}...`);

if(!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
}

const file = fs.createWriteStream(destPath);

https.get(downloadUrl, (response) => {
    if(response.statusCode === 302 || response.statusCode === 301){
        https.get(response.headers.location, (redirectResponse) => {
            pipeFile(redirectResponse);
        });
    } else if (response.statusCode === 200) {
        pipeFile(response);
    } else{
        console.error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`);
        fs.unlinkSync(destPath, () => {});
        process.exit(1);
    }
}).on('error', (err) => {
    console.error(`Error during HTTP request: ${err.message}`);
    process.exit(1);
});

function pipeFile(response) {
    response.pipe(file);
    file.on('finish', () => {
        file.close(() => {
            if(os.platform() !== 'win32') {
                fs.chmodSync(destPath, 0o755);
            }
            console.log(`Download completed successfully. Binary saved to ${destPath}`);
        });
    });
}