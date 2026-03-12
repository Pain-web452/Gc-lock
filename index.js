const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

const GROUP_THREAD_ID = "763032383283418";
const LOCKED_GROUP_NAME = "BRANDED CHIKU & SUI KI MAA RAANDI BY DUY🩷";

const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (_, res) => res.send("Alive"));
app.listen(PORT);

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
