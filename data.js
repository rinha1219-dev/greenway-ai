export const MODES = {
  fastest: { label: "Fastest", icon: "⚡", weights: { air: 0.03, heat: 0.03, traffic: 0.03, flood: 0.03, time: 0.88 } },
  cleanest: { label: "Cleanest", icon: "✦", weights: { air: 0.50, heat: 0.14, traffic: 0.10, flood: 0.10, time: 0.16 } },
  coolest: { label: "Coolest", icon: "☀", weights: { air: 0.14, heat: 0.50, traffic: 0.10, flood: 0.10, time: 0.16 } },
  safest: { label: "Safest", icon: "◆", weights: { air: 0.10, heat: 0.10, traffic: 0.36, flood: 0.32, time: 0.12 } },
  balance: { label: "Eco Balance", icon: "◎", weights: { air: 0.26, heat: 0.22, traffic: 0.18, flood: 0.18, time: 0.16 } },
};

export const ROUTES = [
  { id: "express", name: "Nguyen Van Linh Express", shortName: "Express", description: "Direct arterial-road route", time: 12, distance: 4.8, air: 82, heat: 74, traffic: 86, flood: 48, color: "#ef665f", path: "M92 448 C218 390 285 314 436 294 S647 219 878 154" },
  { id: "green", name: "Green Corridor", shortName: "Green", description: "Tree-lined residential streets", time: 15, distance: 5.2, air: 31, heat: 34, traffic: 38, flood: 20, color: "#0d8f6f", path: "M92 448 C180 354 272 382 370 318 S526 146 694 220 S792 190 878 154" },
  { id: "canal", name: "Canal-Side Route", shortName: "Canal", description: "Lower traffic, seasonal flood risk", time: 14, distance: 5.0, air: 49, heat: 58, traffic: 44, flood: 79, color: "#f1a638", path: "M92 448 C226 468 372 426 486 370 S724 326 878 154" },
];

export const SCENARIOS = {
  normal: { label: "Normal school day", morningExposure: 28, heatSensitivity: 1, pollutionAvoidance: 1, activeTravel: true },
  polluted: { label: "Polluted morning", morningExposure: 63, heatSensitivity: 1, pollutionAvoidance: 2, activeTravel: true },
  hot: { label: "Very hot afternoon", morningExposure: 42, heatSensitivity: 2, pollutionAvoidance: 1, activeTravel: true },
  rain: { label: "Heavy rain alert", morningExposure: 36, heatSensitivity: 0, pollutionAvoidance: 1, activeTravel: false },
};

export const FACTOR_LABELS = { air: "Air pollution", heat: "Heat exposure", traffic: "Traffic risk", flood: "Flood risk", time: "Travel time" };
