// #########################################################################
// #########################################################################
// # Socket.io
// #########################################################################
// #########################################################################

var socket = io.connect(socketIoHost);

// Connected
// -------------------------------------------------------------------------
socket.on('connected', function (data) {
  log('- SOCKET.IO status: ' + data.status, 'info');

  // get notifications
  setInterval(function() {
    // only if user is logged-in
    if(typeof user.get('_id') != 'undefined') {
      socket.emit('getNotifications', {
        _id: user.get('_id'),
        tkn: user.get('tkn')
      }, function(err, data) {
        if(!IS.nullOrEmpty(data)) {
          // check for new chat messages
          // ===========================
          if(!IS.nullOrEmpty(data.chat)) {
            var newMessages = data.chat;

            // loop through chat array and update chatSessions' models
            for(var i = 0; i < newMessages.length; i++) {

              // detect if chat session already exists
              var model = chatSessions.find( function(session) {
                return session.get('_id') == newMessages[i].sId;
              });

              if(!IS.nullOrEmpty(model)) {

                // check if it's a complete message of just a notification
                if(newMessages[i].m) {
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
                user.trigger('newMessage', newMessages[i].sId);

              } else {
                // chat session is new
                console.log(' - new chat session notification');
                userbarView.chatSessionTabs.fetchChatSessionFromServerById(newMessages[i].sId);
              }
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