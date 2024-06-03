import express from "express"

const app = express();


// routes

app.get("/", (req,res,next) => {
    res.json({
        msg: "Welcome to elib apis"
    })
})


export default app;