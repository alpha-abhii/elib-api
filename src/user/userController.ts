import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body)
    // return res.status(200).json({
    //     msg: "Got your data"
    // })

    const {name,email,password} = req.body;

    if(!name || !email || !password){
        const error = createHttpError(400, "All fiels are required");
        return next(error);
    }

    const user = await userModel.findOne({email});

    if(user) {
        const error = createHttpError(400,"User already exists with this email.")
        return next(error);
    }

    const hashedPassword = await bcrypt.hash(password,10,);

    const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword
    })

    const token = jwt.sign(
        {
            sub: newUser._id
        },
            config.jwtSecret as string,
        {
            expiresIn: "7d",
            algorithm: "HS256"
        }
)

    res.json({
        accessToken: token
    })
}

export { createUser };