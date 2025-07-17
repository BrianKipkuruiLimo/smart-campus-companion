import mongoose from "mongoose";

mongoose.connection.on('connected', () => console.log('MongoDB connected'));

const connectDB = async () => {
   await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

export default connectDB;
