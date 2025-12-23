import User from "../models/user.models.js";
import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {
  emailVerificationMailgenContent,
  sendEmail
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/// 🔐 Generate tokens
export const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/// 📝 Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (!fullname || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existedUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    isEmailVerified: false
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
    )
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

/// login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .status(200)
    .json(new ApiResponse(200, "User logged in successfully", {
      user: loggedInUser,
      accessToken,
      refreshToken
    }));
});

/// Logout user
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, 
    { refreshToken: null },
    {new :true});

  const options = {
    httpOnly: true,
    secure: true
  };
  res.clearCookie("refreshToken", options);
  res.clearCookie("accessToken", options);
  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
});

/// get current logged in user
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

/// verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params; 
  if (!verificationToken) {
    throw new ApiError(400, "Verification token is missing");
  }
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() }
    });
    if (!user) {
      throw new ApiError(400, "Invalid or expired verification token");
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, "Email verified successfully"));
});

/// Resend verification email
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }
   const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
    )
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Verification email sent successfully"));
});

/// refreshAccessToken
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401, "Refresh token is missing");  
  }
  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if(!user){
      throw new ApiError(401, "User not found");
    }
    if(user.refreshToken !== incomingRefreshToken){
      throw new ApiError(401, "Invalid refresh token");
    }
    const options = {
      httpOnly: true,
      secure: true
    };
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    return res
      .cookie("accessToken", accessToken, options)
      .status(200)
      .json(new ApiResponse(200, "Access token refreshed successfully", {accessToken}));
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
})
