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
      item_factory,
      item_code,
      item_desc1,
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
         item_desc1 = $3,
         item_desc2 = $4,
         item_desc3 = $5,
         item_status = $6,
         item_building = $7,
         item_group = $8,
         item_sub_group = $9,
         item_owner_cc = $10,
         item_sub_process = $11,
         item_mac_maker = $12,
         item_iot_mc_type = $13,
         item_iot_group1 = $14,
         item_iot_cont1 = $15,
         item_iot_group2 = $16,
         item_iot_cont2 = $17,
         status = $18,
         npi_year = $19,
         plan_date = $20,
         finish_date = $21,
         remark = $22,
         feeder_no = $23
       WHERE id = $24;`,
      [
        item_factory,
        item_code,
        item_desc1,
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

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM public.smart_machine_connect_list WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// POST route to add new data
router.post("/", async (req, res) => {
  try {
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
      item_desc1,
    } = req.body;

    const result = await query(
      `insert
      into
      smart_machine_connect_list
    (item_factory,
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
      item_desc1)
    values($1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    $17,
    $18,
    $19,
    $20,
    $21,
    $22,
    $23);`,
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
        item_desc1,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});
module.exports = router;
