var Player = /** @class */ (function () {
    function Player(r20Id) {
        this.characterName = Campaign.characters._byId[r20Id].attributes.name;
    }
    return Player;
}());
