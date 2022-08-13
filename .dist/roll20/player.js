"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(r20Id) {
        this.characterName = Campaign.characters._byId[r20Id].attributes.name;
    }
}
exports.Player = Player;
