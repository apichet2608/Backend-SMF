const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AoiRejSchema = new Schema({
  aoi_rej_code: { type: String, required: true },
  sum_rej_qty: { type: Number, required: true },
  reject_percent: { type: Number, required: true },
});

const AoiDataSchema = new Schema({
  aoi_date: { type: String, required: true },
  aoi_prd_name: { type: String, required: true },
  aoi_side: { type: String, required: true },
  sum_pcs: { type: Number, required: true },
  aoi_rej: [AoiRejSchema],
});

module.exports = mongoose.model("aoi_smf", AoiDataSchema, "aoi_smf");
