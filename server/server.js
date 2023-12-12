import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";

dotenv.config();

const app = express(); // the framework is express.js
app.use(cors()); // cors():前后端Port不一样，用来连接前后端，相当于前端用proxy的作用

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // 存储的目的地
    cb(null, "uploads/");  //cb(callback) 每次存东西都存在uploads folder里
  },
  filename: function (req, file, cb) { // 存储名字
    cb(null, file.originalname);  //用户上传pdf叫啥名字就叫啥名字
  },
});
const upload = multer({ storage: storage }); // get a multer now

const PORT = 5001;  // my backend port: 5001

let filePath;

// a POST request, path is http://localhost:5001/path
// req: request, user sent; res: response, back to user
// upload.single("file"): 这里调用了我们之前定义的multer，处理上传
app.post("/upload", upload.single("file"), (req, res) => {
  // Use multer to handle file upload
  filePath = req.file.path; // The path where the file is temporarily saved
  res.send(filePath + " your file upload successfully.");
});

// a GET request, path is http://localhost:5001/chat
app.get("/chat", async (req, res) => {
  // req.query.question: 从前端request里提取用户提出的question   
  const resp = await chat(filePath, req.query.question); // Pass the file path to your main function
  res.send(resp.text);
});

app.listen(PORT, () => {
  console.log(`Biu~ Server is running on port ${PORT}`);
});
