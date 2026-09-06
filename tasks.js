const { deleteFoldersRecursive, buildReact, npmInstall, copyFiles } = require('@iobroker/build-tools');

// http://127.0.0.1:18082/vis-2-beta/widgets/vis-2-widgets-material/static/js/node_modules_iobroker_vis-2-widgets-react-dev_index_jsx-_adb40.af309310.chunk.js

function copyAllFiles() {
    copyFiles(
        ['src-widgets/build/**/*', '!src-widgets/build/index.html'],
        'widgets/vis-2-widgets-material/',
        {
            process: (fileData, fileName) => {
                if (fileName.includes('installSVGRenderer')) {
                    // zrender has an error. It uses isFunction before it is defined
                    // here is a code:
                    //    bind = protoFunction && isFunction(protoFunction.bind) ? protoFunction.call.bind(protoFunction.bind) : bindPolyfill;
                    // and later comes the definition of isFunction:
                    //   isFunction = function(value) {
                    //     return typeof value === "function";
                    //   };

                    // Minified code looks like:
                    //   ut = ra && Y(ra.bind)
                    // Where Y is isFunction and ra is protoFunction
                    fileData = fileData.toString();
                    const match = fileData.match(/\w+\s*=\s*\w+\s*&&\s*(\w)\(\w+.bind\)/);
                    if (match) {
                        // Replace the call, do NOT declare anything. Two reasons, both of which broke the
                        // widget set (SyntaxError: Identifier 'W' has already been declared, so nothing of
                        // this widget set loaded at all):
                        //  - the match starts AFTER the `var` of the original `var ut = ra && Y(ra.bind)`,
                        //    so anything put in front of it takes that `var` for itself and leaves `ut`
                        //    without a declaration - and `ut` is the exported `bind`.
                        //  - `Y` is a name the minifier hands out, and it may already belong to a function
                        //    declaration in the same chunk. A second declaration of it is an error in a
                        //    module, which is how the chunk is loaded.
                        fileData = fileData.replace(
                            match[0],
                            match[0].replace(`${match[1]}(`, '(value => typeof value === "function")('),
                        ); // prevent error
                    }
                    return fileData;
                }
            },
        },
    );
}

if (process.argv.includes('--copy-files')) {
    copyAllFiles();
} else if (process.argv.includes('--build')) {
    buildReact(`${__dirname}/src-widgets`, { rootDir: __dirname, vite: true }).catch(() =>
        console.error('Error by build'),
    );
} else {
    deleteFoldersRecursive('src-widgets/build');
    deleteFoldersRecursive('widgets');
    npmInstall('src-widgets')
        .then(() => buildReact(`${__dirname}/src-widgets`, { rootDir: __dirname, vite: true }))
        .then(() => copyAllFiles());
}
