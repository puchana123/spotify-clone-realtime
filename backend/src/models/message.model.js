import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        require: true
    },
    receiverId: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);