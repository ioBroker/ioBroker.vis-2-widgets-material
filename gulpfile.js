/*!
 * ioBroker gulpfile
 * Date: 2023-02-22
 */
'use strict';

const gulp = require('gulp');
const adapterName = require('./package.json').name.replace('iobroker.', '');
const gulpHelper = require('@iobroker/vis-2-widgets-react-dev/gulpHelper');

gulpHelper.gulpTasks(gulp, adapterName, __dirname, `${__dirname}/src-widgets/`);

gulp.task('default', gulp.series('widget-build'));