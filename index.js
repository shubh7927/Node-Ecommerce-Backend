const http = require('http');
const app = require("./src/app.js");
require("dotenv").config({path:"./.env"});
const server = http.createServer(app);
server.listen(process.env.PORT,()=>{
    console.log(`Server Running at ${process.env.SERVER_BASE_URL}${process.env.PORT}`)
})



