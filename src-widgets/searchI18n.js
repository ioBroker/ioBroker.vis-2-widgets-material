const name = require('../package.json').name.replace(/-/g, '_').replace(/^iobroker\./g, '');
const dir = require('node-dir');
// Extend Acorn parser with JSX
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const parser = acorn.Parser.extend(jsx());

// Extend Acorn walk with JSX
const walk = require('acorn-walk');
const { extend } = require('acorn-jsx-walk');
extend(walk.base);

const en = require('./src/i18n/en.json');

const keys = [];

dir.readFiles(__dirname + '/src',
    {
        match: /\.jsx?$/,
    },
    (err, content, next) => {
        const result = parser.parse(content, {
            sourceType: 'module',
            ecmaVersion: 'latest'
        });

        walk.full(result, node => {
            if (node.type === 'CallExpression' && node.callee.property?.type === 'Identifier' && node.callee.property?.name === 't') {
                if (node.arguments.length === 1 && node.arguments[0].type === 'Literal' && typeof node.arguments[0].value === 'string') {
                    // This is for the case `t` is called with a single string
                    // literal as argument.
                    if (!keys.includes(node.arguments[0].value)) {
                        keys.push(node.arguments[0].value);
                    }
                } else {
                    // In case you have things like template literals as well,
                    // or multiple arguments, you'd need to handle them here too.
                    console.log(`Cannot calculate: "${content.slice(node.arguments[0].start, node.arguments[0].end)}"`);
                }
            }
            if (node.type === 'Property' && node.key.name === 'visAttrs') {
                const visAttrs = parser.parse(content.slice(node.value.start, node.value.end), {
                    sourceType: 'module',
                    ecmaVersion: 'latest'
                });
                walk.full(visAttrs, attrNode => {
                    if (attrNode.type === 'Property' && attrNode.key.name === 'label') {
                        if (!keys.includes(attrNode.value.value)) {
                            keys.push(attrNode.value.value);
                        }
                    }
                });
            }
        });
        next();
    },
    () => {
        const result = {}
        keys.forEach(key => result[key] = key.replace(name + '_', ''));
        console.log('All keys:');
        console.log(JSON.stringify(result, null, 2));
        const emptyResult = {};
        keys.forEach(key => {
            if (!en[key]) {
                emptyResult[key] = result[key];
            }
        });
        console.log('Empty keys:');
        console.log(JSON.stringify(emptyResult, null, 2));
    },
);
