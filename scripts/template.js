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

module.exports.info = {
    author: 'Your discord username and tag (ex: SharkFin#1504)',
    title: 'Name of your script',
    description: 'Description of your script',
    version: '1.0.0',
};

module.exports.start = () => {
    /*
    Global Variables Available:
    bot             - the Discord.client() that is signed in
    selectedChan    - the current channel you're in (Object, not the DOM)
    selectedGuild   - the current guild you're in 
    selectedVoice   - the last selected voice channel
                        This isn't really supported, but it's here for future use. If you need better accessibility with this variable, 
                        ask for it in the discord (which you can find on the readme) and we'll see what we can do
    */

    // Your code goes here

    myFunction();
};

module.exports.stop = () => {
    // This code will call when the script should be unloaded
};

function myFunction() {
    // You can make normal functions and call them from start()
}
