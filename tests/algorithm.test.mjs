import assert from "node:assert/strict";
import {
  adjustedWeights,
  calculationRows,
  decisionConfidence,
  exposureBudget,
  factorScores,
  rankRoutes,
  scoreRoute,
} from "../dist/algorithm.js";
import { JOURNEYS, MODES } from "../dist/data.js";

let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks += 1;
};
const preferences = {
  activeTravel: true,
  heatSensitivity: 1,
  pollutionAvoidance: 1,
  morningExposure: 28,
};
const routes = JOURNEYS.school.routes;

for (const mode of Object.values(MODES)) {
  const weights = adjustedWeights(mode.weights, preferences);
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  check(Math.abs(total - 1) < 1e-9, `${mode.label} weights must sum to 1`);
  check(Object.values(weights).every((value) => value >= 0 && value <= 1), `${mode.label} weights must be bounded`);
}

const lowBudgetPressure = adjustedWeights(MODES.balance.weights, { ...preferences, morningExposure: 0 });
const highBudgetPressure = adjustedWeights(MODES.balance.weights, { ...preferences, morningExposure: 80 });
check(highBudgetPressure.time < lowBudgetPressure.time, "Using more of the exposure budget must reduce the relative time weight");
check(highBudgetPressure.air > lowBudgetPressure.air, "Using more of the exposure budget must increase air-risk importance");

const normalWeights = adjustedWeights(MODES.safest.weights, preferences);
const rainWeights = adjustedWeights(MODES.safest.weights, preferences, { heavyRain: true });
check(rainWeights.flood > normalWeights.flood, "Heavy rain must increase flood importance");

check(rankRoutes(routes, MODES.fastest, preferences)[0].id === "express", "Fastest mode must select the express route");
check(rankRoutes(routes, MODES.cleanest, preferences)[0].id === "green", "Cleanest mode must select the green route");
check(rankRoutes(routes, MODES.coolest, preferences)[0].id === "green", "Coolest mode must select the green route");
check(rankRoutes(routes, MODES.safest, preferences, { heavyRain: true })[0].id !== "canal", "Heavy-rain safest mode must reject the flood-prone canal route");

for (const journey of Object.values(JOURNEYS)) {
  for (const mode of Object.values(MODES)) {
    const ranked = rankRoutes(journey.routes, mode, preferences);
    check(ranked.length === 3, `${journey.label} must rank all three routes`);
    check(ranked.every((route) => route.score >= 0 && route.score <= 100), `${journey.label} scores must remain in the 0–100 range`);
    check(ranked[0].score <= ranked[1].score && ranked[1].score <= ranked[2].score, `${journey.label} routes must be sorted from lowest exposure`);
  }
}

const maxTime = Math.max(...routes.map((route) => route.time));
const result = scoreRoute(routes[0], adjustedWeights(MODES.balance.weights, preferences), maxTime);
const contributionTotal = Object.values(result.contributions).reduce((sum, value) => sum + value, 0);
check(Math.abs(result.exactScore - contributionTotal) < 1e-9, "EES must equal the sum of factor contributions");
check(calculationRows({ ...routes[0], ...result, weights: adjustedWeights(MODES.balance.weights, preferences) }).length === 5, "Audit table must contain five factors");

const factors = factorScores(routes[0], maxTime);
check(factors.time === 80, "Travel time must be normalized against the longest candidate");
check(Object.values(factors).every((value) => value >= 0 && value <= 100), "All factor scores must be bounded");

const budget = exposureBudget(90, 80);
check(budget.projected === 124 && budget.exceeded === true, "Budget must preserve and flag projected overexposure");
check(budget.remaining === 0, "Exceeded budget must have zero remaining");

const ranked = rankRoutes(routes, MODES.balance, preferences);
const confidence = decisionConfidence(ranked);
check(confidence.gap >= 0, "Confidence gap cannot be negative");
assert.throws(() => rankRoutes([], MODES.balance, preferences), /At least one route/);
checks += 1;

console.log(`GREENWAY AI: ${checks} algorithm checks passed.`);
