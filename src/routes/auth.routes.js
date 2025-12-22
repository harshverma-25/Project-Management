import { Router } from "express";
import {login, registerUser} from "../controllers/auth.controllers.js"
import { registerValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/register").post( registerValidator(), validate, registerUser);
router.route("/login").post(login);


export default router;
