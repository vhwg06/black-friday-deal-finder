# black-friday-deal-finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/vhwg06/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/vhwg06/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Deal Beacon is a Black Friday 2026 deal finder with 46 real deals from 6 stores, each checked against a named source on Nov 24–27, 2026, with its sale price, usual price, discount, check time, and an honest verdict on whether it is really a deal. Search and filter by category, store, and discount; sort by biggest saving; compare the same product across stores.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The site is static files under `app/` with no build step and no network requests: `main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` — `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
