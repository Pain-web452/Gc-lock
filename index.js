const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// ================= CONFIG =================
const CONFIG = {
  GROUP_THREAD_ID: "7094361373961717",
  LOCKED_GROUP_NAME: "ZETSU 🩷",
  CHECK_INTERVAL: 10 * 1000,      // 10 sec
  ERROR_RETRY: 5 * 10 * 1000,     // 1min
  RANDOM_DELAY: [2000, 10000],    // 2–10 sec
  ADMIN_BYPASS: true,             // Admin change ignore?
  LOG_FILE: "locker.log"
};

// ================= LOGGER =================
function log(message) {
  const time = new Date().toISOString();
  const finalMsg = `[${time}] ${message}`;
  console.log(finalMsg);
  fs.appendFileSync(CONFIG.LOG_FILE, finalMsg + "\n");
}

// ================= LOAD APPSTATE =================
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (err) {
  log("❌ Failed to read appstate.json");
  process.exit(1);
}

// ================= EXPRESS KEEP ALIVE =================
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (_, res) => res.send("🤖 Group Name Locker is running"));
app.listen(PORT, () => log(`🌐 Server running on ${PORT}`));

// ================= LOCKER =================
function startGroupNameLocker(api) {
  let failureCount = 0;

  const loop = () => {
    api.getThreadInfo(CONFIG.GROUP_THREAD_ID, (err, info) => {
      if (err) {
        failureCount++;
        const wait = Math.min(CONFIG.ERROR_RETRY * failureCount, 30 * 60 * 1000);
        log(`❌ getThreadInfo failed → retry in ${wait / 1000}s`);
        return setTimeout(loop, wait);
      }

      failureCount = 0;
      const currentName = info?.name || "Unknown";

      // 🛡️ Admin bypass
      if (CONFIG.ADMIN_BYPASS && info?.adminIDs?.length) {
        if (currentName !== CONFIG.LOCKED_GROUP_NAME) {
          log("⚠️ Admin changed group name → ignoring");
          return setTimeout(loop, CONFIG.CHECK_INTERVAL);
        }
      }

      if (currentName !== CONFIG.LOCKED_GROUP_NAME) {
        log(`🔁 Name changed: "${currentName}" → resetting`);

        const delay =
          Math.floor(Math.random() *
            (CONFIG.RANDOM_DELAY[1] - CONFIG.RANDOM_DELAY[0])) +
          CONFIG.RANDOM_DELAY[0];

        setTimeout(() => {
          api.setTitle(CONFIG.LOCKED_GROUP_NAME, CONFIG.GROUP_THREAD_ID, (err) => {
            if (err) {
              log("❌ setTitle failed");
              return setTimeout(loop, CONFIG.ERROR_RETRY);
            }
            log("🔒 Group name locked again");
            setTimeout(loop, CONFIG.CHECK_INTERVAL);
          });
        }, delay);
      } else {
        log("✅ Group name intact");
        setTimeout(loop, CONFIG.CHECK_INTERVAL);
      }
    });
  };

  loop();
}

// ================= LOGIN =================
login({ appState }, (err, api) => {
  if (err) {
    log("❌ Login failed");
    process.exit(1);
  }

  log("✅ Logged in successfully");
  startGroupNameLocker(api);
});

// ================= SAFETY =================
process.on("uncaughtException", err => log("🔥 Crash: " + err.message));
process.on("unhandledRejection", err => log("🔥 Promise Error: " + err));
