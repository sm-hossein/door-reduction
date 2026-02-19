(() => {
  const CONFIG = {
    orderItemsModule: "Order_Items",
    reductionResultField: "Reduction_Result",
    moduleOverride: "Order_Items"
  };

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch (_err) {
      return fallback;
    }
  };

  const normalizeResultPayload = raw => {
    if (raw === null || raw === undefined) {
      return { hasValue: false, parsed: null };
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return { hasValue: false, parsed: null };
      return { hasValue: true, parsed: safeJsonParse(trimmed, null) };
    }

    return { hasValue: true, parsed: raw };
  };

  const buildPdfBytesForDoor = async (door, pageMeta = {}) => {
    if (!door) {
      throw new Error("No door JSON available for PDF.");
    }

    const raw = door.raw || {};
    const components = Array.isArray(door.components) ? door.components : [];

    if (!window.PDFLib) {
      throw new Error("PDFLib is not loaded.");
    }

    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]);
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

    const leftFields = [
      ["Job Number / Name", `${safe(raw["Job Number"])}  ${safe(raw["Job Name"])} `, { maxLines: 1 }],
      ["Order Type", safe(raw.OrderType), {}],
      ["Measured Dimensions", safe(raw.MeasuredDimensions), {}],
      ["Ref. Door Dimensions", safe(raw.RefDimensions), {}],
      ["Build Product ID", [safe(raw.ProductDescription || ""), safe(raw["Product ID"])].filter(Boolean).join(" - "), {}],
      ["Build Dimensions", safe(raw.BuildDimensions), {}],
      ["Build Notes", safe(raw.BuildNotes), { valueSize: 8.5, maxLines: 2, lineHeight: 9, minHeight: 26 }]
    ];

    const rightFields = [
      ["Due Date", safe(raw["Due Date"]), {}],
      ["Issue Date", safe(raw["Issue Date"]), {}],
      ["Color", safe(raw.ColorName || raw.Color), {}],
      ["Hinge", safe(raw.HingeOutput || raw.Hinge), {}],
      ["Lock", safe(raw.LockOutput || raw.Lock), {}]
    ];

    const measureStack = (yTop, w, fields) =>
      fields.reduce((yPos, [, value, opts]) => yPos - measureFieldHeight(w, value, opts) - headerGap, yTop);

    const panelBottom = Math.min(measureStack(headerTop, leftW, leftFields), measureStack(headerTop, rightW, rightFields)) + headerGap;

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

    let y = Math.min(yL, yR) - 10;

    const sectionTitle = title => {
      if (y - 16 < MIN_CONTENT_Y) {
        y = startContinuationPage();
      }
      y -= 6;
      text(title, M, y, 10, fontBold, colorText);
      page.drawLine({ start: { x: M, y: y - 2 }, end: { x: PW - M, y: y - 2 }, thickness: 0.8, color: colorBorder });
      y -= 8;
    };

    const drawTable = rows => {
      const tableFontSize = 8;
      const headerFontSize = 8;
      const lineHeight = 10;
      const headerBg = colorHeaderBg;
      const col = { qty: 20, desc: 150, loc: 50, size: 80 };
      const notesW = PW - M * 2 - (col.qty + col.desc + col.loc + col.size);
      const colX = [M, M + col.qty, M + col.qty + col.desc, M + col.qty + col.desc + col.loc, M + col.qty + col.desc + col.loc + col.size];
      const headerH = 16;

      const drawHeader = () => {
        page.drawRectangle({ x: M, y: y - headerH, width: PW - M * 2, height: headerH, color: headerBg, borderColor: colorBorder, borderWidth: 1 });
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

      rows.forEach(r => {
        const descLines = wrapText(safe(r.desc), col.desc - 8, font, tableFontSize);
        const notesLines = wrapText(safe(r.notes), notesW - 8, font, tableFontSize);
        const maxLines = Math.max(descLines.length, notesLines.length, 1);
        const rowH = 12 + (maxLines - 1) * lineHeight;

        if (y - rowH < MIN_CONTENT_Y) {
          y = startContinuationPage();
          drawHeader();
        }

        page.drawRectangle({ x: M, y: y - rowH, width: PW - M * 2, height: rowH, borderColor: colorGrid, borderWidth: 1 });
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
      });

      y -= 8;
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
      sectionTitle("Frame / Internal Components");
      if (frameRows.length) drawTable(frameRows);
      if (internalRows.length) drawTable(internalRows);
    }

    const designRows = rowsFor("Design");
    if (designRows.length) {
      sectionTitle("Design Components");
      drawTable(designRows);
    }

    const finalRows = rowsFor("Final");
    if (finalRows.length) {
      sectionTitle("Final Components");
      drawTable(finalRows);
    }

    const openingRows = rowsFor("Opening");
    if (openingRows.length) {
      sectionTitle("Opening Components");
      drawTable(openingRows);
    }

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

    return pdfDoc.save();
  };

  const buildPdfBytesForDoors = async doors => {
    const list = Array.isArray(doors) ? doors : [];
    if (!list.length) {
      throw new Error("No door JSON available for PDF.");
    }

    if (!window.PDFLib) {
      throw new Error("PDFLib is not loaded.");
    }

    const { PDFDocument } = window.PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < list.length; i += 1) {
      const sourceBytes = await buildPdfBytesForDoor(list[i], {
        pageNumber: i + 1,
        totalPages: list.length
      });
      const sourceDoc = await PDFDocument.load(sourceBytes);
      const sourcePages = await mergedPdf.copyPages(sourceDoc, sourceDoc.getPageIndices());
      sourcePages.forEach(p => mergedPdf.addPage(p));
    }

    return mergedPdf.save();
  };

  const appTemplate = () => `
    <div class="app">
      <section id="viewer" class="viewer panel"></section>
    </div>
  `;

  let activeBlobUrl = "";

  const escapeHtml = value =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const clearBlobUrl = () => {
    if (activeBlobUrl) {
      URL.revokeObjectURL(activeBlobUrl);
      activeBlobUrl = "";
    }
  };

  const setStatus = (_text, _isError = false) => {};

  const setViewerHtml = html => {
    const viewer = document.getElementById("viewer");
    if (!viewer) return;
    viewer.innerHTML = html;
  };

  const renderMessage = text => {
    clearBlobUrl();
    setViewerHtml(`<div class="message"><strong>${escapeHtml(text)}</strong></div>`);
  };

  const renderPdfUrl = (url, opts = {}) => {
    if (!opts.fromBlob) {
      clearBlobUrl();
    }
    const safeUrl = escapeHtml(url);
    setViewerHtml(`
      <iframe title="Reduction Result PDF" src="${safeUrl}"></iframe>
    `);
  };

  const createBlobUrl = bytes => {
    clearBlobUrl();
    const blob = new Blob([bytes], { type: "application/pdf" });
    activeBlobUrl = URL.createObjectURL(blob);
    return activeBlobUrl;
  };

  const loadAndRender = async pageData => {
    if (!window.ZOHO?.CRM?.API?.getRecord) {
      setStatus("Zoho SDK is not ready.", true);
      renderMessage("Unable to load Zoho CRM APIs.");
      return;
    }

    const moduleName = CONFIG.moduleOverride || pageData?.Entity || CONFIG.orderItemsModule;
    const recordId = Array.isArray(pageData?.EntityId) ? pageData.EntityId[0] : pageData?.EntityId;

    if (!recordId) {
      setStatus("Missing Order Item context.", true);
      renderMessage("Open this widget from an Order Item record.");
      return;
    }

    setStatus("Loading reduction result...");

    try {
      const recordResp = await ZOHO.CRM.API.getRecord({
        Entity: moduleName,
        RecordID: recordId
      });
      const record = recordResp?.data?.[0] || {};
      const reductionRaw = record[CONFIG.reductionResultField];
      const normalized = normalizeResultPayload(reductionRaw);

      if (!normalized.hasValue) {
        setStatus("No reduction result found.");
        renderMessage("Reduction has not been applied for this item yet.");
        return;
      }

      const parsed = normalized.parsed;

      const doors = Array.isArray(parsed?.doors) ? parsed.doors : [];
      if (doors.length) {
        setStatus("Generating PDF from reduction result...");
        const pdfBytes = await buildPdfBytesForDoors(doors);
        const blobUrl = createBlobUrl(pdfBytes);
        setStatus("Showing generated PDF result.");
        renderPdfUrl(blobUrl, { fromBlob: true });
        return;
      }

      setStatus("No reduction result found.");
      renderMessage("Reduction has not been applied for this item yet.");
    } catch (err) {
      setStatus(err?.message || "Failed to load reduction result.", true);
      renderMessage("Failed to load reduction result PDF.");
    }
  };

  window.ReductionResultWidget = {
    mount(rootId, pageData) {
      const root = document.getElementById(rootId);
      if (!root) return;
      root.innerHTML = appTemplate();
      loadAndRender(pageData);
    }
  };
})();
