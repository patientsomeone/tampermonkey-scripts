"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
class Character {
    constructor(r20Id) {
        this.getName = () => {
            return this.characterName;
        };
        this.getHealth = () => {
            return this.characterHealth;
        };
        const thisChar = Campaign.characters._byId[r20Id];
        this.characterName = thisChar.attributes.name;
        this.characterHealth.current = parseInt(thisChar.view.$charsheet.find("[name='attr_hp']")[0].value, 10);
        this.characterHealth.max = parseInt(thisChar.view.$charsheet.find("[name='attr_hp_max']")[0].value, 10);
    }
}
exports.Character = Character;
