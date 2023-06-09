const express = require("express");
const router = express.Router();
const Checksheet = require("../models/smart_checksheet_08003843_202304191018");

// รับข้อมูล checksheets ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const checksheets = await Checksheet.find();
    res.json(checksheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// เพิ่ม checksheet ใหม่
router.post("/", async (req, res, next) => {
  try {
    const newChecksheet = new Checksheet(req.body);
    const result = await newChecksheet.save();
    res.status(201).json({ message: "Checksheet สร้างสำเร็จ", data: result });
  } catch (err) {
    next(err);
  }
});

// ลบ checksheet ตาม ID
router.delete("/:id", async (req, res) => {
  try {
    const removedChecksheet = await Checksheet.findByIdAndDelete(req.params.id);
    res.json({ message: "ลบ checksheet สำเร็จ", data: removedChecksheet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// อัปเดต checksheet ตาม ID
router.put("/:id", async (req, res) => {
  try {
    const updatedChecksheet = await Checksheet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: "อัปเดต checksheet สำเร็จ", data: updatedChecksheet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/checksheet/:month/:product/:process", async (req, res) => {
  try {
    const { month, product, process } = req.params;
    const { totol_per, target } = req.body;

    const updatedChecksheet = await Checksheet.findOneAndUpdate(
      { month, product, process },
      { totol_per, target },
      { new: true }
    );

    res.json({
      message: "อัปเดต checksheet สำเร็จ",
      data: updatedChecksheet,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
