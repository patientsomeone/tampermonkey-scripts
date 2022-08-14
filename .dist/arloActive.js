// ==UserScript==
// @name         Arlo Keep Active
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keep Arlo videos active
// @author       PatientSomeone
// @match        https://my.arlo.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=arlo.com
// @grant        none
// ==/UserScript==
window.tmArlo = {
    camerasActivated: 0,
    camerasDeActivated: 0,
    timeoutsActivated: 0,
    cameraChecksMade: 0,
    timeoutChecksMade: 0,
    createButton: function () {
        var activationCta = document.createElement("button");
        var body = document.querySelector("body");
        activationCta.innerHTML = "Start Stream";
        activationCta.id = "tmActivatorButton";
        activationCta.style.position = "absolute";
        activationCta.style.top = "126px";
        activationCta.style.left = "-23px";
        activationCta.style.background = "mediumblue";
        activationCta.style.color = "white";
        activationCta.style.height = "2em";
        activationCta.style["border-radius"] = "5px";
        activationCta.style.cursor = "pointer";
        activationCta.style["z-index"] = "50";
        activationCta.style.transform = "rotate(-90deg)";
        body.appendChild(activationCta);
        window.tmArlo.setButton("initialize");
    },
    setButton: function (status) {
        var activationCta = document.querySelector("#tmActivatorButton");
        var statusSets = {
            end: function () {
                activationCta.removeEventListener("click", window.tmArlo.start);
                activationCta.addEventListener("click", window.tmArlo.end);
            },
            initialize: function () {
                activationCta.addEventListener("click", window.tmArlo.start);
            },
            start: function () {
                activationCta.removeEventListener("click", window.tmArlo.end);
                activationCta.addEventListener("click", window.tmArlo.start);
            }
        };
        if (!statusSets.hasOwnProperty(status)) {
            console.error("Unable to set Button Status");
            console.warn("".concat(status, " does not exist"));
        }
        else {
            statusSets[status]();
        }
    },
    playAll: function () {
        var playButtons = document.querySelectorAll(".arlo-cp.camera-play-live");
        var totalPlayButtons = playButtons.length;
        for (var i = 0; i < totalPlayButtons; i += 1) {
            console.log("Activating Camera");
            var thisplayButton = playButtons[i];
            if (!!thisplayButton) {
                window.tmArlo.camerasActivated += 1;
                thisplayButton.click();
            }
        }
        ;
        setTimeout(null, 1500);
    },
    stopAll: function () {
        var buttons = document.querySelectorAll(".cameras_box-inner .cameras-control.cameras-pause");
        var totalButtons = buttons.length;
        for (var i = 0; i < totalButtons; i += 1) {
            console.log("DeActivating Camera");
            var thisButton = buttons[i];
            if (!!thisButton) {
                window.tmArlo.camerasDeActivated += 1;
                thisButton.click();
            }
        }
        setTimeout(null, 1500);
    },
    checkActive: function () {
        var allCameras = document.querySelectorAll(".cameras-wrapper .arlo-cp.camera-play-live");
        window.tmArlo.cameraChecksMade = +1;
        return allCameras.length > 0;
    },
    checkTimeouts: function () {
        var allTimeouts = document.querySelectorAll(".cameras-wrapper .arlo-cp.camera-play-live .ng-star-inserted button");
        window.tmArlo.timeoutChecksMade = +1;
        return allTimeouts.length > 0;
    },
    resetTimeouts: function () {
        var allTimeouts = document.querySelectorAll(".cameras-wrapper .arlo-cp.camera-play-live .ng-star-inserted button");
        var totalTimeouts = allTimeouts.length;
        for (var i = 0; i < totalTimeouts; i += 1) {
            console.log("Activating Camera");
            var thisTimeout = allTimeouts[i];
            if (!!thisTimeout) {
                window.tmArlo.timeoutsActivated += 1;
                thisTimeout.click();
            }
        }
    },
    needsLogin: function () {
        var loginButton = document.querySelectorAll("button.login-button");
        return loginButton.length > 0;
    },
    timeoutId: 0,
    run: function () {
        window.tmArlo.timeoutId = setTimeout(window.tmArlo.initialize, 500);
    },
    initialize: function () {
        clearTimeout(window.tmArlo.timeoutId);
        if (window.tmArlo.checkTimeouts()) {
            window.tmArlo.resetTimeouts();
            setTimeout(null, 3000);
        }
        ;
        if (window.tmArlo.checkActive()) {
            window.tmArlo.playAll();
        }
        ;
        window.tmArlo.run();
    },
    end: function () {
        clearTimeout(window.tmArlo.timeoutId);
        document.querySelector("#arlo-header.header").style.display = "block";
        window.tmArlo.stopAll();
        window.tmArlo.setButton("start");
    },
    start: function () {
        if (!window.tmArlo.needsLogin()) {
            console.log("Starting Arlo Activator");
            document.querySelector("#arlo-header.header").style.display = "none";
            window.tmArlo.setButton("end");
            window.tmArlo.initialize();
        }
        else {
            console.error("Unable to Start Stream");
            console.warn("Login Required");
        }
    }
};
if (document.readyState === "complete") {
    window.tmArlo.createButton();
}
else {
    window.addEventListener("load", window.tmArlo.createButton);
}
