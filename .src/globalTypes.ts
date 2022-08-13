/* Sanitized "any" */
export type anyStandard = (string | number | boolean | anyObject);

/* Object Definitions */
export type anyObject = {
    [key: string]: anyStandard;
};