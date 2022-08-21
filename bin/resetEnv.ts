/* eslint-disable no-console */
/* Native Node Modules */
import * as fs from "fs";
import {unlink, readdir} from "fs/promises";
import * as path from "path";

/* Typings */
import {anyObject, anyStandard} from "./globalTypes";

// const fileList = [
//     "../package-lock.json"
// ];

const folderList = [
    "./test"
    // "../package-lock.json",
    // "../node_modules"
];

const debug = false;
const debLog = (msg) => {
    if (!!debug) {
        return;
    } else {
        return console.error(msg);
    }
};

const promiseLoop = (
    data: anyObject | anyStandard[],
    forEach: (data: anyObject | anyStandard[], key: string | number) => Promise<void>
) => {
    return new Promise((resolve: (value: void) => void, reject) => {
        if (Array.isArray(data)) {
            const arr = data;
            for (let i = arr.length - 1; i >= 0; i -= 1) {
                const current = arr[i];

                console.log(current);

                if (typeof forEach === "function") {
                    void (async () => {
                        /* Do Work */
                        await forEach(arr, i).catch((err) => {
                            console.error(err);

                            reject(err);
                        });
                    })();
                }
            }

            resolve();
        } else if (typeof data === "object") {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const current = data[key] as anyObject;
                    console.log(current);

                    void (async () => {
                        /** Process each object entry */
                        if (typeof forEach === "function") {
                            await forEach(current, key).catch((err) => {
                                console.error(err);

                                reject(err);
                            });
                        }
                    })();
                }
            }
            resolve();
        } else {
            reject("Provided data is not an Array or Object");
        }
    });
};

const removeFile = (path: string) => {
    const processError = (err: {message?: string;}) => {
        if (err.message.indexOf("no such file or directory") >= 0) {
            debLog("removeFile.newPromise.processError.if.no_such_file");
            console.log(`File ${path} does not exist, continuing.`);
            return Promise.resolve();
        } else {
            debLog("removeFile.newPromise.processError.if.else.no_such_file");
            console.error(err);
            return Promise.reject(err);
        }
    };

    return unlink(`${__dirname}/${path}`).catch((err: {message?: string;}) => {
        console.error(err);
        return processError(err);
    });

    // return new Promise((resolve, reject) => {
    //     debLog("removeFile.newPromise");

    //     const processError = (err) => {
    //         if (err.message.indexOf("no such file or directory") >= 0) {
    //             debLog("removeFile.newPromise.processError.if.no_such_file");
    //             console.log(`File ${path} does not exist, continuing.`);
    //             resolve();
    //         } else {
    //             debLog("removeFile.newPromise.processError.if.else.no_such_file");
    //             console.error(err);
    //             reject(err);
    //         }
    //     };

    //     void (async() => {
    //         /** Process File Deletion */

    //         await fs.unlink(`${__dirname}/${path}`, (err) => {
    //             if (err) {
    //                 debLog("removeFile.newPromise.processError.fs.unlink.if.err");
    //                 processError(err);
    //             } else {
    //                 console.log(`Removed ${path}`);

    //                 resolve();
    //             }
    //     })();

    //     });
    // });
};

// const removeFiles = async(files) => {
//     let errors = 0;

//     for (let i = files.length - 1; i >= 0; i -= 1) {
//         await removeFile(files[i])
//             .catch((err) => {
//                 debFunc("RemoveFiles.removeFile.catch");
//                 console.log(err);
//                 errors += 1;
//             });
//     }

//     if (errors > 0) {
//         debFunc("removeFiles.if.errors");
//         return Promise.reject("Not All Files Removed");
//     } else {
//         debFunc("removeFiles.if.else.errors");
//         return Promise.resolve();
//     }

// };

const clean = (path: string): Promise<void> => {
    console.log("\x1b[44m\x1b[37m%s\x1b[0m", `Would Begin Cleaning ${path}`);

    return Promise.resolve();
};

