import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`mongodb+srv://sunidhirhapsody:Ny7UQ16yE4n1vrrB@jayitsaha.ellpjty.mongodb.net/${DB_NAME}`);
        console.log(`\n MongoDB Connected... DB HOST: ${connectionInstance.connection.host}`);
    } catch(e){
        console.log("MONGODB CONNECTION FAILED",e);
        process.exit(1);
    }
}

export default connectDB;