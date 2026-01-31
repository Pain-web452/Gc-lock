const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// 🌐 Express Server (ALWAYS RUNS)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) =>
  res.send("🤖 Bot alive (login optional mode)")
);
app.listen(PORT, () =>
  console.log(`🌐 Web server running on port ${PORT}`)
);

// ✅ Group Info
const GROUP_THREAD_ID = "1461199735613151";
const LOCKED_GROUP_NAME = "FAIZ & FARAHAN KI MAA RAANDI 🩷";

// 🔐 Try loading appState (NO CRASH if missing)
let appState = null;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
  console.log("✅ appstate.json loaded");
} catch (err) {
  console.warn("⚠️ appstate.json not found. Running WITHOUT login.");
}

// 🔒 Group Name Locker
function startGroupNameLocker(api) {
  const loop = () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ getThreadInfo error:", err);
        return setTimeout(loop, 10_000);
      }

      const currentName = info?.name || "Unknown";

      if (currentName !== LOCKED_GROUP_NAME) {
        console.log(`⚠️ Name changed → resetting`);
        api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, () =>
          setTimeout(loop, 10_000)
        );
      } else {
        console.log("✅ Group name locked");
        setTimeout(loop, 10_000);
      }
    });
  };

  loop();
}

// 🟢 Login ONLY if appState exists
if (appState) {
  login({ appState }, (err, api) => {
    if (err) {
      console.error("❌ Login failed. Bot alive, locker disabled.");
      return;
    }

    console.log("🔓 Logged in. Locker activated.");
    startGroupNameLocker(api);
  });
} else {
  console.log("🟡 No login → Bot alive but group locker OFF");
}
