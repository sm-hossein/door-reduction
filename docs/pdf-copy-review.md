# Door Reduction PDF copies

Task: https://trello.com/c/iM346f7S

Each widget generates complete Production Copy, File Copy, and Quality Control
Copy sets, in that order. Only the heading changes. A set contains every door
side and its continuation pages; existing side numbering restarts with each set.

## Verification

- `npm test`: 21 passing tests, including 8 PDF regression tests.
- Both widget scripts pass `node --check`; `git diff --check` passes.
- Synthetic single, paired, and overflow fixtures produce 3, 6, and 15 pages
  respectively in each widget.
- Decoded PDF drawing streams match across corresponding pages after replacing
  copy headings. This covers layout and manufacturing text as well as numbering.
- All six synthetic PDFs were rendered and visually reviewed, including the
  longer Quality Control Copy continuation heading.

Set `PDF_REVIEW_OUTPUT` to an output directory and run `npm test` to regenerate
the six review PDFs. Paired input-widget and overflow result-widget samples are
attached to the task. They contain synthetic data and make no CRM calls.

Live Zoho CRM validation remains a reviewer step. These checks do not establish
deployment state. No merge or deployment is part of this handoff.
