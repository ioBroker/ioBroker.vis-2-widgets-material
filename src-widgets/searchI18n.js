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
            if (node.name === 't') {
                // console.log(node);
            }
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
                    // console.log('t called with unknown arguments: ', node.arguments)
                    node.arguments.forEach(arg =>
                        console.log(`Cannot calculate: "${arg.left.raw} ${arg.operator} ${arg.right.name}"`))
                }
            }
        });
        next();
    },
    () => {
        const result = {}
        keys.forEach(key => result[key] = key.replace(name + '_', ''));
        console.log(JSON.stringify(result, null, 2));
    },
);
