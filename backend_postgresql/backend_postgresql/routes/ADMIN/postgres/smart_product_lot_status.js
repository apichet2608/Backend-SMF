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

router.get("/pieplot1", async (req, res) => {
  try {
    const { factory_desc } = req.query;

    let queryStr = `
    select
    lot_status as status,
    COUNT(lot_status) as status_count
  from
    public.smart_product_lot_status
    `;

    let queryParams = [];

    if (factory_desc !== "ALL") {
      queryStr += `
      where
      factory_desc = $1
      `;
      queryParams.push(factory_desc);
    }

    queryStr += `
    group by
    lot_status
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/pieplot2", async (req, res) => {
  try {
    const { factory_desc, lot_status } = req.query;

    let queryStr = `
    select
	fac_unit_desc as status,
	COUNT(fac_unit_desc) as status_count
from
	public.smart_product_lot_status
    `;

    let queryParams = [];

    if (factory_desc !== "ALL") {
      queryStr += `
        WHERE
        factory_desc = $1
      `;
      queryParams.push(factory_desc);
    }

    if (lot_status !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
        `;
      } else {
        queryStr += `
          WHERE
        `;
      }
      queryStr += `
      lot_status = $${queryParams.length + 1}
      `;
      queryParams.push(lot_status);
    }

    queryStr += `
    group by
    fac_unit_desc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/pieplot3", async (req, res) => {
  try {
    const { factory_desc, lot_status } = req.query;

    let queryStr = `
    select
	pending_reason as status,
	COUNT(lot_status) as status_count
from
	public.smart_product_lot_status
    `;

    let queryParams = [];

    if (factory_desc !== "ALL") {
      queryStr += `
        WHERE
        factory_desc = $1
      `;
      queryParams.push(factory_desc);
    }

    if (lot_status !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
        `;
      } else {
        queryStr += `
          WHERE
        `;
      }
      queryStr += `
      lot_status = $${queryParams.length + 1}
      `;
      queryParams.push(lot_status);
    }

    queryStr += `
    group by
    pending_reason
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
