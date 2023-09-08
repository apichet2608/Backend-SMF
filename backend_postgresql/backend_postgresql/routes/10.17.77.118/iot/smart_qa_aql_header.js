const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.118",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/header", async (req, res) => {
  try {
    // Extract the 'process' query parameter from the request
    const { process, type } = req.query;

    if (!process) {
      // If 'process' query parameter is missing, return a 400 Bad Request response
      return res
        .status(400)
        .json({ error: "Missing 'process' query parameter" });
    }

    const result = await pool.query(
      `SELECT * FROM public.smart_qa_aql_header WHERE process = $1 AND type = $2 ORDER BY id DESC`,
      [process, type]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/header_join_record_last_round_reject", async (req, res) => {
  try {
    // Extract the 'process' query parameter from the request
    const { process, type } = req.query;

    if (!process) {
      // If 'process' query parameter is missing, return a 400 Bad Request response
      return res
        .status(400)
        .json({ error: "Missing 'process' query parameter" });
    }

    const result = await pool.query(
      `
      WITH MaxRoundPerKey AS (
        SELECT
            r.key_id,
            MAX(r.round) AS max_round
        FROM
            public.smart_qa_aql_header h
        JOIN
            public.smart_qa_aql_record r
        ON
            h.un_id = r.key_id
            AND h."type" = $1
            AND h.process = $2
        GROUP BY
            r.key_id
    )
    
    SELECT
        h.un_id,
        r.key_id,
        h.process,
        h."type",
        r.id,
        r.date_time::timestamp,
        r.round,
        r.qa_code,
        r.qa_shift,
        r.qa_head,
        r.total_rej,
        r.status,
        r.rootcause,
        r.corrective,
        r.preventive,
        r.result_res,
        r.eff_date,
        r.action_by,
        r.approve_by,
        r.sub_total_rej
    FROM
        public.smart_qa_aql_header h
    JOIN
        public.smart_qa_aql_record r
    ON
        h.un_id = r.key_id
        AND h."type" = $1
        AND h.process = $2
        AND (r.status NOT IN ('ACCEPT', 'GOOD', 'Good', 'Accept', 'good', 'accept') OR r.status IS NULL)
        AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id);    
      `,
      [type, process]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot_pie_summary", async (req, res) => {
  try {
    // Extract the 'process' query parameter from the request
    const { process, type } = req.query;

    if (!process) {
      // If 'process' query parameter is missing, return a 400 Bad Request response
      return res
        .status(400)
        .json({ error: "Missing 'process' query parameter" });
    }

    const result = await pool.query(
      `
      WITH MaxRoundPerKey AS (
        SELECT
            r.key_id,
            MAX(r.round) AS max_round
        FROM
            public.smart_qa_aql_header h
        JOIN
            public.smart_qa_aql_record r
        ON
            h.un_id = r.key_id
            AND h."type" = $1
            AND h.process = $2
        GROUP BY
            r.key_id
    )
    
    SELECT
        h.process,
        h."type",
        r.status,
        COUNT(r.status) AS result_count_status
    FROM
        public.smart_qa_aql_header h
    JOIN
        public.smart_qa_aql_record r
    ON
        h.un_id = r.key_id
        AND h."type" = $1
        AND h.process = $2
        AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id)
    GROUP BY
        h.process,
        h."type",
        r.status;       
      `,
      [type, process]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/card_summary", async (req, res) => {
  try {
    // Extract the 'process' query parameter from the request
    const { process, type } = req.query;

    if (!process) {
      // If 'process' query parameter is missing, return a 400 Bad Request response
      return res
        .status(400)
        .json({ error: "Missing 'process' query parameter" });
    }

    const result = await pool.query(
      `
      WITH MaxRoundPerKey AS (
        SELECT
            r.key_id,
            MAX(r.round) AS max_round
        FROM
            public.smart_qa_aql_header h
        JOIN
            public.smart_qa_aql_record r
        ON
            h.un_id = r.key_id
            AND h."type" = $1
            AND h.process = $2
        GROUP BY
            r.key_id
    )
    
    SELECT
        h.process,
        h."type",
        r.status,
        COUNT(r.status) AS result_count_status
    FROM
        public.smart_qa_aql_header h
    JOIN
        public.smart_qa_aql_record r
    ON
        h.un_id = r.key_id
        AND h."type" = $1
        AND h.process = $2
        AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id)
    GROUP BY
        h.process,
        h."type",
        r.status
    
    UNION ALL
    
    SELECT
        h.process,
        h."type",
        'Total' AS status,
        COUNT(r.status) AS result_count_status
    FROM
        public.smart_qa_aql_header h
    JOIN
        public.smart_qa_aql_record r
    ON
        h.un_id = r.key_id
        AND h."type" = $1
        AND h.process = $2
        AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id)
    GROUP BY
        h.process,
        h."type";    
      `,
      [type, process]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
