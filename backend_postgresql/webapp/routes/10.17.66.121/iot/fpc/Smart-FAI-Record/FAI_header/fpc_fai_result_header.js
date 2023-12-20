const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "postgres",
  password: "ez2ffp0bp5U3",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/result_header_table", async (req, res) => {
  try {
    const result = await pool.query(
      `
       SELECT 
        id,
        job_id,
        fai_product,
        fai_lot,
        fai_mc_code,
        fai_tool,
        fai_side,
        judgement,
        approve_by,
        approve_date,
        fai_lock
      FROM 
        fpc.fpc_fai_result_header ffrh;
       
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/select_record_id", async (req, res) => {
  try {
    const { fai_dept, fai_proc_group, fai_record } = req.query;
    let query = `
     SELECT
	    DISTINCT fai_record_id
      FROM
	    fpc.fpc_fai_master_header
    `;

    const queryParams = [];
    let whereClauseAdded = false;

    if (fai_dept && fai_dept !== "ALL") {
      query += `
        WHERE fai_dept = $1
      `;
      queryParams.push(fai_dept);
      whereClauseAdded = true;
    }

    if (fai_proc_group && fai_proc_group !== "ALL") {
      if (whereClauseAdded) {
        query += ` AND `;
      } else {
        query += ` WHERE `;
        whereClauseAdded = true;
      }
      query += `
        fai_proc_group = $${queryParams.length + 1}
      `;
      queryParams.push(fai_proc_group);
    }

    if (fai_record && fai_record !== "ALL") {
      if (whereClauseAdded) {
        query += ` AND `;
      } else {
        query += ` WHERE `;
        whereClauseAdded = true;
      }
      query += `
        fai_record = $${queryParams.length + 1}
      `;
      queryParams.push(fai_record);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// ADD HEADER
router.put("/add_create", async (req, res) => {
  console.log("PUT request received at /add_create");
  console.log("Request body:", req.body);

  try {
    // Validate the presence of required fields in the request body
    const requiredFields = [
      "job_id",
      "fai_product",
      "fai_lot",
      "fai_mc_code",
      "fai_tool",
      "fai_side",
      "judgement",
      "approve_by",
      "approve_date",
    ];

    for (const field of requiredFields) {
      if (!(field in req.body) || req.body[field] === null) {
        return res.status(400).json({
          error: `Missing or invalid value for required field: ${field}`,
        });
      }
    }

    const {
      job_id,
      fai_product,
      fai_lot,
      fai_mc_code,
      fai_tool,
      fai_side,
      judgement,
      approve_by,
      approve_date,
    } = req.body;

    // Use parameterized query to prevent SQL injection
    const insertQuery = `
      INSERT INTO fpc.fpc_fai_result_header (
        job_id,
        fai_product,
        fai_lot,
        fai_mc_code,
        fai_tool,
        fai_side,
        judgement,
        approve_by,
        approve_date
      )
      VALUES ($1, $2, $3, $4, $5, $6 ,$7 ,$8, $9)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      job_id,
      fai_product,
      fai_lot,
      fai_mc_code,
      fai_tool,
      fai_side,
      judgement || null, // Allow empty string for judgement
      approve_by || null, // Allow empty string for approve_by
      approve_date || null, // Allow empty string for approve_date
    ]);

    res.status(200).json({ message: "Success", data: result.rows[0] });
  } catch (error) {
    console.error("Error adding data:", error);
    res
      .status(500)
      .json({ error: `An error occurred while adding data: ${error.message}` });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fai_product,
      fai_lot,
      fai_mc_code,
      fai_tool,
      fai_side,
      judgement,
      approve_by,
    } = req.body;

    // Get the current date and time in the desired format

    const results = await query(
      `
        UPDATE fpc.fpc_fai_result_header
        SET
          fai_product = $1,
          fai_lot = $2,
          fai_mc_code = $3,
          fai_tool = $4,
          fai_side = $5,
          judgement = $6,
          approve_by = $7,
          approve_date = now()
        WHERE
          id = $8;
      `,
      [
        fai_product,
        fai_lot,
        fai_mc_code,
        fai_tool,
        fai_side,
        judgement,
        approve_by,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// ADD Detail

// Check  check_detail
router.get("/check_detail", async (req, res) => {
  try {
    const { fai_record_id } = req.query;

    const result = await pool.query(
      `
     select
	job_id as fai_record_id
from
	fpc.fpc_fai_result_detail
where
	job_id = $1
      `,
      [fai_record_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Filter_detail
router.get("/Filter_detail", async (req, res) => {
  try {
    const { fai_record_id } = req.query;

    const result = await pool.query(
      `
      select
	id,
	job_id as fai_record_id,
	fai_no,
	fai_item_check,
	number_flag,
	fai_result,
	fai_text_result
from
	fpc.fpc_fai_result_detail
where
	job_id = $1
order by
	job_id asc
      `,
      [fai_record_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Filter_master
router.get("/Filter_master", async (req, res) => {
  try {
    const { fai_record_id } = req.query;

    const result = await pool.query(
      `
     select
	fai_record_id,
	fai_no,
	fai_item_check,
	number_flag,
	id
from
	fpc.fpc_fai_master_header
where
	fai_record_id = $1
order by
	fai_record_id asc
      `,
      [fai_record_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const results = await query(
      `DELETE FROM fpc.fpc_fai_result_header
       WHERE id = $1;
      `,
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

module.exports = router;
