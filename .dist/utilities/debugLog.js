var isDebug = true;
var debugLog = function (msg) {
    if (!isDebug) {
        return;
    }
    else {
        console.log(msg);
    }
};
var log = function (msg) {
    console.log(msg);
};
