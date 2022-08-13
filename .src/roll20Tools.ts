// ==UserScript==
// @name         Roll 20 Player Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.roll20.net/editor/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=roll20.net
// @grant        none
// ==/UserScript==

const tmRoll20 = {
    test: () => {
        console.log("TamperMonkey Active");
    }
};

console.log("Is Listening");

tmRoll20.test();
