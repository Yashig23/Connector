const socketIo = require('socket.io');
const Comment = require('./commentsscheme'); // Adjust the path if needed
const Message = require('./chatmessageschema');
const users = new Map(); // Store connected users
const Notification = require('./notificationschema');

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {


    // Listen for user ID from client
    socket.on("user-connected", async (userId) => {  // Make the callback async
      if (userId) {
        users.set(userId, socket.id);

        io.emit("update-user-status", { userId, status: "online" });

        // Fetch unread notifications
        try {
          const unreadNotifications = await Notification.find({ userId, isRead: false });

          if (unreadNotifications.length > 0) {
            io.to(socket.id).emit('unread-notifications', unreadNotifications);

          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    })


    socket.on('sendFile', (data) => {


      // Broadcast the file to all users (or specific user if needed)
      io.emit('receiveFile', data);
    });

    socket.on("disconnect", () => {
      let disconnectedUserId = null;

      users.forEach((value, key) => {
        if (value === socket.id) {
          disconnectedUserId = key;
          users.delete(key);
        }
      });

      if (disconnectedUserId) {
        console.log(`User ${disconnectedUserId} disconnected`);
      }
    });

    // Messaging Event
    socket.on('send-message', async (messageData) => {
      try {
        const { receiverId, senderId } = messageData; 

        const message = new Message(messageData);
        await message.save();

        // 🟡 Send message only to the recipient
        const recipientSocketId = users.get(receiverId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive-message', message);

          // ✅ Now receiverId is properly defined
          await Message.updateMany(
            { receiverId, senderId, isRead: false },
            { $set: { isRead: true } }
          );
        } else {
          console.log(`User ${receiverId} is offline`);
        }
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });


    // delete api
    socket.on('delete-message', async (_id) => {
      try {
        const message = await Message.findById(_id);
        if (!message) {

          return;
        }

        await Message.findByIdAndDelete(_id);


        const recipientSocketId = users.get(message.receiverId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message-deleted', _id);
        }

        socket.emit('message-deleted', _id);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });


    // edit api
    socket.on('edit-message', async ({ _id, newContent }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          _id,
          { content: newContent },
          { new: true }
        );

        if (!updatedMessage) {

          return;
        }



        const recipientSocketId = users.get(updatedMessage.receiverId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message-updated', updatedMessage);
        }

        socket.emit('message-updated', updatedMessage);
      } catch (error) {
        console.error('Error updating message:', error);
      }
    });


    // Comment Event
    socket.on('new-comment', async (commentData) => {

      try {
        const comment = new Comment(commentData); // Use CommentsSection model
        await comment.save();

        // Broadcast the new comment
        io.emit('receive-comment', comment);

      } catch (error) {
        console.error('Error saving comment:', error);
      }
    });

    // Reply Event (New)
    socket.on('new-reply', async ({ parentCommentId, replyData }) => {

      try {
        const parentComment = await Comment.findOne({ comment_id: parentCommentId });

        if (!parentComment) {
          console.error('Parent comment not found.');
          return;
        }

        // Push new reply to replies array
        parentComment.replies.push(replyData);
        await parentComment.save();

        // Notify all clients about the new reply
        io.emit('reply-added', { parentCommentId, reply: replyData });
      } catch (error) {
        console.error('Error adding reply:', error.message);
      }
    });

    socket.on("send-notification", async ({ senderId, receiverId, type, message, profile_pic }) => {

      try {

        // Check receiverId exists in users map
        if (!receiverId) {
          return;
        }
        // Store in the database
        const notification = new Notification({
          senderId,
          receiverId,
          type,
          message,
          profile_pic,
          isRead: false,
          createdAt: new Date()
        });

        await notification.save();

        // Send real-time notification
        if (users.has(receiverId)) {
          io.to(users.get(receiverId)).emit("receive-notification", notification);
        }
        else {
          console.error('user has no reciever Id');
        }
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    });


    // Handle Disconnection
    socket.on('disconnect', () => {
      users.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          users.delete(userId);
        }
      });
    });
  });

  return io;
};
