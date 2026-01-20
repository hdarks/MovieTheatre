import mongoose from "mongoose";

const { Schema, model } = mongoose;

const movieSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    durationMin: {
        type: Number,
        required: true,
        min: 1
    },
    genres: {
        type: [String],
        default: []
    },
    languages: {
        type: [String],
        default: []
    },
    rating: {
        type: String,
        enum: ["U", "UA", "A", "R", "PG", "PG-13"],
        required: true
    },
    posterUrl: {
        type: String,
        required: true
    },
    trailerUrl: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: { createdAt: true, updatedAt: true } });

movieSchema.index({ title: "text" });
movieSchema.index({ genres: 1, active: 1 });

const Movie = model('Movie', movieSchema);
export default Movie;