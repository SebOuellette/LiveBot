Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const debug = require("debug");
const helpers_1 = require("./helpers");
const d = debug('electron-notarize:spawn');
exports.spawn = (cmd, args = [], opts = {}) => {
    d('spawning cmd:', cmd, 'args:', args.map(arg => (helpers_1.isSecret(arg) ? '*********' : arg)), 'opts:', opts);
    const child = child_process_1.spawn(cmd, args, opts);
    const out = [];
    const dataHandler = (data) => out.push(data.toString());
    child.stdout.on('data', dataHandler);
    child.stderr.on('data', dataHandler);
    return new Promise(resolve => {
        child.on('exit', code => {
            d(`cmd ${cmd} terminated with code: ${code}`);
            resolve({
                code,
                output: out.join(''),
            });
        });
    });
};
//# sourceMappingURL=spawn.js.map