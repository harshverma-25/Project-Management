import User from "../models/user.models.js";
import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch(error){
        throw new ApiError(
            500,
            "Some Went wrong while generating access token",
        )
    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existedUser) {
        throw new ApiError(400, "Username or email already in use", []);
    }

    const user = await User.create({ username, email, password, isEmailVerified: false });
    
    const {unHashedToken, hashedToken, tokenExpiry} =
    user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/vi/users/verify-email/${unHashedToken}`
        )
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    )

    if(!createdUser){
        throw new ApiError(500, "Something went Wrong while registering a user")
    }


   return res.status(201).json(new ApiResponse(201, "User registered successfully", {user: CreatedUser}));
});

