Electron Notarize
-----------

> Notarize your Electron apps seamlessly for macOS

[![CircleCI status](https://circleci.com/gh/electron/electron-notarize.svg?style=svg)](https://circleci.com/gh/electron/electron-notarize)
[![NPM package](https://img.shields.io/npm/v/electron-notarize)](https://npm.im/electron-notarize)

## Installation

```bash
# npm
npm install electron-notarize --save-dev

# yarn
yarn add electron-notarize --dev
```

## What is app "notarization"?

From Apple's docs in XCode:

> A notarized app is a macOS app that was uploaded to Apple for processing before it was distributed. When you export a notarized app from Xcode, it code signs the app with a Developer ID certificate and staples a ticket from Apple to the app. The ticket confirms that you previously uploaded the app to Apple.

> On macOS 10.14 and later, the user can launch notarized apps when Gatekeeper is enabled. When the user first launches a notarized app, Gatekeeper looks for the app’s ticket online. If the user is offline, Gatekeeper looks for the ticket that was stapled to the app.

Apple has made this a hard requirement as of 10.15 (Catalina).

## Prerequisites

For notarization, you need the following things:

1. Xcode 10 or later installed on your Mac.
2. An [Apple Developer](https://developer.apple.com/) account.
3. [An app-specific password for your ADC account’s Apple ID](https://support.apple.com/HT204397).
4. Your app may need to be signed with `hardened-runtime` and the following entitlements:
    1. `com.apple.security.cs.allow-jit`
    2. `com.apple.security.cs.allow-unsigned-executable-memory`

## API

### Method: `notarize(opts): Promise<void>`

* `options` Object
  * `appBundleId` String - The app bundle identifier your Electron app is using.  E.g. `com.github.electron`
  * `appPath` String - The absolute path to your `.app` file
  * `ascProvider` String (optional) - Your [Team Short Name](#notes-on-your-team-short-name). 
  * There are two methods available: user name with password:
    * `appleId` String - The username of your apple developer account
    * `appleIdPassword` String - The password for your apple developer account
  * ... or apiKey with apiIssuer:
    * `appleApiKey` String - Required for JWT authentication. See Note on JWT authentication below.
    * `appleApiIssuer` String - Issuer ID. Required if `appleApiKey` is specified.

## Safety when using `appleIdPassword`

1. Never hard code your password into your packaging scripts, use an environment
variable at a minimum.
2. It is possible to provide a keychain reference instead of your actual password (assuming that you have already logged into
the Application Loader from Xcode).  For example:

```javascript
const password = `@keychain:"Application Loader: ${appleId}"`;
```

Another option is that you can add a new keychain item using either the Keychain Access app or from the command line using the `security` utility:

```bash
security add-generic-password -a "AC_USERNAME" -w <app_specific_password> -s "AC_PASSWORD"
```
where `AC_USERNAME` should be replaced with your Apple ID, and then in your code you can use:

```javascript
const password = `@keychain:AC_PASSWORD`;
```

## Notes on JWT authentication

You can obtain an API key from [Appstore Connect](https://appstoreconnect.apple.com/access/api). Create a key with _App Manager_ access. Note down the Issuer ID and download the `.p8` file. This file is your API key and comes with the name of `AuthKey_<api_key>.p8`. This is the string you have to supply when calling `notarize`.

Based on the `ApiKey`, `altool` will look in the following places for that file:

* `./private_keys`
* `~/private_keys`
* `~/.private_keys`
* `~/.appstoreconnect/private_keys`

## Notes on your Team Short Name

If you are a member of multiple teams or organizations, you have to tell Apple on behalf of which organization you're uploading. To find your [team's short name](https://forums.developer.apple.com/thread/113798)), you can ask `iTMSTransporter`, which is part of the now deprecated `Application Loader` as well as the newer [`Transporter`](https://apps.apple.com/us/app/transporter/id1450874784?mt=12).

With `Transporter` installed, run:
```sh
/Applications/Transporter.app/Contents/itms/bin/iTMSTransporter -m provider -u APPLE_DEV_ACCOUNT -p APP_PASSWORD
```

Alternatively, with older versions of Xcode, run:
```sh
/Applications/Xcode.app/Contents/Applications/Application Loader.app/Contents/itms/bin/iTMSTransporter -m provider -u APPLE_DEV_ACCOUNT -p APP_PASSWORD
```
## Example Usage

```javascript
import { notarize } from 'electron-notarize';

async function packageTask () {
  // Package your app here, and code sign with hardened runtime
  await notarize({
    appBundleId,
    appPath,
    appleId,
    appleIdPassword,
    ascProvider, // This parameter is optional
  });
}
```
