(() => {
  const { useEffect, useState, useRef } = React;
  const e = React.createElement;

  const CONFIG = {
    orderItemsModule: "Order_Items",
    productsModule: "Products",
    ordersModule: "Deals",
    reductionFieldsKey: "Reduction_Fields",
    exportFunctionName: "doorreductionbackend",
    exportTargetField: "Reduction_Result",
    pdfFunctionName: "doorreductionbackend",
    moduleOverride: ""
  };

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch (err) {
      return fallback;
    }
  };

  const parseFunctionOutput = output => {
    if (typeof output !== "string") return output;
    const trimmed = output.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("Error:")) {
      throw new Error(trimmed);
    }

    const direct = safeJsonParse(trimmed, null);
    if (direct) return direct;

    const doorsMarker = '{"doors"';
    const markerIndex = trimmed.lastIndexOf(doorsMarker);
    if (markerIndex !== -1) {
      const candidate = trimmed.slice(markerIndex);
      const parsed = safeJsonParse(candidate, null);
      if (parsed) return parsed;
    }

    const splitIndex = trimmed.lastIndexOf("}{");
    if (splitIndex !== -1) {
      const candidate = trimmed.slice(splitIndex + 1);
      const parsed = safeJsonParse(candidate, null);
      if (parsed) return parsed;
    }

    return null;
  };

  const buildPdfBytesForDoor = async (door, formOverride, pageMeta = {}) => {
    if (!door) {
      throw new Error("No door JSON available for PDF.");
    }

    const raw = door.raw || {};
    const override = formOverride || {};
    const components = Array.isArray(door.components) ? door.components : [];

    if (!window.PDFLib) {
      throw new Error("PDFLib is not loaded.");
    }

    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // Letter
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const black = rgb(0, 0, 0);
    const colorText = rgb(0.13, 0.15, 0.18);
    const colorMuted = rgb(0.36, 0.4, 0.47);
    const colorPanel = rgb(0.985, 0.988, 0.993);
    const colorBorder = rgb(0.79, 0.82, 0.87);
    const colorGrid = rgb(0.87, 0.89, 0.93);
    const colorHeaderBg = rgb(0.95, 0.96, 0.98);
    const colorTitleBar = rgb(0.09, 0.2, 0.36);
    const colorTitleText = rgb(1, 1, 1);
    const M = 20;
    const PW = 612;
    const PH = 792;

    const text = (t, x, y, size = 10, f = font, color = black) => {
      page.drawText(String(t || ""), { x, y, size, font: f, color });
    };

    const drawLine = (x1, y1, x2, y2, w = 1, color = colorBorder) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: w, color });
    };

    const drawRect = (x, y, w, h, lw = 1) => {
      drawLine(x, y, x + w, y, lw);
      drawLine(x, y + h, x + w, y + h, lw);
      drawLine(x, y, x, y + h, lw);
      drawLine(x + w, y, x + w, y + h, lw);
    };

    const safe = v => (v === null || v === undefined ? "" : String(v));

    const wrapText = (str, maxWidth, f, size) => {
      const words = String(str || "").split(/\s+/).filter(Boolean);
      const lines = [];
      let current = "";
      words.forEach(word => {
        const next = current ? `${current} ${word}` : word;
        if (f.widthOfTextAtSize(next, size) <= maxWidth) {
          current = next;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      });
      if (current) lines.push(current);
      return lines.length ? lines : [""];
    };

    // Title line
    const titleText = "Production Copy";
    const titleY = PH - M - 12;
    const titleBarY = titleY - 8;
    page.drawRectangle({
      x: M,
      y: titleBarY,
      width: PW - M * 2,
      height: 18,
      color: colorTitleBar,
      borderColor: colorTitleBar,
      borderWidth: 0
    });
    text(titleText, M + 8, titleBarY + 5, 10, fontBold, colorTitleText);
    const pageNumber = Number(pageMeta.pageNumber || 1);
    const totalPages = Number(pageMeta.totalPages || 1);
    const pageText = `Side ${pageNumber} of ${totalPages}`;
    const pageTextW = font.widthOfTextAtSize(pageText, 8);
    text(pageText, PW - M - pageTextW - 8, titleBarY + 6, 8, font, colorTitleText);

    // Header fields
    const headerTop = titleBarY - 8;
    const headerGap = 0;
    const colGap = 12;
    const headerW = PW - M * 2;
    const leftW = Math.round(headerW * 0.62);
    const rightW = headerW - leftW - colGap;
    const leftX = M;
    const rightX = M + leftW + colGap;

    const getFieldMetrics = opts => {
      const padding = opts.padding ?? 3;
      const labelSize = opts.labelSize ?? 6;
      const valueSize = opts.valueSize ?? 9;
      const lineHeight = opts.lineHeight ?? 8;
      const maxLines = opts.maxLines ?? 1;
      const minHeight = opts.minHeight ?? 0;
      return { padding, labelSize, valueSize, lineHeight, maxLines, minHeight };
    };

    const measureFieldHeight = (w, value, opts = {}) => {
      const { padding, valueSize, lineHeight, maxLines, minHeight } = getFieldMetrics(opts);
      const lines = wrapText(safe(value), w - padding * 2, font, valueSize);
      const visible = lines.slice(0, maxLines);
      const contentH = visible.length * lineHeight;
      return Math.max(minHeight, padding + 2 + contentH);
    };

    const drawField = (x, yTop, w, label, value, opts = {}) => {
      const { padding, labelSize, valueSize, lineHeight, maxLines } = getFieldMetrics(opts);
      const lines = wrapText(safe(value), w - padding * 2, font, valueSize);
      const visible = lines.slice(0, maxLines);
      const h = measureFieldHeight(w, value, opts);
      const labelText = String(label || "").toUpperCase();
      const labelW = fontBold.widthOfTextAtSize(labelText, labelSize);
      const firstLine = visible[0] || "";
      const valueW = font.widthOfTextAtSize(firstLine, valueSize);
      const labelX = x + padding;
      const labelY = yTop - 10;
      text(labelText, labelX, labelY, labelSize, fontBold, colorMuted);
      const valueX = labelX + labelW + 8;
      const valueY = yTop - 12;
      text(firstLine, valueX, valueY, valueSize, font, colorText);
      visible.slice(1).forEach((ln, idx) => {
        text(ln, valueX, valueY - (idx + 1) * lineHeight, valueSize, font, colorText);
      });
      return yTop - h - headerGap;
    };

    const jobNumber = override.jobNumber || raw["Job Number"] || "";
    const jobName = override.jobName || raw["Job Name"] || "";
    const buildProductLabel = [
      safe(raw.ProductDescription || ""),
      safe(raw["Product ID"])
    ].filter(Boolean).join(" - ");

    const dueDate = override.dueDate || raw["Due Date"] || "";
    const issueDate = override.issueDate || raw["Issue Date"] || "";

    const leftFields = [
      ["Job Number / Name", `${safe(jobNumber)}  ${safe(jobName)}`, { maxLines: 1 }],
      ["Order Type", safe(raw.OrderType), {}],
      ["Measured Dimensions", safe(raw.MeasuredDimensions), {}],
      ["Ref. Door Dimensions", safe(raw.RefDimensions), {}],
      ["Build Product ID", buildProductLabel, {}],
      ["Build Dimensions", safe(raw.BuildDimensions), {}],
      ["Build Notes", safe(raw.BuildNotes), { valueSize: 8.5, maxLines: 2, lineHeight: 9, minHeight: 26 }]
    ];
    const rightFields = [
      ["Due Date", safe(dueDate), {}],
      ["Issue Date", safe(issueDate), {}],
      ["Color", safe(raw.ColorName || raw.Color), {}],
      ["Hinge", safe(raw.HingeOutput || raw.Hinge), {}],
      ["Lock", safe(raw.LockOutput || raw.Lock), {}]
    ];

    const measureStack = (yTop, w, fields) =>
      fields.reduce((yPos, [, value, opts]) => yPos - measureFieldHeight(w, value, opts) - headerGap, yTop);

    const panelBottom = Math.min(
      measureStack(headerTop, leftW, leftFields),
      measureStack(headerTop, rightW, rightFields)
    ) + headerGap;

    page.drawRectangle({
      x: M,
      y: panelBottom,
      width: PW - M * 2,
      height: headerTop - panelBottom + 2,
      color: colorPanel,
      borderColor: colorBorder,
      borderWidth: 1
    });

    let yL = headerTop;
    leftFields.forEach(([label, value, opts]) => {
      yL = drawField(leftX, yL, leftW, label, value, opts);
    });

    let yR = headerTop;
    rightFields.forEach(([label, value, opts]) => {
      yR = drawField(rightX, yR, rightW, label, value, opts);
    });

    const NOTES_SECTION_GAP = 4;
    const NOTES_SECTION_MIN_MARGIN = 20;
    const NOTES_SECTION_MIN_HEIGHT = 44;
    const NOTES_SECTION_LINE_STEP = 10;
    const NOTES_SECTION_BASE_HEIGHT = 96;
    const NOTES_SECTION_BASE_LINES = 5;
    const MIN_CONTENT_Y = M;

    const startContinuationPage = () => {
      page = pdfDoc.addPage([612, 792]);
      const contTitleY = PH - M - 12;
      const contTitleBarY = contTitleY - 8;
      page.drawRectangle({
        x: M,
        y: contTitleBarY,
        width: PW - M * 2,
        height: 18,
        color: colorTitleBar,
        borderColor: colorTitleBar,
        borderWidth: 0
      });
      text(`${titleText} (continued)`, M + 8, contTitleBarY + 5, 10, fontBold, colorTitleText);
      const contPageTextW = font.widthOfTextAtSize(pageText, 8);
      text(pageText, PW - M - contPageTextW - 8, contTitleBarY + 6, 8, font, colorTitleText);
      return contTitleBarY - 14;
    };

    // Section title helper
    let y = Math.min(yL, yR) - 10;

    const sectionTitle = titleText => {
      if (y - 16 < MIN_CONTENT_Y) {
        y = startContinuationPage();
      }
      y -= 6;
      text(titleText, M, y, 10, fontBold, colorText);
      drawLine(M, y - 2, PW - M, y - 2, 0.8, colorBorder);
      y -= 8;
      return true;
    };

    const drawTable = rows => {
      const tableFontSize = 8;
      const headerFontSize = 8;
      const lineHeight = 10;
      const headerBg = colorHeaderBg;
      const col = { qty: 20, desc: 150, loc: 50, size: 80 };
      const notesW = PW - M * 2 - (col.qty + col.desc + col.loc + col.size);
      const colX = [
        M,
        M + col.qty,
        M + col.qty + col.desc,
        M + col.qty + col.desc + col.loc,
        M + col.qty + col.desc + col.loc + col.size
      ];
      const headerH = 16;
      const drawHeader = () => {
        page.drawRectangle({
          x: M,
          y: y - headerH,
          width: PW - M * 2,
          height: headerH,
          color: headerBg,
          borderColor: colorBorder,
          borderWidth: 1
        });
        page.drawLine({ start: { x: colX[1], y: y - headerH }, end: { x: colX[1], y }, thickness: 1, color: colorBorder });
        page.drawLine({ start: { x: colX[2], y: y - headerH }, end: { x: colX[2], y }, thickness: 1, color: colorBorder });
        page.drawLine({ start: { x: colX[3], y: y - headerH }, end: { x: colX[3], y }, thickness: 1, color: colorBorder });
        page.drawLine({ start: { x: colX[4], y: y - headerH }, end: { x: colX[4], y }, thickness: 1, color: colorBorder });
        text("Qty.", colX[0] + 4, y - 12, headerFontSize, fontBold, colorText);
        text("Component Description", colX[1] + 4, y - 12, headerFontSize, fontBold, colorText);
        text("Location", colX[2] + 4, y - 12, headerFontSize, fontBold, colorText);
        text("Size", colX[3] + 4, y - 12, headerFontSize, fontBold, colorText);
        text("Notes", colX[4] + 4, y - 12, headerFontSize, fontBold, colorText);
        y -= headerH;
      };

      if (y - (headerH + 12) < MIN_CONTENT_Y) {
        y = startContinuationPage();
      }
      drawHeader();

      let rendered = 0;
      rows.forEach(r => {
        const descLines = wrapText(safe(r.desc), col.desc - 8, font, tableFontSize);
        const notesLines = wrapText(safe(r.notes), notesW - 8, font, tableFontSize);
        const maxLines = Math.max(descLines.length, notesLines.length, 1);
        const rowH = 12 + (maxLines - 1) * lineHeight;

        if (y - rowH < MIN_CONTENT_Y) {
          y = startContinuationPage();
          drawHeader();
        }

        page.drawRectangle({
          x: M,
          y: y - rowH,
          width: PW - M * 2,
          height: rowH,
          borderColor: colorGrid,
          borderWidth: 1
        });
        page.drawLine({ start: { x: colX[1], y: y - rowH }, end: { x: colX[1], y }, thickness: 1, color: colorGrid });
        page.drawLine({ start: { x: colX[2], y: y - rowH }, end: { x: colX[2], y }, thickness: 1, color: colorGrid });
        page.drawLine({ start: { x: colX[3], y: y - rowH }, end: { x: colX[3], y }, thickness: 1, color: colorGrid });
        page.drawLine({ start: { x: colX[4], y: y - rowH }, end: { x: colX[4], y }, thickness: 1, color: colorGrid });

        text(safe(r.qty), colX[0] + 4, y - 10, tableFontSize, font, colorText);
        descLines.forEach((ln, idx) => text(ln, colX[1] + 4, y - 10 - idx * lineHeight, tableFontSize, font, colorText));
        text(safe(r.loc), colX[2] + 4, y - 10, tableFontSize, font, colorText);
        text(safe(r.size), colX[3] + 4, y - 10, tableFontSize, font, colorText);
        notesLines.forEach((ln, idx) => text(ln, colX[4] + 4, y - 10 - idx * lineHeight, tableFontSize, font, colorText));

        y -= rowH;
        rendered += 1;
      });

      y -= 8;
      return rendered;
    };

    const rowsFor = group =>
      components
        .filter(r => String(r["Component Group"] || "") === group)
        .map(r => ({
          qty: r["Quantity"],
          desc: r["Component Description"],
          loc: r["Location"],
          size: r["Size"],
          notes: r["Notes"]
        }));

    const frameRows = rowsFor("Frame");
    const internalRows = rowsFor("Internal");
    if (frameRows.length || internalRows.length) {
      if (sectionTitle("Frame / Internal Components")) {
        if (frameRows.length) drawTable(frameRows);
        if (internalRows.length) drawTable(internalRows);
      }
    }

    const designRows = rowsFor("Design");
    if (designRows.length) {
      if (sectionTitle("Design Components")) {
        drawTable(designRows);
      }
    }

    const finalRows = rowsFor("Final");
    if (finalRows.length) {
      if (sectionTitle("Final Components")) {
        drawTable(finalRows);
      }
    }

    const openingRows = rowsFor("Opening");
    if (openingRows.length) {
      if (sectionTitle("Opening Components")) {
        drawTable(openingRows);
      }
    }

    // Options / notes section
    const colW = (PW - M * 2) / 3;
    const lockColorText = safe(raw["Lock Color"] || raw.Lock_Color || "");
    const handleTypeText = safe(raw["Handle Type"] || raw.Handle_Type || "");
    const optionList = String(raw.Door_Gate_Option || raw.Options || raw.Option || "")
      .split(/[\r\n,]+/)
      .map(v => v.trim())
      .filter(v => v && !/^lock color:/i.test(v) && !/^handle type:/i.test(v) && !/^options:/i.test(v));
    const optionLines = [];
    if (lockColorText) optionLines.push(`Lock Color: ${lockColorText}`);
    if (handleTypeText) optionLines.push(`Handle Type: ${handleTypeText}`);
    optionLines.push(...optionList);
    if (!optionLines.length) optionLines.push("None");
    const optLines = optionLines.flatMap(line => wrapText(line, colW - 12, font, 9));
    const orderLines = wrapText(safe(raw["Order Notes"] || ""), colW - 12, font, 9);
    const clearLines = wrapText(safe(raw.ClearanceNotes || "No Adjustment Required"), colW - 12, fontItalic, 9);
    let optIndex = 0;
    let orderIndex = 0;
    let clearIndex = 0;

    while (optIndex < optLines.length || orderIndex < orderLines.length || clearIndex < clearLines.length) {
      const remainingLines = Math.max(
        optLines.length - optIndex,
        orderLines.length - orderIndex,
        clearLines.length - clearIndex,
        1
      );
      const desiredSectionHeight =
        NOTES_SECTION_BASE_HEIGHT + Math.max(0, remainingLines - NOTES_SECTION_BASE_LINES) * NOTES_SECTION_LINE_STEP;
      const sectionTop = Math.floor(y - NOTES_SECTION_GAP);
      const availableSectionHeight = Math.max(0, sectionTop - NOTES_SECTION_MIN_MARGIN);

      if (availableSectionHeight < NOTES_SECTION_MIN_HEIGHT) {
        y = startContinuationPage();
        continue;
      }

      const sectionHeight = Math.max(
        NOTES_SECTION_MIN_HEIGHT,
        Math.min(desiredSectionHeight, availableSectionHeight)
      );
      const sectionY = Math.floor(sectionTop - sectionHeight);
      const sectionMaxLines = Math.max(1, Math.floor((sectionHeight - 28) / NOTES_SECTION_LINE_STEP));

      page.drawRectangle({ x: M, y: sectionY, width: colW, height: sectionHeight, color: colorPanel, borderColor: colorBorder, borderWidth: 1 });
      page.drawRectangle({ x: M + colW, y: sectionY, width: colW, height: sectionHeight, color: colorPanel, borderColor: colorBorder, borderWidth: 1 });
      page.drawRectangle({ x: M + colW * 2, y: sectionY, width: colW, height: sectionHeight, color: colorPanel, borderColor: colorBorder, borderWidth: 1 });
      const sectionLabelY = sectionY + sectionHeight - 16;
      text("Options", M + 6, sectionLabelY, 8, fontBold, colorMuted);
      text("Order Notes", M + colW + 6, sectionLabelY, 8, fontBold, colorMuted);
      text("Clearance Adjustment Notes", M + colW * 2 + 6, sectionLabelY, 8, fontBold, colorMuted);
      const sectionLineY = sectionLabelY - 16;

      const drawLines = (x, lines, startIndex, f, color) => {
        const chunk = lines.slice(startIndex, startIndex + sectionMaxLines);
        chunk.forEach((ln, idx) =>
          text(ln, x, sectionLineY - idx * NOTES_SECTION_LINE_STEP, 9, f, color)
        );
        return startIndex + chunk.length;
      };

      optIndex = drawLines(M + 6, optLines, optIndex, font, colorText);
      orderIndex = drawLines(M + colW + 6, orderLines, orderIndex, font, colorText);
      clearIndex = drawLines(M + colW * 2 + 6, clearLines, clearIndex, fontItalic, colorText);

      y = sectionY - 4;
      if (optIndex < optLines.length || orderIndex < orderLines.length || clearIndex < clearLines.length) {
        y = startContinuationPage();
      }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  };

  const buildPdfBytesForDoors = async (doors, formOverride) => {
    const list = Array.isArray(doors) ? doors : [];
    if (!list.length) {
      throw new Error("No door JSON available for PDF.");
    }

    if (!window.PDFLib) {
      throw new Error("PDFLib is not loaded.");
    }

    const { PDFDocument } = window.PDFLib;
    const mergedPdf = await PDFDocument.create();
    const totalPages = list.length;

    for (let i = 0; i < list.length; i += 1) {
      const sourceBytes = await buildPdfBytesForDoor(list[i], formOverride, {
        pageNumber: i + 1,
        totalPages
      });
      const sourceDoc = await PDFDocument.load(sourceBytes);
      const sourcePages = await mergedPdf.copyPages(sourceDoc, sourceDoc.getPageIndices());
      sourcePages.forEach(p => mergedPdf.addPage(p));
    }

    return mergedPdf.save();
  };

  const toBase64 = bytes => {
    const chunk = 0x8000;
    let result = "";
    for (let i = 0; i < bytes.length; i += chunk) {
      result += String.fromCharCode.apply(
        null,
        bytes.subarray(i, i + chunk)
      );
    }
    return btoa(result);
  };

  const executeFunction = async (name, args) => {
    if (window.ZOHO?.CRM?.FUNCTIONS?.execute) {
      return ZOHO.CRM.FUNCTIONS.execute(name, args);
    }
    throw new Error("Zoho CRM FUNCTIONS.execute not available.");
  };

  const DEFAULT_FORM = {
    jobNumber: "",
    jobName: "",
    issueDate: "",
    dueDate: "",
    doorType: "",
    productId: "",
    productName: "",
    secondaryProductId: "",
    secondaryProductName: "",
    width: "",
    height: "",
    lock: "",
    lockColor: "",
    handleType: "",
    color: "",
    hinge: "",
    lockOk: false,
    exDboltTop: "",
    exDboltBottom: "",
    exDboltClearance: "",
    exKnobTop: "",
    exKnobBottom: "",
    exKnobClearance: "",
    doorGateOption: [],
    notes: "",
    adjustNotes: ""
  };

  const REDUCTION_FIELD_MAP = {
    hinge: "Hinge",
    lockOk: "LockOK",
    exDboltTop: "ExDBLoc",
    exDboltBottom: "ExDBLocB",
    exDboltClearance: "ExDBLocFrac",
    exKnobTop: "ExKnobLoc",
    exKnobBottom: "ExKnobLocB",
    exKnobClearance: "ExKnobLocFrac",
    secondaryProductId: "Secondary Product ID",
    secondaryProductName: "Secondary Product Description",
    doorGateOption: "Door_Gate_Option",
    adjustNotes: "AdjustNotes"
  };

  const isOperatorModeForDoorType = doorType =>
    String(doorType || "").trim().toLowerCase() === "french";

  const normalizeDoorTypeKey = value =>
    String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

  const SIDE3_DOOR_TYPES = new Set([
    "patio",
    "1 sidelite",
    "2 sidelite",
    "1 gate",
    "2 gate",
    "single ss"
  ]);

  const requiresSecondaryProductForDoorType = doorType =>
    SIDE3_DOOR_TYPES.has(normalizeDoorTypeKey(doorType));

  const SECONDARY_PRODUCT_CANDIDATES = {
    patio: [{ id: "Tube-S", name: "Tube Frame" }]
  };

  const getSecondaryCandidatesForDoorType = doorType =>
    SECONDARY_PRODUCT_CANDIDATES[normalizeDoorTypeKey(doorType)] || [];

  const REDUCTION_FIELD_MAP_REVERSE = Object.keys(REDUCTION_FIELD_MAP)
    .reduce((acc, key) => {
      acc[REDUCTION_FIELD_MAP[key]] = key;
      return acc;
    }, {});

  const normalizeReductionFields = (rawFields) => {
    const normalized = {};
    if (!rawFields || typeof rawFields !== "object") return normalized;
    Object.keys(rawFields).forEach(key => {
      const mappedKey = REDUCTION_FIELD_MAP_REVERSE[key] || key;
      normalized[mappedKey] = rawFields[key];
    });
    if (!Array.isArray(normalized.doorGateOption)) {
      if (Array.isArray(rawFields.Door_Gate_Option)) {
        normalized.doorGateOption = rawFields.Door_Gate_Option;
      } else if (Array.isArray(rawFields.Options)) {
        normalized.doorGateOption = rawFields.Options;
      } else {
        normalized.doorGateOption = [];
      }
    }
    if ((normalized.hinge === undefined || normalized.hinge === "") && rawFields.Operator !== undefined) {
      normalized.hinge = rawFields.Operator;
    }
    return normalized;
  };

  const ORDER_ITEM_MAP = {
    jobNumber: "Job_Number",
    jobName: "Name",
    issueDate: "Issue_Date",
    dueDate: "Order_Closing_Date",
    doorType: "Double_Door_Type",
    width: "Width",
    height: "Height",
    lock: "Lock_Type",
    lockColor: "Lock_Color",
    handleType: "Handle_Type",
    doorGateOption: "Door_Gate_Option",
    color: "Color",
    notes: "Reduction_Note"
  };

  const ALWAYS_WRITE_ORDER_ITEM_KEYS = new Set([
    "lock",
    "color",
    "lockColor",
    "handleType",
    "doorGateOption"
  ]);

  // UI lock values are kept as legacy widget labels.
  // Backend/calculation engine expects canonical names.
  const UI_TO_BACKEND_LOCK = {
    Marks: "Marks",
    Kwikset: "Yale",
    Fourway: "Four Way"
  };

  const BACKEND_TO_UI_LOCK = {
    Marks: "Marks",
    Yale: "Kwikset",
    "Four Way": "Fourway"
  };

  const toBackendLockValue = value => {
    const v = String(value || "").trim();
    return UI_TO_BACKEND_LOCK[v] || v;
  };

  const toUiLockValue = value => {
    const v = String(value || "").trim();
    return BACKEND_TO_UI_LOCK[v] || v;
  };

  const PICKLIST_FIELD_API_NAMES = Object.freeze({
    lock: "Lock_Type",
    color: "Color",
    lockColor: "Lock_Color",
    handleType: "Handle_Type",
    doorGateOption: "Door_Gate_Option"
  });

  const toArray = value => {
    if (Array.isArray(value)) {
      return value
        .map(v => String(v || "").trim())
        .filter(Boolean);
    }
    if (value === null || value === undefined) return [];
    const one = String(value).trim();
    return one ? [one] : [];
  };

  const uniqueStrings = values => [...new Set(toArray(values))];

  const getPicklistValuesForField = (metaResp, apiName) => {
    const fields = Array.isArray(metaResp?.fields) ? metaResp.fields : [];
    const field = fields.find(
      f => String(f?.api_name || "").toLowerCase() === String(apiName || "").toLowerCase()
    );
    if (!field || !Array.isArray(field.pick_list_values)) return [];
    return field.pick_list_values
      .map(item => String(item?.actual_value ?? item?.display_value ?? "").trim())
      .filter(Boolean);
  };

  function App({ pageData }) {
    const [loadingState, setLoadingState] = useState("idle");
    const [error, setError] = useState("");
    const [recordInfo, setRecordInfo] = useState({ module: "", recordId: "" });
    const [orderItem, setOrderItem] = useState(null);
    const [product, setProduct] = useState(null);
    const [orderRecord, setOrderRecord] = useState(null);
    const [form, setForm] = useState(DEFAULT_FORM);
    const [sdkReady, setSdkReady] = useState(false);
    const [contextReady, setContextReady] = useState(false);
    const [pdfDoors, setPdfDoors] = useState([]);
    const [pdfUrl, setPdfUrl] = useState("");
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfFormSnapshot, setPdfFormSnapshot] = useState(DEFAULT_FORM);
    const [pdfError, setPdfError] = useState("");
    const [doorGateOptionsOpen, setDoorGateOptionsOpen] = useState(false);
    const [picklistChoices, setPicklistChoices] = useState({
      lock: [],
      color: [],
      lockColor: [],
      handleType: [],
      doorGateOption: []
    });
    const pdfUrlRef = useRef("");
    const doorGateOptionsRef = useRef(null);

    const hasZoho = window.ZOHO && ZOHO.CRM;
    const isOperatorMode = isOperatorModeForDoorType(form.doorType);
    const requiresSecondaryProduct = requiresSecondaryProductForDoorType(form.doorType);
    const secondaryCandidates = (() => {
      const base = getSecondaryCandidatesForDoorType(form.doorType);
      const fromValue = form.secondaryProductId
        ? [{ id: form.secondaryProductId, name: form.secondaryProductName || form.secondaryProductId }]
        : [];
      const merged = [...fromValue, ...base];
      const seen = new Set();
      return merged.filter(item => {
        const id = String(item.id || "").trim();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    })();

    const setField = (key, value) => {
      setForm(prev => ({ ...prev, [key]: value }));
    };

    const resetPdfState = () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
      pdfUrlRef.current = "";
      setPdfUrl("");
      setPdfLoading(false);
      setPdfDoors([]);
    };

    const hydratePdfStateFromExport = (exportJson, formSnapshot) => {
      const doors = Array.isArray(exportJson?.doors) ? exportJson.doors : [];
      if (!doors.length) {
        resetPdfState();
        setPdfError("No export JSON available for PDF preview.");
        return [];
      }
      resetPdfState();
      setPdfDoors(doors);
      setPdfFormSnapshot(formSnapshot || form);
      setPdfError("");
      return doors;
    };

    const ensureCombinedPdf = async opts => {
      const doors = opts.doors || pdfDoors;
      const formSnapshot = opts.formSnapshot || pdfFormSnapshot;
      if (!Array.isArray(doors) || !doors.length) return;
      setPdfLoading(true);
      setPdfError("");

      try {
        const pdfBytes = await buildPdfBytesForDoors(doors, formSnapshot);
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        if (pdfUrlRef.current) {
          URL.revokeObjectURL(pdfUrlRef.current);
        }
        pdfUrlRef.current = blobUrl;
        setPdfUrl(blobUrl);
        setPdfLoading(false);
      } catch (err) {
        setPdfLoading(false);
        setPdfError(err?.message || "Unable to generate PDF preview.");
      }
    };

    useEffect(() => {
      return () => {
        if (pdfUrlRef.current) {
          URL.revokeObjectURL(pdfUrlRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const handleDocMouseDown = ev => {
        const root = doorGateOptionsRef.current;
        if (!root) return;
        if (!root.contains(ev.target)) {
          setDoorGateOptionsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleDocMouseDown);
      return () => {
        document.removeEventListener("mousedown", handleDocMouseDown);
      };
    }, []);

    useEffect(() => {
      let mounted = true;

      const loadFromContext = async () => {
        if (!pageData) return;
        if (!hasZoho) {
          if (mounted) {
            setError("Zoho SDK not available.");
            setLoadingState("error");
          }
          return;
        }

        setSdkReady(true);

        const moduleName = CONFIG.moduleOverride || pageData?.Entity;
        const recordId = Array.isArray(pageData?.EntityId)
          ? pageData.EntityId[0]
          : pageData?.EntityId || "";
        setRecordInfo({ module: moduleName || "", recordId });
        setContextReady(true);

        if (!moduleName || !recordId) {
          setError("Missing record context from Zoho.");
          setLoadingState("error");
          return;
        }

        setLoadingState("loading");
        try {
          const recordResp = await ZOHO.CRM.API.getRecord({
            Entity: moduleName,
            RecordID: recordId
          });
          const record = recordResp?.data?.[0] || {};
          setOrderItem(record);

          if (ZOHO?.CRM?.META?.getFields) {
            try {
              const metaResp = await ZOHO.CRM.META.getFields({ Entity: moduleName });
              setPicklistChoices({
                lock: getPicklistValuesForField(metaResp, PICKLIST_FIELD_API_NAMES.lock),
                color: getPicklistValuesForField(metaResp, PICKLIST_FIELD_API_NAMES.color),
                lockColor: getPicklistValuesForField(metaResp, PICKLIST_FIELD_API_NAMES.lockColor),
                handleType: getPicklistValuesForField(metaResp, PICKLIST_FIELD_API_NAMES.handleType),
                doorGateOption: getPicklistValuesForField(metaResp, PICKLIST_FIELD_API_NAMES.doorGateOption)
              });
            } catch (_metaErr) {
              // Do not block the form if metadata fails; current values remain editable.
              setPicklistChoices({
                lock: [],
                color: [],
                lockColor: [],
                handleType: [],
                doorGateOption: []
              });
            }
          }

          const reductionFieldsRaw = safeJsonParse(record[CONFIG.reductionFieldsKey], {});
          const reductionFields = normalizeReductionFields(reductionFieldsRaw);
          const initial = { ...DEFAULT_FORM, ...reductionFields };

          initial.jobNumber =
            record.Job_Number ||
            record.Order?.name ||
            record.Name ||
            initial.jobNumber;
          initial.jobName = record.Name || initial.jobName;
          initial.issueDate = record.Issue_Date || initial.issueDate;
          initial.dueDate = record.Order_Closing_Date || initial.dueDate;
          initial.doorType = record.Double_Door_Type || initial.doorType;
          initial.lock = toUiLockValue(record.Lock_Type || initial.lock);
          initial.lockColor = String(record.Lock_Color || initial.lockColor || "");
          initial.handleType = String(record.Handle_Type || initial.handleType || "");
          initial.color = record.Color || initial.color;
          initial.width = record.Width ?? initial.width;
          initial.height = record.Height ?? initial.height;
          initial.notes = record.Reduction_Note || initial.notes;
          initial.adjustNotes = initial.adjustNotes;
          if (initial.secondaryProductId && !initial.secondaryProductName) {
            initial.secondaryProductName = initial.secondaryProductId;
          }

          if (record.Item_Type?.id) {
            initial.productId = "";
          }
          if (record.Item_Type?.name) {
            initial.productName = record.Item_Type.name;
          }

          initial.doorGateOption = uniqueStrings(
            Array.isArray(record.Door_Gate_Option) && record.Door_Gate_Option.length
              ? record.Door_Gate_Option
              : initial.doorGateOption
          );

          setForm(initial);

          if (record.Order?.id) {
            try {
              const orderResp = await ZOHO.CRM.API.getRecord({
                Entity: CONFIG.ordersModule,
                RecordID: record.Order.id
              });
              const orderRec = orderResp?.data?.[0] || null;
              setOrderRecord(orderRec);
              if (orderRec?.name) {
                setForm(prev => ({ ...prev, jobNumber: orderRec.name }));
              }
              const accountName =
                orderRec?.Account_Name?.name ||
                orderRec?.Account_Name ||
                "";
              if (accountName) {
                setForm(prev => ({ ...prev, jobName: accountName }));
              }
            } catch (err) {
              setError(err?.message || "Failed to load Order record.");
            }
          }

          if (record.Item_Type?.id) {
            const productResp = await ZOHO.CRM.API.getRecord({
              Entity: CONFIG.productsModule,
              RecordID: record.Item_Type.id
            });
            const productRecord = productResp?.data?.[0] || null;
            setProduct(productRecord);
            if (productRecord?.Product_Name && !initial.productName) {
              setForm(prev => ({ ...prev, productName: productRecord.Product_Name }));
            }
            if (productRecord?.Door_Type && !initial.doorType) {
              setForm(prev => ({ ...prev, doorType: productRecord.Door_Type }));
            }
          }

          setLoadingState("ready");
        } catch (err) {
          setError(err?.message || "Failed to load order item data.");
          setLoadingState("error");
        }
      };

      loadFromContext();
      return () => {
        mounted = false;
      };
    }, [pageData]);

    useEffect(() => {
      if (!requiresSecondaryProduct) {
        if (form.secondaryProductId || form.secondaryProductName) {
          setForm(prev => ({ ...prev, secondaryProductId: "", secondaryProductName: "" }));
        }
        return;
      }

      if (!form.secondaryProductId && secondaryCandidates.length) {
        const first = secondaryCandidates[0];
        setForm(prev => ({
          ...prev,
          secondaryProductId: first.id,
          secondaryProductName: first.name || first.id
        }));
      }
    }, [requiresSecondaryProduct, form.doorType, form.secondaryProductId]);

    const statusLabel = (() => {
      if (loadingState === "loading") return "Loading order item...";
      if (!sdkReady) return "Waiting for Zoho SDK to initialize.";
      if (!contextReady) return "Waiting for record context.";
      return "Ready.";
    })();

    const buildPayload = (forcedForm) => {
      if (!orderItem) return null;
      const currentForm = forcedForm || form;
      const operatorMode = isOperatorModeForDoorType(currentForm.doorType);
      const update = { id: recordInfo.recordId };
      const reductionFields = {};

      Object.keys(currentForm).forEach(key => {
        if (key === "hinge") {
          const hingeValue = currentForm[key];
          reductionFields[operatorMode ? "Operator" : "Hinge"] = hingeValue;
          return;
        }

        const map = ORDER_ITEM_MAP[key];
        const value = currentForm[key];
        const hasField = map && (
          ALWAYS_WRITE_ORDER_ITEM_KEYS.has(key) ||
          Object.prototype.hasOwnProperty.call(orderItem, map)
        );

        if (hasField) {
          update[map] = value;
        } else {
          const mappedKey = REDUCTION_FIELD_MAP[key] || key;
          reductionFields[mappedKey] = value;
        }
      });

      if (!Object.prototype.hasOwnProperty.call(update, ORDER_ITEM_MAP.doorGateOption)) {
        reductionFields[REDUCTION_FIELD_MAP.doorGateOption] = uniqueStrings(currentForm.doorGateOption);
      }

      update[CONFIG.reductionFieldsKey] = JSON.stringify(reductionFields);
      return update;
    };

    const handleReduce = async () => {
      if (!sdkReady || !contextReady) {
        setError("Zoho SDK not ready yet.");
        return;
      }
      setError("");
      setPdfError("");
      resetPdfState();
      setLoadingState("loading");
      try {
        const today = new Date().toISOString().slice(0, 10);
        const nextForm = { ...form, issueDate: today, dueDate: today };
        setForm(nextForm);
        const payload = buildPayload(nextForm);
        if (!payload) {
          throw new Error("Order item not loaded.");
        }

        // Save user-entered fields first so export uses latest values.
        await ZOHO.CRM.API.updateRecord({
          Entity: CONFIG.orderItemsModule,
          APIData: payload,
          Trigger: []
        });

        if (CONFIG.exportFunctionName && CONFIG.exportTargetField) {
          const exportResp = await executeFunction(CONFIG.exportFunctionName, {
            doorId: recordInfo.recordId,
            orderItemsId: recordInfo.recordId
          });
          const exportOutput = exportResp?.details?.output ?? exportResp?.output;
          const parsed = parseFunctionOutput(exportOutput);
          if (parsed) {
            const exportPayload = {
              id: recordInfo.recordId,
              [CONFIG.exportTargetField]: JSON.stringify(parsed)
            };
            await ZOHO.CRM.API.updateRecord({
              Entity: CONFIG.orderItemsModule,
              APIData: exportPayload,
              Trigger: []
            });
            payload[CONFIG.exportTargetField] = JSON.stringify(parsed);
          }
        }

        const exportJson = payload[CONFIG.exportTargetField]
          ? safeJsonParse(payload[CONFIG.exportTargetField], null)
          : null;
        if (exportJson) {
          const doors = hydratePdfStateFromExport(exportJson, nextForm);
          if (doors.length) {
            await ensureCombinedPdf({
              doors: Array.isArray(exportJson?.doors) ? exportJson.doors : [],
              formSnapshot: nextForm
            });
          }
        } else {
          setPdfError("No export JSON available for PDF preview.");
        }

        setLoadingState("ready");
      } catch (err) {
        setError(err?.message || "Failed to update order item.");
        setLoadingState("error");
      }
    };

    const styleCode = product?.Style_Code || product?.Reduction_Style_Code || "";
    const lockLetter = (() => {
      const backendLock = toBackendLockValue(form.lock);
      if (backendLock === "Marks") return "S";
      if (backendLock === "Yale") return "Y";
      if (backendLock === "Four Way") return "F";
      return "";
    })();

    useEffect(() => {
      if (!styleCode || !lockLetter) return;
      const computed = `${lockLetter}${styleCode}`;
      if (computed !== form.productId) {
        setForm(prev => ({ ...prev, productId: computed }));
      }
    }, [styleCode, lockLetter]);

    const lockColorChoices = uniqueStrings([
      ...picklistChoices.lockColor,
      form.lockColor
    ]);
    const lockChoices = uniqueStrings([
      ...picklistChoices.lock,
      form.lock
    ]);
    const colorChoices = uniqueStrings([
      ...picklistChoices.color,
      form.color
    ]);
    const handleTypeChoices = uniqueStrings([
      ...picklistChoices.handleType,
      form.handleType
    ]);
    const doorGateOptionChoices = uniqueStrings([
      ...picklistChoices.doorGateOption,
      ...form.doorGateOption
    ]);
    const selectedDoorGateCount = form.doorGateOption.length;

    const toggleDoorGateOption = value => {
      const nextValue = String(value || "").trim();
      if (!nextValue) return;
      setForm(prev => {
        const set = new Set(toArray(prev.doorGateOption));
        if (set.has(nextValue)) {
          set.delete(nextValue);
        } else {
          set.add(nextValue);
        }
        return { ...prev, doorGateOption: [...set] };
      });
    };

    const removeDoorGateOption = value => {
      const target = String(value || "").trim();
      if (!target) return;
      setForm(prev => ({
        ...prev,
        doorGateOption: toArray(prev.doorGateOption).filter(v => v !== target)
      }));
    };

    const handleCancel = () => {
      if (ZOHO?.CRM?.UI?.Popup?.close) {
        ZOHO.CRM.UI.Popup.close().catch(() => {});
        return;
      }
      if (window.close) {
        window.close();
      }
    };

    return e(
      "div",
      { className: "app" },
      e(
        "header",
        { className: "header" },
        e("div", { className: "title" }, "Door Reduction"),
        e("div", { className: "subtitle" }, "CRM Widget · Edit Mode")
      ),
      e(
        "section",
        { className: "status panel" },
        e("div", { className: "status-label" }, statusLabel),
        error ? e("div", { className: "status-error" }, error) : null
      ),
      e(
        "main",
        { className: "content panel" },
        e(
          "div",
          { className: "row top-row" },
          e(
            "div",
            { className: "field" },
            e("label", null, "Job Number:"),
            e("input", {
              value: form.jobNumber,
              readOnly: true
            })
          ),
          e(
            "div",
            { className: "field" },
            e("label", null, "Issue Date:"),
            e("input", {
              type: "date",
              value: form.issueDate,
              readOnly: true
            })
          )
        ),
        e(
          "div",
          { className: "row" },
          e(
            "div",
            { className: "field wide" },
            e("label", null, "Job Name:"),
            e("input", {
              value: form.jobName,
              readOnly: true
            })
          ),
          e(
            "div",
            { className: "field" },
            e("label", null, "Due Date:"),
            e("input", {
              type: "date",
              value: form.dueDate,
              readOnly: true
            })
          )
        ),
        e(
          "div",
          { className: "row mid-row" },
          e(
            "div",
            { className: "block-left" },
            e(
              "div",
              { className: "field" },
            e("label", null, "Door Type:"),
            e("input", {
              value: form.doorType,
              readOnly: true
            })
          ),
          e(
            "div",
            { className: "field" },
            e("label", null, "Product ID:"),
            e("input", {
              value: form.productId,
              readOnly: true
            })
          ),
            e(
              "div",
              { className: "field" },
              e("label", null, "Product Name:"),
              e("input", {
                value: form.productName,
                readOnly: true
              })
            ),
            requiresSecondaryProduct
              ? e(
                  "div",
                  { className: "field" },
                  e("label", null, "Secondary Product ID:"),
                  e(
                    "select",
                    {
                      value: form.secondaryProductId || "",
                      onChange: ev => {
                        const selectedId = ev.target.value;
                        const selected = secondaryCandidates.find(c => c.id === selectedId);
                        setForm(prev => ({
                          ...prev,
                          secondaryProductId: selectedId,
                          secondaryProductName: selected ? (selected.name || selectedId) : selectedId
                        }));
                      }
                    },
                    e("option", { value: "" }, "Select"),
                    ...secondaryCandidates.map(c =>
                      e("option", { key: c.id, value: c.id }, c.id)
                    )
                  )
                )
              : null,
            requiresSecondaryProduct
              ? e(
                  "div",
                  { className: "field" },
                  e("label", null, "Secondary Product:"),
                  e("input", {
                    value: form.secondaryProductName || "",
                    readOnly: true
                  })
                )
              : null,
            e(
              "div",
              { className: "field dim" },
              e("label", null, "Dimensions:"),
              e(
                "div",
                { className: "dim-row" },
                e("input", {
                  value: form.width,
                  onChange: ev => setField("width", ev.target.value)
                }),
                e("span", { className: "dim-x" }, "x"),
                e("input", {
                  value: form.height,
                  onChange: ev => setField("height", ev.target.value)
                }),
                e("span", { className: "dim-note" }, "(w x h)")
              )
            ),
          e(
            "div",
            { className: "field" },
            e("label", null, "Lock:"),
            e(
              "select",
              {
                value: form.lock || "",
                onChange: ev => setField("lock", ev.target.value)
              },
              e("option", { value: "" }, "Select"),
              ...lockChoices.map(value =>
                e("option", { key: value, value }, value)
              )
            )
          ),
          ),
          e(
            "div",
            { className: "block-right" },
            e(
              "div",
              { className: "lock-ok" },
              e("input", {
                type: "checkbox",
                checked: !!form.lockOk,
                onChange: ev => setField("lockOk", ev.target.checked)
              }),
              e("span", null, "Lock OK")
            ),
            e(
              "div",
              { className: "mini-grid" },
              e("div", { className: "mini-title" }, "Ex. DBolt"),
              e("div", null, "Top"),
              e("div", null, "Bottom"),
              e("div", null, "Clearance"),
              e("div", null, ""),
              e("input", {
                value: form.exDboltTop,
                onChange: ev => setField("exDboltTop", ev.target.value)
              }),
              e("input", {
                value: form.exDboltBottom,
                onChange: ev => setField("exDboltBottom", ev.target.value)
              }),
              e("input", {
                value: form.exDboltClearance,
                onChange: ev => setField("exDboltClearance", ev.target.value)
              }),
              e("div", { className: "mini-title" }, "Ex. Knob"),
              e("div", null, "Top"),
              e("div", null, "Bottom"),
              e("div", null, "Clearance"),
              e("div", null, ""),
              e("input", {
                value: form.exKnobTop,
                onChange: ev => setField("exKnobTop", ev.target.value)
              }),
              e("input", {
                value: form.exKnobBottom,
                onChange: ev => setField("exKnobBottom", ev.target.value)
              }),
              e("input", {
                value: form.exKnobClearance,
                onChange: ev => setField("exKnobClearance", ev.target.value)
              })
            )
          )
        ),
        e(
          "div",
          { className: "row lower-row" },
          e(
            "div",
            { className: "stack" },
            e(
              "div",
              { className: "field" },
              e("label", null, "Color:"),
              e(
                "select",
                {
                  value: form.color || "",
                  onChange: ev => setField("color", ev.target.value)
                },
                e("option", { value: "" }, "Select"),
                ...colorChoices.map(value =>
                  e("option", { key: value, value }, value)
                )
              )
            ),
            e(
              "div",
              { className: "field" },
              e("label", null, "Lock Color:"),
              e(
                "select",
                {
                  value: form.lockColor || "",
                  onChange: ev => setField("lockColor", ev.target.value)
                },
                e("option", { value: "" }, "Select"),
                ...lockColorChoices.map(value =>
                  e("option", { key: value, value }, value)
                )
              )
            ),
            e(
              "div",
              { className: "field" },
              e("label", null, "Handle Type:"),
              e(
                "select",
                {
                  value: form.handleType || "",
                  onChange: ev => setField("handleType", ev.target.value)
                },
                e("option", { value: "" }, "Select"),
                ...handleTypeChoices.map(value =>
                  e("option", { key: value, value }, value)
                )
              )
            ),
            e(
              "div",
              { className: "field" },
              e("label", null, isOperatorMode ? "Operator:" : "Hinge:"),
              e(
                "select",
                {
                  value: form.hinge || "",
                  onChange: ev => setField("hinge", ev.target.value)
                },
                e("option", { value: "" }, "Select"),
                e("option", { value: "Left" }, "Left"),
                e("option", { value: "Right" }, "Right")
              )
            )
          ),
          e(
            "div",
            { className: "options" },
            e("label", null, "Options"),
            e(
              "div",
              {
                className: "multi-picklist",
                ref: doorGateOptionsRef
              },
              e(
                "button",
                {
                  type: "button",
                  className: `multi-picklist-control${doorGateOptionsOpen ? " open" : ""}`,
                  onClick: () => setDoorGateOptionsOpen(prev => !prev)
                },
                e(
                  "div",
                  { className: "multi-picklist-chips" },
                  form.doorGateOption.length
                    ? form.doorGateOption.map(value =>
                        e(
                          "span",
                          { key: value, className: "multi-picklist-chip" },
                          e("span", { className: "multi-picklist-chip-text" }, value),
                          e(
                            "span",
                            {
                              className: "multi-picklist-chip-remove",
                              role: "button",
                              tabIndex: 0,
                              onClick: ev => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                removeDoorGateOption(value);
                              },
                              onKeyDown: ev => {
                                if (ev.key === "Enter" || ev.key === " ") {
                                  ev.preventDefault();
                                  ev.stopPropagation();
                                  removeDoorGateOption(value);
                                }
                              }
                            },
                            "x"
                          )
                        )
                      )
                    : e("span", { className: "multi-picklist-placeholder" }, "Select one or more options")
                ),
                e(
                  "span",
                  { className: "multi-picklist-meta" },
                  selectedDoorGateCount ? `${selectedDoorGateCount} selected` : ""
                ),
                e("span", { className: "multi-picklist-caret" }, doorGateOptionsOpen ? "^" : "v")
              ),
              doorGateOptionsOpen
                ? e(
                    "div",
                    { className: "multi-picklist-menu" },
                    doorGateOptionChoices.length
                      ? doorGateOptionChoices.map(value => {
                          const selected = form.doorGateOption.includes(value);
                          return e(
                            "button",
                            {
                              type: "button",
                              key: value,
                              className: `multi-picklist-option${selected ? " selected" : ""}`,
                              onClick: () => toggleDoorGateOption(value)
                            },
                            selected ? `[x] ${value}` : value
                          );
                        })
                      : e("div", { className: "multi-picklist-empty" }, "No options available")
                  )
                : null
            ),
            e("div", { className: "multi-picklist-help" }, "Click to add or remove options")
          )
        ),
        e(
          "div",
          { className: "row notes-row" },
          e(
            "div",
            { className: "field notes" },
            e("label", null, "Notes:"),
            e("textarea", {
              value: form.notes,
              onChange: ev => setField("notes", ev.target.value),
              rows: 3
            })
          ),
          e(
            "div",
            { className: "field notes" },
            e("label", null, "Adjust Notes:"),
            e("textarea", {
              value: form.adjustNotes,
              onChange: ev => setField("adjustNotes", ev.target.value),
              rows: 3
            })
          )
        )
      ),
      e(
        "div",
        { className: "actions" },
        e(
          "button",
          {
            className: "btn primary",
            type: "button",
            onClick: handleReduce,
            disabled: loadingState === "loading"
          },
          loadingState === "loading" ? "Saving..." : "Reduce"
        ),
        e(
          "button",
          { className: "btn", type: "button", onClick: handleCancel },
          "Cancel"
        )
      ),
      pdfError
        ? e(
            "div",
            { className: "status panel" },
            e("div", { className: "status-error" }, pdfError)
          )
        : null,
      pdfDoors.length
        ? e(
            "div",
            { className: "pdf-viewers" },
            pdfUrl
              ? e("div", { className: "pdf-panel" }, e("iframe", { title: "Door Reduction PDF", src: pdfUrl }))
              : e(
                  "div",
                  { className: "pdf-loading panel" },
                  pdfLoading ? "Generating PDF pages..." : "Preparing PDF preview..."
                )
          )
        : null,
    );
  }

  window.DoorReductionWidget = {
    mount: (rootId, pageData) => {
      const root = document.getElementById(rootId || "root");
      if (!root) return;
      ReactDOM.createRoot(root).render(e(App, { pageData }));
    }
  };
})();
