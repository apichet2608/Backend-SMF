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
    const { factory_desc, fac_unit_desc } = req.query;

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
    if (fac_unit_desc !== "ALL") {
      queryStr += `
      AND
      fac_unit_desc = $2
      `;
      queryParams.push(fac_unit_desc);
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
    const { factory_desc, lot_status, fac_unit_desc } = req.query;

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

    if (fac_unit_desc !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
          fac_unit_desc = $${queryParams.length + 1}
        `;
      }

      queryParams.push(fac_unit_desc);
    }

    queryStr += `
    group by
    pending_reason
    order by 
    status_count desc
    limit 20
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/pieplot4", async (req, res) => {
  try {
    const { factory_desc, lot_status, fac_unit_desc } = req.query;

    let queryStr = `
    select
    lot_prd_name as status,
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

    if (fac_unit_desc !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
          fac_unit_desc = $${queryParams.length + 1}
        `;
      }

      queryParams.push(fac_unit_desc);
    }

    queryStr += `
    group by
    lot_prd_name
    order by 
    status_count desc
    limit 15
    `;
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/table", async (req, res) => {
  try {
    const { factory_desc, lot_status, fac_unit_desc } = req.query;

    let queryStr = `
    select
	id,
	lot_prd_name,
	lot,
	proc_id,
	proc_disp,
	lot_status,
	input_qty,
	pending_date,
	pending_group,
	pending_reason,
	pending_remark,
	fac_unit_desc,
	factory_desc
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

    if (fac_unit_desc !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += `
          AND
          fac_unit_desc = $${queryParams.length + 1}
        `;
      }

      queryParams.push(fac_unit_desc);
    }

    queryStr += `
    order by
	pending_date :: timestamp asc ,
	lot_prd_name asc ,
	proc_disp asc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
