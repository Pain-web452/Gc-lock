const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const GROUP_THREAD_ID = "877207874954540";
const LOCKED_GROUP_NAME = "H4SHIR4MA 🩷";

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

/* 🌐 Keep Alive */
const app = express();
app.get("/", (_, res) => res.send("🤖 GC Locker Alive"));
app.listen(process.env.PORT || 3000);

function startLocker(api) {
  let resetting = false;
  let lastReset = 0;

  const CHECK_INTERVAL = 20000;      // 20 sec
  const RESET_DELAY = 3000;          // 3 sec (human-like)
  const COOLDOWN = 5 * 60 * 1000;    // 5 min (ANTI BLOCK)

  const loop = () => {
    if (resetting) return setTimeout(loop, CHECK_INTERVAL);

    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err || !info) {
        console.error("❌ getThreadInfo error");
        return setTimeout(loop, 60000);
      }

      if (info.name !== LOCKED_GROUP_NAME) {
        const now = Date.now();

        if (now - lastReset < COOLDOWN) {
          console.log("⏳ Cooldown active, skipping reset");
          return setTimeout(loop, CHECK_INTERVAL);
        }

        resetting = true;
        lastReset = now;

        console.log(`⚠️ Name changed → resetting safely`);

        setTimeout(() => {
          api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, err => {
            resetting = false;

            if (err) {
              console.error("❌ setTitle blocked → backing off");
              return setTimeout(loop, 10 * 60 * 1000);
            }

            console.log("🔒 GC name restored");
            setTimeout(loop, CHECK_INTERVAL);
          });
        }, RESET_DELAY);
      } else {
        setTimeout(loop, CHECK_INTERVAL);
      }
    });
  };

  loop();
}

login({ appState }, (err, api) => {
  if (err) return console.error("❌ Login failed");
  console.log("✅ Logged in – Safe Instant Locker ON");
  startLocker(api);
});
