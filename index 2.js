const express = require('express');
const app = express();

// Code for API Fech

app.get("/", (req, resp) => {
    resp.send("Server Is LOading ....")
});

app.listen(5001)

//5001 Server confirgure for nashcard application

