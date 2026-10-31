# Database (JSON data)

This folder holds all app data JSON files. **Do not overwrite or replace this folder when deploying updates** so that existing data (gallery, news, careers) is preserved.

## Content posts & gallery

- `gallery-images.json` – gallery images metadata (Vite plugin / gallery-admin)
- `gallery-albums.json` – gallery album metadata
- `gallery-settings.json` – gallery page copy
- `news-posts.json` – news posts (news-admin.php)
- `careers-posts.json` – careers posts (careers-admin.php)
- `aviation-careers-posts.json` – aviation careers posts (aviation-careers-admin.php)

## CMS site content (seed from source)

These files are created by `node scripts/seed-cms-from-source.js` (only if missing). Templates live in `lib/cmsDefaults/`.

- `site-seo.json` – default and per-page SEO (`lib/pageMeta.ts`, root layout keywords)
- `site-settings.json` – phone, email, address, map, social, brochure URL
- `home.json` – home hero, tiles, FAQs, videos, airlines, why-choose cards
- `about.json` – about page copy, MD message, vision/mission, IATA cards
- `courses.json` – course catalog (`src/data/coursesData.ts`)
- `team.json` – leadership and trainer profiles
- `placement.json` – placement hero, stories, videos, partners
- `contact.json` – contact hero; address/phone use `site-settings.json`
- `student-hub.json` – Student Hub apps and intro
- `flight-announcements.json` – announcement categories and scripts
- `virtual-classroom.json` – sample sessions and login copy
- `it-department.json` – IT department page content (`src/data/kiteItDepartment.ts`)
- `chrome.json` – header nav, footer links, copyright pattern

Kind names and filenames are defined in `lib/cmsKinds.ts`.

## Uploads

- `uploads/{section}/` – permanent CMS media uploads (served at `/database/uploads/...`). Preserve this folder on deploy.
