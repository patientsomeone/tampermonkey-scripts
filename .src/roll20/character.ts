class Character {
    private characterName: string;
    private characterHealth: {
        current: number;
        max: number;
    };

    constructor(r20Id: string) {
        const thisChar = Campaign.characters._byId[r20Id];

        this.characterName = thisChar.attributes.name;
        this.characterHealth.current = parseInt(thisChar.view.$charsheet.find("[name='attr_hp']")[0].value, 10);
        this.characterHealth.max = parseInt(thisChar.view.$charsheet.find("[name='attr_hp_max']")[0].value, 10);
    }

    public getName = () => {
        return this.characterName;
    };

    public getHealth = () => {
        return this.characterHealth;
    };
}
var tmTest = () => {
    console.warn("Running Tampermonkey Test");
    return;
};
