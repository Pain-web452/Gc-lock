const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const GROUP_THREAD_ID = "877207874954540";
const LOCKED_GROUP_NAME = "H4SHIR4MA 🩷";

let appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

/* 🌐 Keep Alive */
const app = express();
app.get("/", (_, res) => res.send("🤖 GC Name Locker Running"));
app.listen(process.env.PORT || 3000);

function startLocker(api) {
  let busy = false;
  let lastReset = 0;
  const RESET_COOLDOWN = 3 * 60 * 1000; // 3 min

  const loop = () => {
    if (busy) return setTimeout(loop, 15000);

    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err || !info) {
        console.error("❌ getThreadInfo failed");
        return setTimeout(loop, 30000);
      }

      if (info.name !== LOCKED_GROUP_NAME) {
        const now = Date.now();
        if (now - lastReset < RESET_COOLDOWN) {
          console.log("⏳ Cooldown active");
          return setTimeout(loop, 15000);
        }

        busy = true;
        lastReset = now;

        console.log(`⚠️ Name changed → instant reset`);

        setTimeout(() => {
          api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, err => {
            busy = false;

            if (err) {
              console.error("❌ setTitle blocked");
              return setTimeout(loop, 60000);
            }

            console.log("🔒 Name restored instantly");
            setTimeout(loop, 15000);
          });
        }, 2000); // ⚡ 2 sec delay
      } else {
        setTimeout(loop, 15000);
      }
    });
  };

  loop();
}

login({ appState }, (err, api) => {
  if (err) return console.error("❌ Login failed");
  console.log("✅ Logged in – Instant locker active");
  startLocker(api);
});
