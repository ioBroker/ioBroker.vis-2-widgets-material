/*!
 * ioBroker gulpfile
 * Date: 2023-02-22
 */
'use strict';

const gulp = require('gulp');
const adapterName = require('./package.json').name.replace('iobroker.', '');
const gulpHelper = require('@iobroker/vis-2-widgets-react-dev/gulpHelper');

// http://127.0.0.1:18082/vis-2-beta/widgets/vis-2-widgets-material/static/js/node_modules_iobroker_vis-2-widgets-react-dev_index_jsx-_adb40.af309310.chunk.js

gulpHelper.gulpTasks(gulp, adapterName, __dirname, `${__dirname}/src-widgets/`, [
    `${__dirname}/src-widgets/build/static/js/*echarts-for-react_lib_core*.*`,
    `${__dirname}/src-widgets/build/static/js/*spectrum_color_dist_import_mjs*.*`,
    `${__dirname}/src-widgets/build/static/js/*uiw_react-color-shade-slider*.*`,
    `${__dirname}/src-widgets/build/static/js/*lottie-react_build*.*`,
    `${__dirname}/src-widgets/build/static/js/*runtime_js-src_sketch_css*.*`,
    `${__dirname}/src-widgets/build/static/js/*node_modules_babel_runtime_helpers_createForOfItera*.*`,
]);

gulp.task('version', done => {
    const pack = require('./package.json');
    const widgets = require(`${__dirname}/src-widgets/package.json`);
    widgets.version = pack.version;
    require('fs').writeFileSync(`${__dirname}/src-widgets/package.json`, JSON.stringify(widgets, null, 2));
    done();
});

gulp.task('default', gulp.series('version', 'widget-build'));
