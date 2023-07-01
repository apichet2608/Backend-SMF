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

router.get("/table", async (req, res) => {
  try {
    const { dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (dept === "ALL") {
      queryStr = `
      select
      *
    from
      public.smart_project_task
      `;
    } else {
      queryStr = `
      select
	*
from
	public.smart_project_task
where dept = $1
      `;
      queryParams = [dept];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dept,
      project,
      description,
      action,
      dri,
      plan_date,
      finished_date,
      status,
      email,
      link,
    } = req.body;

    const result = await query(
      `UPDATE public.smart_project_task
       SET
         dept = $1,
         project = $2,
         description = $3,
         action = $4,
         dri = $5,
         plan_date = $6,
         finished_date = $7,
         status = $8,
         email = $9,
         link = $10
       WHERE id = $11`,
      [
        dept,
        project,
        description,
        action,
        dri,
        plan_date,
        finished_date,
        status,
        email,
        link,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM public.smart_project_task WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      dept,
      project,
      description,
      action,
      dri,
      plan_date,
      finished_date,
      status,
      email,
      link,
    } = req.body;

    const result = await query(
      `INSERT INTO smart_project_task (
         dept,
         project,
         description,
         action,
         dri,
         plan_date,
         finished_date,
         status,
         email,
         link
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        dept,
        project,
        description,
        action,
        dri,
        plan_date,
        finished_date,
        status,
        email,
        link,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

module.exports = router;
