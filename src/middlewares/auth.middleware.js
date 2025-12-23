import User from "../models/user.models";
import asyncHandler from "../utils/async-handler";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(401, "Authentication token is missing");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
        if (!user) {
            throw new ApiError(401, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid authentication token");
    }
});