const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// ✅ Load AppState
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (err) {
  console.error("❌ Error reading appstate.json:", err);
  process.exit(1);
}

// ✅ Group Info
const GROUP_THREAD_ID = "877207874954540";        // Group ka ID
const LOCKED_GROUP_NAME = "H4SHIR4MA 🩷";   // Locked name

// ✅ Express Server to keep bot alive (for Render or UptimeRobot)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🤖 Group Name Locker Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ✅ Function to start locking loop
function startGroupNameLocker(api) {
  const lockLoop = () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Error fetching group info:", err);
        // Agar error aaya to 5 min wait karke dobara try karo
        return setTimeout(lockLoop, 5 * 7 * 1000);
      }

      // 🛠️ Safe check: agar info.name null/undefined hai
      const currentName = info?.name || "Unknown";

      if (currentName !== LOCKED_GROUP_NAME) {
        console.warn(`⚠️ Group name changed to "${currentName}" → resetting...`);

        // Random delay 2–10 sec (detect hone se bachne ke liye)
        const delay = Math.floor(Math.random() * 8000) + 2000;

        setTimeout(() => {
          api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
            if (err) {
              console.error("❌ Failed to reset group name:", err);
              // Agar setTitle fail ho jaye → 5 min baad try karo
              setTimeout(lockLoop, 5 * 7 * 1000);
            } else {
              console.log("🔒 Group name reset successfully.");
              // Reset ke baad normal cycle continue
              setTimeout(lockLoop, 7 * 1000);
            }
          });
        }, delay);

      } else {
        console.log("✅ Group name is correct.");
        // Agar naam sahi hai → 1 min baad dobara check
        setTimeout(lockLoop, 7 * 1000);
      }
    });
  };

  lockLoop(); // Start loop
}

// 🟢 Facebook Login
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully. Group name locker activated.");
  startGroupNameLocker(api);
});const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// ✅ Load AppState
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (err) {
  console.error("❌ Error reading appstate.json:", err);
  process.exit(1);
}

// ✅ Group Info
const GROUP_THREAD_ID = "877207874954540";        // Group ka ID
const LOCKED_GROUP_NAME = "H4SHIR4MA 🩷";   // Locked name

// ✅ Express Server to keep bot alive (for Render or UptimeRobot)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🤖 Group Name Locker Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ✅ Function to start locking loop
function startGroupNameLocker(api) {
  const lockLoop = () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Error fetching group info:", err);
        // Agar error aaya to 5 min wait karke dobara try karo
        return setTimeout(lockLoop, 5 * 7 * 1000);
      }

      // 🛠️ Safe check: agar info.name null/undefined hai
      const currentName = info?.name || "Unknown";

      if (currentName !== LOCKED_GROUP_NAME) {
        console.warn(`⚠️ Group name changed to "${currentName}" → resetting...`);

        // Random delay 2–10 sec (detect hone se bachne ke liye)
        const delay = Math.floor(Math.random() * 8000) + 2000;

        setTimeout(() => {
          api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
            if (err) {
              console.error("❌ Failed to reset group name:", err);
              // Agar setTitle fail ho jaye → 5 min baad try karo
              setTimeout(lockLoop, 5 * 7 * 1000);
            } else {
              console.log("🔒 Group name reset successfully.");
              // Reset ke baad normal cycle continue
              setTimeout(lockLoop, 7 * 1000);
            }
          });
        }, delay);

      } else {
        console.log("✅ Group name is correct.");
        // Agar naam sahi hai → 1 min baad dobara check
        setTimeout(lockLoop, 7 * 1000);
      }
    });
  };

  lockLoop(); // Start loop
}

// 🟢 Facebook Login
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully. Group name locker activated.");
  startGroupNameLocker(api);
});
