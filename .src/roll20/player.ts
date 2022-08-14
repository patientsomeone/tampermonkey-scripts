class Player {
    private characterName: string;
    
    constructor(r20Id: string) {
        this.characterName = Campaign.characters._byId[r20Id].attributes.name;
    }
}