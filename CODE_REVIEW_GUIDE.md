# GREENWAY AI — Code Review Guide

This guide lets a reviewer verify the project quickly.

## 1. Verify the algorithm

Open `dist/algorithm.js`.

- `adjustedWeights()` personalizes and normalizes the active weights.
- `factorScores()` places all inputs on a 0–100 scale.
- `scoreRoute()` calculates factor contributions and EES.
- `rankRoutes()` selects the lowest-scoring candidate.
- `exposureBudget()` projects daily exposure.
- `decisionConfidence()` measures the score gap to second place.

## 2. Verify separation of concerns

- Data: `dist/data.js`
- Decision logic: `dist/algorithm.js`
- Interface: `dist/app.js`
- Layout: `dist/index.html`
- Visual design: `dist/styles.css`

The scoring engine contains no DOM code and can be tested independently.

## 3. Run automated checks

```bash
npm test
```

Expected result: all algorithm checks pass with no dependencies or network access.

## 4. Verify the claim in the interface

Open the application and compare the **Live Algorithm Proof** table with a route card:

1. Read each factor score.
2. Multiply it by the displayed weight.
3. Add the five displayed contributions.
4. Confirm that the sum equals the displayed EES.
5. Confirm that the route with the lowest EES is ranked first.

## 5. Judging-criteria mapping

| Criterion | Evidence |
|---|---|
| Suitability | HCMC student commuting; pollution, heat, traffic, and flood factors |
| Creativity | Personalized Environmental Exposure Budget and explainable route choice |
| Algorithms | Normalization, dynamic weights, weighted scoring, ranking, confidence, tests |
| Completeness | Three journeys, four scenarios, five modes, responsive UI, audit export, documentation |
