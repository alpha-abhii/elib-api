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
            filename_override: fileName,
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


const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.id;
    const {title,genre} = req.body;


    const book = await bookModel.findOne({_id: bookId});

    if(!book) {
        // return res.status(404).json({
        //     "message": "Book not found"
        // })
        return next(createHttpError(404,"Book not found"))
    }

    const _req = req as AuthRequest;

    // console.log(book.author)
    // console.log(_req.userId)

    if(book.author.toString() !== _req.userId) {
        // return res.status(403).json({
        //     "message": "Unauthorized access"
        // })
        return next(createHttpError(403,"You can not update others book."))
    }

    let completeCoverImage = "";
    const files = req.files as {[fieldName: string]: Express.Multer.File[]};

    if(files.coverImage) {
        
        const oldcoverFileSplits = book.coverImage.split('/')
        const oldcoverImagePublicId = oldcoverFileSplits.at(-2)+"/"+oldcoverFileSplits.at(-1)?.split(".").at(-2);
        // console.log("coverImagePublicId",coverImagePublicId)

        const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
        const fileName = files.coverImage[0].filename;

        const filePath = path.resolve(__dirname,"../../public/data/uploads",fileName)

        const uploadResult = await cloudinary.uploader.upload(filePath,{
            filename_override: fileName,
            folder: 'book-covers',
            format: coverImageMimeType
        })

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);

        
        await cloudinary.uploader.destroy(oldcoverImagePublicId);
        
        
    
        

    }
    
    let completeFilePath = "";

    if(files.file){

        const oldbookFileSplits = book.file.split("/")
        const oldbookPublicId = oldbookFileSplits.at(-2)+"/"+oldbookFileSplits.at(-1);
        // console.log(oldbookPublicId)

        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname,"../../public/data/uploads",bookFileName)
    
        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
            resource_type: 'raw',
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: "pdf"
        })

        completeFilePath = bookFileUploadResult.secure_url;
        await fs.promises.unlink(bookFilePath);

        await cloudinary.uploader.destroy(oldbookPublicId,{
            resource_type: "raw"
        });
    }

    const bookUpdate = await bookModel.findOneAndUpdate(
        {
            _id: bookId,
        },
        {
            title: title,
            genre: genre,
            coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
            file: completeFilePath ? completeFilePath: book.file
        },
        {
            new: true
        }
    )

    res.json(bookUpdate);

}

const listBooks = async (req: Request, res: Response, next: NextFunction) => {

    try {
        //todo: add pagination
        const book = await bookModel.find();
        res.json(book)
    } catch (error) {
        return next(createHttpError(500,"Error while getting the book"))
    }
}

const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.id;
    
    try {
        const book = await bookModel.findOne({_id: bookId});
        if(!book) {
            return next(createHttpError(404,"Book not found"))
        }
        return res.json(book);
    } catch (error) {
        return next(createHttpError(500, "Error while getting a book"))
    }
}

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.id;
    // console.log("bookId: ",bookId)

    const book = await bookModel.findOne({_id: bookId});

    if(!book) {
        return next(createHttpError(404,"Book not found"))
    }

    const _req = req as AuthRequest;

    if(book.author.toString() !== _req.userId) {
        return next(createHttpError(403,"You can not delete others book."))
    }

    const coverFileSplits = book.coverImage.split('/')
    const coverImagePublicId = coverFileSplits.at(-2)+"/"+coverFileSplits.at(-1)?.split(".").at(-2);
    // console.log("coverImagePublicId",coverImagePublicId)
    
    const bookFileSplits = book.file.split("/")
    const bookPublicId = bookFileSplits.at(-2)+"/"+bookFileSplits.at(-1);
    // console.log(bookPublicId)

    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookPublicId,{
        resource_type: "raw"
    });

    await bookModel.deleteOne({_id: bookId});

    return res.sendStatus(204)
}

export {
    createBook,
    updateBook,
    listBooks,
    getSingleBook,
    deleteBook
}