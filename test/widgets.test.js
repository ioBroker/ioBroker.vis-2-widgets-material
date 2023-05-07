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
                resolve(err);
            } else {
                reject();
            }
        }, counter));
}

function installAdapter(adapterName) {
    if (!fs.existsSync(`${__dirname}/../tmp/node_modules/iobroker.${adapterName}`)) {
        console.log(`Install ${adapterName}`);
        cp.execSync(`npm install iobroker.${adapterName} --production`, {cwd: `${__dirname}/../tmp`});
    }
}

function startIoBroker() {
    return new Promise(resolve => {
        setup.setupController(['web', 'vis-2-beta'], async () => {
            installAdapter('web');
            installAdapter('vis-2-beta');

            await setup.setOfflineState('vis-2-beta.0.info.uploaded', {val: 0});
            // lets the web adapter start on port 18082
            let config = await setup.getAdapterConfig(0, 'web');
            config.common.port = 18082;
            config.common.enabled = true;
            await setup.setAdapterConfig(config.common, config.native, 0, 'web');

            config = await setup.getAdapterConfig(0, 'vis-2-beta');
            config.common.enabled = true;
            await setup.setAdapterConfig(config.common, config.native, 0, 'vis-2-beta');

            setup.startController(
                false, // do not start widgets
                (id, obj) => {},
                (id, state) => onStateChanged && onStateChanged(id, state),
                (_objects, _states) => {
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
        this.timeout(120000);
        // install js-controller, web and vis-2-beta
        await startIoBroker();
        await checkIsVisUploadedAsync(100);
        const result = await startPuppeteer();
        browser = result.browser;
        page = result.page;

        await page.goto('http://127.0.0.1:18082/vis-2-beta/edit.html', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector( '.MuiAvatar-root', { timeout: 30000 } );
    });

    it(`Check if vis-2-beta adapter started`, async () => {
        await checkIsVisUploadedAsync();
        expect(true).to.be(true);
    }).timeout(120000);

    after(async function (done) {
        this.timeout(10000);
        browser.close();

        await setup.stopCustomAdapter('vis-2-beta', 0);
        await setup.stopCustomAdapter('web', 0);

        await stopIoBroker();
    });
});