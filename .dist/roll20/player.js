class Player {
    constructor(r20Id) {
        this.characterName = Campaign.characters._byId[r20Id].attributes.name;
    }
}
