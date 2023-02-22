/*!
 * ioBroker gulpfile
 * Date: 2023-02-22
 */
'use strict';

const gulp = require('gulp');
const fs = require('fs');
const cp = require('child_process');
const adapterName = require('./package.json').name.replace('iobroker.', '');

const SRC = 'src-widgets/';
const src = `${__dirname}/${SRC}`;

function deleteFoldersRecursive(path, exceptions) {
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);
        for (const file of files) {
            const curPath = `${path}/${file}`;
            if (exceptions && exceptions.find(e => curPath.endsWith(e))) {
                continue;
            }

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

function npmInstall() {
    return new Promise((resolve, reject) => {
        // Install node modules
        const cwd = src.replace(/\\/g, '/');

        const cmd = `npm install -f`;
        console.log(`"${cmd} in ${cwd}`);

        // System call used for update of js-controller itself,
        // because during installation npm packet will be deleted too, but some files must be loaded even during the install process.
        const exec = cp.exec;
        const child = exec(cmd, {cwd});

        child.stderr.pipe(process.stderr);
        child.stdout.pipe(process.stdout);

        child.on('exit', (code /* , signal */) => {
            // code 1 is strange error that cannot be explained. Everything is installed but error :(
            if (code && code !== 1) {
                reject(`Cannot install: ${code}`);
            } else {
                console.log(`"${cmd} in ${cwd} finished.`);
                // command succeeded
                resolve();
            }
        });
    });
}

function buildWidgets() {
    const version = JSON.parse(fs.readFileSync(`${__dirname}/package.json`).toString('utf8')).version;
    const data    = JSON.parse(fs.readFileSync(`${src}package.json`).toString('utf8'));

    data.version = version;

    fs.writeFileSync(`${src}package.json`, JSON.stringify(data, null, 4));

    // we have bug, that federation requires version number in @mui/material/styles, so we have to change it
    // read version of @mui/material and write it to @mui/material/styles
    const muiStyleVersion = require(`${src}node_modules/@mui/material/styles/package.json`);
    if (!muiStyleVersion.version) {
        const muiVersion = require(`${src}node_modules/@mui/material/package.json`);
        muiStyleVersion.version = muiVersion.version;
        fs.writeFileSync(`${src}node_modules/@mui/material/styles/package.json`, JSON.stringify(muiStyleVersion, null, 2));
    }

    return new Promise((resolve, reject) => {
        const options = {
            stdio: 'pipe',
            cwd: src,
            env: {
                CI: 'true',
            }
        };

        console.log(options.cwd);

        let script = `${src}node_modules/@craco/craco/dist/bin/craco.js`;
        if (!fs.existsSync(script)) {
            script = `${__dirname}/node_modules/@craco/craco/dist/bin/craco.js`;
        }
        if (!fs.existsSync(script)) {
            console.error(`Cannot find execution file: ${script}`);
            reject(`Cannot find execution file: ${script}`);
        } else {
            const child = cp.fork(script, ['build'], options);
            child.stdout.on('data', data => console.log(data.toString()));
            child.stderr.on('data', data => console.warn(data.toString()));
            child.on('close', code => {
                console.log(`child process exited with code ${code}`);
                code ? reject(`Exit code: ${code}`) : resolve();
            });
        }
    });
}

gulp.task('widget-0-clean', done => {
    deleteFoldersRecursive(`${src}/build`);
    deleteFoldersRecursive(`${__dirname}/widgets`);
    done();
});

gulp.task('widget-1-npm', async () => npmInstall());

gulp.task('widget-2-compile', async () => buildWidgets());

gulp.task('widget-3-copy', () => Promise.all([
    gulp.src([`${SRC}build/*.js`]).pipe(gulp.dest(`widgets/${adapterName}`)),
    gulp.src([`${SRC}build/img/*`]).pipe(gulp.dest(`widgets/${adapterName}/img`)),
    gulp.src([`${SRC}build/*.map`]).pipe(gulp.dest(`widgets/${adapterName}`)),
    gulp.src([
        `${SRC}build/static/**/*`,
        `!${SRC}build/static/js/node_modules*.*`,
        `!${SRC}build/static/js/vendors-node_modules*.*`,
        `!${SRC}build/static/js/main*.*`,
        `!${SRC}build/static/js/src_bootstrap*.*`,
        `!${SRC}build/static/media/Alarm Systems.*.svg`,
        `!${SRC}build/static/media/Amplifier.*.svg`,
        `!${SRC}build/static/media/Anteroom.*.svg`,
        `!${SRC}build/static/media/Attic.*.svg`,
        `!${SRC}build/static/media/Awnings.*.svg`,
        `!${SRC}build/static/media/Balcony.*.svg`,
        `!${SRC}build/static/media/Barn.*.svg`,
        `!${SRC}build/static/media/Basement.*.svg`,
        `!${SRC}build/static/media/Bathroom.*.svg`,
        `!${SRC}build/static/media/Battery Status.*.svg`,
        `!${SRC}build/static/media/Bedroom.*.svg`,
        `!${SRC}build/static/media/Boiler Room.*.svg`,
        `!${SRC}build/static/media/Carport.*.svg`,
        `!${SRC}build/static/media/Ceiling Spotlights.*.svg`,
        `!${SRC}build/static/media/Cellar.*.svg`,
        `!${SRC}build/static/media/Chamber.*.svg`,
        `!${SRC}build/static/media/Chandelier.*.svg`,
        `!${SRC}build/static/media/Climate.*.svg`,
        `!${SRC}build/static/media/Coffee Makers.*.svg`,
        `!${SRC}build/static/media/Cold Water.*.svg`,
        `!${SRC}build/static/media/Computer.*.svg`,
        `!${SRC}build/static/media/Consumption.*.svg`,
        `!${SRC}build/static/media/Corridor.*.svg`,
        `!${SRC}build/static/media/Curtains.*.svg`,
        `!${SRC}build/static/media/Dining Area.*.svg`,
        `!${SRC}build/static/media/Dining Room.*.svg`,
        `!${SRC}build/static/media/Dining.*.svg`,
        `!${SRC}build/static/media/Dishwashers.*.svg`,
        `!${SRC}build/static/media/Doors.*.svg`,
        `!${SRC}build/static/media/Doorstep.*.svg`,
        `!${SRC}build/static/media/Dressing Room.*.svg`,
        `!${SRC}build/static/media/Driveway.*.svg`,
        `!${SRC}build/static/media/Dryer.*.svg`,
        `!${SRC}build/static/media/Entrance.*.svg`,
        `!${SRC}build/static/media/Equipment Room.*.svg`,
        `!${SRC}build/static/media/Fan.*.svg`,
        `!${SRC}build/static/media/Floor Lamps.*.svg`,
        `!${SRC}build/static/media/Front Yard.*.svg`,
        `!${SRC}build/static/media/Gallery.*.svg`,
        `!${SRC}build/static/media/Garage Doors.*.svg`,
        `!${SRC}build/static/media/Garage.*.svg`,
        `!${SRC}build/static/media/Garden.*.svg`,
        `!${SRC}build/static/media/Gates.*.svg`,
        `!${SRC}build/static/media/Ground Floor.*.svg`,
        `!${SRC}build/static/media/Guest Bathroom.*.svg`,
        `!${SRC}build/static/media/Guest Room.*.svg`,
        `!${SRC}build/static/media/Gym.*.svg`,
        `!${SRC}build/static/media/Hairdryer.*.svg`,
        `!${SRC}build/static/media/Hall.*.svg`,
        `!${SRC}build/static/media/Handle.*.svg`,
        `!${SRC}build/static/media/Hanging Lamps.*.svg`,
        `!${SRC}build/static/media/Heater.*.svg`,
        `!${SRC}build/static/media/Home Theater.*.svg`,
        `!${SRC}build/static/media/Hoods.*.svg`,
        `!${SRC}build/static/media/Hot Water.*.svg`,
        `!${SRC}build/static/media/Humidity.*.svg`,
        `!${SRC}build/static/media/Iron.*.svg`,
        `!${SRC}build/static/media/Irrigation.*.svg`,
        `!${SRC}build/static/media/Kitchen.*.svg`,
        `!${SRC}build/static/media/Laundry Room.*.svg`,
        `!${SRC}build/static/media/Led Strip.*.svg`,
        `!${SRC}build/static/media/Light.*.svg`,
        `!${SRC}build/static/media/Lightings.*.svg`,
        `!${SRC}build/static/media/Living Area.*.svg`,
        `!${SRC}build/static/media/Living Room.*.svg`,
        `!${SRC}build/static/media/Lock.*.svg`,
        `!${SRC}build/static/media/Locker Room.*.svg`,
        `!${SRC}build/static/media/Louvre.*.svg`,
        `!${SRC}build/static/media/Mowing Machine.*.svg`,
        `!${SRC}build/static/media/Music.*.svg`,
        `!${SRC}build/static/media/names.*.txt`,
        `!${SRC}build/static/media/Nursery.*.svg`,
        `!${SRC}build/static/media/Office.*.svg`,
        `!${SRC}build/static/media/Outdoor Blinds.*.svg`,
        `!${SRC}build/static/media/Outdoors.*.svg`,
        `!${SRC}build/static/media/People.*.svg`,
        `!${SRC}build/static/media/Playroom.*.svg`,
        `!${SRC}build/static/media/Pool.*.svg`,
        `!${SRC}build/static/media/Power Consumption.*.svg`,
        `!${SRC}build/static/media/Printer.*.svg`,
        `!${SRC}build/static/media/Pump.*.svg`,
        `!${SRC}build/static/media/Rear Wall.*.svg`,
        `!${SRC}build/static/media/Receiver.*.svg`,
        `!${SRC}build/static/media/Sconces.*.svg`,
        `!${SRC}build/static/media/Second Floor.*.svg`,
        `!${SRC}build/static/media/Security.*.svg`,
        `!${SRC}build/static/media/Shading.*.svg`,
        `!${SRC}build/static/media/Shed.*.svg`,
        `!${SRC}build/static/media/Shutters.*.svg`,
        `!${SRC}build/static/media/Sleeping Area.*.svg`,
        `!${SRC}build/static/media/SmokeDetector.*.svg`,
        `!${SRC}build/static/media/Sockets.*.svg`,
        `!${SRC}build/static/media/Speaker.*.svg`,
        `!${SRC}build/static/media/Stairway.*.svg`,
        `!${SRC}build/static/media/Stairwell.*.svg`,
        `!${SRC}build/static/media/Storeroom.*.svg`,
        `!${SRC}build/static/media/Stove.*.svg`,
        `!${SRC}build/static/media/Summer House.*.svg`,
        `!${SRC}build/static/media/Swimming Pool.*.svg`,
        `!${SRC}build/static/media/Table Lamps.*.svg`,
        `!${SRC}build/static/media/Temperature Sensors.*.svg`,
        `!${SRC}build/static/media/Terrace.*.svg`,
        `!${SRC}build/static/media/Toilet.*.svg`,
        `!${SRC}build/static/media/Tv.*.svg`,
        `!${SRC}build/static/media/Upstairs.*.svg`,
        `!${SRC}build/static/media/Vacuum Cleaner.*.svg`,
        `!${SRC}build/static/media/Ventilation.*.svg`,
        `!${SRC}build/static/media/Wardrobe.*.svg`,
        `!${SRC}build/static/media/Washing Machines.*.svg`,
        `!${SRC}build/static/media/Washroom.*.svg`,
        `!${SRC}build/static/media/Water Consumption.*.svg`,
        `!${SRC}build/static/media/Water Heater.*.svg`,
        `!${SRC}build/static/media/Water.*.svg`,
        `!${SRC}build/static/media/Wc.*.svg`,
        `!${SRC}build/static/media/Weather.*.svg`,
        `!${SRC}build/static/media/Window.*.svg`,
        `!${SRC}build/static/media/Windscreen.*.svg`,
        `!${SRC}build/static/media/Workshop.*.svg`,
        `!${SRC}build/static/media/Workspace.*.svg`,
    ]).pipe(gulp.dest(`widgets/${adapterName}/static`)),
    gulp.src([
        `${SRC}build/static/js/vendors-node_modules_echarts-for-react_lib_core_js-node_modules_echarts_core_js-*.chunk.*`,
        `${SRC}build/static/js/vendors-node_modules_echarts_lib*.*`,
        `${SRC}build/static/js/vendors-node_modules_color*.*`,
        `${SRC}build/static/js/vendors-node_modules_leaflet*.*`,
        `${SRC}build/static/js/vendors-node_modules_moment*.*`,
        `${SRC}build/static/js/vendors-node_modules_react-circular*.*`,
    ]).pipe(gulp.dest(`widgets/${adapterName}/static/js`)),
    gulp.src([`${SRC}src/i18n/*.json`]).pipe(gulp.dest(`widgets/${adapterName}/i18n`)),
    new Promise(resolve =>
        setTimeout(() => {
            if (fs.existsSync(`widgets/${adapterName}/static/media`) &&
                !fs.readdirSync(`widgets/${adapterName}/static/media`).length
            ) {
                fs.rmdirSync(`widgets/${adapterName}/static/media`)
            }
            resolve();
        }, 500)
    )
]));

gulp.task('widget-build', gulp.series(['widget-0-clean', 'widget-1-npm', 'widget-2-compile', 'widget-3-copy']));

gulp.task('default', gulp.series('widget-build'));