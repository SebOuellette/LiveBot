/**
 * Runs the `rcedit` Windows binary (via Wine on macOS/Linux) to modify the metadata of a
 * Windows executable.
 *
 * @param exePath - the path to the Windows executable to be modified
 * @param options - metadata used to update the Windows executable
 */
declare function rcedit (exePath: string, options: rcedit.Options): Promise<void>

/* eslint-disable-next-line no-redeclare */
declare namespace rcedit {
  /** See [MSDN](https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2015/deployment/trustinfo-element-clickonce-application?view=vs-2015#requestedexecutionlevel) for details. */
  type RequestedExecutionLevel = 'asInvoker' | 'highestAvailable' | 'requireAdministrator'
  /**
   * Basic user-supplied metadata embedded in the application. Docstrings are copied from MSDN.
   *
   * See [MSDN](https://docs.microsoft.com/en-us/windows/win32/menurc/stringfileinfo-block) for details.
   */
  interface VersionStringOptions {
    /** Additional information that should be displayed for diagnostic purposes. */
    Comments?: string
    /** Company that produced the executable. */
    CompanyName?: string
    /** File description to be presented to users. */
    FileDescription?: string
    /** Internal name of the file. Usually, this string should be the original filename, without the extension. */
    InternalFilename?: string
    /** Copyright notices that apply, including the full text of all notices, legal symbols, copyright dates, etc. */
    LegalCopyright?: string
    /** Trademarks and registered trademarks, including the full text of all notices, legal symbols, trademark numbers, etc. */
    LegalTrademarks1?: string
    /** Trademarks and registered trademarks, including the full text of all notices, legal symbols, trademark numbers, etc. */
    LegalTrademarks2?: string
    /** Original name of the file, not including a path. */
    OriginalFilename?: string
    /** Name of the product with which the file is distributed. */
    ProductName?: string
  }
  /**
   * EXE metadata that can be changed.
   */
  interface Options {
    /** The metadata within a version-information resource. */
    'version-string'?: VersionStringOptions
    /**
     * See [MSDN](https://docs.microsoft.com/en-us/windows/win32/msi/version) for the version format.
     */
    'file-version'?: string
    /**
     * See [MSDN](https://docs.microsoft.com/en-us/windows/win32/msi/version) for the version format.
     */
    'product-version'?: string
    /**
     * Absolute path to the [ICO-formatted icon](https://en.wikipedia.org/wiki/ICO_(file_format))
     * to set as the application's icon.
     */
    icon?: string
    /** See [MSDN](https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2015/deployment/trustinfo-element-clickonce-application?view=vs-2015#requestedexecutionlevel) for details. */
    'requested-execution-level'?: RequestedExecutionLevel
    /**
     * The path to the [application manifest](https://docs.microsoft.com/en-us/windows/win32/sbscs/application-manifests)
     * XML that is to be embedded in the EXE.
     */
    'application-manifest'?: string
  }
}

export = rcedit
