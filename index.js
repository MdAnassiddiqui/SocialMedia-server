const express = require("express");
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const dbConnect = require("./dbConnect");
const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const morgan = require("morgan");
const postsRouter = require("./routers/postsRouter");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary =require ('cloudinary').v2;
//const bodyParser =require('body-parser');         
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});



// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(morgan("common"));
app.use(cookieParser());

let origin = 'http://localhost:3000';
console.log('here env', process.env.NODE_ENV);
if(process.env.NODE_ENV === 'production') {
    origin = process.env.CORS_ORIGIN;
}

// Set up CORS to allow requests from the frontend domain
app.use(cors({
    credentials: true,
    origin
}));

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/user' ,userRouter);

app.get('/', (req, res) => {
    res.status(200).send("Ok from server");
});

const PORT = process.env.PORT || 4001;
dbConnect();
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
