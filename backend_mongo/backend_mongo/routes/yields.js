const express = require("express"); // นำเข้า module express
const router = express.Router(); // สร้าง router ใหม่จาก express
const Yield = require("../models/yield"); // นำเข้าโมเดล Yield จากไฟล์ "../models/yield"

// Get all yields
router.get("/", async (req, res, next) => {
  try {
    const yields = await Yield.find(); // ค้นหาและเรียกข้อมูล yields ทั้งหมดจากฐานข้อมูล
    res.json({ message: "Yields fetched successfully", data: yields }); // ส่งข้อมูล yields กลับพร้อมข้อความ
  } catch (err) {
    next(err); // จัดการข้อผิดพลาด
  }
});

// Add a new yield
router.post("/", async (req, res, next) => {
  try {
    const newYield = new Yield(req.body); // สร้าง yield ใหม่จากข้อมูลที่ส่งมา
    const result = await newYield.save(); // บันทึก yield ใหม่ลงฐานข้อมูล
    res
      .status(201)
      .json({ message: "Yield created successfully", data: result }); // ส่งข้อมูล yield ใหม่และข้อความยืนยันกลับ
  } catch (err) {
    next(err); // จัดการข้อผิดพลาด
  }
});

// Edit a yield
router.put("/:id", async (req, res, next) => {
  try {
    const updatedYield = await Yield.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ); // อัปเดตข้อมูล yield ที่มี id ตามที่ระบุ จากข้อมูลที่ส่งมา
    res.json({ message: "Yield updated successfully", data: updatedYield }); // ส่งข้อมูล yield ที่อัปเดตและข้อความยืนยันกลับ
  } catch (err) {
    next(err); // จัดการข้อผิดพลาด
  }
});

// Delete a yield
router.delete("/:id", async (req, res, next) => {
  try {
    const deletedYield = await Yield.findByIdAndDelete(req.params.id); // ลบข้อมูล yield ที่มี id ตามที่ระบุ
    if (deletedYield) {
      res.json({ message: "Yield deleted successfully", data: deletedYield }); // ถ้าลบสำเร็จ, ส่งข้อมูล yield ที่ลบและข้อความยืนยันกลับ
    } else {
      res.status(404).json({ message: "Yield not found" }); // ถ้าไม่พบข้อมูล yield, ส่งข้อความแจ้งว่าไม่พบ
    }
  } catch (err) {
    next(err); // จัดการข้อผิดพลาด
  }
});

module.exports = router; // ส่งออก router เพื่อให้แอปพลิเคชันหลักสามารถใช้งาน
