import express from "express"
import { createBook, listBooks, updateBook } from "./bookController";
import multer from "multer";
import path from "path";
import authenticate from "../middlewares/authenticate";


const bookRouter = express.Router();


const upload = multer({
    dest: path.resolve(__dirname,"../../public/data/uploads"),
    limits: {fileSize: 3e7}//TODO: put limit of max 10mb
})


bookRouter.post("/create",authenticate,upload.fields([
    {name: 'coverImage', maxCount:1},
    {name: "file", maxCount: 1}
]), createBook);

bookRouter.patch("/update/:id",authenticate,upload.fields([
    {name: 'coverImage', maxCount:1},
    {name: "file", maxCount: 1}
]),updateBook)

bookRouter.get("/list",listBooks)


export default bookRouter