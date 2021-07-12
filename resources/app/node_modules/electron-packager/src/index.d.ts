// Originally based on the type definitions for electron-packager 14.0
// Project: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/electron-packager
// Original Authors:
// * Maxime LUCE <https://github.com/SomaticIT>
// * Juan Jimenez-Anca <https://github.com/cortopy>
// * John Kleinschmidt <https://github.com/jkleinsc>
// * Brendan Forster <https://github.com/shiftkey>
// * Mark Lee <https://github.com/malept>
// * Florian Keller <https://github.com/ffflorian>

import { CreateOptions as AsarOptions } from 'asar';
import { ElectronDownloadRequestOptions as ElectronDownloadOptions } from '@electron/get';
import { NotarizeCredentials, TransporterOptions as NotarizeTransporterOptions } from 'electron-notarize';
import { SignOptions } from 'electron-osx-sign';

/**
 * Bundles Electron-based application source code with a renamed/customized Electron executable and
 * its supporting files into folders ready for distribution.
 *
 * Briefly, this function:
 * - finds or downloads the correct release of Electron
 * - uses that version of Electron to create a app in `<out>/<appname>-<platform>-<arch>`
 *
 * Short example:
 *
 * ```javascript
 * const packager = require('electron-packager')
 *
 * async function bundleElectronApp(options) {
 *   const appPaths = await packager(options)
 *   console.log(`Electron app bundles created:\n${appPaths.join("\n")}`)
 * }
 * ```
 *
 * @param opts - Options to configure packaging.
 *
 * @returns A Promise containing the paths to the newly created application bundles.
 */
declare function electronPackager(opts: electronPackager.Options): Promise<string[]>;

declare namespace electronPackager {
  /**
   * Architectures that have been supported by the official Electron prebuilt binaries, past
   * and present.
   */
  type OfficialArch = 'ia32' | 'x64' | 'armv7l' | 'arm64' | 'mips64el';
  /**
   * Platforms that have been supported by the official Electron prebuilt binaries, past and present.
   */
  type OfficialPlatform = 'linux' | 'win32' | 'darwin' | 'mas';
  type TargetArch = OfficialArch | string;
  type TargetPlatform = OfficialPlatform | string;
  type ArchOption = TargetArch | 'all';
  type PlatformOption = TargetPlatform | 'all';

  /**
   * A predicate function that, given an absolute file `path`, returns `true` if the file should be
   * ignored, or `false` if the file should be kept. *This does not use any of the default ignored
   * files/directories listed for the [[ignore]] option.*
   */
  type IgnoreFunction = (path: string) => boolean;
  /**
   * A function that is called on the completion of a packaging stage.
   *
   * By default, the functions are called in parallel (via
   * [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)).
   * If you need the functions called serially, there is a utility function provided. Please note that
   * **callback-style functions are not supported by `serialHooks`.** For example:
   *
   * ```javascript
   * const packager = require('electron-packager')
   * const { serialHooks } = require('electron-packager/src/hooks')
   *
   * packager({
   *   // ...
   *   afterCopy: [serialHooks([
   *     (buildPath, electronVersion, platform, arch) => {
   *       return new Promise((resolve, reject) => {
   *         setTimeout(() => {
   *           console.log('first function')
   *           resolve()
   *         }, 1000)
   *       })
   *     },
   *     (buildPath, electronVersion, platform, arch) => {
   *       console.log('second function')
   *     }
   *   ])],
   *   // ...
   * })
   * ```
   *
   * For real-world examples of `HookFunction`s, see the [list of related
   * plugins](https://github.com/electron/electron-packager#plugins).
   */
  type HookFunction =
    /**
     * @param buildPath - For [[afterExtract]], the path to the temporary folder where the prebuilt
     * Electron binary has been extracted to. For [[afterCopy]] and [[afterPrune]], the path to the
     * folder where the Electron app has been copied to.
     * @param electronVersion - the version of Electron that is being bundled with the application.
     * @param platform - The target platform you are packaging for.
     * @param arch - The target architecture you are packaging for.
     * @param callback - Must be called once you have completed your actions.
     */
    (
    buildPath: string,
    electronVersion: string,
    platform: TargetArch,
    arch: TargetArch,
    callback: () => void
  ) => void;

  /** See the documentation for [`electron-osx-sign`](https://npm.im/electron-osx-sign#opts) for details. */
  type OsxSignOptions = Omit<SignOptions, 'app' | 'binaries' | 'platform' | 'version'>;

