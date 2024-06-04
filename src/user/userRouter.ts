import express from "express"
import { createUser, loginUser, logout } from "./userController";

const userRouter = express.Router();

userRouter.post("/register",createUser)
userRouter.post("/login",loginUser)
userRouter.post("/logout",logout)

export default userRouter