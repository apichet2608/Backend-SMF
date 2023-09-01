const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.118",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/", async (req, res) => {
  try {
    const { un_id } = req.query;
    let queryStr = `
      SELECT *
      FROM public.smart_qa_aql_record
      WHERE key_id = $1
      order by id desc
    `;
    const queryParams = [un_id];
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// ADD route to ADD data
// ADD route to ADD data
router.post("/insertdata", async (req, res) => {
  try {
    const {
      key_id,
      round,
      qa_code,
      qa_shift,
      qa_head,
      total_rej,
      status,
      rootcause,
      corrective,
      preventive,
      result_res,
      eff_date,
      action_by,
      approve_by,
      sub_total_rej,
    } = req.body;

    const result = await query(
      `insert into smart_qa_aql_record (
        date_time,
        key_id,
        round,
        qa_code,
        qa_shift,
        qa_head,
        total_rej,
        status,
        rootcause,
        corrective,
        preventive,
        result_res,
        eff_date,
        action_by,
        approve_by,
        sub_total_rej
      ) values (
        now(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15 -- Remove the trailing comma here
      );
      `,
      [
        key_id,
        round,
        qa_code,
        qa_shift,
        qa_head,
        total_rej,
        status,
        rootcause,
        corrective,
        preventive,
        result_res,
        eff_date,
        action_by,
        approve_by,
        JSON.stringify(sub_total_rej),
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

// UPDATE route to UPDATE data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date_time,
      key_id,
      round,
      qa_code,
      qa_shift,
      qa_head,
      total_rej,
      status,
      rootcause,
      corrective,
      preventive,
      result_res,
      eff_date,
      action_by,
      approve_by,
    } = req.body;

    const result = await query(
      `update
        smart_qa_aql_record
      set
        date_time = $1,
        key_id = $2,
        round = $3,
        qa_code = $4,
        qa_shift = $5,
        qa_head = $6,
        total_rej = $7,
        status = $8,
        rootcause = $9,
        corrective = $10,
        preventive = $11,
        result_res = $12,
        eff_date = $13,
        action_by = $14,
        approve_by = $15
      where
        id = $16`, // Include $16 as a placeholder for id
      [
        date_time,
        key_id,
        round,
        qa_code,
        qa_shift,
        qa_head,
        total_rej,
        status,
        rootcause,
        corrective,
        preventive,
        result_res,
        eff_date,
        action_by,
        approve_by,
        id, // Bind id as the 16th parameter
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

router.put("/updatesub_total_rej/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sub_total_rej } = req.body;
    console.log(sub_total_rej);
    if (!sub_total_rej) {
      return res.status(400).json({ error: "Missing sub_total_rej data" });
    }

    const subActionJson = JSON.stringify(sub_total_rej); // แปลง Array of Objects เป็น JSON
    const result = await query(
      `UPDATE smart_qa_aql_record
       SET sub_total_rej = $1
       WHERE id = $2`,
      [subActionJson, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// DELETE route to DELETE data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM smart_qa_aql_record
       WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

module.exports = router;
