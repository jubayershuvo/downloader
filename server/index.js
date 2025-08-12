import app from "./src/app.js";
import connectDB from "./src/db/confg.js";

app.listen(process.env.PORT || 3000, async () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT || 3000}`
  );
  await connectDB();
});