  /**
   * See the documentation for [`electron-notarize`](https://npm.im/electron-notarize#method-notarizeopts-promisevoid)
   * for details.
   */
  type OsxNotarizeOptions = NotarizeCredentials & NotarizeTransporterOptions;

  /**
   * Defines URL protocol schemes to be used on macOS.
   */
  interface MacOSProtocol {
    /**
     * The descriptive name. Maps to the `CFBundleURLName` metadata property.
     */
    name: string;
    /**
     * One or more protocol schemes associated with the app. For example, specifying `myapp`
     * would cause URLs such as `myapp://path` to be opened with the app. Maps to the
     * `CFBundleURLSchemes` metadata property.
     */
    schemes: string[];
  }

  /**
   * A collection of application metadata to embed into the Windows executable.
   *
   * For more information, read the [`rcedit` Node module documentation](https://github.com/electron/node-rcedit#docs).
   */
  interface Win32MetadataOptions {
    /** Defaults to the `author` name from the nearest `package.json`. */
    CompanyName?: string;
    /** Defaults to either `productName` or `name` from the nearest `package.json`. */
    FileDescription?: string;
    /** Defaults to the renamed Electron `.exe` file. */
    OriginalFilename?: string;
    /** Defaults to either `productName` or `name` from the nearest `package.json`. */
    ProductName?: string;
    /** Defaults to either `productName` or `name` from the nearest `package.json`. */
    InternalName?: string;
    /** See [MSDN](https://msdn.microsoft.com/en-us/library/6ad1fshk.aspx#Anchor_9) for details. */
    'requested-execution-level'?: 'asInvoker' | 'highestAvailable' | 'requireAdministrator';
    /**
     * Path to a local manifest file.
     *
     * See [MSDN](https://msdn.microsoft.com/en-us/library/windows/desktop/aa374191.aspx) for more details.
     */
    'application-manifest'?: string;
  }

  /** Options passed to the `packager()` function. */
  interface Options {
    /** The source directory. */
    dir: string;
    /**
     * Functions to be called after your app directory has been copied to a temporary directory.
     *
     * **Note**: `afterCopy` will not be called if the [[prebuiltAsar]] option is set.
     */
    afterCopy?: HookFunction[];
    /** Functions to be called after the prebuilt Electron binary has been extracted to a temporary directory. */
    afterExtract?: HookFunction[];
    /**
     * Functions to be called after Node module pruning has been applied to the application.
     *
     * **Note**: None of these functions will be called if the [[prune]] option is `false` or
     * the [[prebuiltAsar]] option is set.
     */
    afterPrune?: HookFunction[];

