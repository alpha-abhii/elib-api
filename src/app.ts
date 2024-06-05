import express from "express"
import cors from "cors"
import globalErrorHandlers from "./middlewares/globalHandlers";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import { config } from "./config/config";

const app = express();

app.use(cors({
    origin: config.frontendDomain,
}))

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