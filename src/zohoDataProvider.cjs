const ORDER_ITEM_MODULE = "Order_Items";
const CRM_PRODUCT_MODULE = "Products";
const PRODUCT_MODULE = "Steel_Products";
const COMPONENT_MODULE = "Components";
const PRODUCT_COMPONENT_MODULE = "Steel_Product_Components";

const fs = require("fs");
const path = require("path");

function loadArrayFromJs(fileName, exportName) {
  const filePath = path.join(__dirname, fileName);
  const text = fs.readFileSync(filePath, "utf8");
  const re = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*([\\s\\S]*?);\\s*$`, "m");
  const match = text.match(re);
  if (!match) {
    throw new Error(`Export ${exportName} not found in ${fileName}`);
  }
  return new Function(`return ${match[1]};`)();
}

const referenceCodeRows = loadArrayFromJs("referenceCodes.js", "REFERENCE_CODES");
const doorTypeRows = loadArrayFromJs("doorTypes.js", "DOOR_TYPES");
const fractionRows = loadArrayFromJs("fractions.js", "FRACTIONS");
const componentSizeRuleRows = loadArrayFromJs("componentSizeRules.js", "COMPONENT_SIZE_RULES");

const staticTables = {
  DoorType: doorTypeRows.map(([id, type, side]) => ({
    "Type ID": id,
    "Type": type,
    "Side": side
  })),
  ReferenceCodes: referenceCodeRows.map(([id, key, code, desc]) => ({
    "Reference ID": id,
    "Reference Key": key,
    "Reference Code": code,
    "Reference Description": desc
  })),
  Fractions: fractionRows.map(([id, desc, num, den, dec]) => ({
    "Fraction ID": id,
    "Description": desc,
    "Numerator": num,
    "Denominator": den,
    "Decimal": dec
  })),
  ComponentSizeRules: componentSizeRuleRows.map(
    ([id, productType, group, category, section, rule]) => ({
      "Size ID": id,
      "Product Type": productType,
      "Group": group,
      "Category": category,
      "Section": section,
      "Sizing Rule": rule
    })
  )
};

const PRODUCT_FIELD_MAP = {
  productId: "Name",
  description: "Description",
  productType: "Product_Type",
  defaultLock: "Default_Lock",
  glassType: "Glass_Type",
  doorPicture: "Door_Picture",
  rating: "Rating"
};

const COMPONENT_FIELD_MAP = {
  componentId: "Component_ID",
  description: "Name",
  category: "Category",
  sizeRule: "Size_Rule"
};

const PRODUCT_COMPONENT_FIELD_MAP = {
  productId: "Steel_Product",
  componentId: "Component",
  doorType: "Door_Type",
  group: "Group",
  section: "Section",
  side: "Side",
  quantity: "Quantity",
  measurement: "Measurement"
};

const LOCK_PREFIX_MAP = {
  fourway: "F",
  "four way": "F",
  kwikset: "Y",
  yale: "Y",
  marks: "S"
};

function normalizeCrmScalar(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value.name !== undefined && value.name !== null) return String(value.name).trim();
    if (value.value !== undefined && value.value !== null) return String(value.value).trim();
    if (value.id !== undefined && value.id !== null) return String(value.id).trim();
  }
  return String(value).trim();
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map(v => normalizeCrmScalar(v)).filter(Boolean);
  }
  const one = normalizeCrmScalar(value);
  return one ? [one] : [];
}

const DOOR_FIELD_DEFAULTS = {
  "Door ID": "",
  "Job Number": "",
  "Job Name": "",
  "Order Notes": "",
  "Issue Date": "",
  "Due Date": "",
  "Quantity": "0",
  "Product ID": "",
  "Secondary Product ID": "",
  "Hinge": "",
  "Operator": "",
  "Color": "",
  "Type": "",
  "Width": "0",
  "Width Fraction": "0",
  "Height": "0",
  "Height Fraction": "0",
  "Door Width": "0",
  "Door Width Fraction": "0",
  "Door Height": "0",
  "Door Height Fraction": "0",
  "Lock": "",
  "Leg Length": "0",
  "Leg Length Fraction": "0",
  "ExDoorHt": "0",
  "ExDoorHtFrac": "0",
  "ExKnobLoc": "0",
  "ExKnobLocB": "0",
  "ExKnobLocFrac": "0",
  "ExDBLoc": "0",
  "ExDBLocB": "0",
  "ExDBLocFrac": "0",
  "ExKnobProj": "0",
  "ExKnobProjFrac": "0",
  "ExDBProj": "0",
  "ExDBProjFrac": "0",
  "AdjustNotes": "",
  "LockOK": "FALSE"
};

async function zohoRequest(context, { method, url }) {
  const connector = context.getConnection("crm");
  const connRes = await connector.makeRequestSync({ url, method });

  const chunks = [];
  return new Promise((resolve, reject) => {
    connRes.on("data", chunk => chunks.push(chunk));
    connRes.on("end", () => {
      const body = Buffer.concat(chunks).toString();
      try {
        resolve(JSON.parse(body));
      } catch (_err) {
        resolve(body);
      }
    });
    connRes.on("error", err => reject(err));
  });
}

function normalizeProduct(record) {
  if (!record) return null;
  return {
    "Product ID": normalizeCrmScalar(record[PRODUCT_FIELD_MAP.productId]),
    "Description": normalizeCrmScalar(record[PRODUCT_FIELD_MAP.description]),
    "Product Type": normalizeCrmScalar(record[PRODUCT_FIELD_MAP.productType]),
    "Default Lock": normalizeCrmScalar(record[PRODUCT_FIELD_MAP.defaultLock]),
    "Glass Type": normalizeCrmScalar(record[PRODUCT_FIELD_MAP.glassType]),
    "Door Picture": normalizeCrmScalar(record[PRODUCT_FIELD_MAP.doorPicture]),
    "Rating": normalizeCrmScalar(record[PRODUCT_FIELD_MAP.rating])
  };
}

function normalizeComponent(record) {
  if (!record) return null;
  return {
    "Component ID": normalizeCrmScalar(record.id || record[COMPONENT_FIELD_MAP.componentId]),
    "Description": normalizeCrmScalar(record[COMPONENT_FIELD_MAP.description]),
    "Category": normalizeCrmScalar(record[COMPONENT_FIELD_MAP.category]),
    "Size Rule": normalizeCrmScalar(record[COMPONENT_FIELD_MAP.sizeRule])
  };
}

function normalizeProductComponent(record) {
  if (!record) return null;
  const productId = record[PRODUCT_COMPONENT_FIELD_MAP.productId];
  const componentId = record[PRODUCT_COMPONENT_FIELD_MAP.componentId];

  return {
    "Product ID": normalizeCrmScalar(productId && productId.id ? productId.id : productId),
    "Component ID": normalizeCrmScalar(componentId && componentId.id ? componentId.id : componentId),
    "Door Type": normalizeCrmScalar(record[PRODUCT_COMPONENT_FIELD_MAP.doorType]),
    "Group": normalizeCrmScalar(record[PRODUCT_COMPONENT_FIELD_MAP.group]),
    "Section": normalizeCrmScalar(record[PRODUCT_COMPONENT_FIELD_MAP.section]),
    "Side": normalizeCrmScalar(record[PRODUCT_COMPONENT_FIELD_MAP.side]),
    "Quantity": normalizeCrmScalar(record[PRODUCT_COMPONENT_FIELD_MAP.quantity]),
    "Measurement": normalizeCrmScalar(record[PRODUCT_COMPONENT_FIELD_MAP.measurement])
  };
}

function isDigits(value) {
  return /^\d+$/.test(String(value || ""));
}

function getLockPrefix(lockType) {
  if (!lockType) return "";
  const key = normalizeCrmScalar(lockType).toLowerCase();
  return LOCK_PREFIX_MAP[key] || "";
}

function getStyleCode(record) {
  if (!record) return "";
  return record.Style_Code || record.Reduction_Style_Code || "";
}

async function getCrmProductByZohoId(context, recordId) {
  const url = `https://www.zohoapis.com/crm/v8/${CRM_PRODUCT_MODULE}/${recordId}`;
  const res = await zohoRequest(context, { method: "GET", url });
  return res && Array.isArray(res.data) ? res.data[0] : null;
}

