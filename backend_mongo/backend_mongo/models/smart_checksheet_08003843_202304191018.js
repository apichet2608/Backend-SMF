const mongoose = require("mongoose"); // นำเข้า module mongoose
const Schema = mongoose.Schema; // นำเข้า class Schema จาก mongoose

// สร้าง schema สำหรับข้อมูล checksheet
const checksheetSchema = new Schema({
  month: { type: String, required: false },
  process: { type: String, required: false },
  product: { type: String, required: false },
  totol_per: { type: Number, required: false },
  target: { type: Number, required: false },
});

// ส่งออกโมเดล checksheet ที่ใช้งานกับคอลเลกชัน "smart_checksheet_08003843_202304191018" ในฐานข้อมูล
module.exports = mongoose.model(
  "smart_checksheet_08003843_202304191018",
  checksheetSchema,
  "smart_checksheet_08003843_202304191018"
);
