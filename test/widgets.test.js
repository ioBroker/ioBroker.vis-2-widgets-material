const setup = require('@iobroker/legacy-testing');
const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const fs = require('fs');
const cp = require('child_process');
let page;
let browser;

let objects = null;
let states  = null;
let onStateChanged = null;

const VIS_UPLOADED_ID = 'vis-2-beta.0.info.uploaded';

function deleteFoldersRecursive(path) {
    if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1);
    }
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);
        for (const file of files) {
            const curPath = `${path}/${file}`;
            const stat = fs.statSync(curPath);
            if (stat.isDirectory()) {
                deleteFoldersRecursive(curPath);
                fs.rmdirSync(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        }
    }
}

function checkValueOfState(id, value, cb, counter) {
    counter = counter === undefined ? 20 : counter;
    if (counter === 0) {
        return cb && cb(`Cannot check value Of State ${id}`);
    }

    states.getState(id, (err, state) => {
        err && console.error(err);
        if (value === null && !state) {
            cb && cb();
        } else
        if (state && (value === undefined || state.val === value)) {
            cb && cb();
        } else {
            setTimeout(() =>
                checkValueOfState(id, value, cb, counter - 1), 500);
        }
    });
}

function checkIsVisUploaded(cb, counter) {
    counter = counter === undefined ? 20 : counter;
    if (counter === 0) {
        return cb && cb(`Cannot check value Of State ${VIS_UPLOADED_ID}`);
    }

    states.getState(VIS_UPLOADED_ID, (err, state) => {
        console.log(`[${counter}]Check if vis is uploaded ${VIS_UPLOADED_ID} = ${JSON.stringify(state)}`);
        err && console.error(err);
        if (state && state.val) {
            cb && cb();
        } else {
            setTimeout(() =>
                checkIsVisUploaded(cb, counter - 1), 500);
        }
    });
}

function checkIsVisUploadedAsync(counter) {
    return new Promise((resolve, reject) =>
        checkIsVisUploaded(err => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve();
            }
        }, counter));
}

function startIoBroker() {
    return new Promise(resolve => {
        // delete the old project
        deleteFoldersRecursive(`${__dirname}/../tmp/iobroker-data/files/vis-2-beta.0/main`);
        fs.existsSync(`${__dirname}/../tmp/iobroker-data/files/vis-2-beta.0/main`) && fs.unlinkSync(`${__dirname}/../tmp/iobroker-data/files/vis-2-beta.0/main`);

        setup.setupController(['iobroker.web@5.5.3', 'iobroker.vis-2-beta@2.0.25'], async () => {
            await setup.setOfflineState('vis-2-beta.0.info.uploaded', {val: 0});
            // lets the web adapter start on port 18082
            let config = await setup.getAdapterConfig(0, 'web');
            config.native.port = 18082;
            config.common.enabled = true;
            await setup.setAdapterConfig(config.common, config.native, 0, 'web');

            config = await setup.getAdapterConfig(0, 'vis-2-beta');
            if (!config.common.enabled) {
                config.common.enabled = true;
                await setup.setAdapterConfig(config.common, config.native, 0, 'vis-2-beta');
            }

            setup.startController(
                false, // do not start widgets
                (id, obj) => {},
                (id, state) => onStateChanged && onStateChanged(id, state),
                (_objects, _states) => {
                    console.log('STARTED!');
                    objects = _objects;
                    states  = _states;
                    setup.startCustomAdapter('web', 0);
                    setup.startCustomAdapter('vis-2-beta', 0);
                    resolve();
                });
        });
    });
}

function stopIoBroker() {
    return new Promise(resolve => {
        setup.stopController(normalTerminated => {
            console.log(`Adapter normal terminated: ${normalTerminated}`);
            resolve();
        });
    });
}

async function startPuppeteer() {
    const browser = await puppeteer.launch({headless: false});
    const pages = await browser.pages();
    const timeout = 5000;
    pages[0].setDefaultTimeout(timeout);

    await pages[0].setViewport( {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });

    return { browser, page: pages[0] };
}

describe('vis-2-widgets-material', () => {
    before(async function (){
        this.timeout(180000);
        // install js-controller, web and vis-2-beta
        await startIoBroker();
        await checkIsVisUploadedAsync(100);
        const result = await startPuppeteer();
        browser = result.browser;
        page = result.page;

        await page.goto('http://127.0.0.1:18082/vis-2-beta/edit.html', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector( '#create-new-project', { timeout: 30000 } );
    });

    it(`Check if vis-2-beta adapter started`, async (done) => {
        await checkIsVisUploadedAsync();
        expect(1).to.equal(1);
        done();
    }).timeout(120000);

    after(async function () {
        this.timeout(10000);
        browser.close();

        await setup.stopCustomAdapter('vis-2-beta', 0);
        await setup.stopCustomAdapter('web', 0);

        return stopIoBroker();
    });
});