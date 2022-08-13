import {anyObject, anyStandard} from "../globalTypes";

export type campaign = {
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
