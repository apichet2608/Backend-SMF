const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/fox-summary", async (req, res) => {
  try {
    const result = await query(
      `select
 	ROW_NUMBER() OVER (ORDER BY production_date) AS id,
    production_date,
    sendresultdetails_product,
    MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN percent_yield END) AS test15_spi_ky,
    MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN total_count END) AS test15_spi_ky_total_count,
    MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN result_pass END) AS test15_spi_ky_result_pass,
    MAX(CASE WHEN station_process = 'TEST15_spi_ky' THEN result_fail END) AS test15_spi_ky_result_fail,
    MAX(CASE WHEN station_process = 'TEST18_aoi' THEN percent_yield END) AS test18_aoi,
    MAX(CASE WHEN station_process = 'TEST18_aoi' THEN total_count END) AS test18_aoi_total_count,
    MAX(CASE WHEN station_process = 'TEST18_aoi' THEN result_pass END) AS test18_aoi_result_pass,
    MAX(CASE WHEN station_process = 'TEST18_aoi' THEN result_fail END) AS test18_aoi_result_fail,
    MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN percent_yield END) AS test27_holding_time,
    MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN total_count END) AS test27_holding_time_total_count,
    MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN result_pass END) AS test27_holding_time_result_pass,
    MAX(CASE WHEN station_process = 'TEST27_holding_time_27' THEN result_fail END) AS test27_holding_time_result_fail,
    MAX(CASE WHEN station_process = 'TEST12_xray' THEN percent_yield END) AS test12_xray,
    MAX(CASE WHEN station_process = 'TEST12_xray' THEN total_count END) AS test12_xray_total_count,
    MAX(CASE WHEN station_process = 'TEST12_xray' THEN result_pass END) AS test12_xray_result_pass,
    MAX(CASE WHEN station_process = 'TEST12_xray' THEN result_fail END) AS test12_xray_result_fail,
    MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN percent_yield END) AS iqc_flex3_et,
    MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN total_count END) AS iqc_flex3_et_total_count,
    MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN result_pass END) AS iqc_flex3_et_result_pass,
    MAX(CASE WHEN station_process = 'IQC-FLEX3_et' THEN result_fail END) AS iqc_flex3_et_result_fail,
    MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN percent_yield END) AS test42_oqc_et,
    MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN total_count END) AS test42_oqc_et_total_count,
    MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN result_pass END) AS test42_oqc_et_result_pass,
    MAX(CASE WHEN station_process = 'TEST42_oqc_et' THEN result_fail END) AS test42_oqc_et_result_fail,
    MAX(CASE WHEN station_process = 'TEST21_avi' THEN percent_yield END) AS test21_avi_percent_yield,
    MAX(CASE WHEN station_process = 'TEST21_avi' THEN total_count END) AS test21_avi_total_count,
    MAX(CASE WHEN station_process = 'TEST21_avi' THEN result_pass END) AS test21_avi_result_pass,
    MAX(CASE WHEN station_process = 'TEST21_avi' THEN result_fail END) AS test21_avi_result_fail,
    MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN percent_yield END) AS test13_oqc_fai,
    MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN total_count END) AS test13_oqc_fai_total_count,
    MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN result_pass END) AS test13_oqc_fai_result_pass,
    MAX(CASE WHEN station_process = 'TEST13_oqc_fai' THEN result_fail END) AS test13_oqc_fai_result_fail,
    MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN percent_yield END) AS test39_holding_time,
    MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN total_count END) AS test39_holding_time_total_count,
    MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN result_pass END) AS test39_holding_time_result_pass,
    MAX(CASE WHEN station_process = 'TEST39_holding_time_39' THEN result_fail END) AS test39_holding_time_result_fail,
    MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN percent_yield END) AS test74_holding_time,
    MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN total_count END) AS test74_holding_time_total_count,
    MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN result_pass END) AS test74_holding_time_result_pass,
    MAX(CASE WHEN station_process = 'TEST74_holding_time_74' THEN result_fail END) AS test74_holding_time_result_fail
FROM
    foxsystem_json_backup_header_summary
GROUP BY
    production_date,
    sendresultdetails_product`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/product-fail", async (req, res) => {
//   try {
//     const { startdate, stopdate, product } = req.query;

//     const result = await query(
//       `SELECT
//         *
//       FROM
//         public.foxsystem_json_backup_header_summary
//       WHERE
//         test_attributes_uut_stop >= $1
//         AND DATE_TRUNC('day', test_attributes_uut_stop) <= DATE_TRUNC('day', $2::TIMESTAMP)
//         AND sendresultdetails_product = $3
//         and test_attributes_test_result = 'FAIL'
//       ORDER BY
//         test_attributes_uut_stop`,
//       [startdate, stopdate, product]
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/distinct-sendresultdetails_product", async (req, res) => {
//   try {
//     const result = await query(`
// select
// 	distinct  sendresultdetails_product
// from
// 	public.foxsystem_json_backup_header_summary
// order by sendresultdetails_product
//     `);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/distinct-product", async (req, res) => {
  try {
    const result = await query(`
    select
    distinct sendresultdetails_product
  from
    public.foxsystem_json_backup_header_summary 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
