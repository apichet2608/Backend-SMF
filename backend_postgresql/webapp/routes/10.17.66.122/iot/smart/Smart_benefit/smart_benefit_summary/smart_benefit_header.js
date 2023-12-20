const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.122",
  port: 5432,
  user: "postgres",
  password: "p45aH9c17hT11T{]",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/Table_benefit_header", async (req, res) => {
  try {
    const result = await query(
      `select
	id,
	create_at,
	aspect_id,
	aspects_code,
	aspects,
	items_code,
	items_desc,
	action_id,
	is_action,
	smf_line_cost_saving,
	none_smf_line_cost_saving
from
	smart.smart_benefit_header
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
