// #########################################################################
// #########################################################################
// # Socket.io
// #########################################################################
// #########################################################################
var socket=io.connect(socketIoHost);socket.on("connected",function(e){console.log("- SOCKET.IO status: "+e.status);setInterval(function(){typeof user.get("_id")!="undefined"&&socket.emit("getNotifications",{_id:user.get("_id"),instasodaToken:user.get("tkn")},function(e,t){if(!IS.nullOrEmpty(t)&&!IS.nullOrEmpty(t.chat)){var n=t.chat;for(var r=0;r<n.length;r++){var i=chatSessions.find(function(e){return e.get("_id")==n[r].sId});if(!IS.nullOrEmpty(i)){var s={u:n[r].u,t:n[r].t,m:n[r].m};i.get("log").push(s);i.trigger("change:log",s)}else{console.log(" - new chat session notification");chatView.chatSessionTabs.fetchChatSessionFromServerById(n[r].sId)}$("#chatWindow").is(":visible")||IS.notify("New message from "+n[r].u,null,n[r].m)}}})},2e3)});socket.on("onlineUsers",function(e){onlineUsers.set({count:e.count})});socket.on("newChatMessage",function(e){});