const createError = require("http-errors"); // นำเข้า http-errors สำหรับจัดการข้อผิดพลาด
const express = require("express"); // นำเข้า express สำหรับสร้างแอปพลิเคชัน
const path = require("path"); // นำเข้า path สำหรับจัดการเส้นทางไฟล์
const cookieParser = require("cookie-parser"); // นำเข้า cookie-parser สำหรับจัดการคุกกี้
const logger = require("morgan"); // นำเข้า morgan สำหรับการบันทึก
const cors = require("cors"); // นำเข้า cors สำหรับใช้งาน Cross-Origin Resource Sharing

const mongoose = require("mongoose"); // นำเข้า mongoose สำหรับเชื่อมต่อ MongoDB

// Authentication middleware
const auth = require("basic-auth");
const checkAuth = (req, res, next) => {
  const user = auth(req);
  const username = "myUserAdmin";
  const password = "myUserAdmin";

  if (user && user.name === username && user.pass === password) {
    next(); // Pass the authentication
  } else {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401); // Status Unauthorized
  }
};

mongoose.Promise = global.Promise;

// เชื่อมต่อฐานข้อมูล MongoDB ด้วย Mongoose
mongoose
  .connect(
    "mongodb://myUserAdmin:myUserAdmin@127.0.0.1:27017/Fujikura_smf?authMechanism=DEFAULT&authSource=admin"
  )
  .then(() => console.log("Connected to database!!"))
  .catch((err) => console.error(err));

// นำเข้า routes
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var yieldsRouter = require("./routes/yields"); // นำเข้า yields route
const aoiDataRoutes = require("./routes/aoi_smf");
const checksheetRoutes = require("./routes/smart_checksheet_08003843_202304191018");
const app = express(); // สร้าง instance ของ express

app.use(cors()); // ใช้งาน cors middleware

// ตั้งค่า view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// ใช้ middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ใช้ routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/yields", checkAuth, yieldsRouter); // Use checkAuth middleware before yields route
app.use("/checksheet", checkAuth, checksheetRoutes);
app.use("/api/aoi-data", checkAuth, aoiDataRoutes);

// จัดการข้อผิดพลาด 404
app.use(function (req, res, next) {
  next(createError(404));
});

// จัดการข้อผิดพลาดอื่น ๆ
app.use(function (err, req, res, next) {
  // ตั้งค่าตัวแปรในระดับ locals เฉพาะ error ในโหมด development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // แสดงหน้า error
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app; // ส่งออก app สำหรับใช้งานในโมดูลอื่น
