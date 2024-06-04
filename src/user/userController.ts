import { NextFunction, Request, Response } from "express";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    return res.status(200).json({
        msg: "Got your data"
    })
}

export { createUser };