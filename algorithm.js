import { FACTOR_LABELS } from "./data.js";

export function adjustedWeights(modeWeights, preferences, weather = {}) {
  const weights = { ...modeWeights };
  if (preferences.activeTravel) weights.heat += 0.05;
  weights.heat += preferences.heatSensitivity * 0.045;
  weights.air += preferences.pollutionAvoidance * 0.045;
  if (weather.heavyRain) weights.flood += 0.18;
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, value / total]));
}

export function scoreRoute(route, weights, maxTime = 18) {
  const factors = { air: route.air, heat: route.heat, traffic: route.traffic, flood: route.flood, time: Math.min(100, (route.time / maxTime) * 100) };
  const contributions = Object.fromEntries(Object.entries(factors).map(([key, value]) => [key, value * weights[key]]));
  return { score: Math.round(Object.values(contributions).reduce((sum, value) => sum + value, 0)), factors, contributions };
}

export function rankRoutes(routes, mode, preferences, weather = {}) {
  const weights = adjustedWeights(mode.weights, preferences, weather);
  return routes.map((route) => ({ ...route, ...scoreRoute(route, weights), weights })).sort((a, b) => a.score - b.score || a.time - b.time);
}

export function exposureBudget(morningExposure, routeScore) {
  const routeShare = Math.round(routeScore * 0.42);
  const total = Math.min(100, morningExposure + routeShare);
  return { morning: morningExposure, route: routeShare, total, remaining: Math.max(0, 100 - total) };
}

export function exposureLevel(score) {
  if (score < 38) return { label: "Low", color: "#0d8f6f" };
  if (score < 62) return { label: "Moderate", color: "#f1a638" };
  return { label: "High", color: "#ef665f" };
}

export function explainChoice(best, fastest) {
  if (best.id === fastest.id) return "This is the fastest route and has the lowest weighted exposure for the current settings.";
  const extra = best.time - fastest.time;
  const improvements = ["air", "heat", "traffic", "flood"].map((key) => ({ key, reduction: Math.round((1 - best[key] / fastest[key]) * 100) })).filter((item) => item.reduction > 10).sort((a, b) => b.reduction - a.reduction).slice(0, 2);
  const benefit = improvements.map((item) => `${item.reduction}% lower ${FACTOR_LABELS[item.key].toLowerCase()}`).join(" and ");
  return `This route takes ${extra} ${extra === 1 ? "minute" : "minutes"} longer, but gives ${benefit}.`;
}

export function dominantFactor(route) { return Object.entries(route.contributions).sort((a, b) => b[1] - a[1])[0][0]; }
