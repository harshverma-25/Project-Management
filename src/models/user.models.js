import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
    avatar:{
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            localPath: null
        }
    },
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true
    },
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    refreshToken:{
        type: String
    },
    forgotPasswordToken:{
        type: String
    },
    forgetPasswordExpiry:{
        type: Date
    },
    emailVerificationToken:{
        type: String
    },
    emailVerificationExpiry:{
        type: Date
    },
    
}, {timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;