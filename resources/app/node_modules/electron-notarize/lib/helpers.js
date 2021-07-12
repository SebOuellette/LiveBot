var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const d = debug('electron-notarize:helpers');
function withTempDir(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = yield fs.mkdtemp(path.resolve(os.tmpdir(), 'electron-notarize-'));
        d('doing work inside temp dir:', dir);
        let result;
        try {
            result = yield fn(dir);
        }
        catch (err) {
            d('work failed');
            yield fs.remove(dir);
            throw err;
        }
        d('work succeeded');
        yield fs.remove(dir);
        return result;
    });
}
exports.withTempDir = withTempDir;
class Secret {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return this.value;
    }
    inspect() {
        return '******';
    }
}
function makeSecret(s) {
    return new Secret(s);
}
exports.makeSecret = makeSecret;
function isSecret(s) {
    return s instanceof Secret;
}
exports.isSecret = isSecret;
function parseNotarizationInfo(info) {
    const out = {};
    const matchToProperty = (key, r, modifier) => {
        const exec = r.exec(info);
        if (exec) {
            out[key] = modifier ? modifier(exec[1]) : exec[1];
        }
    };
    matchToProperty('uuid', /\n *RequestUUID: (.+?)\n/);
    matchToProperty('date', /\n *Date: (.+?)\n/, d => new Date(d));
    matchToProperty('status', /\n *Status: (.+?)\n/);
    matchToProperty('logFileUrl', /\n *LogFileURL: (.+?)\n/);
    matchToProperty('statusCode', /\n *Status Code: (.+?)\n/, n => parseInt(n, 10));
    matchToProperty('statusMessage', /\n *Status Message: (.+?)\n/);
    if (out.logFileUrl === '(null)') {
        out.logFileUrl = null;
    }
    return out;
}
exports.parseNotarizationInfo = parseNotarizationInfo;
//# sourceMappingURL=helpers.js.map