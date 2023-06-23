const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.57",
  port: 5432,
  user: "postgres",
  password: "fujikura",
  database: "smart_factory", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});


const query = (text, params) => pool.query(text, params);

router.get("/factory", async (req, res) => {
  try {
    const result = await query(`
select
	distinct factory 
from
	public.smart_enviro_cleanroomparticle
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/room", async (req, res) => {
  try {
    const { factory } = req.query;
    const result = await query(
      `select
	distinct area 
from
	public.smart_enviro_cleanroomparticle
where factory = $1`,
      [factory]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/processmachine", async (req, res) => {
  try {
    const { factory, room } = req.query;
    const result = await query(
      `
select
	distinct process_machine
from
	public.smart_enviro_cleanroomparticle
   where factory = $1
   and area =$2`,
      [factory, room]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/querry", async (req, res) => {
  try {
    const { process_machine, factory, area } = req.query;
    const day = parseInt(req.query.day); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(day)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
	*
from
	public.smart_enviro_cleanroomparticle
where process_machine = $1
and factory = $2
and area = $3
and measuretime :: timestamp >= (now() - interval '${day}' day)
order by measuretime asc`,
      [process_machine, factory, area]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/isoclass", async (req, res) => {
  try {
    const { process_machine, factory, area } = req.query;
    const day = parseInt(req.query.day); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(day)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
      distinct iso_class 
from
	public.smart_enviro_cleanroomparticle
where process_machine = $1
and factory = $2
and area = $3
and measuretime :: timestamp >= (now() - interval '${day}' day)`,
      [process_machine, factory, area]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;

// http://10.17.77.111:3001/api/smart_enviro_cleanroomparticle/querry?process_machine=RCLL-B&factory=B&hours=48
// http://10.17.77.111:3001/api/smart_enviro_cleanroomparticle/querry?process_machine=B&factory=RLSP&hours=48
