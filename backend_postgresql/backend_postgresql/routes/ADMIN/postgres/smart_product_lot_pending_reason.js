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
      `select
      distinct factory_desc
    from
      public.smart_product_lot_pending_reason
    order by
      factory_desc asc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctfac_unit_desc", async (req, res) => {
  try {
    const { factory_desc } = req.query;

    let queryStr = `
    select
	distinct fac_unit_desc
from
	public.smart_product_lot_pending_reason
where
	factory_desc = $1
order by
	fac_unit_desc asc
    `;

    let queryParams = [factory_desc];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotdonutchart", async (req, res) => {
  try {
    const { factory_desc, fac_unit_desc } = req.query;

    let queryStr = `
    select
	pending_reason,
	COUNT(pending_reason) as count_pending_reason,
	create_at
from
	public.smart_product_lot_pending_reason
where
	create_at = (
	select
		MAX(create_at)
	from
		public.smart_product_lot_pending_reason
)
	and
factory_desc = $1
    `;

    let queryParams = [factory_desc];

    if (fac_unit_desc !== "ALL") {
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
    group by
	pending_reason,
	create_at
order by
	pending_reason asc;
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plotareachart", async (req, res) => {
  try {
    const { factory_desc, fac_unit_desc } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (fac_unit_desc !== "ALL") {
      queryStr = `
        select
          fac_unit_desc,
          pending_reason,
          create_at,
          count(count_lot) as result
        from
          public.smart_product_lot_pending_reason
        where
          factory_desc = $1
          and fac_unit_desc = $2
        group by
          fac_unit_desc,
          pending_reason,
          create_at
        ORDER BY 
          create_at asc,
          "result" desc
      `;
      queryParams.push(factory_desc, fac_unit_desc);
    } else {
      queryStr = `
        select
          factory_desc,
          sum(count_lot) as result_sum,
          create_at
        from
          public.smart_product_lot_pending_reason
        where 
          factory_desc = $1
        group by 
          factory_desc,
          create_at
        ORDER BY 
          create_at asc,
          result_sum desc
      `;
      queryParams.push(factory_desc);
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
