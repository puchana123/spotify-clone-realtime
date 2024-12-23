import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    artist: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: true
    },
    releaseYear: {
        type: Number,
        require: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
    }]
}, { timestamps: true });

export const Album = mongoose.model("Album", albumSchema);