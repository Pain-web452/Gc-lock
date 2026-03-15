/**
 * Advanced Group Name Locker Bot
 * Developer: Axshu 🩷
 */

const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// CONFIG
const GROUP_THREAD_ID = "763032383283418";
const LOCKED_GROUP_NAME = "SUI RAANDI CHUD K DAFAN 💀";

// Load appstate
let appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

// Express keep alive
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req,res)=>{
res.send("🤖 Group Name Locker Bot Running");
});

app.listen(PORT, ()=>{
console.log(`🌐 Server running on port ${PORT}`);
});

// Safe title setter
function safeSetTitle(api,title,threadID,retry=0){

api.setTitle(title,threadID,(err)=>{

if(err){

console.error("❌ Title set failed:",err);

if(retry < 3){

console.log("🔁 Retrying...");
setTimeout(()=>{
safeSetTitle(api,title,threadID,retry+1);
},1000);

}

}else{

console.log(`🔒 Title locked → ${title}`);

}

});

}

// Instant listener
function startListener(api){

api.listenMqtt((err,event)=>{

if(err) return console.error("MQTT Error:",err);

if(!event) return;

if(event.type === "event"){

const type = event.logMessageType;

if(
type === "log:thread-name" ||
type === "log:thread-name-change" ||
type === "log:thread-title"
){

if(event.threadID === GROUP_THREAD_ID){

console.log("⚠️ Title change detected");

setTimeout(()=>{

safeSetTitle(api,LOCKED_GROUP_NAME,GROUP_THREAD_ID);

},100);

}

}

}

});

}

// Polling backup
function startPolling(api){

setInterval(()=>{

api.getThreadInfo(GROUP_THREAD_ID,(err,info)=>{

if(err) return;

const name = info.name || info.threadName;

if(name !== LOCKED_GROUP_NAME){

console.log("⚠️ Polling detected change");

safeSetTitle(api,LOCKED_GROUP_NAME,GROUP_THREAD_ID);

}

});

},20000);

}

// LOGIN
login({appState},(err,api)=>{

if(err){
console.error("❌ Login error:",err);
return;
}

console.log("✅ Logged in");
console.log("🚀 Advanced Name Locker Activated");

startListener(api);
startPolling(api);

// Initial lock
safeSetTitle(api,LOCKED_GROUP_NAME,GROUP_THREAD_ID);

});
