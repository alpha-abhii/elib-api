import express from "express"
import globalErrorHandlers from "./middlewares/globalHandlers";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());


// routes

app.get("/", (req,res,next) => {
    res.json({
        msg: "Welcome to elib apis"
    })
})

app.use("/api/v1/users",userRouter)

//global error handler
app.use(globalErrorHandlers);


export default app;