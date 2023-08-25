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

router.get("/distinctfactory", async (req, res) => {
  try {
    const result = await query(
      `SELECT distinct factory_desc
      FROM public.smart_product_lot_status_count
      order by factory_desc asc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotchart1", async (req, res) => {
  try {
    const { factory_desc, lot_status } = req.query;

    let queryStr = `
    select
	id,
	create_at,
	update_date,
	factory_desc,
	fac_unit_desc,
	lot_status,
	count_lot
from
	public.smart_product_lot_status_count
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
    AND
  `;
    queryStr += `
    create_at >= NOW() - INTERVAL '1 year'
    `;
    queryStr += `
    ORDER BY 
    create_at asc,
    count_lot asc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotchartfixfac_unit_desc", async (req, res) => {
  try {
    const { factory_desc, lot_status, fac_unit_desc } = req.query;

    let queryStr = `
    select
	id,
	create_at,
	update_date,
	factory_desc,
	fac_unit_desc,
	lot_status,
	count_lot
from
	public.smart_product_lot_status_count
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

    if (fac_unit_desc !== "-") {
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
      fac_unit_desc = $${queryParams.length + 1}
      `;
      queryParams.push(fac_unit_desc);
    }
    queryStr += `
    AND
  `;
    queryStr += `
    create_at >= NOW() - INTERVAL '1 year'
    `;
    queryStr += `
    ORDER BY 
    create_at asc,
    count_lot asc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
