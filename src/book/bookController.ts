import { Request, Response, NextFunction } from "express"
import cloudinary from "../config/cloudinary"
import path from "path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs"
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const {title,genre} = req.body;

    // console.log("title:: ",title);
    // console.log("genre:: ",genre);
    // console.log(req.files);

    const files = req.files as {[fieldName: string]: Express.Multer.File[]};
    
    // console.log("files:: ",files)
    

    try {

        const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
        const fileName = files.coverImage[0].filename;

        const filePath = path.resolve(__dirname,"../../public/data/uploads",fileName)

        const uploadResult = await cloudinary.uploader.upload(filePath,{
            filename_override: __filename,
            folder: 'book-covers',
            format: coverImageMimeType
        })

        // console.log(uploadResult);

        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname,"../../public/data/uploads",bookFileName)
    
        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
            resource_type: 'raw',
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: "pdf"
        })
    
        // console.log(bookFileUploadResult);
        // @ts-ignore
        // console.log("userId",req.userId)

        const _req = req as AuthRequest;

        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url
        })

        // console.log(newBook)

        //TODO: wrap in trycatch
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(bookFilePath);


        res.status(201).json({id: newBook._id})

    } catch (error) {
        console.log(error)
        next(createHttpError(500,"Error while uploading the files"))
    }

    

}

export {
    createBook
}