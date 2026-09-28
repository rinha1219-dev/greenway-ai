import { FACTOR_LABELS, FACTOR_UNITS, JOURNEYS, MODES, SCENARIOS } from "./data.js";
import {
  calculationRows,
  decisionConfidence,
  dominantFactor,
  explainChoice,
  exposureBudget,
  exposureLevel,
  rankRoutes,
} from "./algorithm.js";

const state = {
  journey: "school",
  mode: "balance",
  scenario: "normal",
  morningExposure: SCENARIOS.normal.morningExposure,
  heatSensitivity: SCENARIOS.normal.heatSensitivity,
  pollutionAvoidance: SCENARIOS.normal.pollutionAvoidance,
  activeTravel: SCENARIOS.normal.activeTravel,
  heavyRain: SCENARIOS.normal.heavyRain,
};

let latestDecision = null;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function renderJourneySelector() {
  $("#journey-select").innerHTML = Object.entries(JOURNEYS)
    .map(([id, journey]) => `<option value="${id}" ${state.journey === id ? "selected" : ""}>${journey.label}</option>`)
    .join("");
  const journey = JOURNEYS[state.journey];
  $("#from-location").textContent = journey.from;
  $("#to-location").textContent = journey.to;
  $("#journey-context").textContent = journey.district;
  $("#map-start-label").textContent = journey.to.toUpperCase();
  $("#map-end-label").textContent = journey.from.toUpperCase();
}

function renderModes() {
  $("#mode-buttons").innerHTML = Object.entries(MODES)
    .map(([id, mode]) => `
      <button class="mode-button ${state.mode === id ? "is-active" : ""}" data-mode="${id}" aria-pressed="${state.mode === id}" title="${mode.description}">
        <span>${mode.icon}</span>${mode.label}
      </button>`)
    .join("");
  $$(".mode-button").forEach((button) =>
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      render();
    })
  );
}

function renderMap(ranked) {
  const best = ranked[0];
  $("#route-layer").innerHTML = [...ranked]
    .reverse()
    .map((route) => `<path class="route-line ${route.id === best.id ? "is-best" : ""}" data-route="${route.id}" d="${route.path}" style="--route-color:${route.color}" />`)
    .join("");
  $("#map-legend").innerHTML = ranked
    .map((route) => `<span><i style="background:${route.color}"></i>${route.shortName}</span>`)
    .join("");
  $$(".route-line").forEach((path) => {
    path.addEventListener("mouseenter", () => highlightRoute(path.dataset.route));
    path.addEventListener("mouseleave", () => highlightRoute(best.id));
  });
  highlightRoute(best.id);
}

function highlightRoute(id) {
  $$(".route-line").forEach((path) => path.classList.toggle("is-highlighted", path.dataset.route === id));
  $$(".route-card").forEach((card) => card.classList.toggle("is-highlighted", card.dataset.route === id));
}

function metric(label, value) {
  const level = exposureLevel(value);
  return `<div class="mini-metric"><span>${label}</span><strong style="color:${level.color}">${value}</strong></div>`;
}

function renderCards(ranked, routes) {
  const best = ranked[0];
  const fastest = routes.reduce((a, b) => (a.time < b.time ? a : b));
  $("#route-cards").innerHTML = ranked
    .map((route, index) => {
      const level = exposureLevel(route.score);
      return `<article class="route-card ${index === 0 ? "is-recommended" : ""}" data-route="${route.id}" tabindex="0">
        <div class="card-top">
          <span class="route-swatch" style="background:${route.color}"></span>
          <div><h3>${route.name}</h3><p>${route.description}</p></div>
          ${index === 0 ? '<span class="recommend-badge">Recommended</span>' : ""}
        </div>
        <div class="card-score">
          <strong>${route.time}<small> min</small></strong>
          <span style="color:${level.color}">EES ${route.score} · ${level.label}</span>
        </div>
        <div class="metric-grid">
          ${metric("Air", route.air)}${metric("Heat", route.heat)}${metric("Traffic", route.traffic)}${metric("Flood", route.flood)}
        </div>
        <p class="driver">Largest contribution: <b>${FACTOR_LABELS[dominantFactor(route)]}</b></p>
      </article>`;
    })
    .join("");
  $$(".route-card").forEach((card) => {
    card.addEventListener("mouseenter", () => highlightRoute(card.dataset.route));
    card.addEventListener("focus", () => highlightRoute(card.dataset.route));
    card.addEventListener("mouseleave", () => highlightRoute(best.id));
  });
  $("#explanation").textContent = explainChoice(best, fastest);
}

function renderBudget(best) {
  const budget = exposureBudget(state.morningExposure, best.score);
  $("#budget-total").textContent = budget.exceeded ? `${budget.projected}%` : `${budget.total}%`;
  $("#budget-remaining").textContent = budget.exceeded ? `${budget.projected - 100}% over budget` : `${budget.remaining}% remaining`;
  $("#morning-value").textContent = `${budget.morning}%`;
  $("#route-value").textContent = `+${budget.route}%`;
  $("#morning-bar").style.width = `${budget.morning}%`;
  $("#route-bar").style.width = `${Math.min(budget.route, 100 - budget.morning)}%`;
  $("#route-bar").style.left = `${budget.morning}%`;
  const level = exposureLevel(Math.min(100, budget.projected));
  $("#budget-status").textContent = budget.exceeded ? "Daily exposure budget exceeded" : `${level.label} projected daily exposure`;
  $("#budget-status").style.color = budget.exceeded ? "#d84f49" : level.color;
}

