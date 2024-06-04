import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/config";
import { User } from "./userTypes";

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

    try {
        const user = await userModel.findOne({email});
    
        if(user) {
            const error = createHttpError(400,"User already exists with this email.")
            return next(error);
        }
    
    } catch (error) {
        return next(createHttpError(500,"Error while getting user"))
    }

    let newUser: User;

    try {
        const hashedPassword = await bcrypt.hash(password,10,);
        newUser = await userModel.create({
            name,
            email,
            password: hashedPassword
        })
    } catch (error) {
        return next(createHttpError(500,"Error while creating user"))
    }

    

    try {
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
    
        res.status(201).json({
            accessToken: token
        })
    } catch (error) {
        return next(createHttpError(500,"Error while signing the jwt token"))
    }
}

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const {email,password} = req.body;

    if(!email || !password) {
        return next(createHttpError(400,"All fields are required"));
    }

    const user = await userModel.findOne({email});

    if(!user) {
        return next(createHttpError(401,"User doesnot exists"))
    }

    const isPasswordCorrect = await bcrypt.compare(password,user.password)

    if(!isPasswordCorrect){
        return next(createHttpError(400,"Password is incorrect"))
    }

    const token = jwt.sign(
        {
            sub: user._id
        },
            config.jwtSecret as string,
        {
            expiresIn: "7d",
            algorithm: "HS256"
        }
    )


    res.status(200).json({
        accessToken: token
    })
}

export { 
    createUser,
    loginUser
};