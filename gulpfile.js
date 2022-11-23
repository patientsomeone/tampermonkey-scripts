/* eslint-env node, gulp, es6*/
"use strict";
const gulp = require("gulp");
const fs = require("fs");
const replace = require("gulp-replace");
const prompt = require("gulp-prompt");
const rename = require("gulp-rename");
const cmd = require("child_process");
const opn = require("opn");
const debug = require("debug");
const log = debug("logger:message*");
const logError = debug("logger:error*");

const housekeep = () => {
    return new Promise((resolve) => {
        cmd.exec("git gc --auto", (error, out, data) => {
            if (error) {
                log("Pushing upstream failed...");
                log("Error:", error);
            } else {
                log("Performing housekeeping tasks...");
                if (!!out) {
                    log("Garbage Collector Output:\n", out);
                }
                if (!!data) {
                    log("Garbage Collector Data:\n:", data);
                }
                resolve();
            }
        });
    });
};

const promptBranch = () => {
    const thisDebug = debug("gulp:prompt");
    thisDebug("Arguments passed:", process.argv);
    return new Promise((resolve) => {
        // TODO: Fix needing this file twice https://github.com/Freyskeyd/gulp-prompt/issues/22
        gulp.src(["package.json"]).pipe(prompt.prompt({
            type: "input",
            name: "branch",
            message: "Please enter your Branch Name"
        }, function(res) {
            resolve(res.branch);
        }));
    });
};

const getStatus = () => {
    const thisDebug = debug("gulp:git:status");

    return new Promise((resolve, reject) => {
        cmd.exec("git status", (error, out) => {
            if (error) {
                log("Unable to retrieve git status...");
                logError("Error:", error);
                reject();
            } else {
                log("Successfully retrieved git status...");
                log("Status output:", out);
                thisDebug(out);
                resolve(out);
            }
        });
    });
};

const commitChanges = (branchName) => {
    const thisDebug = debug("gulp:git:status:commit");
    return new Promise((resolve) => {
        const getCount = ((status) => {
            const exp = new RegExp("by (\\d*)(?= commit)", "\g");
            const regExResult = exp.exec(status);

            return regExResult[1];
        });

        getStatus()
            .then((status) => {
                let curCount;
                thisDebug("Original status:", status);

                if (status.indexOf(`ahead of 'origin/${branchName.trim()}'`) >= 0) {
                    curCount = getCount(status);
                    // eslint-disable-next-line max-len
                    thisDebug(`Ahead of remote 'origin/$branchName' by ${curCount} commit${(curCount > 1 ? "s" : "")}.`);
                    resolve({
                        "required": true,
                        "count": getCount(status)
                    });
                } else {
                    thisDebug("Up to date");
                    resolve({
                        "required": false
                    });
                }
            });
    });
};

const unstagedChanges = () => {
    const thisDebug = debug("gulp:git:status:sanitized");
    return new Promise((resolve) => {
        getStatus()
            .then((status) => {
                thisDebug("Original status:", status);

                if (status.indexOf("Changes not staged for commit:") >= 0) {
                    thisDebug("Unstaged changes present");
                    resolve(true);
                } else {
                    thisDebug("No unstaged changes present");
                    resolve(false);
                }
            });
    });
};

const stashCurrentChanges = (branchName) => {
    const thisDebug = debug("gulp:git:stash");
    return new Promise((resolve, reject) => {
        cmd.exec("git stash", (error, out) => {
            if (error) {
                log("Unable to stash changes...");
                logError("Error:", error);
                reject();
            } else {
                log("Successfully stashed changes...");
                thisDebug("output:", out);

                resolve(branchName);
            }
        });
    });
};
const getCurrentBranch = () => {
    const thisDebug = debug("gulp:git:branch:get");
    return new Promise((resolve, reject) => {
        cmd.exec("git rev-parse --abbrev-ref HEAD", (error, out) => {
            if (error) {
                log("Locating current branch failed...");
                logError("Error:", error);
                reject();
            } else {
                thisDebug("Returning current branch...");
                thisDebug("output:", out);
                resolve(out);
            }
        });
    });
};

const pullMaster = () => {
    const thisDebug = debug("gulp:git:branch:pull:master");
    return new Promise((resolve, reject) => {
        cmd.exec("git pull origin master", (error, out, data) => {
            if (error) {
                log("Pulling Master branch failed...");
                logError("Error:", error);
                return reject();
            } else {
                log("Pulled from Master branch...");
                log("output:", out);
                thisDebug("Data", data);
                return housekeep()
                    .then(getCurrentBranch)
                    .then(resolve);
            }
        });
    });
};

