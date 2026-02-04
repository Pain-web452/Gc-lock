const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const GROUP_THREAD_ID = "877207874954540";
const LOCKED_GROUP_NAME = "H4SHIR4MA 🩷";

// 🔐 Cooldown (avoid spam)
let lastResetTime = 0;
const COOLDOWN = 60 * 1000; // 1 minute

// 🌐 Server
const app = express();
app.get("/", (req, res) => res.send("🤖 Group Name Locker Running"));
app.listen(process.env.PORT || 3000);

// 📦 Load AppState
const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

login({ appState }, (err, api) => {
  if (err) return console.error("❌ Login failed", err);

  console.log("✅ Logged in — Name locker active");

  api.listenMqtt((err, event) => {
    if (err) return;

    // 🔔 Only detect thread name change
    if (
      event.type === "event" &&
      event.logMessageType === "log:thread-name" &&
      event.threadID === GROUP_THREAD_ID
    ) {
      const now = Date.now();

      if (now - lastResetTime < COOLDOWN) {
        console.log("⏳ Cooldown active, skipping reset");
        return;
      }

      lastResetTime = now;

      const delay = Math.floor(Math.random() * 7000) + 3000;

      console.warn("⚠️ Group name changed — resetting...");

      setTimeout(() => {
        api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, err => {
          if (err) {
            console.error("❌ Reset failed:", err);
          } else {
            console.log("🔒 Group name locked again");
          }
        });
      }, delay);
    }
  });
});