    /** When `true`, sets both [[arch]] and [[platform]] to `all`. */
    all?: boolean;
    /*
     * The bundle identifier to use in the application's `Info.plist`.
     *
     * @category macOS
     */
    appBundleId?: string;
    /**
     * The application category type, as shown in the Finder via *View → Arrange by Application
     * Category* when viewing the Applications directory.
     *
     * For example, `app-category-type=public.app-category.developer-tools` will set the
     * application category to *Developer Tools*.
     *
     * Valid values are listed in [Apple's documentation](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8).
     *
     * @category macOS
     */
    appCategoryType?: string;
    /**
     * The human-readable copyright line for the app. Maps to the `LegalCopyright` metadata
     * property on Windows, and `NSHumanReadableCopyright` on macOS.
     */
    appCopyright?: string;
    /**
     * The release version of the application.
     *
     * By default the `version` property in the `package.json` is used, but it can be overridden
     * with this argument. If neither are provided, the version of Electron will be used. Maps
     * to the `ProductVersion` metadata property on Windows, and `CFBundleShortVersionString`
     * on macOS.
     */
    appVersion?: string;
    /**
     * The target system architecture(s) to build for.
     *
     * Not required if the [[all]] option is set. If `arch` is set to `all`, all supported
     * architectures for the target platforms specified by [[platform]] will be built.
     * Arbitrary combinations of individual architectures are also supported via a comma-delimited
     * string or array of strings. The non-`all` values correspond to the architecture names used
     * by [Electron releases](https://github.com/electron/electron/releases). This value
     * is not restricted to the official set if [[download|`download.mirrorOptions`]] is set.
     *
     * Defaults to the arch of the host computer running Electron Packager.
     *
     * Arch values for the official prebuilt Electron binaries:
     * - `ia32`
     * - `x64`
     * - `armv7l`
     * - `arm64` _(Linux: Electron 1.8.0 and above; Windows: 6.0.8 and above; macOS: 11.0.0-beta.1 and above)_
     * - `mips64el` _(Electron 1.8.2-beta.5 to 1.8.8)_
     */
    arch?: ArchOption | ArchOption[];
    /**
     * Whether to package the application's source code into an archive, using [Electron's
     * archive format](https://github.com/electron/asar). Reasons why you may want to enable
     * this feature are described in [an application packaging tutorial in Electron's
     * documentation](https://electronjs.org/docs/tutorial/application-packaging/). When the value
     * is `true`, it passes the default configuration to the `asar` module. The configuration
     * values can be customized when the value is an `Object`. Supported sub-options include, but
     * are not limited to:
     * - `ordering` (*string*): A path to an ordering file for packing files. An explanation can be
     *   found on the [Atom issue tracker](https://github.com/atom/atom/issues/10163).
     * - `unpack` (*string*): A [glob expression](https://github.com/isaacs/minimatch#features),
     *   when specified, unpacks the file with matching names to the `app.asar.unpacked` directory.
     * - `unpackDir` (*string*): Unpacks the dir to the `app.asar.unpacked` directory whose names
     *   exactly or pattern match this string. The `asar.unpackDir` is relative to [[dir]].
     *
     * Defaults to `false`.
     *
     * Some examples:
     *
     * - `asar.unpackDir = 'sub_dir'` will unpack the directory `/<dir>/sub_dir`
     * - `asar.unpackDir = path.join('**', '{sub_dir1/sub_sub_dir,sub_dir2}', '*')` will unpack the directories `/<dir>/sub_dir1/sub_sub_dir` and `/<dir>/sub_dir2`, but it will not include their subdirectories.
     * - `asar.unpackDir = path.join('**', '{sub_dir1/sub_sub_dir,sub_dir2}', '**')` will unpack the subdirectories of the directories `/<dir>/sub_dir1/sub_sub_dir` and `/<dir>/sub_dir2`.
     * - `asar.unpackDir = path.join('**', '{sub_dir1/sub_sub_dir,sub_dir2}', '**', '*')` will unpack the directories `/<dir>/sub_dir1/sub_sub_dir` and `/<dir>/sub_dir2` and their subdirectories.
     *
     * **Note:** `asar` will have no effect if the [[prebuiltAsar]] option is set.
     */
    asar?: boolean | AsarOptions;
    /**
     * The build version of the application. Defaults to the value of the [[appVersion]] option.
     * Maps to the `FileVersion` metadata property on Windows, and `CFBundleVersion` on macOS.
     */
    buildVersion?: string;
    /**
     * Forces support for Mojave (macOS 10.14) dark mode in your packaged app. This sets the
     * `NSRequiresAquaSystemAppearance` key to `false` in your app's `Info.plist`.  For more information,
     * see the [Electron documentation](https://www.electronjs.org/docs/tutorial/mojave-dark-mode-guide)
     * and the [Apple developer documentation](https://developer.apple.com/documentation/appkit/nsappearancecustomization/choosing_a_specific_appearance_for_your_app).
     *
     * @category macOS
     */
    darwinDarkModeSupport?: boolean;
    /**
     * Whether symlinks should be dereferenced during the copying of the application source.
     * Defaults to `true`.
     *
     * **Note:** `derefSymlinks` will have no effect if the [[prebuiltAsar]] option is set.
     */
    derefSymlinks?: boolean;
    /**
     * If present, passes custom options to [`@electron/get`](https://npm.im/@electron/get). See
     * the module for option descriptions, proxy support, and defaults. Supported parameters
     * include, but are not limited to:
     * - `cacheRoot` (*string*): The directory where prebuilt, pre-packaged Electron downloads are cached.
     * - `mirrorOptions` (*Object*): Options to override the default Electron download location.
     * - `rejectUnauthorized` (*boolean* - default: `true`): Whether SSL certificates are required to be
     *   valid when downloading Electron.
     *
     * **Note:** `download` sub-options will have no effect if the [[electronZipDir]] option is set.
     */
    download?: ElectronDownloadOptions;
    /**
     * The Electron version with which the app is built (without the leading 'v') - for example,
     * [`1.4.13`](https://github.com/electron/electron/releases/tag/v1.4.13). See [Electron
     * releases](https://github.com/electron/electron/releases) for valid versions. If omitted, it
     * will use the version of the nearest local installation of `electron`,
     * `electron-prebuilt-compile`, or `electron-prebuilt`, defined in `package.json` in either
     * `devDependencies` or `dependencies`.
     */
    electronVersion?: string;
    /**
     * The local path to a directory containing Electron ZIP files for Electron Packager to unzip, instead
     * of downloading them. The ZIP filenames should be in the same format as the ones downloaded from the
     * [Electron releases](https://github.com/electron/electron/releases) site.
     *
     * **Note:** Setting this option prevents the [[download]] sub-options from being used, as
     * the functionality gets skipped over.
     */
    electronZipDir?: string;
    /**
     * The name of the executable file, sans file extension. Defaults to the value for the [[name]]
     * option. For `darwin` or `mas` target platforms, this does not affect the name of the
     * `.app` folder - this will use the [[name]] option instead.
     */
    executableName?: string;
    /**
     * When the value is a string, specifies the filename of a `plist` file. Its contents are merged
     * into the app's `Info.plist`.
     * When the value is an `Object`, it specifies an already-parsed `plist` data structure that is
     * merged into the app's `Info.plist`.
     *
     * Entries from `extendInfo` override entries in the base `Info.plist` file supplied by
     * `electron`, `electron-prebuilt-compile`, or `electron-prebuilt`, but are overridden by other
     * options such as [[appVersion]] or [[appBundleId]].
     *
     * @category macOS
     */
    extendInfo?: string | { [property: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
    /**
     * One or more files to be copied directly into the app's `Contents/Resources` directory for
     * macOS target platforms, and the `resources` directory for other target platforms.
     */
    extraResource?: string | string[];
    /**
     * The bundle identifier to use in the application helper's `Info.plist`.
     *
     * @category macOS
     */
    helperBundleId?: string;
    /**
     * The local path to the icon file, if the target platform supports setting embedding an icon.
     *
     * Currently you must look for conversion tools in order to supply an icon in the format required by the platform:
     *
     * - macOS: `.icns`
     * - Windows: `.ico` ([See the readme](https://github.com/electron/electron-packager#building-windows-apps-from-non-windows-platforms) for details on non-Windows platforms)
     * - Linux: this option is not supported, as the dock/window list icon is set via
     *   [the `icon` option in the `BrowserWindow` constructor](https://electronjs.org/docs/api/browser-window/#new-browserwindowoptions).
     *   *Please note that you need to use a PNG, and not the macOS or Windows icon formats, in order for it
     *   to show up in the dock/window list.* Setting the icon in the file manager is not currently supported.
     *
     * If the file extension is omitted, it is auto-completed to the correct extension based on the
     * platform, including when [[platform|`platform: 'all'`]] is in effect.
     */
    icon?: string;
    /**
     * One or more additional [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
     * patterns which specify which files to ignore when copying files to create the app bundle(s). The
     * regular expressions are matched against the absolute path of a given file/directory to be copied.
     *
     * **Please note that [glob patterns](https://en.wikipedia.org/wiki/Glob_%28programming%29) will not work.**
     *
     * The following paths are always ignored (*when you aren't using an [[IgnoreFunction]]*):
     *
     * - the directory specified by the [[out]] option
     * - the temporary directory used to build the Electron app
     * - `node_modules/.bin`
     * - `node_modules/electron`
     * - `node_modules/electron-prebuilt`
     * - `node_modules/electron-prebuilt-compile`
     * - `.git`
     * - files and folders ending in `.o` and `.obj`
     *
     * **Note**: Node modules specified in `devDependencies` are ignored by default, via the
     * [[prune]] option.
     *
     * **Note:** `ignore` will have no effect if the [[prebuiltAsar]] option is set.
     */
    ignore?: RegExp | RegExp[] | IgnoreFunction;
    /**
     * Ignores [system junk files](https://github.com/sindresorhus/junk) when copying the Electron app,
     * regardless of the [[ignore]] option.
     *
     * **Note:** `junk` will have no effect if the [[prebuiltAsar]] option is set.
     */
    junk?: boolean;
    /**
     * The application name. If omitted, it will use the `productName` or `name` value from the
     * nearest `package.json`.
     *
     * **Regardless of source, characters in the Electron app name which are not allowed in all target
     * platforms' filenames (e.g., `/`), will be replaced by hyphens (`-`).**
     */
    name?: string;
    /**
     * If present, notarizes macOS target apps when the host platform is macOS and XCode is installed.
     * See [`electron-notarize`](https://github.com/electron/electron-notarize#method-notarizeopts-promisevoid)
     * for option descriptions, such as how to use `appleIdPassword` safely or obtain an API key.
     *
     * **Requires the [[osxSign]] option to be set.**
     *
     * @category macOS
     */
    osxNotarize?: OsxNotarizeOptions;
    /**
     * If present, signs macOS target apps when the host platform is macOS and XCode is installed.
     * When the value is `true`, pass default configuration to the signing module. See
     * [electron-osx-sign](https://npm.im/electron-osx-sign#opts---options) for sub-option descriptions and
     * their defaults. Options include, but are not limited to:
     * - `identity` (*string*): The identity used when signing the package via `codesign`.
     * - `entitlements` (*string*): The path to the 'parent' entitlements.
     * - `entitlements-inherit` (*string*): The path to the 'child' entitlements.
     *
     * @category macOS
     */
    osxSign?: true | OsxSignOptions;
    /**
     * The base directory where the finished package(s) are created.
     *
     * Defaults to the current working directory.
     */
    out?: string;
    /**
     * Whether to replace an already existing output directory for a given platform (`true`) or
     * skip recreating it (`false`). Defaults to `false`.
     */
    overwrite?: boolean;
    /**
     * The target platform(s) to build for.
     *
     * Not required if the [[all]] option is set. If `platform` is set to `all`, all officially
     * supported target platforms for the target architectures specified by the [[arch]] option
     * will be built. Arbitrary combinations of individual platforms are also supported via a
     * comma-delimited string or array of strings.
     *
     * The official non-`all` values correspond to the platform names used by [Electron
     * releases](https://github.com/electron/electron/releases). This value is not restricted to
     * the official set if [[download|`download.mirrorOptions]] is set.
     *
     * Defaults to the platform of the host computer running Electron Packager.
     *
     * Platform values for the official prebuilt Electron binaries:
     * - `darwin` (macOS)
     * - `linux`
     * - `mas` (macOS, specifically for submitting to the Mac App Store)
     * - `win32`
     */
    platform?: PlatformOption | PlatformOption[];
    /**
     * The path to a prebuilt ASAR file.
     *
     * **Note:** Setting this option prevents the following options from being used, as the functionality
     * gets skipped over:
     *
     * - [[asar]]
     * - [[afterCopy]]
     * - [[afterPrune]]
     * - [[derefSymlinks]]
     * - [[ignore]]
     * - [[junk]]
     * - [[prune]]
     */
    prebuiltAsar?: string;
    /**
     * The URL protocol schemes associated with the Electron app.
     *
     * @category macOS
     */
    protocols?: MacOSProtocol[];
    /**
     * Walks the `node_modules` dependency tree to remove all of the packages specified in the
     * `devDependencies` section of `package.json` from the outputted Electron app.
     *
     * Defaults to `true`.
     *
     * **Note:** `prune` will have no effect if the [[prebuiltAsar]] option is set.
     */
    prune?: boolean;
    /**
     * If `true`, disables printing informational and warning messages to the console when
     * packaging the application. This does not disable errors.
     *
     * Defaults to `false`.
     */
    quiet?: boolean;
    /**
     * The base directory to use as a temporary directory. Set to `false` to disable use of a
     * temporary directory. Defaults to the system's temporary directory.
     */
    tmpdir?: string | false;
    /**
     * Human-readable descriptions of how the Electron app uses certain macOS features. These are displayed
     * in the App Store. A non-exhaustive list of available properties:
     *
     * * `Camera` - required for media access API usage in macOS Catalina
     * * `Microphone` - required for media access API usage in macOS Catalina
     *
     * Valid properties are the [Cocoa keys for MacOS](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html)
     * of the pattern `NS(.*)UsageDescription`, where the captured group is the key to use.
     *
     * Example:
     *
     * ```javascript
     * {
     *   usageDescription: {
     *     Camera: 'Needed for video calls',
     *     Microphone: 'Needed for voice calls'
     *   }
     * }
     * ```
     *
     * @category macOS
     */
    usageDescription?: { [property: string]: string };
    /**
     * Application metadata to embed into the Windows executable.
     * @category Windows
     */
    win32metadata?: Win32MetadataOptions;
  }
}

export = electronPackager;
