// dbConnect.js
import mongoose from "mongoose";

const db = process.env.MONGO_URI;

export default function connectDB(options = {}) {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(db, options)
      .then((connectionInstance) => {
        console.log("==== DB Connected ====");
        console.log(`DB_HOST: ${connectionInstance.connection.host}`);
        resolve();
      })
      .catch((error) => {
        console.error("==== DB Connection Failed ====", error.toString());
        reject(error);
      });

    mongoose.connection.on("error", (err) => {
      console.error("==== DB Connection Lost ====", err);
    });
  });
}
