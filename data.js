export const MODES = {
  fastest: {
    label: "Fastest",
    icon: "⚡",
    description: "Minimizes travel time",
    weights: { air: 0.03, heat: 0.03, traffic: 0.03, flood: 0.03, time: 0.88 },
  },
  cleanest: {
    label: "Cleanest",
    icon: "✦",
    description: "Prioritizes lower air-pollution exposure",
    weights: { air: 0.50, heat: 0.14, traffic: 0.10, flood: 0.10, time: 0.16 },
  },
  coolest: {
    label: "Coolest",
    icon: "☀",
    description: "Prioritizes shaded, lower-heat streets",
    weights: { air: 0.14, heat: 0.50, traffic: 0.10, flood: 0.10, time: 0.16 },
  },
  safest: {
    label: "Safest",
    icon: "◆",
    description: "Prioritizes traffic and flood safety",
    weights: { air: 0.10, heat: 0.10, traffic: 0.36, flood: 0.32, time: 0.12 },
  },
  balance: {
    label: "Eco Balance",
    icon: "◎",
    description: "Balances health, safety, and time",
    weights: { air: 0.26, heat: 0.22, traffic: 0.18, flood: 0.18, time: 0.16 },
  },
};

const PATHS = {
  direct: "M92 448 C218 390 285 314 436 294 S647 219 878 154",
  green: "M92 448 C180 354 272 382 370 318 S526 146 694 220 S792 190 878 154",
  water: "M92 448 C226 468 372 426 486 370 S724 326 878 154",
};

export const JOURNEYS = {
  school: {
    label: "School → Home",
    from: "Korea Global School",
    to: "Phu My Hung, District 7",
    district: "District 7 student commute",
    routes: [
      { id: "express", name: "Nguyen Van Linh Express", shortName: "Express", description: "Direct arterial-road route", time: 12, distance: 4.8, air: 82, heat: 74, traffic: 86, flood: 48, color: "#ef665f", path: PATHS.direct },
      { id: "green", name: "Green Corridor", shortName: "Green", description: "Tree-lined residential streets", time: 15, distance: 5.2, air: 31, heat: 34, traffic: 38, flood: 20, color: "#0d8f6f", path: PATHS.green },
      { id: "canal", name: "Canal-Side Route", shortName: "Canal", description: "Lower traffic, seasonal flood risk", time: 14, distance: 5.0, air: 49, heat: 58, traffic: 44, flood: 79, color: "#f1a638", path: PATHS.water },
    ],
  },
  campus: {
    label: "Campus → Mall",
    from: "RMIT University Vietnam",
    to: "Crescent Mall",
    district: "District 7 afternoon trip",
    routes: [
      { id: "urban", name: "Urban Direct", shortName: "Direct", description: "Shortest route through busy roads", time: 10, distance: 3.7, air: 70, heat: 78, traffic: 81, flood: 42, color: "#ef665f", path: PATHS.direct },
      { id: "shade", name: "Shaded Campus Link", shortName: "Shaded", description: "More shade and calmer crossings", time: 14, distance: 4.2, air: 29, heat: 25, traffic: 32, flood: 26, color: "#0d8f6f", path: PATHS.green },
      { id: "riverside", name: "Riverside Connector", shortName: "Riverside", description: "Low traffic, rain-sensitive section", time: 12, distance: 4.0, air: 43, heat: 48, traffic: 39, flood: 75, color: "#f1a638", path: PATHS.water },
    ],
  },
  shopping: {
    label: "Shopping → Park",
    from: "SC VivoCity",
    to: "Crescent Park",
    district: "District 7 weekend trip",
    routes: [
      { id: "boulevard", name: "Boulevard Direct", shortName: "Boulevard", description: "Fast route beside heavy traffic", time: 11, distance: 4.1, air: 76, heat: 69, traffic: 83, flood: 38, color: "#ef665f", path: PATHS.direct },
      { id: "residential", name: "Residential Greenway", shortName: "Greenway", description: "Shaded local-road alternative", time: 16, distance: 4.9, air: 27, heat: 31, traffic: 30, flood: 22, color: "#0d8f6f", path: PATHS.green },
      { id: "waterside", name: "Waterside Path", shortName: "Waterside", description: "Pleasant route with flood exposure", time: 13, distance: 4.5, air: 41, heat: 45, traffic: 36, flood: 82, color: "#f1a638", path: PATHS.water },
    ],
  },
};

export const SCENARIOS = {
  normal: { label: "Normal school day", morningExposure: 28, heatSensitivity: 1, pollutionAvoidance: 1, activeTravel: true, heavyRain: false },
  polluted: { label: "Polluted morning", morningExposure: 63, heatSensitivity: 1, pollutionAvoidance: 2, activeTravel: true, heavyRain: false },
  hot: { label: "Very hot afternoon", morningExposure: 47, heatSensitivity: 2, pollutionAvoidance: 1, activeTravel: true, heavyRain: false },
  rain: { label: "Heavy rain alert", morningExposure: 36, heatSensitivity: 0, pollutionAvoidance: 1, activeTravel: false, heavyRain: true },
};

export const FACTOR_LABELS = {
  air: "Air pollution",
  heat: "Heat exposure",
  traffic: "Traffic risk",
  flood: "Flood risk",
  time: "Travel time",
};

export const FACTOR_UNITS = {
  air: "0–100 risk index",
  heat: "0–100 heat index",
  traffic: "0–100 conflict index",
  flood: "0–100 flood index",
  time: "normalized to longest candidate",
};
