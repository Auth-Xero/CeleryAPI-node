const { CELERY_BIN_URL, CELERY_INJECTOR_URL, CELERY_VERSION_URL, user32Functions } = require('./constants');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const child_process = require('child_process');

let isInjectorRunning = false;

async function getUrlContents(url) {
    const response = await axios.get(url);
    return response.data;
}

async function installOrUpdate() {
    const binFolder = path.join(__dirname, 'bin');
    if (!fs.existsSync(binFolder)) {
        fs.mkdirSync(binFolder);
    }

    const urls = [CELERY_BIN_URL, CELERY_INJECTOR_URL];

    const downloadPromises = urls.map(url => {
        const fileName = path.basename(url);
        const filePath = path.join(binFolder, fileName);
        return axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        }).then(response => {
            response.data.pipe(fs.createWriteStream(filePath));
            return new Promise((resolve, reject) => {
                response.data.on('end', () => resolve(filePath));
                response.data.on('error', reject);
            });
        });
    });

    await Promise.all(downloadPromises);
}

async function inject() {
    if (!fs.existsSync('bin')) {
        fs.mkdirSync('bin');
        await installOrUpdate();
    }

    const versionFilePath = path.join(__dirname, 'bin', 'ver.txt');
    const versionUrl = CELERY_VERSION_URL;

    if (!fs.existsSync(versionFilePath)) {
        const versionContent = await getUrlContents(versionUrl);
        fs.writeFileSync(versionFilePath, versionContent, 'utf-8');
    }

    const currentVersion = fs.readFileSync(versionFilePath).toString();
    const latestVersion = await getUrlContents(versionUrl);

    if (currentVersion !== latestVersion) {
        fs.writeFileSync(versionFilePath, latestVersion.toString(), 'utf-8');
        await installOrUpdate();
    }

    user32Functions.SetPropA(user32Functions.FindWindowA(null, 'Roblox'), 'CELERYHOOKED', 273);

    const injectorPath = path.join(__dirname, 'bin', 'CeleryInject.exe');
    const injectorProc = child_process.spawn(injectorPath, {
        stdio: ['ignore', 'pipe', 'ignore'],
        shell: true
    });

    isInjectorRunning = true;

    return new Promise((resolve) => {
        injectorProc.stdout.on('data', (data) => {
            if (data.toString().includes('Failed to establish')) {
                console.error('Failed to establish connection');
                isInjectorRunning = false;
                resolve('FAILED');
                return;
            }

            if (data.toString().includes('READY')) {
                setTimeout(() => {
                    isInjectorRunning = true;
                    console.log('Injector is ready and running');
                    resolve('SUCCESS');
                }, 2000);
            }
        });

        injectorProc.on('exit', (code) => {
            isInjectorRunning = false;
            if (code !== 0) {
                resolve('FAILED');
            }
        });
    });
}
function isInjected() {
    return isInjectorRunning;
}

function execute(source) {
    if (!isInjected()) {
        console.error('Error: Cannot execute because the process is not injected.');
        return;
    }

    const tempPath = path.join(os.tmpdir(), 'celery', 'myfile.txt');

    fs.mkdir(path.dirname(tempPath), { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating directory:', err);
            return;
        }

        fs.writeFile(tempPath, source, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
        });
    });
}

module.exports = {
    inject,
    installOrUpdate,
    execute,
    isInjected
};