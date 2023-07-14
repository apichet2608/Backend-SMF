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

router.get("/page1/distinctaspects", async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT aspects
      FROM public.smart_overall_require_08003809
      ORDER BY aspects ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/distinctaspect", async (req, res) => {
  try {
    const { aspects } = req.query;

    const queryStr = `
      SELECT DISTINCT aspect
      FROM public.smart_overall_require_08003809
      WHERE aspects = $1
      ORDER BY aspect ASC
    `;
    const queryParams = [aspects];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/table", async (req, res) => {
  try {
    const { aspects, aspect } = req.query;

    let queryStr = `
      SELECT
        id,
        "no",
        aspects,
        sub_no,
        aspect,
        sub_sub_no,
        request,
        score,
        description_proof,
        done,
        total,
        update_by,
        fjk_comment,
        dept_concern,
        email,
        create_at,
        update_date
      FROM public.smart_overall_require_08003809
      WHERE aspects = $1
    `;
    let queryParams = [aspects];

    if (aspect && aspect !== "ALL") {
      queryStr += `AND aspect = $2`;
      queryParams.push(aspect);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `delete
      from
        smart_overall_require_08003809
      where
        id = $1;
        `,
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// UPDATE route to UPDATE data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      no,
      aspects,
      sub_no,
      aspect,
      sub_sub_no,
      request,
      score,
      description_proof,
      done,
      total,
      update_by,
      fjk_comment,
      dept_concern,
      email,
    } = req.body;

    const result = await query(
      `UPDATE smart_overall_require_08003809
       SET
         "no" = $1,
         aspects = $2,
         sub_no = $3,
         aspect = $4,
         sub_sub_no = $5,
         request = $6,
         score = $7,
         description_proof = $8,
         done = $9,
         total = $10,
         update_by = $11,
         fjk_comment = $12,
         dept_concern = $13,
         email = $14,
         update_date = now()
       WHERE id = $15`,
      [
        no,
        aspects,
        sub_no,
        aspect,
        sub_sub_no,
        request,
        score,
        description_proof,
        done,
        total,
        update_by,
        fjk_comment,
        dept_concern,
        email,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// POST route to insert data
router.post("/", async (req, res) => {
  try {
    const {
      no,
      aspects,
      sub_no,
      aspect,
      sub_sub_no,
      request,
      score,
      description_proof,
      done,
      total,
      update_by,
      fjk_comment,
      dept_concern,
      email,
    } = req.body;
    const result = await query(
      `INSERT INTO smart_overall_require_08003809 (
       "no",
       aspects,
       sub_no,
       aspect,
       sub_sub_no,
       request,
       score,
       description_proof,
       done,
       total,
       update_by,
       fjk_comment,
       dept_concern,
       email,
       create_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now())`,
      [
        no,
        aspects,
        sub_no,
        aspect,
        sub_sub_no,
        request,
        score,
        description_proof,
        done,
        total,
        update_by,
        fjk_comment,
        dept_concern,
        email,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

module.exports = router;
