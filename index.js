/**
 * ULTRA FACEBOOK GROUP MODERATION BOT
 */

const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// ================= CONFIG =================

const GROUPS = {
"763032383283418": {
lockedName: "Protected Group",
lockedNickname: "Member"
}
};

const WARN_LIMIT = 3;

const BAD_WORDS = [
"spamword1",
"spamword2",
"spamword3"
];

// ==========================================

const warns = {};

const appState = JSON.parse(
fs.readFileSync("appstate.json","utf8")
);

// keep alive server
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/",(req,res)=>{
res.send("🤖 Ultra Moderation Bot Running");
});

app.listen(PORT,()=>{
console.log(`Server running on ${PORT}`);
});

// warning system
function warnUser(api,user,thread){

if(!warns[user]) warns[user] = 0;

warns[user]++;

api.sendMessage(
`⚠️ Warning ${warns[user]}/${WARN_LIMIT}`,
thread
);

if(warns[user] >= WARN_LIMIT){

api.removeUserFromGroup(user,thread);
api.sendMessage("🚫 User removed for repeated violations.",thread);

}

}

// group name lock
function lockGroupName(api,threadID,name){

api.setTitle(name,threadID,(err)=>{
if(err) console.log("Title lock failed");
});

}

// nickname lock
function lockNickname(api,user,thread,nickname){

api.changeNickname(nickname,thread,user,(err)=>{
if(err) console.log("Nickname lock failed");
});

}

// spam filter
function containsBadWord(message){

if(!message) return false;

message = message.toLowerCase();

return BAD_WORDS.some(w => message.includes(w));

}

// listener
function startListener(api){

api.listenMqtt((err,event)=>{

if(err) return;

if(!event) return;

const threadID = event.threadID;

if(!GROUPS[threadID]) return;

// MESSAGE MODERATION
if(event.type === "message"){

const sender = event.senderID;
const body = event.body || "";

if(containsBadWord(body)){

api.unsendMessage(event.messageID);

warnUser(api,sender,threadID);

}

}

// EVENT MODERATION
if(event.type === "event"){

// nickname change
if(event.logMessageType === "log:user-nickname"){

const user = event.logMessageData.participant_id;

lockNickname(
api,
user,
threadID,
GROUPS[threadID].lockedNickname
);

warnUser(api,user,threadID);

}

// group name change
if(
event.logMessageType === "log:thread-name" ||
event.logMessageType === "log:thread-title"
){

lockGroupName(
api,
threadID,
GROUPS[threadID].lockedName
);

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

const currentName = info.name || info.threadName;

if(currentName !== GROUPS[threadID].lockedName){

lockGroupName(
api,
threadID,
GROUPS[threadID].lockedName
);

}

});

}

},20000);

}

// login
login({appState},(err,api)=>{

if(err){
console.log("Login error",err);
return;
}

console.log("✅ Ultra Moderation Bot Active");

startListener(api);
startPolling(api);

});
