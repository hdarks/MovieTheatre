import mongoose from "mongoose";

const { Schema, model } = mongoose;

const preferenceSchema = new Schema({
    genres: {
        type: [String],
        default: []
    },
    language: {
        type: String,
        default: 'English'
    }
}, { _id: false });

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid Email Format"]
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: 60
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    role: {
        type: String,
        enum: ["customer", "staff", "manager", "admin"],
        default: "customer"
    },
    loyaltyPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    preferences: {
        type: preferenceSchema,
        default: () => ({})
    }
}, { timestamps: true });

userSchema.index({ email: 1 });

userSchema.methods.addPoints = function (points) {
    this.loyaltyPoints += points;
    return this.find({ role });
};

userSchema.statics.findByRole = function (role) {
    return this.find({ role });
}

const User = model('User', userSchema);

export default User;