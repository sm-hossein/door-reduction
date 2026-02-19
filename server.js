import express from "express";
import cors from "cors";
import path from "path";
import { createCsvDataProvider } from "./src/dataProvider.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

const dataProvider = createCsvDataProvider();
const tables = dataProvider.getStaticTables();

app.get("/api/door/jobs", (_req, res) => {
  const jobs = dataProvider.getAllDoors().map(d => ({
    jobNumber: d["Job Number"],
    jobName: d["Job Name"],
    doorId: d["Door ID"]
  }));
  res.json(jobs);
});

app.get("/api/door/:jobNumber/sides", (req, res) => {
  const { jobNumber } = req.params;
  const door = dataProvider.getDoorByJobNumber(jobNumber);
  if (!door) {
    return res.status(404).json({ error: "Job not found" });
  }
  const sideRows = tables.DoorType.filter(dt => dt.Type === door["Type"]);
  const sides = sideRows.length ? sideRows.map(r => String(r.Side)) : ["1"];
  res.json({ sides });
});

app.get("/api/door/:jobNumber", (req, res) => {
  const { jobNumber } = req.params;
  const door = dataProvider.getDoorByJobNumber(jobNumber);

  if (!door) {
    return res.status(404).json({ error: "Job not found" });
  }

  const product = dataProvider.getProductById(door["Product ID"]) || {};

  res.json({
    door,
    product
  });
});

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "door-reduction-api" });
});

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});