const popStashedChanges = (branchName) => {
    const thisDebug = debug("gulp:git:stash:pop");
    return new Promise((resolve) => {
        const pop = () => {
            return new Promise((resolve) => {
                cmd.exec("git stash pop", (error, out) => {
                    if (error) {
                        log("Unable to pop stashed changes...");
                        logError("Error:", error);
                    } else {
                        log("Successfully popped stashed changes...");
                        thisDebug("output:", out);

                        resolve(branchName);
                    }
                });
            });
        };

        pullMaster()
            .then(pop)
            .then(resolve);
    });
};

const checkoutBranch = (branchName) => {
    const thisDebug = debug("gulp:git:branch:checkout");
    return new Promise((resolve) => {
        const branch = (branchName || "master");
        thisDebug(`Checking out ${branch}`);
        cmd.exec(`git checkout ${branch}`, (error, out, data) => {
            if (error) {
                log(`Checkout of ${branch} branch failed...`);
                thisDebug("Error:", error);
                log("\nContinuing from current branch. Some commits may be included");
            } else {
                log(`Checked out ${branch} branch...`);
                log("output:", out);
                thisDebug("Data", data);
            }

            resolve(branchName);
        });
    });
};

const stashCheckout = (branchName) => {
    const thisDebug = debug("gulp:git:stash:checkout");
    return new Promise((resolve) => {
        thisDebug("Stashing changes before checkout...");
        stashCurrentChanges(branchName)
            .then(checkoutBranch)
            .then(resolve);
    });
};




const pushCurrentCommits = (current, branchName) => {
    const thisDebug = debug("gulp:git:branch:push");
    return new Promise((resolve, reject) => {
        thisDebug("Pushing commits...");
        cmd.exec(`git push -u origin ${current}`, (error, out, data) => {
            if (error) {
                log("Pushing commits failed...");
                log("Error:", error);
                reject();
            } else {
                log("Successfully pushed commits...");
                thisDebug("Output:", out);
                log("Data:", data);
                resolve(branchName);
            }
        });
    });
};

const createNewBranch = (branchName) => {
    const thisDebug = debug("gulp:git:branch:create:new");
    return new Promise((resolve, reject) => {
        cmd.exec(`git checkout -b ${branchName}`, (error, out, data) => {
            if (error) {
                log("Creating branch failed...");
                log("Error:", error);
                return reject();
            } else {
                log(`Created Branch ${branchName}...`);
                thisDebug("output:", out);
                log("Data", data);
                return resolve(branchName);
            }
        });
    });
};

const promptStash = (branchName, newBranch, callback) => {
    const thisDebug = debug("gulp:git:prompt:stash");
    const nextFunc = () => {
        if (typeof callback === "function") {
            return new Promise((resolve) => {
                thisDebug("Executing callback", callback);
                callback(newBranch)
                    .then(resolve);
            });
        } else {
            return new Promise((resolve, reject) => {
                thisDebug("No callback provided for promptStash...");
                return reject(branchName);
            });
        }
    };
    return new Promise((resolve) => {

        const toStash = () => {
            return new Promise((resolve) => {
                unstagedChanges()
                    .then((stashRequired) => {
                        if (!stashRequired) {
                            thisDebug("No stashing is currently required. Continuing...");
                            nextFunc(branchName)
                                .then(resolve);
                        } else {
                            thisDebug("Uncommited changes identified. Prompting...");
                            gulp.src(["package.json"])
                                .pipe(prompt.prompt({
                                    "type": "list",
                                    "name": "selection",
                                    "message": "Current changes will be stashed\n How would you like to continue?",
                                    "choices": ["Stash Only", "Stash and Pop", "Cancel"],
                                    "pageSize": 2
                                }, function(res) {
                                    const actions = {
                                        "Stash Only": () => {
                                            thisDebug("Stash only selected");
                                            stashCheckout(branchName)
                                                .then(nextFunc)
                                                .then(resolve);
                                        },
                                        "Stash and Pop": () => {
                                            thisDebug("Stash and Pop selected");
                                            stashCheckout(branchName)
                                                .then(nextFunc)
                                                .then(popStashedChanges)
                                                .then(resolve);
                                        },
                                        "Cancel": () => {
                                            thisDebug("Cancel selected");
                                            log("Cancelled changes");
                                        }
                                    };

                                    thisDebug("Selection:", res.selection);
                                    if (actions.hasOwnProperty(res.selection)) {
                                        actions[res.selection]();
                                    } else {
                                        log("Rejected changes");
                                    }
                                }));
                        }
                    });
            });
        };
        const toCommit = () => {
            return new Promise((resolve, reject) => {
                getCurrentBranch()
                    .then((curBranch) => {
                        commitChanges(branchName)
                            .then((commit) => {
                                thisDebug("Commit Required:", commit.required);

                                if (!commit.required) {
                                    resolve(branchName);
                                } else {
                                    gulp.src(["package.json"])
                                        .pipe(prompt.prompt({
                                            "type": "list",
                                            "name": "selection",
                                            // eslint-disable-next-line max-len
                                            "message": `WARNING:\n ${curBranch.trim()} is ahead of remote by ${commit.count} commit${(commit.count > 1 ? "s" : "")} \n You may want to push ${curBranch.trim()} first...\n How would you like to continue?`,
                                            "choices": ["Push", "Continue As Is", "Cancel"],
                                            "pageSize": 3
                                        }, function(res) {
                                            const actions = {
                                                "Push": () => {
                                                    thisDebug("Push selected");
                                                    pushCurrentCommits(curBranch, branchName)
                                                        .then(resolve);
                                                },
                                                "Continue As Is": () => {
                                                    thisDebug("Continue As Is selected");
                                                    resolve();
                                                },
                                                "Cancel": () => {
                                                    thisDebug("Cancel selected");
                                                    log("Cancelled changes");
                                                }
                                            };

                                            thisDebug("Selection:", res.selection);
                                            if (actions.hasOwnProperty(res.selection)) {
                                                actions[res.selection]();
                                            } else {
                                                reject();
                                            }
                                        }));
                                }
                            });
                    });
            });
        };

        toCommit()
            .then(toStash)
            .then(resolve);
    });
};



