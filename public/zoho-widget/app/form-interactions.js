(() => {
  const normalizeText = value => String(value ?? "").trim().toLocaleLowerCase();

  const normalizeOptions = options => {
    const seen = new Set();
    return (Array.isArray(options) ? options : [])
      .map(option => {
        if (option && typeof option === "object") {
          const value = String(option.value ?? "");
          return { value, label: String(option.label ?? value) };
        }
        const value = String(option ?? "");
        return { value, label: value };
      })
      .filter(option => {
        if ((!option.value && !option.label) || seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  };

  const withCurrentOption = (options, value) => {
    const normalized = normalizeOptions(options);
    const current = String(value ?? "");
    if (!current || normalized.some(option => option.value === current)) return normalized;
    return [{ value: current, label: current }, ...normalized];
  };

  const filterOptions = (options, query) => {
    const needle = normalizeText(query);
    const normalized = normalizeOptions(options);
    if (!needle) return normalized;
    return normalized.filter(option => normalizeText(option.label).includes(needle));
  };

  const isVisible = element => {
    if (!element || element.hidden) return false;
    if (element.getClientRects && element.getClientRects().length === 0) return false;
    return true;
  };

  const getEnterNavigationControls = root => {
    if (!root?.querySelectorAll) return [];
    return [...root.querySelectorAll(
      'input:not([type="hidden"]):not([type="checkbox"]), [data-enter-destination="true"]'
    )].filter(element =>
      !element.disabled &&
      !element.readOnly &&
      element.getAttribute?.("aria-disabled") !== "true" &&
      isVisible(element)
    );
  };

  const moveFocusOnEnter = (event, root) => {
    if (
      event?.key !== "Enter" ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) return false;

    const target = event.target;
    if (!target?.matches?.('input:not([type="hidden"]):not([type="checkbox"])')) return false;
    if (target.readOnly || target.disabled || target.getAttribute?.("aria-expanded") === "true") {
      return false;
    }

    const controls = getEnterNavigationControls(root);
    const currentIndex = controls.indexOf(target);
    if (currentIndex < 0) return false;
    const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
    const next = controls[nextIndex];
    if (!next) return false;

    event.preventDefault?.();
    next.focus?.();
    next.select?.();
    return true;
  };

  window.DoorReductionFormInteractions = {
    filterOptions,
    getEnterNavigationControls,
    moveFocusOnEnter,
    normalizeOptions,
    withCurrentOption
  };
})();
