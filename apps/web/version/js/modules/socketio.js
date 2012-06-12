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
      }, function(data) {
        // TODO
      });
    } // else do nothing
  }, 2000);
});

// Receive online users
// -------------------------------------------------------------------------
socket.on('onlineUsers', function (msg) {
  onlineUsers.set({ count: msg.count });
});