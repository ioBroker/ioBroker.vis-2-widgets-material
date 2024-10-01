const { deleteFoldersRecursive, buildReact, npmInstall, copyFiles } = require('@iobroker/build-tools');

// http://127.0.0.1:18082/vis-2-beta/widgets/vis-2-widgets-material/static/js/node_modules_iobroker_vis-2-widgets-react-dev_index_jsx-_adb40.af309310.chunk.js

deleteFoldersRecursive('src-widgets/build');
deleteFoldersRecursive('widgets');
npmInstall('src-widgets')
    .then(() => buildReact(`${__dirname}/src-widgets`, { rootDir: __dirname, craco: true }))
    .then(() => {
        copyFiles(
            [
                'src-widgets/build/*',
                '!src-widgets/build/static/js/*node_modules*.*',
                '!src-widgets/build/static/js/node_modules_*',
            ],
            'widgets/vis-2-widgets-material/',
        );
        copyFiles(
            [
                `src-widgets/build/static/js/*echarts-for-react_lib_core*.*`,
                `src-widgets/build/static/js/*spectrum_color_dist_import_mjs*.*`,
                `src-widgets/build/static/js/*uiw_react-color-shade-slider*.*`,
                `src-widgets/build/static/js/*lottie-react_build*.*`,
                `src-widgets/build/static/js/*runtime_js-src_sketch_css*.*`,
                `src-widgets/build/static/js/*node_modules_babel_runtime_helpers_createForOfItera*.*`,
            ],
            'widgets/vis-2-widgets-material/static/js',
        );
    });
/*
gulpHelper.gulpTasks(gulp, adapterName, __dirname, `${__dirname}/src-widgets/`, [
    `${__dirname}/src-widgets/build/static/js/*echarts-for-react_lib_core*.*`,
    `${__dirname}/src-widgets/build/static/js/*spectrum_color_dist_import_mjs*.*`,
    `${__dirname}/src-widgets/build/static/js/*uiw_react-color-shade-slider*.*`,
    `${__dirname}/src-widgets/build/static/js/*lottie-react_build*.*`,
    `${__dirname}/src-widgets/build/static/js/*runtime_js-src_sketch_css*.*`,
    `${__dirname}/src-widgets/build/static/js/*node_modules_babel_runtime_helpers_createForOfItera*.*`,
]);
*/