function parseJsonField(record) {
  if (!record || !record.Reduction_Fields) return {};
  try {
    return JSON.parse(record.Reduction_Fields);
  } catch (_err) {
    return {};
  }
}

function pickFromJson(jsonObj, candidates) {
  if (!jsonObj) return undefined;
  for (const key of candidates) {
    if (jsonObj[key] !== undefined && jsonObj[key] !== null) return jsonObj[key];
  }
  return undefined;
}

function buildJsonCandidates(field) {
  const noSpace = field.replace(/\s+/g, "");
  const underscore = field.replace(/\s+/g, "_");
  return [field, noSpace, underscore];
}

function getDoorField(record, jsonObj, field, fallback) {
  if (record[field] !== undefined && record[field] !== null) return record[field];
  const v = pickFromJson(jsonObj, buildJsonCandidates(field));
  if (v !== undefined && v !== null) return v;
  return fallback;
}

function normalizeDoor(context, record, steelProductName) {
  if (!record) return null;
  const jsonObj = parseJsonField(record);
  const itemType = record.Item_Type || {};
  const lockTypeRaw = getDoorField(record, jsonObj, "Lock_Type", DOOR_FIELD_DEFAULTS["Lock"]);
  const lockType = normalizeLockType(context, lockTypeRaw);
  const doorGateOptions = normalizeStringArray(
    getDoorField(
      record,
      jsonObj,
      "Door_Gate_Option",
      getDoorField(record, jsonObj, "Options", [])
    )
  );

  return {
    "Door ID": String(record.id || DOOR_FIELD_DEFAULTS["Door ID"]),
    "Job Number": String(record.id || DOOR_FIELD_DEFAULTS["Job Number"]),
    "Job Name": String(record.Name || DOOR_FIELD_DEFAULTS["Job Name"]),
    "Order Notes": String(record.Order_Note || record.Reduction_Note || record.Discount_Note || DOOR_FIELD_DEFAULTS["Order Notes"]),
    "Issue Date": String(record.Created_Time || DOOR_FIELD_DEFAULTS["Issue Date"]),
    "Due Date": String(record.Order_Closing_Date || DOOR_FIELD_DEFAULTS["Due Date"]),
    "Quantity": String(record.Qty || record.Qty1 || DOOR_FIELD_DEFAULTS["Quantity"]),
    "Product ID": String(steelProductName || itemType.id || DOOR_FIELD_DEFAULTS["Product ID"]),
    "Secondary Product ID": normalizeCrmScalar(getDoorField(record, jsonObj, "Secondary Product ID", DOOR_FIELD_DEFAULTS["Secondary Product ID"])),
    "Hinge": normalizeCrmScalar(getDoorField(record, jsonObj, "Hinge", DOOR_FIELD_DEFAULTS["Hinge"])),
    "Operator": normalizeCrmScalar(getDoorField(record, jsonObj, "Operator", DOOR_FIELD_DEFAULTS["Operator"])),
    "Color": normalizeCrmScalar(record.Color || DOOR_FIELD_DEFAULTS["Color"]),
    "Type": normalizeCrmScalar(record.Double_Door_Type || DOOR_FIELD_DEFAULTS["Type"]),
    "Width": String(getDoorField(record, jsonObj, "Width", DOOR_FIELD_DEFAULTS["Width"])),
    "Width Fraction": String(getDoorField(record, jsonObj, "Width Fraction", DOOR_FIELD_DEFAULTS["Width Fraction"])),
    "Height": String(getDoorField(record, jsonObj, "Height", DOOR_FIELD_DEFAULTS["Height"])),
    "Height Fraction": String(getDoorField(record, jsonObj, "Height Fraction", DOOR_FIELD_DEFAULTS["Height Fraction"])),
    "Door Width": String(getDoorField(record, jsonObj, "Door Width", DOOR_FIELD_DEFAULTS["Door Width"])),
    "Door Width Fraction": String(getDoorField(record, jsonObj, "Door Width Fraction", DOOR_FIELD_DEFAULTS["Door Width Fraction"])),
    "Door Height": String(getDoorField(record, jsonObj, "Door Height", DOOR_FIELD_DEFAULTS["Door Height"])),
    "Door Height Fraction": String(getDoorField(record, jsonObj, "Door Height Fraction", DOOR_FIELD_DEFAULTS["Door Height Fraction"])),
    "Lock": String(lockType),
    "Lock Color": normalizeCrmScalar(
      getDoorField(record, jsonObj, "Lock_Color", getDoorField(record, jsonObj, "Lock Color", ""))
    ),
    "Handle Type": normalizeCrmScalar(
      getDoorField(record, jsonObj, "Handle_Type", getDoorField(record, jsonObj, "Handle Type", ""))
    ),
    "Door_Gate_Option": doorGateOptions,
    "Leg Length": String(getDoorField(record, jsonObj, "Leg Length", DOOR_FIELD_DEFAULTS["Leg Length"])),
    "Leg Length Fraction": String(getDoorField(record, jsonObj, "Leg Length Fraction", DOOR_FIELD_DEFAULTS["Leg Length Fraction"])),
    "ExDoorHt": String(getDoorField(record, jsonObj, "ExDoorHt", DOOR_FIELD_DEFAULTS["ExDoorHt"])),
    "ExDoorHtFrac": String(getDoorField(record, jsonObj, "ExDoorHtFrac", DOOR_FIELD_DEFAULTS["ExDoorHtFrac"])),
    "ExKnobLoc": String(getDoorField(record, jsonObj, "ExKnobLoc", DOOR_FIELD_DEFAULTS["ExKnobLoc"])),
    "ExKnobLocB": String(getDoorField(record, jsonObj, "ExKnobLocB", DOOR_FIELD_DEFAULTS["ExKnobLocB"])),
    "ExKnobLocFrac": String(getDoorField(record, jsonObj, "ExKnobLocFrac", DOOR_FIELD_DEFAULTS["ExKnobLocFrac"])),
    "ExDBLoc": String(getDoorField(record, jsonObj, "ExDBLoc", DOOR_FIELD_DEFAULTS["ExDBLoc"])),
    "ExDBLocB": String(getDoorField(record, jsonObj, "ExDBLocB", DOOR_FIELD_DEFAULTS["ExDBLocB"])),
    "ExDBLocFrac": String(getDoorField(record, jsonObj, "ExDBLocFrac", DOOR_FIELD_DEFAULTS["ExDBLocFrac"])),
    "ExKnobProj": String(getDoorField(record, jsonObj, "ExKnobProj", DOOR_FIELD_DEFAULTS["ExKnobProj"])),
    "ExKnobProjFrac": String(getDoorField(record, jsonObj, "ExKnobProjFrac", DOOR_FIELD_DEFAULTS["ExKnobProjFrac"])),
    "ExDBProj": String(getDoorField(record, jsonObj, "ExDBProj", DOOR_FIELD_DEFAULTS["ExDBProj"])),
    "ExDBProjFrac": String(getDoorField(record, jsonObj, "ExDBProjFrac", DOOR_FIELD_DEFAULTS["ExDBProjFrac"])),
    "AdjustNotes": String(getDoorField(record, jsonObj, "AdjustNotes", DOOR_FIELD_DEFAULTS["AdjustNotes"])),
    "LockOK": String(getDoorField(record, jsonObj, "LockOK", DOOR_FIELD_DEFAULTS["LockOK"]))
  };
}

