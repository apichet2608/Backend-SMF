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

router.get("/count-status", async (req, res) => {
  try {
    const result = await query(`
    SELECT status, COUNT(*) AS count
FROM public.smart_machine_connect_list
WHERE status IN ('Finished', 'planed', 'Wait for plan','')
GROUP BY status

UNION ALL

SELECT 'total' AS status, COUNT(*) AS count
FROM public.smart_machine_connect_list
WHERE status IN ('Finished', 'planed', 'Wait for plan','')

order by Count desc
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/table", async (req, res) => {
  try {
    const { status } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (status === "total") {
      queryStr = `
        SELECT *
        FROM public.smart_machine_connect_list smcl
        WHERE status IN ('Finished', 'planed', 'Wait for plan', '')
        ORDER BY finish_date ASC
      `;
    } else {
      queryStr = `
        SELECT *
        FROM public.smart_machine_connect_list smcl
        WHERE status = $1
        ORDER BY finish_date ASC
      `;
      queryParams = [status];
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
      item_factory,
      item_code,
      item_desc2,
      item_desc3,
      item_status,
      item_building,
      item_group,
      item_sub_group,
      item_owner_cc,
      item_sub_process,
      item_mac_maker,
      item_iot_mc_type,
      item_iot_group1,
      item_iot_cont1,
      item_iot_group2,
      item_iot_cont2,
      status,
      npi_year,
      plan_date,
      finish_date,
      remark,
      feeder_no,
    } = req.body;

    const result = await query(
      `UPDATE public.smart_machine_connect_list
       SET
         item_factory = $1,
         item_code = $2,
         item_desc2 = $3,
         item_desc3 = $4,
         item_status = $5,
         item_building = $6,
         item_group = $7,
         item_sub_group = $8,
         item_owner_cc = $9,
         item_sub_process = $10,
         item_mac_maker = $11,
         item_iot_mc_type = $12,
         item_iot_group1 = $13,
         item_iot_cont1 = $14,
         item_iot_group2 = $15,
         item_iot_cont2 = $16,
         status = $17,
         npi_year = $18,
         plan_date = $19,
         finish_date = $20,
         remark = $21,
         feeder_no = $22
       WHERE id = $23;`,
      [
        item_factory,
        item_code,
        item_desc2,
        item_desc3,
        item_status,
        item_building,
        item_group,
        item_sub_group,
        item_owner_cc,
        item_sub_process,
        item_mac_maker,
        item_iot_mc_type,
        item_iot_group1,
        item_iot_cont1,
        item_iot_group2,
        item_iot_cont2,
        status,
        npi_year,
        plan_date,
        finish_date,
        remark,
        feeder_no,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

module.exports = router;
