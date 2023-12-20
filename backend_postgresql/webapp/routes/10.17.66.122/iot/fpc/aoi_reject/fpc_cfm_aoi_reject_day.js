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

router.get("/AOI_Table", async (req, res) => {
  try {
    const { aoi_date, aoi_prd_name } = req.query;

    let query = `
     SELECT 
        ROW_NUMBER() OVER (ORDER BY aoi_date) AS id,
        TO_CHAR(aoi_date, 'YYYY-MM-DD') AS formatted_aoi_date,                
        aoi_prd_name AS product_name, 
        aoi_side,                
        sub_group,             
        reject_desc,             
        sum_input_pcs AS input_pcs,  
        sum_rej_qty AS rej_qty,      
        CASE 
          WHEN reject_percentage = 0 THEN '0'
          ELSE TO_CHAR(reject_percentage, 'FM0.999')
        END AS rej_percent 
      FROM 
        fpc.fpc_cfm_aoi_reject_day
      WHERE 1=1
    `;

    const queryParams = [];

    if (aoi_date && aoi_date !== "ALL") {
      query += " AND aoi_date = $1"; // Use the original expression
      queryParams.push(aoi_date);
    }

    if (aoi_prd_name && aoi_prd_name !== "ALL") {
      query += " AND aoi_prd_name = $2";
      queryParams.push(aoi_prd_name);
    }

    query += `
      ORDER BY 
        aoi_date DESC, product_name DESC, aoi_side, reject_percentage DESC;
    `;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_aoi_date", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT DISTINCT TO_CHAR(aoi_date, 'YYYY-MM-DD') AS formatted_aoi_date
            FROM fpc.fpc_cfm_aoi_reject_day fcard
            ORDER BY formatted_aoi_date DESC;
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinct_aoi_prd_name", async (req, res) => {
  try {
    const { aoi_date } = req.query;
    let query = `
      select distinct aoi_prd_name  as product_name
    from fpc.fpc_cfm_aoi_reject_day fcard
    `;
    if (aoi_date !== "ALL") {
      query += `
        WHERE aoi_date = $1
      `;
    }
    const queryParams = aoi_date !== "ALL" ? [aoi_date] : [];
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/Chart_AOI", async (req, res) => {
  try {
    const { aoi_prd_name, aoi_side, sub_group, reject_desc } = req.query;

    let queryStr = `
      SELECT 
        TO_CHAR(aoi_date, 'yyyy-mm-dd') AS formatted_date,           
        aoi_prd_name AS product_name, 
        aoi_side,                
        sub_group,             
        reject_desc,             
        sum_input_pcs AS input_pcs,  
        sum_rej_qty AS rej_qty,      
        CASE 
          WHEN reject_percentage = 0 THEN '0'
          ELSE TO_CHAR(reject_percentage, 'FM0.999')
        END AS rej_percent 
      FROM 
        fpc.fpc_cfm_aoi_reject_day
      WHERE 1=1
    `;

    const queryParams = [];

    if (aoi_prd_name && aoi_prd_name !== "all") {
      queryStr += ` AND aoi_prd_name = $${queryParams.length + 1}`;
      queryParams.push(aoi_prd_name);
    }

    if (aoi_side && aoi_side !== "all") {
      queryStr += ` AND aoi_side = $${queryParams.length + 1}`;
      queryParams.push(aoi_side);
    }

    if (sub_group && sub_group !== "all") {
      queryStr += ` AND sub_group = $${queryParams.length + 1}`;
      queryParams.push(sub_group);
    }

    if (reject_desc && reject_desc !== "all") {
      queryStr += ` AND reject_desc = $${queryParams.length + 1}`;
      queryParams.push(reject_desc);
    }

    queryStr += `
      ORDER BY aoi_date, product_name DESC, aoi_side, reject_percentage DESC;
    `;

    const result = await pool.query(queryStr, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/setDEFAULT", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select distinct TO_CHAR(aoi_date, 'YYYY-MM-DD') as formatted_aoi_date
      from fpc.fpc_cfm_aoi_reject_day fcard  
      order by formatted_aoi_date desc
      limit 1;
      
      `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