function normalizeLockType(context, lockType) {
  if (lockType === null || lockType === undefined) return "";
  let raw = lockType;
  if (typeof raw === "object") {
    if (raw.name) {
      raw = raw.name;
    } else if (raw.value) {
      raw = raw.value;
    }
  }
  const value = String(raw).trim();
  if (!value) return "";
  const key = value.toLowerCase();
  switch (key) {
    case "-none-":
    case "none":
      return "None";
    case "fourway":
    case "four way":
      return "Four Way";
    case "kwikset":
      return "Yale";
    default:
      return value;
  }
}

function createZohoDataProvider(context) {
  return {
    getStaticTables() {
      return staticTables;
    },
    getTables() {
      return staticTables;
    },
    async getProductById(productId) {
      const encoded = encodeURIComponent(String(productId));
      const url = `https://www.zohoapis.com/crm/v8/${PRODUCT_MODULE}/search?criteria=(Name:equals:${encoded})`;
      const res = await zohoRequest(context, { method: "GET", url });
      const record = res && Array.isArray(res.data) ? res.data[0] : null;
      return normalizeProduct(record);
    },
    async getProductByZohoId(recordId) {
      const url = `https://www.zohoapis.com/crm/v8/${PRODUCT_MODULE}/${recordId}`;
      const res = await zohoRequest(context, { method: "GET", url });
      const record = res && Array.isArray(res.data) ? res.data[0] : null;
      return normalizeProduct(record);
    },
    async getComponentById(componentId) {
      context.log.INFO("getComponentById: " + String(componentId));
      const url = `https://www.zohoapis.com/crm/v8/${COMPONENT_MODULE}/${componentId}`;
      const res = await zohoRequest(context, { method: "GET", url });
      context.log.INFO("getComponentById response: " + JSON.stringify(res));
      const record = res && Array.isArray(res.data) ? res.data[0] : null;
      const normalized = normalizeComponent(record);
      context.log.INFO("getComponentById normalized: " + JSON.stringify(normalized));
      return normalized;
    },
    async getComponentsByIds(componentIds) {
      const ids = Array.isArray(componentIds) ? componentIds : [];
      if (!ids.length) return [];
      context.log.INFO("getComponentsByIds ids: " + JSON.stringify(ids));
      const results = await Promise.all(
        ids.map(id => this.getComponentById(id))
      );
      context.log.INFO("getComponentsByIds results: " + JSON.stringify(results));
      return results.filter(Boolean);
    },
    async getComponentByZohoId(recordId) {
      const url = `https://www.zohoapis.com/crm/v8/${COMPONENT_MODULE}/${recordId}`;
      const res = await zohoRequest(context, { method: "GET", url });
      const record = res && Array.isArray(res.data) ? res.data[0] : null;
      return normalizeComponent(record);
    },
    async getProductComponentsByProductId(productId) {
      const encoded = encodeURIComponent(String(productId));
      const url = `https://www.zohoapis.com/crm/v8/${PRODUCT_COMPONENT_MODULE}/search?criteria=(${PRODUCT_COMPONENT_FIELD_MAP.productId}:equals:${encoded})`;
      const res = await zohoRequest(context, { method: "GET", url });
      const records = res && Array.isArray(res.data) ? res.data : [];
      context.log.INFO("Raw ProductComponents: " + JSON.stringify(records));
      return records.map(normalizeProductComponent);
    },
    async getProductComponentsByDoorType(doorType) {
      if (!doorType) return [];
      const encoded = encodeURIComponent(String(doorType));
      const url = `https://www.zohoapis.com/crm/v8/${PRODUCT_COMPONENT_MODULE}/search?criteria=(${PRODUCT_COMPONENT_FIELD_MAP.doorType}:equals:${encoded})`;
      const res = await zohoRequest(context, { method: "GET", url });
      const records = res && Array.isArray(res.data) ? res.data : [];
      context.log.INFO("Raw ProductComponents (Door Type): " + JSON.stringify(records));
      return records.map(normalizeProductComponent);
    },
    async getProductComponentByZohoId(recordId) {
      const url = `https://www.zohoapis.com/crm/v8/${PRODUCT_COMPONENT_MODULE}/${recordId}`;
      const res = await zohoRequest(context, { method: "GET", url });
      const record = res && Array.isArray(res.data) ? res.data[0] : null;
      return normalizeProductComponent(record);
    },
    async getDoorById(doorId) {
      const url = `https://www.zohoapis.com/crm/v8/${ORDER_ITEM_MODULE}/${doorId}`;
      const res = await zohoRequest(context, { method: "GET", url });
      const record = res && Array.isArray(res.data) ? res.data[0] : null;
      let steelProductName = "";
      if (record && record.Item_Type && record.Item_Type.id) {
        const crmProduct = await getCrmProductByZohoId(context, record.Item_Type.id);
        const styleCode = getStyleCode(crmProduct);
        const prefix = getLockPrefix(record.Lock_Type);
        if (prefix && styleCode) {
          steelProductName = `${prefix}${styleCode}`;
        }
      }
      return normalizeDoor(context, record, steelProductName);
    },
    async getDoorByJobNumber(jobNumber) {
      return this.getDoorById(jobNumber);
    },
    async getSteelProductByDoorId(doorId) {
      const door = await this.getDoorById(doorId);
      const steelProductName = door ? door["Product ID"] : "";
      if (!steelProductName) return null;
      return this.getProductById(steelProductName);
    }
  };
}

