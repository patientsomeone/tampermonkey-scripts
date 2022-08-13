import { log, logLine } from "../utilities/log";

import { LoadUrl } from "../utilities/urlLoader";

LoadUrl.single(url)
    .then((urlData) => {
        log(urlData);
    })
    .catch(() => {
        
    });

// Additional Line