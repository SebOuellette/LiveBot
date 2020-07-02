// Custom error messages
function errorHandler(err){
    let code = err.code ? err.code : err;
    switch(code){
        case('NO-TOKEN'):
            console.error('There is no token stored');
            settings.functions.openSettings('User');
            break;
        case('EMPTY-TOKEN'):
            console.error('The token is empty');
            break;
        case('TOKEN_INVALID'):
            console.error('Invalid Token');
            break;
        case('SHARDING_REQUIRED'):
            console.error('Sharding is not a feature yet');
            break;
        case('EMPTY-NAME'):
            console.error('Username is empty or contains invalid characters')
            break;
        default:
            console.error(`Error code: ${err.code}\n${err}`);
            break;
    }
}