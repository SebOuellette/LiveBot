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

"use strict";

let loadedThemes = [];

function loadThemes() {
    // Set the directory of the themes
    let dir = './themes/';

    // Get all the files in the themes folder
    let files = fs.readdirSync(dir);

    // Remove the template file out of the equasion if there is one
    if (files.includes('template.css'))
        files.splice(files.indexOf('template.css'), 1);

    // Don't bother loading if there is nothing
    if (!files.length) return;

    console.log('Loading themes...');

    files.forEach((file) => {
        if (!file.endsWith('.css')) return;

        let script = document.createElement('link');
        script.id = file;
        script.rel = 'stylesheet';
        script.href = dir + file;

        loadedThemes.push([script, file]);

        document.head.appendChild(script);
        console.log('\n%c  ' + file + ' loaded', 'color:Lime');
    });
}

function unloadThemes() {
    // If there's nothing there don't bother
    if (!loadedThemes.length) return;

    // Display that the themes are being unloaded
    console.log('Unloading themes...');

    // Go through each of the elements that are saved in the memory
    for (element of loadedThemes) {
        document.head.removeChild(element[0]);
        console.log('%c  ' + element[1] + ' unloaded', 'color:Red');
    }
    // Delete all the elements that were once loaded
    loadedThemes = [];
}
