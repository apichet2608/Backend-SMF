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

router.get("/totalstatus", async (req, res) => {
  try {
    const result = await pool.query(
      `select
  'Total' as title,
  COUNT(*) as value
from
  public.smart_status_data_script_transform
union all
select
  task_status as title,
  COUNT(*) as value
from
  public.smart_status_data_script_transform
group by
  task_status`
    );

    // Send the JSON response back to the client

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `select
	task_description as task_name,
	start_datetime,
	stop_datetime,
	update_datetime,
	from_database as from_db,
	to_database as to_db,
	to_table,
	task_status as check_status,
	task_error_details as task_error_status,
	JSON_AGG(

JSON_BUILD_OBJECT(

'host_name',
	host_name,
	'data_detail',
	data_details,
	'operation_time',
	operation_time,
	'ip_from_db',
	ip_from_database,
	'ip_to_db',
	ip_to_database,
	'cpu_percent',
	cpu_percent,
	'memory_percent',
	memory_percent

)

) as details
from
	public.smart_status_data_script_transform
group by
	task_description,
	start_datetime,
	stop_datetime,
	update_datetime,
	from_database,
	to_database,
	to_table,
	task_status,
	task_error_details;`
    );

    // Send the JSON response back to the client

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);

    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/querry", async (req, res) => {
  try {
    const { task_status } = req.query;

    let queryStr = `
select
	task_description as task_name,
	start_datetime,
	stop_datetime,
	update_datetime,
	from_database as from_db,
	to_database as to_db,
	to_table,
	task_status as check_status,
	task_error_details as task_error_status,
	JSON_AGG(

JSON_BUILD_OBJECT(

'host_name',
	host_name,
	'data_detail',
	data_details,
	'operation_time',
	operation_time,
	'ip_from_db',
	ip_from_database,
	'ip_to_db',
	ip_to_database,
	'cpu_percent',
	cpu_percent,
	'memory_percent',
	memory_percent

)

) as details
from
	public.smart_status_data_script_transform
      `;

    let queryParams = [];

    if (task_status !== "Total" && task_status !== "NULL") {
      queryStr += `
          WHERE
          task_status = $1
        `;

      queryParams.push(task_status);
    }

    if (task_status === "NULL") {
      queryStr += `
          WHERE
          task_status IS NULL
        `;
      //  queryParams.push(task_status);
    }

    queryStr += `
      GROUP BY
        task_description,
        start_datetime,
        stop_datetime,
        update_datetime,
        from_database,
        to_database,
        to_table,
        task_status,
        task_error_details;
      `;

    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
