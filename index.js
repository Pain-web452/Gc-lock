{
  "checkInterval": 10000,
  "resetDelay": 20000,
  "groups": [
    {
      "threadID": "877207874954540",
      "lockedName": "zetsu🩷",
      "enabled": true
    }
  ]
}
const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

process.on("unhandledRejection", err => {
  console.error("🔥 Unhandled Rejection:", err);
});

process.on("uncaughtException", err => {
  console.error("💥 Uncaught Exception:", err);
});

// ================= CONFIG =================
const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const appState = JSON.parse(fs.readFileSync("./appstate.json", "utf-8"));

// ================= SERVER =================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("🤖 Advanced Group Name Locker is running");
});

app.listen(PORT, () =>
  console.log(`🌐 Server running on port ${PORT}`)
);

// ================= LOCK ENGINE =================
function startLocker(api) {
  console.log("🔒 Group name lock system started");

  const checkGroups = async () => {
    for (const group of config.groups) {
      if (!group.enabled) continue;

      api.getThreadInfo(group.threadID, (err, info) => {
        if (err) {
          return console.error(`❌ Fetch error [${group.threadID}]`, err);
        }

        if (info.name !== group.lockedName) {
          console.warn(
            `⚠️ Name changed → "${info.name}" | Resetting soon...`
          );

          setTimeout(() => {
            api.setTitle(group.lockedName, group.threadID, err => {
              if (err) {
                console.error("❌ Reset failed:", err);
              } else {
                console.log("🔐 Group name locked again");
              }
            });
          }, config.resetDelay);
        } else {
          console.log(`✅ Locked OK | ${group.threadID}`);
        }
      });
    }

    setTimeout(checkGroups, config.checkInterval);
  };

  checkGroups();
}

// ================= LOGIN =================
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login failed:", err);
    return;
  }

  api.setOptions({
    listenEvents: true,
    selfListen: false
  });

  console.log("✅ Logged in successfully");
  startLocker(api);
});
