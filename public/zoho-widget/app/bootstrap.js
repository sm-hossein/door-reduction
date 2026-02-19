(() => {
  const showFallback = message => {
    const root = document.getElementById("root");
    if (!root) return;
    root.innerHTML = `<div style="padding:16px;font-family:sans-serif;color:#7a2a21;">${message}</div>`;
  };

  if (!window.ZOHO || !ZOHO.embeddedApp) {
    showFallback("Zoho SDK not available. Load this widget inside Zoho CRM.");
    return;
  }

  ZOHO.embeddedApp.on("PageLoad", data => {
    if (ZOHO?.CRM?.UI?.Resize) {
      ZOHO.CRM.UI.Resize({ height: "100%", width: "100%" }).catch(() => {});
    }

    if (window.DoorReductionWidget?.mount) {
      window.DoorReductionWidget.mount("root", data);
    } else {
      showFallback("Widget not ready. app.js did not load correctly.");
    }
  });

  ZOHO.embeddedApp.init();
})();
