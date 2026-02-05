const login = require("ws3-fca");
const fs = require("fs");

const GROUP_THREAD_ID = "877207874954540";
const LOCKED_GROUP_NAME = "H4SHIR4MA 🩷";

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

login({ appState }, (err, api) => {
  if (err) return;

  api.listenMqtt((err, event) => {
    if (err) return;

    if (
      event.threadID === GROUP_THREAD_ID &&
      event.logMessageType === "log:thread-name" &&
      event.logMessageData?.name !== LOCKED_GROUP_NAME
    ) {
      api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID);
    }
  });
});
