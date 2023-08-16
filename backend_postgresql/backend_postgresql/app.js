const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const compression = require("compression"); // นำเข้า compression

const { Pool } = require("pg");
const pool = new Pool({
  host: "10.17.71.57",
  port: 5432,
  user: "postgres",
  password: "fujikura",
  database: "smart_factory", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const customRouter = require("./routes/10.17.71.57/10.17.71.57-smart_factory/smf-aoi");
const smt_aoi = require("./routes/10.17.71.57/10.17.71.57-smart_factory/smt-aoi");
const jwdb_r23662_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_r23662_actv");
const smart_mil_common = require("./routes/ADMIN/postgres/smart_mil_common");
const smart_enviro_cleanroomparticle = require("./routes/10.17.71.57/10.17.71.57-smart_factory/smart_enviro_cleanroomparticle");
const ok2s = require("./routes/ADMIN/postgres/smart-ok2s");
const foxsystem_json_backup_header_ok = require("./routes/ADMIN/postgres/foxsystem_json_backup_header_ok");
const foxsystem_json_backup_header_summary = require("./routes/ADMIN/postgres/foxsystem_json_backup_header_summary");
const foxsystem_json_backup_header_defect = require("./routes/ADMIN/postgres/foxsystem_json_backup_header_defect");
const smart_oee_overall = require("./routes/10.17.66.230/postgres/smart_oee_overall");
const fin_ost_reject_day = require("./routes/10.17.66.230/postgres/fin_ost_reject");
const jwdb_rdflv_mck_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_rdflv_mck_actv");
const jwdb_rdfl_mck_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_rdfl_mck_actv");
const jwdb_rdflv_gro_up_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_rdflv_gro_up_actv");
const jwdb_rexp_two_line = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rexp_two_line");
const jwdb_rlse_beac = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rlse_beac");
const jwdb_rcur_b = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rcur_b");
const jwdb_rcll = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rcll");
const elgop_mto_ni = require("./routes/10.17.71.57/10.17.71.57-smart_factory/elgop_mto_ni");
const smt_vacuum_seal_data = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/smt_vacuum_seal_data");
const smt_binder_oven_data = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/smt_binder_oven_data");
const smt_reflow_tamura_temp_log = require("./routes/10.17.71.21/10.17.71.21-data_log/smt_reflow_tamura_temp_log");
const jwdb_rphp_beac_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_rphp_beac_actv");
const foxsystem_post_by_hr = require("./routes/ADMIN/postgres/foxsystem_post_by_hr");
const foxsystem_post_by_day = require("./routes/ADMIN/postgres/foxsystem_post_by_day");
const smart_machine_connect_list = require("./routes/ADMIN/postgres/smart_machine_connect_list");
const smart_collaboration_task = require("./routes/ADMIN/postgres/smart_collaboration_task");
const smart_energy_by_month = require("./routes/ADMIN/postgres/smart_energy_by_month");
const asteria_lsedi_screen_exposedata = require("./routes/10.17.71.21/10.17.71.21-postgres/asteria_lsedi_screen_exposedata");
const smart_cost_kpi = require("./routes/ADMIN/postgres/smart_cost_kpi");
const smart_energy_month_bue_dept = require("./routes/ADMIN/postgres/smart_energy_month_bue_dept");
const smart_energy_month_bue_deptbuild = require("./routes/ADMIN/postgres/smart_energy_month_bue_deptbuild");
const smart_overall_require_08003809 = require("./routes/ADMIN/postgres/smart_overall_require_08003809");
const smart_master_fin_fost_verify = require("./routes/ADMIN/postgres/smart_master_fin_fost_verify");
const smart_energy_by_day = require("./routes/ADMIN/postgres/smart_energy_by_day");
const smart_cost_item_daily_kpi = require("./routes/ADMIN/postgres/smart_cost_item_daily_kpi");
const smart_cost_div_kpi = require("./routes/ADMIN/postgres/smart_cost_div_kpi");
const smart_eworking_calling = require("./routes/10.17.77.118/iot/smart_eworking_calling");
const smt_reflow_tamura_set_log = require("./routes/10.17.71.21/10.17.71.21-data_log/smt_reflow_tamura_set_log");
const smt_data_reflow_smic_set_log = require("./routes/10.17.71.21/10.17.71.21-data_log/smt_data_reflow_smic_set_log");
const smart_master_verify_zaoi = require("./routes/ADMIN/postgres/smart_master_verify_zaoi");
const smart_master_verify_xray = require("./routes/ADMIN/postgres/smart_master_verify_xray");
const smart_overall_require_08003809_action = require("./routes/ADMIN/postgres/smart_overall_require_08003809_action");

const app = express();

// app.use(compression()); // ใช้งาน compression middleware
app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/custom", customRouter);
app.use("/smt-aoi", smt_aoi);
app.use("/jwdb_r23662_actv", jwdb_r23662_actv);
app.use("/api/smart-mil-common", smart_mil_common);
app.use("/api/smart_enviro_cleanroomparticle", smart_enviro_cleanroomparticle);
app.use("/api/smart-ok2s", ok2s);
app.use(
  "/api/foxsystem_json_backup_header_ok",
  foxsystem_json_backup_header_ok
);
app.use(
  "/api/foxsystem_json_backup_header_summary",
  foxsystem_json_backup_header_summary
);
app.use(
  "/api/foxsystem_json_backup_header_defect",
  foxsystem_json_backup_header_defect
);
app.use("/api/smart_oee_overall", smart_oee_overall);
app.use("/api/fin_ost_reject", fin_ost_reject_day);
app.use("/api/jwdb_rdflv_mck_actv", jwdb_rdflv_mck_actv);
app.use("/api/jwdb_rdfl_mck_actv", jwdb_rdfl_mck_actv);
app.use("/api/jwdb_rdflv_gro_up_actv", jwdb_rdflv_gro_up_actv);
app.use("/api/jwdb_rexp_two_line", jwdb_rexp_two_line);
app.use("/api/jwdb_rlse_beac", jwdb_rlse_beac);
app.use("/api/jwdb_rcur_b", jwdb_rcur_b);
app.use("/api/jwdb_rcll", jwdb_rcll);
app.use("/api/elgop_mto_ni", elgop_mto_ni);
app.use("/api/smt_vacuum_seal_data", smt_vacuum_seal_data);
app.use("/api/smt_binder_oven_data", smt_binder_oven_data);
app.use("/api/smt_reflow_tamura_temp_log", smt_reflow_tamura_temp_log);
app.use("/api/jwdb_rphp_beac_actv", jwdb_rphp_beac_actv);
app.use("/api/foxsystem_post_by_hr", foxsystem_post_by_hr);
app.use("/api/foxsystem_post_by_day", foxsystem_post_by_day);
app.use("/api/smart_machine_connect_list", smart_machine_connect_list);
app.use("/api/smart_collaboration_task", smart_collaboration_task);
app.use("/api/smart_energy_by_month", smart_energy_by_month);
app.use(
  "/api/asteria_lsedi_screen_exposedata",
  asteria_lsedi_screen_exposedata
);
app.use("/api/smart_cost_kpi", smart_cost_kpi);
app.use("/api/smart_energy_month_bue_dept", smart_energy_month_bue_dept);
app.use(
  "/api/smart_energy_month_bue_deptbuild",
  smart_energy_month_bue_deptbuild
);
app.use("/api/smart_overall_require", smart_overall_require_08003809);
app.use("/api/smart_master_fin_fost_verify", smart_master_fin_fost_verify);
app.use("/api/smart_energy_by_day", smart_energy_by_day);
app.use("/api/smart_cost_item_daily_kpi", smart_cost_item_daily_kpi);
app.use("/api/smart_cost_div_kpi", smart_cost_div_kpi);
app.use("/api/smart_eworking_calling", smart_eworking_calling);
app.use("/api/smt_reflow_tamura_set_log", smt_reflow_tamura_set_log);
app.use("/api/smt_data_reflow_smic_set_log", smt_data_reflow_smic_set_log);
app.use("/api/smart_master_verify_zaoi", smart_master_verify_zaoi);
app.use("/api/smart_master_verify_xray", smart_master_verify_xray);
app.use(
  "/api/smart_overall_require_08003809_action",
  smart_overall_require_08003809_action
);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
