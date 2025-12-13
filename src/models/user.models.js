import mongoose  from "mongoose";
import bcrypt from "bcrypt";

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





const User = mongoose.model("User", userSchema);
export default User;