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

    createButton: () => {
        const activationCta = document.createElement("button");
        const body = document.querySelector("body");

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

    setButton: (status) => {
        const activationCta = document.querySelector("#tmActivatorButton");

        const statusSets = {
            end: () => {
                activationCta.removeEventListener("click", window.tmArlo.start);
                activationCta.addEventListener("click", window.tmArlo.end);
            },
            initialize: () => {
                activationCta.addEventListener("click", window.tmArlo.start);
            },
            start: () => {
                activationCta.removeEventListener("click", window.tmArlo.end);
                activationCta.addEventListener("click", window.tmArlo.start);
            }
        };

        if (!statusSets.hasOwnProperty(status)) {
            console.error("Unable to set Button Status");
            console.warn(`${status} does not exist`);
        } else {
            statusSets[status]();
        }

    },

    playAll: () => {
        const playButtons = document.querySelectorAll(".arlo-cp.camera-play-live");
        const totalPlayButtons = playButtons.length;

        for (let i = 0; i < totalPlayButtons; i += 1) {
            console.log("Activating Camera");
            const thisplayButton = playButtons[i];
            if (!!thisplayButton) {
                window.tmArlo.camerasActivated += 1;
                thisplayButton.click();
            }
        };

        setTimeout(null, 1500);
    },

    stopAll: () => {
        const buttons = document.querySelectorAll(".cameras_box-inner .cameras-control.cameras-pause");
        const totalButtons = buttons.length;

        for (let i = 0; i < totalButtons; i += 1) {
            console.log("DeActivating Camera");
            const thisButton = buttons[i];
            if (!!thisButton) {
                window.tmArlo.camerasDeActivated += 1;
                thisButton.click();
            }
        }

        setTimeout(null, 1500);
    },

    checkActive: () => {
        const allCameras = document.querySelectorAll(".cameras-wrapper .arlo-cp.camera-play-live");
        window.tmArlo.cameraChecksMade = +1;
        return allCameras.length > 0;
    },

    checkTimeouts: () => {
        const allTimeouts = document.querySelectorAll(".cameras-wrapper .arlo-cp.camera-play-live .ng-star-inserted button");
        window.tmArlo.timeoutChecksMade = +1;
        return allTimeouts.length > 0;
    },

    resetTimeouts: () => {
        const allTimeouts = document.querySelectorAll(".cameras-wrapper .arlo-cp.camera-play-live .ng-star-inserted button")
        const totalTimeouts = allTimeouts.length;

        for (let i = 0; i < totalTimeouts; i += 1) {
            console.log("Activating Camera");
            const thisTimeout = allTimeouts[i];
            if (!!thisTimeout) {
                window.tmArlo.timeoutsActivated += 1;
                thisTimeout.click();
            }
        }
    },

    needsLogin: () => {
        const loginButton = document.querySelectorAll("button.login-button");
        return loginButton.length > 0;
    },

    timeoutId: 0,

    run: () => {
        window.tmArlo.timeoutId = setTimeout(window.tmArlo.initialize, 500);
    },

    initialize: () => {
        clearTimeout(window.tmArlo.timeoutId);

        if (window.tmArlo.checkTimeouts()) {
            window.tmArlo.resetTimeouts();
            setTimeout(null, 3000);
        };

        if (window.tmArlo.checkActive()) {
            window.tmArlo.playAll();
        };

        window.tmArlo.run();
    },

    end: () => {
        clearTimeout(window.tmArlo.timeoutId);
        document.querySelector("#arlo-header.header").style.display = "block";
        window.tmArlo.stopAll();
        window.tmArlo.setButton("start");
    },

    start: () => {
        if (!window.tmArlo.needsLogin()) {
            console.log("Starting Arlo Activator");
            document.querySelector("#arlo-header.header").style.display = "none";
            window.tmArlo.setButton("end");
            window.tmArlo.initialize();
        } else {
            console.error("Unable to Start Stream");
            console.warn("Login Required");
        }
    }
}

if (document.readyState === "complete") {
    window.tmArlo.createButton();
} else {
    window.addEventListener("load", window.tmArlo.createButton);
}