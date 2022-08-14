"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmTest = void 0;
var Character = /** @class */ (function () {
    function Character(r20Id) {
        var _this = this;
        this.getName = function () {
            return _this.characterName;
        };
        this.getHealth = function () {
            return _this.characterHealth;
        };
        var thisChar = Campaign.characters._byId[r20Id];
        this.characterName = thisChar.attributes.name;
        this.characterHealth.current = parseInt(thisChar.view.$charsheet.find("[name='attr_hp']")[0].value, 10);
        this.characterHealth.max = parseInt(thisChar.view.$charsheet.find("[name='attr_hp_max']")[0].value, 10);
    }
    return Character;
}());
var tmTest = function () {
    console.warn("Running Tampermonkey Test");
    return;
};
exports.tmTest = tmTest;
