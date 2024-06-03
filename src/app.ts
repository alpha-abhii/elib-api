import express from "express"
import globalErrorHandlers from "./middlewares/globalHandlers";

const app = express();


// routes

app.get("/", (req,res,next) => {
    res.json({
        msg: "Welcome to elib apis"
    })
})


//global error handler
app.use(globalErrorHandlers);


export default app;