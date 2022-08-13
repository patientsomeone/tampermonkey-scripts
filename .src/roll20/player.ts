import {campaign} from "./.r20Types.d";

declare const Campaign: campaign;

export class Player {
    private characterName: string;
    
    constructor(r20Id: string) {
        this.characterName = Campaign.characters._byId[r20Id].attributes.name;
    }
}