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

let loadAllScripts = () => {
    let files = fs.readdirSync('./scripts');

    // Remove the template file out of the equation if there is one
    if (files.includes('template.js'))
        files.splice(files.indexOf('template.js'), 1);

    // If there are no scripts don't even bother
    if (!files.length) return;

    // Preload all the scripts
    console.log('Loading scripts...');
    files.forEach((file) => {
        if (file.endsWith('.js') && file != 'template.js') {
            delete require.cache[require.resolve(`./scripts/${file}`)];

            require('./scripts/' + file);
            console.log(`%c  ${file} loaded!`, 'color:Green');
        }
    });

    // Start all the loaded scripts
    console.log('Starting scripts...');
    files.forEach((file) => {
        if (file.endsWith('.js')) {
            try {
                if (
                    !require.cache[require.resolve(`./scripts/${file}`)].exports
                        .start
                )
                    throw { message: '.exports.start is not a function' };
                console.log(`%c  ${file} started!`, 'color:Green');
                require.cache[
                    require.resolve(`./scripts/${file}`)
                ].exports.start();
            } catch (err) {
                // If it's missing the start function then display a short error and say which plugin it is
                if (err.message.includes('.exports.start is not a function'))
                    return console.log(
                        `%c  ${file} was unable to start`,
                        'color:Red'
                    );
                console.log(
                    `%c   ${file} was unable to start\n${err}`,
                    'color:Red'
                );
            }
        }
    });
};

let unloadAllScripts = () => {
    let files = fs.readdirSync('./scripts');

    // Stop and unload all the scripts
    console.log('Stopping scripts...');
    files.forEach((file) => {
        if (
            file.endsWith('.js') &&
            file != 'template.js' &&
            require.cache[require.resolve(`./scripts/${file}`)]
        ) {
            try {
                if (
                    !require.cache[require.resolve(`./scripts/${file}`)].exports
                        .stop
                )
                    throw { message: '.exports.stop is not a function' };
                console.log(`%c  ${file} stopped!`, 'color:Red');
                require.cache[
                    require.resolve(`./scripts/${file}`)
                ].exports.stop();
            } catch (err) {
                // If it's missing the start function then display a short error and say which plugin it is
                if (err.message.includes('.exports.stop is not a function'))
                    return console.log(
                        `%c  ${file} was unable to stop`,
                        'color:Red'
                    );
                console.log(
                    `%c   ${file} was unable to stop\n${err}`,
                    'color:Red'
                );
            }

            delete require.cache[require.resolve(`./scripts/${file}`)];
            console.log(`%c  ${file} unloaded!`, 'color:Red');
        }
    });
};

let getData = () => {
    let object = {};

    let files = fs.readdirSync('./scripts');

    files.forEach((file) => {
        if (file.endsWith('.js') && file != 'template.js') {
            object[file] =
                require.cache[
                    require.resolve(`./scripts/${file}`)
                ].exports.info;
            object[file].file = file;
        }
    });

    return object;
};
