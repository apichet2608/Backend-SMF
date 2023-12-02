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

router.get("/Check_Dept", async (req, res) => {
  const { email } = req.query;
  try {
    let queryStr = `
      SELECT id, email, dept
      FROM smart.smart_users_dept
      where email = $1
    `;

    const queryParams = [email];
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/TaskData", async (req, res) => {
  const { dept, status } = req.query;

  // Convert comma-separated string to an array
  const deptArray = dept.split(",");

  try {
    // Generate the placeholder string for the IN clause based on the length of the dept array
    const placeholders = deptArray
      .map((_, index) => `$${index + 1}`)
      .join(", ");

    let queryStr = `
      SELECT *
      FROM smart.smart_collaboration_task
      WHERE dept IN (${placeholders})
    `;

    // Check if status is provided before adding it to the query
    if (status || status === "total") {
      queryStr += ` AND status = $${deptArray.length + 1}`;
    }

    queryStr += ` ORDER BY no ASC;`;

    // Combine queryParams for both dept and status
    const queryParams = status ? [...deptArray, status] : deptArray;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/CardSummary", async (req, res) => {
//   const { dept, status } = req.query;

//   // Convert comma-separated string to an array
//   const deptArray = dept.split(",");

//   try {
//     // Generate the placeholder string for the IN clause based on the length of the dept array
//     const placeholders = deptArray
//       .map((_, index) => `$${index + 1}`)
//       .join(", ");

//     let queryStr = `
// WITH StatusSummary AS (
//   SELECT
//     status,
//     COUNT(*) AS status_count,
//     jsonb_object_agg(dri, status_count) AS dri_status_count,
//     CASE
//       WHEN status = 'total' THEN 1
//       WHEN status = 'Finished' THEN 2
//       WHEN status = 'Ongoing' THEN 3
//       WHEN status = 'Open' THEN 4
//       ELSE 5
//     END AS status_order
//   FROM (
//     SELECT
//       id,
//       dept,
//       project,
//       description,
//       "action",
//       dri,
//       plan_date,
//       finished_date,
//       status,
//       email,
//       link,
//       "no",
//       vave,
//       sub_action,
//       attached_file,
//       COUNT(*) OVER (PARTITION BY dri, status) AS status_count
//     FROM
//       smart.smart_collaboration_task
//     WHERE
//       dept IN (${placeholders})
//       ${
//         status || status === "total"
//           ? "AND status = $" + (deptArray.length + 1)
//           : ""
//       }
//   ) AS subquery
//   GROUP BY status
// )
// SELECT * FROM StatusSummary

// UNION ALL

// SELECT
//   'total' as status,
//   COUNT(*) as status_count,
//   NULL as dri_status_count,
//   1 as status_order
// FROM
//   smart.smart_collaboration_task
// WHERE
//   dept IN (${placeholders})
//   ${
//     status || status === "total"
//       ? "AND status = $" + (deptArray.length + 1)
//       : ""
//   }
// ORDER BY status_order;
// `;

//     // Check if status is provided before adding it to the query
//     if (status || status === "total") {
//       queryStr += ` AND status = $${deptArray.length + 1}`;
//     }

//     // Combine queryParams for both dept and status
//     const queryParams = status ? [...deptArray, status] : deptArray;

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/CardSummary", async (req, res) => {
  const { dept } = req.query;

  // Convert comma-separated string to an array
  const deptArray = dept.split(",");

  try {
    // Generate the placeholder string for the IN clause based on the length of the dept array
    const placeholders = deptArray
      .map((_, index) => `$${index + 1}`)
      .join(", ");

    const queryStr = `
WITH StatusSummary AS (
  SELECT
    status,
    COUNT(*) AS status_count,
    jsonb_object_agg(dri, status_count) AS dri_status_count,
    CASE
      WHEN status = 'total' THEN 1
      WHEN status = 'Finished' THEN 2
      WHEN status = 'Ongoing' THEN 3
      WHEN status = 'Open' THEN 4
      ELSE 5
    END AS status_order
  FROM (
    SELECT
      id,
      dept,
      project,
      description,
      "action",
      dri,
      plan_date,
      finished_date,
      status,
      email,
      link,
      "no",
      vave,
      sub_action,
      attached_file,
      COUNT(*) OVER (PARTITION BY dri, status) AS status_count
    FROM
      smart.smart_collaboration_task
    WHERE
      dept IN (${placeholders})
  ) AS subquery
  GROUP BY status
)
SELECT * FROM StatusSummary

UNION ALL

SELECT
  'total' as status,
  COUNT(*) as status_count,
  NULL as dri_status_count,
  1 as status_order
FROM
  smart.smart_collaboration_task
WHERE
  dept IN (${placeholders})
ORDER BY status_order;
`;

    const result = await query(queryStr, deptArray);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
