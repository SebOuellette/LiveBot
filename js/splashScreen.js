function hideSplashScreen() {
    document.getElementById('splashLoading').style.opacity = '0';
    setTimeout(() => document.getElementById('percentageText').style.opacity = '0', 2000);
    setTimeout(() => document.getElementById('loadingBar').style.opacity = '0', 2000);
    setTimeout(() => document.getElementById('splashScreen').style.opacity = '0', 3000);
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


async function showSplashScreen(token = undefined) {
    if(!token) return;

    let error = (await setToken(token));

    if (!error[0])
        document.getElementById('splashScreen').style.visibility = 'visible';
    else {
        errorHandler(error[1]);
    }
}