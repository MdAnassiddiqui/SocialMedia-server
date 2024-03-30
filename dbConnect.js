const mongoose = require('mongoose');
module.exports =async() =>{
    const mongoUri ="mongodb://localhost:27017/Social-media"
    try{ 
    const connect = await mongoose.connect(mongoUri ,{
        useUnifiedTopology :true,  
        useNewUrlParser: true,
    });
    console.log(`MongoDB connected: ${connect.connection.host}`);
}
catch(error){
    console.log(error);
    process.exit(1);
} 
}