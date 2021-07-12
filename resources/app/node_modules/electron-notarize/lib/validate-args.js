Object.defineProperty(exports, "__esModule", { value: true });
function isPasswordCredentials(opts) {
    const creds = opts;
    return creds.appleId !== undefined || creds.appleIdPassword !== undefined;
}
exports.isPasswordCredentials = isPasswordCredentials;
function isApiKeyCredentials(opts) {
    const creds = opts;
    return creds.appleApiKey !== undefined || creds.appleApiIssuer !== undefined;
}
exports.isApiKeyCredentials = isApiKeyCredentials;
function validateAuthorizationArgs(opts) {
    const isPassword = isPasswordCredentials(opts);
    const isApiKey = isApiKeyCredentials(opts);
    if (isPassword && isApiKey) {
        throw new Error('Cannot use both password credentials and API key credentials at once');
    }
    if (isPassword) {
        const passwordCreds = opts;
        if (!passwordCreds.appleId) {
            throw new Error('The appleId property is required when using notarization with appleIdPassword');
        }
        else if (!passwordCreds.appleIdPassword) {
            throw new Error('The appleIdPassword property is required when using notarization with appleId');
        }
        return passwordCreds;
    }
    if (isApiKey) {
        const apiKeyCreds = opts;
        if (!apiKeyCreds.appleApiKey) {
            throw new Error('The appleApiKey property is required when using notarization with appleApiIssuer');
        }
        else if (!apiKeyCreds.appleApiIssuer) {
            throw new Error('The appleApiIssuer property is required when using notarization with appleApiKey');
        }
        return apiKeyCreds;
    }
    throw new Error('No authentication properties provided (e.g. appleId, appleApiKey)');
}
exports.validateAuthorizationArgs = validateAuthorizationArgs;
//# sourceMappingURL=validate-args.js.map