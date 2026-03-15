/**
 * NEXT GENERATION FACEBOOK GROUP NAME LOCKER
 * Developer: Axshu 🩷
 */

const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// ================= CONFIG =================

const GROUPS = {
"763032383283418": "SUI RAANDI CHUD K DAFAN 💀"
};

const AUTO_KICK = true;
const ALERT_MESSAGE = true;
const POLL_INTERVAL = 15000;

// ==========================================

// load appstate
const appState = JSON.parse(fs.readFileSync("appstate.json","utf8"));

// keep alive server
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/",(req,res)=>{
res.send("🚀 NEXT GEN GROUP LOCKER BOT RUNNING");
});

app.listen(PORT,()=>{
console.log(`🌐 Server running on ${PORT}`);
});

// safe title setter
function lockTitle(api,threadID,title,retry=0){

api.setTitle(title,threadID,(err)=>{

if(err){

console.log("❌ Title change failed");

if(retry < 5){

setTimeout(()=>{
lockTitle(api,threadID,title,retry+1);
},800);

}

}else{

console.log(`🔒 Locked → ${title}`);

}

});

}

// kick user
function kickUser(api,threadID,userID){

if(!AUTO_KICK) return;

api.removeUserFromGroup(userID,threadID,(err)=>{

if(err){
console.log("❌ Kick failed");
}else{
console.log(`👢 User kicked ${userID}`);
}

});

}

// send alert
function sendAlert(api,threadID,userID){

if(!ALERT_MESSAGE) return;

api.sendMessage(
`⚠️ Group name change detected!

👤 User: ${userID}
🔒 Name restored automatically.

Do not change group name.`,
threadID
);

}

// listener system
function startListener(api){

api.listenMqtt((err,event)=>{

if(err) return console.error(err);

if(!event) return;

if(event.type !== "event") return;

const type = event.logMessageType;

if(
type === "log:thread-name" ||
type === "log:thread-name-change" ||
type === "log:thread-title"
){

const threadID = event.threadID;
const userID = event.author;

if(GROUPS[threadID]){

console.log("⚠️ Name change detected");

setTimeout(()=>{

lockTitle(api,threadID,GROUPS[threadID]);

},80);

kickUser(api,threadID,userID);

sendAlert(api,threadID,userID);

}

}

});

}

// polling backup
function startPolling(api){

setInterval(()=>{

for(const threadID in GROUPS){

api.getThreadInfo(threadID,(err,info)=>{

if(err) return;

const current = info.name || info.threadName;

if(current !== GROUPS[threadID]){

console.log("⚠️ Poll detected change");

lockTitle(api,threadID,GROUPS[threadID]);

}

});

}

},POLL_INTERVAL);

}

// login
login({appState},(err,api)=>{

if(err){
console.log("❌ Login failed",err);
return;
}

console.log("✅ Logged in");
console.log("🚀 NEXT GEN GROUP LOCKER ACTIVE");

// start systems
startListener(api);
startPolling(api);

// initial lock
for(const threadID in GROUPS){

lockTitle(api,threadID,GROUPS[threadID]);

}

});
