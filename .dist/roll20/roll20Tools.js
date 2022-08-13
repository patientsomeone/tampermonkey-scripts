"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncUtil_1 = require("../utilities/asyncUtil");
const tmRoll20 = {
    fetchPlayers: () => {
        console.log("I will Fetch Players");
    },
    roundCounter: () => {
        const counterWindow = "";
        console.log("I will count rounds");
    },
    allCharacters: () => {
        const allCharacters = Campaign.characters._byId;
        const eachCharacter = (individualItem, key, triggerNext, triggerCounter) => {
            const currentCharacter = individualItem;
            return console.log(currentCharacter.attributes.name);
        };
        return asyncUtil_1.AsyncUtil.eachOfSeries(allCharacters, eachCharacter);
    }
};
tmRoll20.allCharacters();
