import {AsyncUtil} from "../utilities/asyncUtil";
import {log, logLine} from "../utilities/log";
import {} from "../utilities/debugLog";

/* Import the Campaign type */
import {campaign} from "./.r20Types.d";
import {each} from "jquery";
/* Declare Campaign as Global Constant */
declare const Campaign: campaign;

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
            const currentCharacter = individualItem as campaign["characters"]["_byId"][0];

            return console.log(currentCharacter.attributes.name);
        };

        return AsyncUtil.eachOfSeries(allCharacters, eachCharacter);
    }
};

tmRoll20.allCharacters();