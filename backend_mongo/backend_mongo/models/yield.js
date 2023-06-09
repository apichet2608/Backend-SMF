const mongoose = require("mongoose"); // นำเข้า module mongoose
const Schema = mongoose.Schema; // นำเข้า class Schema จาก mongoose

// สร้าง schema สำหรับข้อมูล yield
const yieldSchema = new Schema({
  station_id: { type: String, required: false },
  lot_no: { type: String, required: false },
  product: { type: String, required: false },
  fj_product: { type: String, required: false },
  input_sn: { type: Number, required: false },
  ng_sn: { type: Number, required: false },
  station_type: { type: String, required: false },
  uut_start: { type: Date, required: false },
  uut_stop: { type: Date, required: false },
  yield: { type: Number, required: false },
  rej_descr: { type: Schema.Types.Mixed, required: false },
  task: { type: String, required: false },
  status: { type: String, required: false },
  checkpoint: { type: String, required: false },
});

// ส่งออกโมเดล Yield ที่ใช้งานกับคอลเลกชัน "yields" ในฐานข้อมูล
module.exports = mongoose.model("Yield", yieldSchema, "yields");
