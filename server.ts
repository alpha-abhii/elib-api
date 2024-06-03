import app from "./src/app";
import { config } from "./src/config/config";


const startServer = () => {
    const port = config.port || 3001;

    app.listen(port, () => {
        console.log(`server is listening on port ${port}`)
    })
}

startServer();