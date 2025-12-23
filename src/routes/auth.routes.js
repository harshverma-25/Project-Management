import { Router } from "express";
import {login, registerUser, logout} from "../controllers/auth.controllers.js"
import { registerValidator, loginValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post( registerValidator(), validate, registerUser);
router.route("/login").post(loginValidator(), validate, login);
// Protected route
router.route("/logout").post( verifyJWT, logout);


export default router;