function renderWeights(best) {
  $("#weight-list").innerHTML = Object.entries(best.weights)
    .map(([key, value]) => `<div class="weight-row"><span>${FACTOR_LABELS[key]}</span><div><i style="width:${Math.round(value * 100)}%"></i></div><b>${Math.round(value * 100)}%</b></div>`)
    .join("");
  const weightTotal = Object.values(best.weights).reduce((sum, value) => sum + value, 0);
  $("#weight-check").textContent = `✓ Normalized total: ${Math.round(weightTotal * 100)}%`;
}

function renderCalculation(best, ranked) {
  $("#calculation-route").textContent = best.name;
  $("#calculation-rows").innerHTML = calculationRows(best)
    .map((row) => `<tr>
      <td><b>${row.label}</b><small>${FACTOR_UNITS[row.key]}</small></td>
      <td>${row.factor.toFixed(1)}</td>
      <td>${(row.weight * 100).toFixed(1)}%</td>
      <td><strong>${row.contribution.toFixed(1)}</strong></td>
    </tr>`)
    .join("");
  $("#calculation-total").textContent = best.exactScore.toFixed(1);
  const confidence = decisionConfidence(ranked);
  $("#confidence-label").textContent = confidence.label;
  $("#confidence-gap").textContent = `${confidence.gap}-point gap to second place`;
}

function render() {
  renderJourneySelector();
  renderModes();
  const journey = JOURNEYS[state.journey];
  const preferences = {
    activeTravel: state.activeTravel,
    heatSensitivity: state.heatSensitivity,
    pollutionAvoidance: state.pollutionAvoidance,
    morningExposure: state.morningExposure,
  };
  const ranked = rankRoutes(journey.routes, MODES[state.mode], preferences, { heavyRain: state.heavyRain });
  latestDecision = { generatedAt: new Date().toISOString(), state: { ...state }, journey, preferences, mode: MODES[state.mode], ranked };

  renderCards(ranked, journey.routes);
  renderMap(ranked);
  renderBudget(ranked[0]);
  renderWeights(ranked[0]);
  renderCalculation(ranked[0], ranked);

  const level = exposureLevel(ranked[0].score);
  $("#summary-score").textContent = `EES ${ranked[0].score}`;
  $("#summary-level").textContent = level.label.toUpperCase();
  $("#summary-level").style.background = level.color;
  $("#best-route-name").textContent = ranked[0].name;
  $("#active-mode").textContent = MODES[state.mode].label;
}

function applyScenario(id) {
  const scenario = SCENARIOS[id];
  Object.assign(state, { scenario: id, ...scenario });
  $("#morning-exposure").value = state.morningExposure;
  $("#morning-output").textContent = `${state.morningExposure}%`;
  $("#active-travel").checked = state.activeTravel;
  $("#heat-sensitivity").value = state.heatSensitivity;
  $("#pollution-avoidance").value = state.pollutionAvoidance;
  $$(".scenario-button").forEach((button) => button.classList.toggle("is-active", button.dataset.scenario === id));
  render();
}

function exportDecisionReport() {
  if (!latestDecision) return;
  const safeReport = {
    project: "GREENWAY AI",
    purpose: "Transparent competition prototype decision audit",
    generatedAt: latestDecision.generatedAt,
    journey: {
      from: latestDecision.journey.from,
      to: latestDecision.journey.to,
    },
    settings: latestDecision.state,
    activeWeights: latestDecision.ranked[0].weights,
    rankedRoutes: latestDecision.ranked.map((route, rank) => ({
      rank: rank + 1,
      name: route.name,
      timeMinutes: route.time,
      environmentalExposureScore: route.score,
      factorScores: route.factors,
      contributions: route.contributions,
    })),
    disclosure: "Illustrative sample data; not live navigation or emergency guidance.",
  };
  const blob = new Blob([JSON.stringify(safeReport, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "greenway-ai-decision-report.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

Object.entries(SCENARIOS).forEach(([id, scenario]) => {
  const button = document.createElement("button");
  button.className = `scenario-button ${id === state.scenario ? "is-active" : ""}`;
  button.dataset.scenario = id;
  button.textContent = scenario.label;
  button.addEventListener("click", () => applyScenario(id));
  $("#scenario-buttons").append(button);
});

$("#journey-select").addEventListener("change", (event) => {
  state.journey = event.target.value;
  render();
});
$("#morning-exposure").addEventListener("input", (event) => {
  state.morningExposure = Number(event.target.value);
  $("#morning-output").textContent = `${state.morningExposure}%`;
  render();
});
$("#active-travel").addEventListener("change", (event) => {
  state.activeTravel = event.target.checked;
  render();
});
$("#heat-sensitivity").addEventListener("change", (event) => {
  state.heatSensitivity = Number(event.target.value);
  render();
});
$("#pollution-avoidance").addEventListener("change", (event) => {
  state.pollutionAvoidance = Number(event.target.value);
  render();
});
$("#method-button").addEventListener("click", () => $("#method-dialog").showModal());
$("#close-dialog").addEventListener("click", () => $("#method-dialog").close());
$("#method-dialog").addEventListener("click", (event) => {
  if (event.target === $("#method-dialog")) $("#method-dialog").close();
});
$("#export-report").addEventListener("click", exportDecisionReport);

render();
