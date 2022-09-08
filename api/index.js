const express = require('express');
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const morgan = require('morgan');
const auth = require("./routes/auth");
const posts = require("./routes/posts");
const user = require("./routes/user");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan());
const storage = multer.diskStorage({
  destination : (req,file, cb)=> {
    cb(null, "public/images");
  },
  filename : (req,file,cb) => {
    cb(null, req.body.name);
  }
})
const upload = multer({storage});
app.post("/api/upload" , upload.single("file"), (req,res) => {
  try {
    return res.status(200).json("File uploaded successfully.");
  } catch (error) {
    console.log(error);
  }
})

mongoose.connect(process.env.MONGO_URL, () => {
  app.listen(8088, () => {
    console.log("App running!");
  });
});

app.use("/images" , express.static(path.join(__dirname , "public/images")));

//route
app.use("/api/user" , auth);
app.use("/api/user" , user);
app.use("/api/post" , posts)

