import { body } from "express-validator";

const registerValidator = () => [
    body('email')
        .trim()
        .isEmail()
        .isEmpty()
        .withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
];

const loginValidator = () => [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

export { registerValidator, loginValidator };