const createBranch = (branchName) => {
    const thisDebug = debug("gulp:git:branch:create");
    return new Promise((resolve) => {
        const knownBranches = () => {
            return new Promise((resolve, reject) => {
                cmd.exec("git branch", (error, out) => {
                    if (error) {
                        log("Unable to retrieve known branches...");
                        thisDebug("Error:", error);
                        reject();
                    } else {
                        log("Retrieved known branches...");
                        thisDebug("output:", out);
                        resolve(out);
                    }
                });
            });
        };

        const checkBranch = (curBranch) => {
            return new Promise((resolve) => {
                knownBranches()
                    .then((known) => {
                        if (known.indexOf(branchName) < 0) {
                            thisDebug("Branch unknown, creating...");
                            promptStash(curBranch, branchName, createNewBranch)
                                .then(resolve);
                        } else {
                            thisDebug("Branch known, checkout...");
                            promptStash(curBranch, branchName, checkoutBranch)
                                .then(resolve);
                        }
                    });
            });
        };

        getCurrentBranch()
            .then((current) => {
                if (branchName === current) {
                    resolve(branchName);
                } else {
                    checkBranch(current)
                        .then(resolve);
                }
            });
    });
};
const createPullRequest = (branchName) => {
    const thisDebug = debug("gulp:git:branch:pull:request");
    return new Promise((resolve, reject) => {
        const snatchUrl = (input) => {
            const branchBased = (function() {
                const check = new RegExp(`(http)(.*)(${branchName.trim()})`, "g");

                return (input.match(check) && input.match(check)[0] || false);
            }());
            const numberBased = (function() {
                const check = new RegExp("(http)(.*)(\\d)", "g");

                return (input.match(check) && input.match(check)[0] || false);
            }());

            return (branchBased || numberBased);
        };

        const checkPull = (input) => {
            const check = new RegExp("Everything up-to-date", "g");
            const pullRequestCreated = !input.match(check);

            if (pullRequestCreated) {
                const pullUrl = snatchUrl(input);
                log("Launching pull request located at:", pullUrl, "...");
                opn(pullUrl, { wait: false });
            } else {
                log("Branch up to date; No pull request created");
            }
        };

        cmd.exec(`git push -u origin ${branchName}`, (error, out, data) => {
            if (error) {
                log("Pushing upstream failed...");
                log("Error:", error);
                reject();
            } else {
                const pullUrl = snatchUrl(data);
                log("Successfully pushed upstream...");
                thisDebug("Output:", out);
                log("Data:", data);
                checkPull(data);
                resolve(branchName);
            }
        });
    });
};

gulp.task("createPullRequest", function() {
    const thisDebug = debug("gulp:task:createPullRequest");
    getCurrentBranch().then((branchName) => {
        if (branchName !== "master") {
            return pullMaster().then(
                createPullRequest(branchName)
            );
        } else {
            thisDebug("Unable to create pull request from branch Master");
            return promptBranch()
                .then(checkoutBranch)
                .then(pullMaster)
                .then(createPullRequest);
        }
    });
});

gulp.task("createBranch", () => {
    promptBranch()
        .then(createBranch)
        .then(pullMaster);
});

gulp.task("pullMaster", () => {
    return pullMaster();
});

gulp.task("prune", () => {
    const executePrune = () => {
        housekeep();
    };

    pullMaster()
        .then(executePrune);

});