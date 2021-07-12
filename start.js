// Copyright 2017 Sebastian Ouellette

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const url = require('url');
const pack = require('./package.json');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1300,
        height: 750,
        frame: false,
        backgroundColor: '#FFF',
        webPreferences: { 
            nodeIntegration: true, // Use node in the render js files
            contextIsolation: false, // Makes node in the render js files work in newer electron versions
            enableRemoteModule: true // Allow the remote module to be used in the render js files
        },
        icon: __dirname + '/resources/icons/logo.png',
    });

    win.loadURL(
        url.pathToFileURL(path.join(__dirname, 'dontOpenMe.html')).toString()
    );

    // win.webContents.on('new-window', (e, url) => {
    //     e.preventDefault();
    //     electron.shell.openExternal(url.replace(/\/$/, ''));
    // });
    win.webContents.setWindowOpenHandler(({ url }) => {
        e.preventDefault();
        electron.shell.openExternal(url.replace(/\/$/, ''));
        return { action: 'allow' }
      })

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
