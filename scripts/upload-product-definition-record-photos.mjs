import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();

function env(name, fallback = undefined) {
  const v = process.env[name];
  return v === undefined || v === "" ? fallback : v;
}

function requiredEnv(name) {
  const v = env(name);
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function boolEnv(name, fallback = false) {
  const v = env(name);
  if (v == null) return fallback;
  return ["1", "true", "yes", "y"].includes(String(v).toLowerCase());
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function stripExt(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

function productCodeFromFileName(fileName) {
  const base = stripExt(path.basename(fileName)).trim();
  const i = base.indexOf("-");
  return (i >= 0 ? base.slice(0, i) : base).trim();
}

function sanitizeCsv(value) {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".bmp") return "image/bmp";
  return "application/octet-stream";
}

async function getAccessToken({ accountsBase, clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token"
  });

  const url = `${accountsBase.replace(/\/$/, "")}/oauth/v2/token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Token refresh returned non-JSON (${res.status}): ${text}`);
  }

  if (!res.ok || json.error) {
    throw new Error(`Token refresh failed (${res.status}): ${JSON.stringify(json)}`);
  }

  if (!json.access_token) {
    throw new Error(`Token refresh missing access_token: ${JSON.stringify(json)}`);
  }

  return {
    accessToken: json.access_token,
    apiDomain: json.api_domain || null
  };
}

async function zohoJson(url, { accessToken, method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await res.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response from ${url} (${res.status}): ${text}`);
    }
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${url}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function fetchAllRecords({ crmBase, moduleApiName, nameFieldApiName, accessToken }) {
  const records = [];
  let page = 1;
  while (true) {
    const url = new URL(`${crmBase.replace(/\/$/, "")}/${moduleApiName}`);
    url.searchParams.set("fields", `id,${nameFieldApiName}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", "200");

    const json = await zohoJson(url.toString(), { accessToken });
    const data = Array.isArray(json.data) ? json.data : [];
    records.push(...data);

    const more = Boolean(json.info?.more_records);
    if (!more) break;
    page += 1;
  }
  return records;
}

async function uploadRecordPhoto({ crmBase, moduleApiName, recordId, filePath, accessToken }) {
  const fileBuffer = await fs.readFile(filePath);
  const fileName = path.basename(filePath);
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: mimeTypeFor(filePath) }), fileName);

  const url = `${crmBase.replace(/\/$/, "")}/${moduleApiName}/${recordId}/photo`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`
    },
    body: form
  });

  const text = await res.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  if (!res.ok) {
    throw new Error(`Photo upload failed (${res.status}) for record ${recordId}: ${JSON.stringify(json)}`);
  }

  return json;
}

async function listImageFiles(imagesDir) {
  const entries = await fs.readdir(imagesDir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile())
    .map(e => path.join(imagesDir, e.name))
    .filter(p => /\.(png|jpe?g|gif|bmp)$/i.test(p))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
}

async function main() {
  const imagesDir = path.resolve(cwd, env("IMAGES_DIR", "Door Pictures/extracted-images"));
  const outputLogDir = path.resolve(cwd, env("UPLOAD_LOG_DIR", "Door Pictures/upload-logs"));
  const moduleApiName = env("ZOHO_MODULE_API_NAME", "Product_Definitions");
  const nameFieldApiName = env("ZOHO_NAME_FIELD_API_NAME", "Name");
  const dryRun = boolEnv("DRY_RUN", false);
  const delayMs = Number(env("REQUEST_DELAY_MS", "100")) || 0;

  const clientId = requiredEnv("ZOHO_CLIENT_ID");
  const clientSecret = requiredEnv("ZOHO_CLIENT_SECRET");
  const refreshToken = requiredEnv("ZOHO_REFRESH_TOKEN");
  const accountsBase = requiredEnv("ZOHO_ACCOUNTS_BASE"); // e.g. https://accounts.zoho.com
  const configuredCrmBase = env("ZOHO_CRM_API_BASE"); // optional; if empty, uses api_domain from refresh response

  await fs.mkdir(outputLogDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonlPath = path.join(outputLogDir, `zoho-photo-upload-${ts}.jsonl`);
  const csvPath = path.join(outputLogDir, `zoho-photo-upload-${ts}.csv`);

  const imageFiles = await listImageFiles(imagesDir);
  if (imageFiles.length === 0) {
    throw new Error(`No image files found in ${imagesDir}`);
  }

  console.log(`Images directory: ${imagesDir}`);
  console.log(`Found ${imageFiles.length} image files`);

  const token = await getAccessToken({
    accountsBase,
    clientId,
    clientSecret,
    refreshToken
  });

  const crmBase = configuredCrmBase || `${token.apiDomain}/crm/v8`;
  if (!crmBase) {
    throw new Error("Could not determine CRM base URL. Set ZOHO_CRM_API_BASE.");
  }

  console.log(`CRM base: ${crmBase}`);
  console.log(`Module: ${moduleApiName}`);
  console.log(`Match field: ${nameFieldApiName}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "UPLOAD"}`);

  const records = await fetchAllRecords({
    crmBase,
    moduleApiName,
    nameFieldApiName,
    accessToken: token.accessToken
  });

  console.log(`Fetched ${records.length} records from ${moduleApiName}`);

  const recordMap = new Map();
  for (const r of records) {
    const key = String(r[nameFieldApiName] ?? "").trim();
    if (!key) continue;
    if (!recordMap.has(key)) recordMap.set(key, []);
    recordMap.get(key).push(r);
  }

  const results = [];

  for (const filePath of imageFiles) {
    const fileName = path.basename(filePath);
    const code = productCodeFromFileName(fileName);
    const matches = recordMap.get(code) || [];

    let status = "pending";
    let recordId = "";
    let message = "";

    try {
      if (!code) {
        status = "skipped";
        message = "Could not parse code from filename";
      } else if (matches.length === 0) {
        status = "not_found";
        message = `No ${moduleApiName} record with ${nameFieldApiName}='${code}'`;
      } else if (matches.length > 1) {
        status = "duplicate_match";
        message = `Multiple records matched ${nameFieldApiName}='${code}'`;
      } else {
        recordId = String(matches[0].id);
        if (dryRun) {
          status = "dry_run";
          message = "Matched record; upload not executed";
        } else {
          const response = await uploadRecordPhoto({
            crmBase,
            moduleApiName,
            recordId,
            filePath,
            accessToken: token.accessToken
          });
          status = "uploaded";
          message = JSON.stringify(response);
          if (delayMs > 0) await sleep(delayMs);
        }
      }
    } catch (err) {
      status = "error";
      message = err instanceof Error ? err.message : String(err);
    }

    const row = {
      fileName,
      code,
      recordId,
      status,
      message
    };
    results.push(row);
    console.log(`${status.padEnd(14)} ${fileName}${recordId ? ` -> ${recordId}` : ""}`);
  }

  const jsonl = results.map(r => JSON.stringify(r)).join("\n") + "\n";
  await fs.writeFile(jsonlPath, jsonl, "utf8");

  const csvHeader = ["fileName", "code", "recordId", "status", "message"];
  const csvLines = [
    csvHeader.join(","),
    ...results.map(r => csvHeader.map(h => sanitizeCsv(r[h])).join(","))
  ];
  await fs.writeFile(csvPath, csvLines.join("\n") + "\n", "utf8");

  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  console.log("Summary:", counts);
  console.log(`JSONL log: ${jsonlPath}`);
  console.log(`CSV log:   ${csvPath}`);
}

main().catch(err => {
  console.error(err?.stack || String(err));
  process.exitCode = 1;
});

