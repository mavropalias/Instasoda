// #########################################################################
// #########################################################################
// # Socket.io
// #########################################################################
// #########################################################################

var socket = io.connect(socketIoHost);

// Connected
// -------------------------------------------------------------------------
socket.on('connected', function (data) {
  console.log('- SOCKET.IO status: ' + data.status);
  
  // get notifications
  setInterval(function() {
    // only if user is logged-in
    if(typeof user.get('_id') != 'undefined') {
      socket.emit('getNotifications', {
        _id: user.get('_id'),
        fTkn: user.get('fTkn')
      }, function(err, data) {
        if(!IS.nullOrEmpty(data)) {
          // check for new chat messages
          if(!IS.nullOrEmpty(data.chat)) {
            //console.log(chatSessions.get(data.chat[0].sId));

            // loop through chat array and update chatSessions' models
            var newMessages = data.chat;

            for(var i = 0; i < newMessages.length; i++) {
              var model = chatSessions.find( function(session) {
                return session.get('_id') == newMessages[i].sId;
              });

              // construct message
              var sMsg = {
                u: newMessages[i].u,
                t: newMessages[i].t,
                m: newMessages[i].m
              };

              // update the model
              model.get('log').push(sMsg);
              model.trigger('change:log', sMsg);
            }

            
            
          }
        }
      });
    } // else do nothing
  }, 2000);
});

// Receive online users
// -------------------------------------------------------------------------
socket.on('onlineUsers', function (msg) {
  onlineUsers.set({ count: msg.count });
});

// Receive chat message
// -------------------------------------------------------------------------
socket.on('newChatMessage', function (msg) {
  //TODO handle new message
});