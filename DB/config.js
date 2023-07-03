const mongoose = require("mongoose");

const connectDatabase = async () => {
  console.log("here");
  try {
    const db = await mongoose.connect(
      "mongodb+srv://abhinavsiwal:nashcard4790@cluster0.zgzoc68.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Database Connected");
  } catch (error) {
    console.log(
      "Error in connecting to database. Please check your connection"
    );
    console.log(error);
  }
};

module.exports = connectDatabase;
