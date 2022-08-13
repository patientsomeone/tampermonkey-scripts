const isDebug = true;

const debugLog = (msg) => {
  if (!isDebug) {
    return;
  } else {
    console.log(msg);
  }
};

const log = (msg) => {
  console.log(msg);
};