const removeDirent = (path: string) => {
    return clean(`${__dirname}/${path}`)
        .then((files) => {
            debLog("removeFolder.clean.then");
            console.log(files);
            return Promise.resolve(files);
        })
        .catch((err) => {
            debLog("removeFolder.clean.catch");
            console.log(err);
            return Promise.reject(err);
        });
};

const processDirents = async (folder) => {
    const processedPaths = [];

    return new Promise(async (resolve, reject) => {
        // Read all files in Directory
        await fs.readdir(folder, {withFileTypes: true}, (err, files) => {
            if (!err) {
                console.log("Directory Ready");
                console.log(files);
                return resolve(files);
            } else {
                console.error("Failed to read Directory");
                console.log(err);
                return reject(err);
            }
        });
    })
        .then(async (files) => {
            return new Promise(async (resolve, reject) => {
                const workingFolderTree = [];

                promiseLoop(files, (currentFile) => {
                    return checkEntry(currentFile)
                        .then((processedPath) => {
                            workingFolderTree.push(processedPath);
                            return Promise.resolve(workingFolderTree);
                        })
                        .catch((err) => {
                            console.log(err);
                            return Promise.reject(err);
                        });
                })
                    .then((data) => {
                        if (workingFolderTree.length > 0) {
                            debLog("clean.fs.readdir.then.if.workingFolderTree.toResolve");
                            return resolve(workingFolderTree);
                        } else {
                            debLog("clean.fs.readdir.then.if.workingFolderTree.toReject");
                            return reject("Something went wrong");
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        return Promise.reject(err);
                    });
            });
        })
        .then((data) => {
            /* Do Work */

            return Promise.resolve(data);
        })
        .catch((err) => {
            console.error(err);

            /* Do Work */

            return Promise.reject(err);
        });
};

const listDirents = async (allDirectories: string[]) => {
    const allDirents = [];
    const errors = 0;

    return await promiseLoop(allDirectories, async (currentFolder) => {
        return await processDirents(currentFolder)
            .then((data) => {
                allDirents.push(data);

                return Promise.resolve(data);
            })
            .catch((err) => {
                console.error(err);

                errors += 1;

                return Promise.reject(err);
            });
    })
        .then((data) => {
            if (errors > 0) {
                debLog("listFolders.if.errors.toReject");
                return Promise.reject("Not All Files Removed");
            } else {
                debLog("listFolders.if.erros.toResolve");
                return Promise.resolve();
            }

            return Promise.resolve(data);
        })
        .catch((err) => {
            console.error(err);

            /* Do Work */

            return Promise.reject(err);
        });
};

const checkEntry = async (directoryEntry: fs.Dirent) => {
    const entryPath = path.join("../", directoryEntry.name);

    if (directoryEntry.isDirectory()) {
        return listDirents(directoryEntry)
            .then((data) => {
                return Promise.resolve(data);
            })
            .catch((err) => {
                console.error(err);
                return Promise.reject(err);
            });
    } else {
        return Promise.resolve(entryPath);
    }
};

listDirents(folderList)
    .then(() => {
        console.log("Cleaned up files and folders");
        console.log(folderList);
        return Promise.resolve();
    })
    .catch((err) => {
        console.error("Failed to clean up files and folders");
        console.error(err);
        throw err;
    });

// removeFiles(fileList)
//     .then(() => {
//         console.log("Cleaned up files");
//         console.log(fileList);
//         return removeFolders(folderList)
//             .then(() => {
//                 console.log("Cleaned up folders");
//                 console.log(folderList);
//                 return Promise.resolve();
//             })
//             .catch((err) => {
//                 console.error("Failed to clean up folders");
//                 console.error(err);
//                 return Promise.reject(err);
//             });
//     })
//     .then(() => {
//         console.log("Cleaned up files and folders");
//     })
//     .catch((err) => {
//         console.error("Failed to clean up");
//         console.error(err);
//     });
