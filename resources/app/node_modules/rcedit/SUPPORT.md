# Support for `node-rcedit`

## Troubleshooting

This module uses the [`debug`](https://npm.im/debug) module to print out debugging information. To
use it, consult your operating system's documentation on setting environment variables _([Windows
notes](https://github.com/visionmedia/debug#windows-command-prompt-notes))_. Set the `DEBUG`
environment variable to `rcedit`, and it will print out information, including any `STDERR` output
from `rcedit.exe`/`rcedit-x64.exe`.
