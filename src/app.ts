import express from "express"
import globalErrorHandlers from "./middlewares/globalHandlers";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

const app = express();
app.use(express.json());


// routes

app.get("/", (req,res,next) => {
    res.json({
        msg: "Welcome to elib apis"
    })
})

app.use("/api/v1/users",userRouter)
app.use("/api/v1/books",bookRouter)

//global error handler
app.use(globalErrorHandlers);


export default app;