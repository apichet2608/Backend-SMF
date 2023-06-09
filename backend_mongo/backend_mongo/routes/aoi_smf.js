const express = require("express");
const router = express.Router();

const AoiData = require("../models/aoi_smf");

// Route สำหรับดึงข้อมูลจาก MongoDB โดยใช้ filter จาก aoi_prd_name และ aoi_side
router.get("/filter", async (req, res) => {
  try {
    const { aoi_prd_name, aoi_side } = req.query;

    // ตั้งค่าวันที่เริ่มต้นและสิ้นสุดสำหรับช่วงปัจจุบันและย้อนหลัง 2 เดือน
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);
    startDate.setDate(1);

    // Convert dates to the format "YYYY-MM-DD"
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const filter = {
      aoi_prd_name,
      aoi_side,
      aoi_date: { $gte: startDateStr, $lte: endDateStr },
    };

    const aoiData = await AoiData.find(filter);
    res.status(200).json(aoiData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
