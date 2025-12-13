import apiresponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js";

export const healthcheck = asyncHandler(async (req, res) => {
     res.status(200).json(
        new apiresponse(200, "Server is running", true)
        );
    });




