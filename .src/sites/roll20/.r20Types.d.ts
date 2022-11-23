/* Declare Campaign as Global Constant */
declare const Campaign: campaign;

type campaign = {
    characters: {
        _byId: {
            [key: string]: {
                attributes: {
                    name: string;
                };
                view: {
                    ["$charsheet"]: {
                        find: (selector: string) => {
                            [key: number]: {
                                value: string
                            }
                        };
                    };
                };
            };
        };
    };
};
