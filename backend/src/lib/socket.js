import { Server } from 'socket.io';
import { Message } from '../models/message.model.js';

export const initializeSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
    });

    const userSocket = new Map(); // {userId: socketId}
    const userActivities = new Map(); // {userId: [activityId]}

    io.on('connection', (socket) => {
        // User connected to server
        socket.on('user_connected', (userId) => {
            userSocket.set(userId, socket.id);
            userActivities.set(userId, "Idle");

            // Broadcast to all users that a new user has connected
            io.emit('user_connected', userId);
            // Get online users
            socket.emit('users_online', Array.from(userSocket.keys()));
            // Get users activities
            io.emit('activities', Array.from(userActivities.entries()));
        });
        // Update activity on listening
        socket.on('update_activity', (userId, activity) => {
            console.log('update_activity', userId, activity);
            userActivities.set(userId, activity);
            io.emit('activity_updated', { userId, activity });
        });
        // Sending messages
        socket.on('send_message', async (data) => {
            try {
                const { senderId, receiverId, content } = data;

                const message = await Message.create({
                    senderId,
                    receiverId,
                    content
                })

                // Send to receiver in realtime if they're online
                const receiverSocketId = userSocket.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', message);
                }
                // send message successfully
                socket.emit('message_sent', message);

            } catch (error) {
                console.log("Error in sending message", error);
                socket.emit('message_error', error.message);
            }
        });
        // Disconnect user
        socket.on('disconnect', () => {
            let disconnectedUserId;
            for (const [userId, socketId] of userSocket.entries()) {
                // find disconnected users
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    userSocket.delete(userId);
                    userActivities.delete(userId);
                    break;
                }
            }

            // Broadcast to all users that a user has disconnected
            if (disconnectedUserId) {
                io.emit('user_disconnected', disconnectedUserId);
            }
        })
    });
}