const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.111",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/", async (req, res) => {
  try {
    const { un_id } = req.query;
    let queryStr = `
      SELECT *
      FROM public.smart_qa_aql_record
      WHERE un_id = $1
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
      un_id,
      sub_task,
      key_id,
      round,
      qa_code,
      qa_shift,
      qa_head,
      total_rej,
      qty_rej,
      process,
      defect_code,
      sub_defectcode,
      defect_level,
      status,
      fin_code,
      fin_shift,
      fin_line,
      rootcause,
      corrective,
      preventive,
      result_res,
      eff_date,
      action_by,
      approve_by,
    } = req.body;

    const result = await query(
      `INSERT INTO smart_qa_aql_record (
         un_id, sub_task, date_time, key_id, round, qa_code, qa_shift, 
         qa_head, total_rej, qty_rej, process, defect_code, sub_defectcode, 
         defect_level, status, fin_code, fin_shift, fin_line, rootcause, 
         corrective, preventive, result_res, eff_date, action_by, approve_by
       )
       VALUES (
         $1, $2, now(), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
         $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
       );`,
      [
        un_id,
        sub_task,
        key_id,
        round,
        qa_code,
        qa_shift,
        qa_head,
        total_rej,
        qty_rej,
        process,
        defect_code,
        sub_defectcode,
        defect_level,
        status,
        fin_code,
        fin_shift,
        fin_line,
        rootcause,
        corrective,
        preventive,
        result_res,
        eff_date,
        action_by,
        approve_by,
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
    const { un_id, sub_task } = req.body;

    const result = await query(
      `UPDATE smart_qa_aql_record
       SET un_id = $1,
           sub_task = $2
       WHERE id = $3`,
      [un_id, sub_task, id]
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
