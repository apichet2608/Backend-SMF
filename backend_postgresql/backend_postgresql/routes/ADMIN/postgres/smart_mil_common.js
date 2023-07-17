const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/", async (req, res) => {
  try {
    const result = await query(`
select
	*
from
	public.smart_mil_common
order by no 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/apple-dri", async (req, res) => {
  try {
    const result = await query(`
select
	distinct  apple_dri 
from
	public.smart_mil_common;`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/agenda", async (req, res) => {
  try {
    const result = await query(`
select
	distinct  agenda 
from
	public.smart_mil_common;`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year-agenda-status-appledri", async (req, res) => {
  try {
    const { year, agenda, status, apple_dri } = req.query;

    const result = await query(
      `SELECT *
       FROM public.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
         AND agenda = $2
         AND status = $3
         AND apple_dri = $4
         order by no `,
      [year, agenda, status, apple_dri]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year-agenda-status", async (req, res) => {
  try {
    const { year, agenda, status } = req.query;

    const result = await query(
      `SELECT *
       FROM public.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
         AND agenda = $2
         AND status = $3
         order by no `,
      [year, agenda, status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year-agenda", async (req, res) => {
  try {
    const { year, agenda } = req.query;

    const result = await query(
      `SELECT *
       FROM public.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
         AND agenda = $2
         order by no `,
      [year, agenda]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/year", async (req, res) => {
  try {
    const { year } = req.query;

    const result = await query(
      `SELECT *
       FROM public.smart_mil_common
       WHERE EXTRACT(YEAR FROM mil_date) = $1
       order by no `,
      [year]
    );

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
      "DELETE FROM public.smart_mil_common WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// PUT route to update data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      agenda,
      apple_dri,
      mil_date,
      process,
      smart_topic,
      sub_topic,
      risk,
      findings,
      corrective_action,
      fjk_dri,
      cp_date,
      status,
      share_link_report,
      email_list,
      no,
    } = req.body;

    const result = await query(
      `UPDATE public.smart_mil_common 
       SET 
         agenda = $1,
         apple_dri = $2,
         mil_date = $3,
         process = $4,
         smart_topic = $5,
         sub_topic = $6,
         risk = $7,
         findings = $8,
         corrective_action = $9,
         fjk_dri = $10,
         cp_date = $11,
         status = $12,
         share_link_report = $13,
         "email_list" = $14,
         no =  $15
       WHERE id = $16;`,
      [
        agenda,
        apple_dri,
        mil_date,
        process,
        smart_topic,
        sub_topic,
        risk,
        findings,
        corrective_action,
        fjk_dri,
        cp_date,
        status,
        share_link_report,
        email_list,
        no,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// POST route to add new data
router.post("/", async (req, res) => {
  try {
    const {
      agenda,
      apple_dri,
      mil_date,
      process,
      smart_topic,
      sub_topic,
      risk,
      findings,
      corrective_action,
      fjk_dri,
      cp_date,
      status,
      share_link_report,
      email_list,
      no,
    } = req.body;

    const result = await query(
      `INSERT INTO public.smart_mil_common 
       (agenda, apple_dri, mil_date, process, smart_topic, sub_topic, risk, findings, corrective_action, fjk_dri, cp_date, status, share_link_report, "email_list","no")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15);`,
      [
        agenda,
        apple_dri,
        mil_date,
        process,
        smart_topic,
        sub_topic,
        risk,
        findings,
        corrective_action,
        fjk_dri,
        cp_date,
        status,
        share_link_report,
        email_list,
        no,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

// POST route to add new data
router.post("/agenda", async (req, res) => {
  try {
    const { agenda } = req.body;

    const result = await query(
      `INSERT INTO public.smart_mil_common 
       (agenda)
       VALUES ($1);`,
      [agenda]
    );
    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

module.exports = router;
