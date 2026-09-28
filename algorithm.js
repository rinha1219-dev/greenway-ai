import { FACTOR_LABELS } from "./data.js";

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (total <= 0) throw new Error("Weight total must be greater than zero.");
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, value / total]));
}

/**
 * Personalizes mode weights using travel behavior, health preferences,
 * weather, and the share of today's exposure budget already consumed.
 */
export function adjustedWeights(modeWeights, preferences = {}, weather = {}) {
  const weights = { ...modeWeights };
  const morningExposure = clamp(Number(preferences.morningExposure || 0));
  const budgetPressure = morningExposure / 100;

  if (preferences.activeTravel) {
    weights.heat += 0.05;
    weights.air += 0.02;
  }

  weights.heat += clamp(Number(preferences.heatSensitivity || 0), 0, 2) * 0.045;
  weights.air += clamp(Number(preferences.pollutionAvoidance || 0), 0, 2) * 0.045;

  // Environmental Exposure Budget: as today's budget is consumed, the
  // algorithm progressively values lower additional exposure over minutes.
  weights.air += budgetPressure * 0.08;
  weights.heat += budgetPressure * 0.06;
  weights.traffic += budgetPressure * 0.035;
  weights.flood += budgetPressure * 0.035;

  if (weather.heavyRain) weights.flood += 0.20;
  return normalizeWeights(weights);
}

export function factorScores(route, maxTime) {
  if (!route || maxTime <= 0) throw new Error("A valid route and maxTime are required.");
  return {
    air: clamp(route.air),
    heat: clamp(route.heat),
    traffic: clamp(route.traffic),
    flood: clamp(route.flood),
    time: clamp((route.time / maxTime) * 100),
  };
}

export function scoreRoute(route, weights, maxTime) {
  const factors = factorScores(route, maxTime);
  const contributions = Object.fromEntries(
    Object.entries(factors).map(([key, value]) => [key, value * weights[key]])
  );
  const exactScore = Object.values(contributions).reduce((sum, value) => sum + value, 0);
  return { score: Math.round(exactScore), exactScore, factors, contributions };
}

export function rankRoutes(routes, mode, preferences = {}, weather = {}) {
  if (!Array.isArray(routes) || routes.length === 0) throw new Error("At least one route is required.");
  const maxTime = Math.max(...routes.map((route) => route.time));
  const weights = adjustedWeights(mode.weights, preferences, weather);
  return routes
    .map((route) => ({ ...route, ...scoreRoute(route, weights, maxTime), weights }))
    .sort((a, b) => a.score - b.score || a.time - b.time);
}

export function exposureBudget(morningExposure, routeScore, dailyLimit = 100) {
  const morning = clamp(Math.round(morningExposure), 0, dailyLimit);
  const route = Math.round(clamp(routeScore) * 0.42);
  const projected = morning + route;
  const total = Math.min(dailyLimit, projected);
  return {
    morning,
    route,
    projected,
    total,
    remaining: Math.max(0, dailyLimit - projected),
    exceeded: projected > dailyLimit,
  };
}

export function exposureLevel(score) {
  if (score < 38) return { label: "Low", color: "#0d8f6f" };
  if (score < 62) return { label: "Moderate", color: "#d98618" };
  return { label: "High", color: "#d84f49" };
}

export function percentageReduction(betterValue, comparisonValue) {
  if (comparisonValue <= 0) return 0;
  return Math.max(0, Math.round((1 - betterValue / comparisonValue) * 100));
}

export function explainChoice(best, fastest) {
  if (best.id === fastest.id) {
    return "This is the fastest candidate and has the lowest weighted exposure for the current settings.";
  }
  const extra = Math.max(0, best.time - fastest.time);
  const improvements = ["air", "heat", "traffic", "flood"]
    .map((key) => ({ key, reduction: percentageReduction(best[key], fastest[key]) }))
    .filter((item) => item.reduction > 10)
    .sort((a, b) => b.reduction - a.reduction)
    .slice(0, 2);
  const benefit = improvements.length
    ? improvements.map((item) => `${item.reduction}% lower ${FACTOR_LABELS[item.key].toLowerCase()}`).join(" and ")
    : "a lower combined environmental score";
  return `This route takes ${extra} ${extra === 1 ? "minute" : "minutes"} longer, but provides ${benefit}.`;
}

export function dominantFactor(route) {
  return Object.entries(route.contributions).sort((a, b) => b[1] - a[1])[0][0];
}

export function decisionConfidence(rankedRoutes) {
  if (rankedRoutes.length < 2) return { label: "Only candidate", gap: 0 };
  const gap = Math.max(0, rankedRoutes[1].exactScore - rankedRoutes[0].exactScore);
  if (gap >= 10) return { label: "High confidence", gap: Math.round(gap) };
  if (gap >= 4) return { label: "Moderate confidence", gap: Math.round(gap) };
  return { label: "Close decision", gap: Math.round(gap) };
}

export function calculationRows(route) {
  return Object.keys(route.factors).map((key) => ({
    key,
    label: FACTOR_LABELS[key],
    factor: route.factors[key],
    weight: route.weights[key],
    contribution: route.contributions[key],
  }));
}
