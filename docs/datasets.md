# CycloneShield AI - Datasets & Remote Sensing

## 1. Supported & Ingested Datasets

| Dataset | Source | Purpose | Format | Update Frequency | Status in Prototype |
|---|---|---|---|---|---|
| **NOAA IBTrACS** | NOAA NCEI | Historical global cyclone best tracks | CSV / NetCDF | 3-hourly during storm | Live ingestion with cached fallback |
| **IMD RSMC Advisories** | India Meteorological Dept | Official Indian Ocean synoptic warnings | Bulletin / XML | 3-hourly | Live ingestion with fallback |
| **Copernicus Sentinel-1 SAR** | ESA / Copernicus / GEE | C-band radar cloud-penetrating flood extent | GeoTIFF / GRD | 6-12 day revisit | GEE pipeline + cached radar scene |
| **Copernicus DEM (GLO-30)** | ESA / Copernicus | Coastal ground elevation & surge exposure | Raster (30m) | Static reference | Ingested into asset risk engine |
| **Lifeline Infrastructure** | OpenStreetMap & OSDMA | Hospitals, substations, bridges, shelters | GeoJSON / SQL | Annual | Integrated coastal database |
| **Census Demographics** | Census of India / WorldPop | District-level population density | Tabular / Raster | Decennial / Annual | Mapped across impact rings |

## 2. Remote Sensing & Earth Engine Pipeline
The system utilizes Google Earth Engine (`ee.ImageCollection('COPERNICUS/S1_GRD')`) with dual-polarization (VV/VH) radar backscatter thresholding to delineate flood inundation beneath dense cyclonic cloud canopies.
