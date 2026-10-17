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

  const getHighlightedOption = (options, highlightedIndex) => {
    if (!Number.isInteger(highlightedIndex) || highlightedIndex < 0) return null;
    return (Array.isArray(options) ? options : [])[highlightedIndex] ?? null;
  };

  const getSearchResults = (options, query, typed = false) =>
    filterOptions(options, typed ? query : "").filter(option => !typed || option.value !== "");

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

  const focusAdjacentControl = (target, root, backwards = false) => {
    const controls = getEnterNavigationControls(root);
    const currentIndex = controls.indexOf(target);
    if (currentIndex < 0) return false;
    const next = controls[currentIndex + (backwards ? -1 : 1)];
    if (!next) return false;
    next.focus?.();
    next.select?.();
    return true;
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

    if (!focusAdjacentControl(target, root, !!event.shiftKey)) return false;
    event.preventDefault?.();
    return true;
  };

  window.DoorReductionFormInteractions = {
    filterOptions,
    focusAdjacentControl,
    getHighlightedOption,
    getSearchResults,
    getEnterNavigationControls,
    moveFocusOnEnter,
    normalizeOptions,
    withCurrentOption
  };
})();
