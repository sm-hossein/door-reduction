# Door Reduction

Door Reduction calculates manufacturing dimensions, components, options, build notes, and clearance adjustments for security doors and gates. It is a Node.js conversion of a legacy Microsoft Access/VBA application and includes both a local API and Zoho CRM/widget integration.

## What this repository contains

- The calculation engine used to convert opening measurements and product rules into build dimensions.
- Clearance checks for existing knobs and deadbolts.
- CSV-backed data access for local development and testing.
- A Zoho CRM data provider for production order-item, product, component, and photo data.
- Zoho widgets for entering reduction measurements and viewing or exporting results.
- PDF reduction-sheet generation with component tables, notes, and production QA fields.
- The original Access/VBA modules for comparison with the Node.js implementation.

## Requirements

- Node.js 18 or newer
- npm

## Installation

```bash
npm install
```

## Running locally

Start the API server:

```bash
npm start
```

The service listens on `http://localhost:3001` by default and serves static files from `public/`.

For development with automatic restart:

```bash
npm run dev
```

## Local API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Service health response |
| `GET` | `/api/door/jobs` | Lists locally available door jobs |
| `GET` | `/api/door/:jobNumber` | Returns a door and its associated product |
| `GET` | `/api/door/:jobNumber/sides` | Returns the applicable sides for a door |

The local API reads the CSV fixtures in `data/`. The Zoho runtime instead retrieves live CRM records through `src/zohoDataProvider.cjs`.

## Testing

Run the Node test suite with:

```bash
npm test
```

The regression suite currently focuses on standard glass sizing for single, French, and patio configurations, including paired operator-door boundary cases.

PDF regression tests also exercise both widgets with single-sided, paired, and
overflowing reports. They verify three complete sets in order: Production Copy,
File Copy, and Quality Control Copy. Only the heading differs; side numbering,
continuation pages, manufacturing content, and QA fields are preserved.
Set `PDF_REVIEW_OUTPUT` to a local directory when running `npm test` to save the
synthetic PDF fixtures for visual review. Tests use the same pinned `pdf-lib`
version as the widgets and do not contact CRM.

## Calculation flow

1. A data provider loads the door, product, component, option, and reference data.
2. `src/init.js` normalizes that data into a calculation context.
3. `src/calculations.js`, `src/components.js`, and `src/clearanceCheck.js` calculate sizes, components, notes, and clearance requirements.
4. `src/calcDoorOutput.js` produces the result consumed by the widgets and PDF generator.

The legacy VBA modules are retained in `legacy-access-vba/` to make parity checks and migration debugging possible. The local Access database itself is intentionally ignored because it is a large, environment-specific artifact.

## Project structure

| Path | Description |
| --- | --- |
| `src/` | Calculation engine, normalization logic, static tables, and data providers |
| `test/` | Node regression tests |
| `data/` | CSV fixtures used by the local data provider |
| `public/zoho-widget/` | Active Zoho widget applications and browser assets |
| `legacy-access-vba/` | Original Microsoft Access/VBA modules used as the behavioral reference |
| `Door Pictures/` | Product reference images and their extraction/upload records |
| `docs/` | Technical documentation for calculation behavior |
| `scripts/` | Analysis, image extraction/upload, and Zoho OAuth helper scripts |
| `server.js` | Local Express API entry point |
| `DoorReductionBackend.js` | Zoho serverless backend entry point |
| `config.json` | Zoho function routing configuration |

## Zoho integration

`DoorReductionBackend.js` is the Zoho serverless entry point. It accepts an `orderItemsId` (or `doorId`), loads the related CRM data, runs the calculation engine, and returns the reduction result as JSON.

The scripts used for OAuth token exchange and product-photo upload require credentials to be supplied through parameters or environment variables. Credential files, CRM exports, local databases, and temporary extraction output are excluded by `.gitignore` and must not be committed.

## Development notes

- Keep JavaScript calculation changes aligned with the corresponding behavior in `legacy-access-vba/` unless the difference is an intentional bug fix.
- Add regression coverage for changes to measurements, glass classification, clearance checks, or component sizing.
- Treat files under `Door Pictures/` as maintained reference assets. Other generated PDFs, widget build output, and temporary extraction files should remain untracked.
