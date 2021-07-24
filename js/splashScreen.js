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

function hideSplashScreen() {
    if (!settings.options.splash) return;

    settings.options.splash = false;
    document.getElementById('splashLoading').style.opacity = '0';
    setTimeout(
        () => (document.getElementById('percentageText').style.opacity = '0'),
        2000
    );
    setTimeout(
        () => (document.getElementById('loadingBar').style.opacity = '0'),
        2000
    );
    setTimeout(
        () => (document.getElementById('splashScreen').style.opacity = '0'),
        3000
    );
    setTimeout(() => {
        document.getElementById('splashScreen').style.visibility = 'hidden';

        // Reset opacity of inner elements
        setTimeout(() => {
            document.getElementById('percentageText').style.opacity = '1';
            document.getElementById('loadingBar').style.opacity = '1';
            document.getElementById('splashScreen').style.opacity = '1';
            setLoadingPerc(0);
        }, 1500);
    }, 3500);
}

async function showSplashScreen(token = undefined, save = false) {
    if (settings.options.splash) return;

    if (!token) return;
    let error;
    if (save) error = await saveToken(token);
    else error = await setToken(token);

    if (!error[0]) {
        settings.options.splash = true;
        document.getElementById('splashScreen').style.visibility = 'visible';
    } else {
        errorHandler(error[1]);
    }
}
