# DATA SOURCES

Authoritative / legally usable sources only. Record URL + date verified.

## Planned primary integrations

| Source | Use | Access | Notes |
|--------|-----|--------|-------|
| NHTSA vPIC | VIN decode | Public API | https://vpic.nhtsa.dot.gov/api/ |
| NHTSA Recalls | Open recalls by make/model/year or VIN | Public API | https://api.nhtsa.gov/ |
| NHTSA manufacturer communications / TSBs | Coverage investigation | Public where available | Prefer official NHTSA endpoints; never scrape paid shop DBs |
| OEM warranty / campaign pages | Program eligibility | Public web | Cite URL + retrieval date |
| Public settlements / regulatory filings | Class actions, campaigns | Public | Cite primary documents |

## Live endpoints used in the MVP

| Call | URL | Verified |
|------|-----|----------|
| VIN decode (flat) | `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json` | 2026-09-19 |
| Recalls by Y/M/M | `https://api.nhtsa.gov/recalls/recallsByVehicle?make=&model=&modelYear=` | 2026-09-19 (NHTSA datasets page) |
| Recalls by VIN (best-effort) | `https://api.nhtsa.gov/recalls/recallsByVehicleId?vin=` | 2026-09-19 — used when the API responds; fallback is Y/M/M |

## Forbidden without licensing

ALLDATA, Mitchell1, Identifix, authenticated shop estimating systems, any paywalled proprietary labor/parts database accessed by scraping or credential sharing.

## coverage_programs seed

Seeded 2026-09-19 from public pages/PDFs only. If a program could not be verified, it was omitted.

| Program | Source | Last verified |
|---------|--------|---------------|
| Hyundai TXXM engine warranty extension | https://autoservice.hyundaiusa.com/TXXM | 2026-09-19 |
| Hyundai TXXI / Theta II settlement comms | https://static.nhtsa.gov/odi/tsbs/2022/MC-10207801-0001.pdf | 2026-09-19 |
| Kia Theta II engine settlement notice | https://www.kiaenginesettlement.com/Content/Documents/Notice.pdf | 2026-09-19 |
| Kia Soul 1.6L GDI KSDS owner letter | https://static.nhtsa.gov/odi/tsbs/2021/MC-10201610-0001.pdf | 2026-09-19 |
| Nissan CVT 84/84 extension bulletin | https://static.nhtsa.gov/odi/tsbs/2020/MC-10176204-0001.pdf | 2026-09-19 |
| Toyota MY2020+ hybrid battery warranty | https://www.toyota.com/owners/warranty-owners-manuals/ | 2026-09-19 |
| Takata inflator recalls | https://www.nhtsa.gov/equipment/takata-recall-spotlight | 2026-09-19 |

Supporting Toyota announcement (not a second program): https://pressroom.toyota.com/toyota-extends-battery-warranty-for-model-year-2020-hybrid-plug-in-and-fuel-cell-electric-vehicles/