async function createZohoDoorDataContext(context, doorId) {
  const provider = createZohoDataProvider(context);
  const tables = provider.getStaticTables();

  const door = await provider.getDoorById(doorId);
  if (!door) {
    throw new Error(`Door ${doorId} not found`);
  }

  const secondaryProductId = String(door["Secondary Product ID"] || "");
  const product = await provider.getProductById(door["Product ID"]);
  const secondaryProduct = secondaryProductId
    ? await provider.getProductById(secondaryProductId)
    : null;
  const productComponents = await provider.getProductComponentsByProductId(door["Product ID"]);
  const secondaryProductComponents = secondaryProductId
    ? await provider.getProductComponentsByProductId(secondaryProductId)
    : [];
  const openingComponents = provider.getProductComponentsByDoorType
    ? await provider.getProductComponentsByDoorType(door["Type"])
    : await provider.getProductComponentsByProductId(door["Type"]);

  const componentIds = new Set(
    [...productComponents, ...secondaryProductComponents, ...openingComponents]
      .map(pc => pc["Component ID"])
      .filter(Boolean)
      .map(id => String(id))
  );
  const components = await provider.getComponentsByIds([...componentIds]);
  const componentById = new Map(
    components.map(c => [String(c["Component ID"]), c])
  );

  const cachedProvider = {
    getStaticTables: () => tables,
    getTables: () => tables,
    getDoorById: () => door,
    getDoorByJobNumber: () => door,
    getProductById: productId => {
      const id = String(productId || "");
      if (id === String(door["Product ID"])) return product;
      if (secondaryProductId && id === secondaryProductId) return secondaryProduct;
      return null;
    },
    getProductComponentsByProductId: productId => {
      const id = String(productId);
      if (id === String(door["Product ID"])) return productComponents;
      if (secondaryProductId && id === secondaryProductId) return secondaryProductComponents;
      if (id === String(door["Type"])) return openingComponents;
      return [];
    },
    getProductComponentsByDoorType: doorType => {
      if (String(doorType) === String(door["Type"])) return openingComponents;
      return [];
    },
    getComponentsByIds: ids => {
      const wanted = new Set((ids || []).map(id => String(id)));
      if (!wanted.size) return [];
      return [...wanted]
        .map(id => componentById.get(id))
        .filter(Boolean);
    }
  };

  return { tables, provider: cachedProvider };
}

module.exports = { createZohoDataProvider, createZohoDoorDataContext };
