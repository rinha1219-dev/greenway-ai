# GREENWAY AI

GREENWAY AI is an explainable environmental navigation prototype for students and everyday travelers in Ho Chi Minh City. Ordinary navigation minimizes time. GREENWAY AI minimizes a user's **additional environmental exposure** while still considering travel time.

The prototype compares three candidate routes using five normalized factors:

- air pollution
- heat exposure
- traffic risk
- flood risk
- travel time

Users can choose a journey, daily condition, route priority, travel behavior, heat sensitivity, pollution preference, and the percentage of their Environmental Exposure Budget already used. Every choice immediately recalculates the route ranking.

## Quick start

No packages or API keys are required.

```bash
npm start
```

Open `http://localhost:8000`.

The application also runs by serving the `dist` folder with any static web server.

## Run the algorithm checks

```bash
npm test
```

The test suite verifies weight normalization, score bounds, mode behavior, heavy-rain behavior, budget personalization, deterministic ranking, contribution totals, and all three demo journeys.

## Explainable algorithm

Every factor is represented on the same 0–100 risk scale. Travel time is normalized against the slowest current candidate.

```text
EES = Air × w_air
    + Heat × w_heat
    + Traffic × w_traffic
    + Flood × w_flood
    + Time × w_time
```

Lower EES is better.

1. The selected mode supplies five base weights.
2. Active travel, heat sensitivity, pollution avoidance, heavy rain, and exposure already used adjust those weights.
3. The weights are normalized to exactly 100%.
4. Each factor is multiplied by its active weight.
5. The contributions are added and routes are ranked from lowest to highest EES.
6. The interface shows the winning calculation, confidence gap, and plain-language explanation.

## Environmental Exposure Budget

The exposure budget is part of the decision, not only a display. As the user consumes more of today's budget, environmental risk weights progressively increase relative to the time weight. The interface also projects the recommended trip's additional exposure and warns when the daily budget would be exceeded.

## Demonstration data and ethics

The included route values are transparent, illustrative 0–100 sample indices for repeatable District 7 competition demonstrations. They are not live measurements, medical advice, or emergency guidance.

A production version would use adapters for:

- a routing service for candidate geometry and time
- an air-quality service for pollution estimates
- a weather service for temperature and heat risk
- traffic observations for road-conflict risk
- city or community flood alerts for flood risk

The scoring engine is separated from the dataset, so live adapters can replace the sample data without changing the tested decision logic.

## Project structure

- `dist/index.html` — accessible application structure
- `dist/styles.css` — responsive interface
- `dist/data.js` — journeys, routes, modes, scenarios, and factor labels
- `dist/algorithm.js` — pure scoring, ranking, budget, confidence, and explanation functions
- `dist/app.js` — state, interaction, map, calculation table, and report export
- `tests/algorithm.test.mjs` — deterministic algorithm checks
- `CODE_REVIEW_GUIDE.md` — short path for judges reviewing the source
- `DATA_METHOD.md` — normalization and production-data plan

## Suggested demonstration

1. Begin with **School → Home**, **Normal school day**, and **Eco Balance**.
2. Point to the live calculation table and show that weights total 100%.
3. Switch to **Fastest** to show the direct road winning.
4. Select **Polluted morning** and **Cleanest**; explain how the used exposure budget increases environmental importance.
5. Select **Heavy rain alert** and **Safest**; show the flood-prone route moving down.
6. Change the demo journey to prove the same algorithm works with another route set.
7. Export the JSON decision audit to demonstrate reproducibility.
