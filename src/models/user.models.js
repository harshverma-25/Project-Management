import mongoose  from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

// hashing password before saving user
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// method to compare passwords
userSchema.methods.isPasswordMatch = async function(password){
    return await bcrypt.compare(password, this.password);
};

// method to generate JWT token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
);
};

userSchema.methods.generateTemporaryToken = function(){
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash(sha256)
        .update(unHashedToken)
        .digest("hex")

        
    const tokenExpiry = Date.now() + (20*60*1000)
    return {unHashedToken, hashedToken, tokenExpiry}
}

const User = mongoose.model("User", userSchema);
export default User;