import { MODES, ROUTES, SCENARIOS, FACTOR_LABELS } from "./data.js";
import { dominantFactor, explainChoice, exposureBudget, exposureLevel, rankRoutes } from "./algorithm.js";

const state = { mode: "balance", scenario: "normal", morningExposure: SCENARIOS.normal.morningExposure, heatSensitivity: SCENARIOS.normal.heatSensitivity, pollutionAvoidance: SCENARIOS.normal.pollutionAvoidance, activeTravel: SCENARIOS.normal.activeTravel, heavyRain: false };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function renderModes() {
  $("#mode-buttons").innerHTML = Object.entries(MODES).map(([id, mode]) => `<button class="mode-button ${state.mode === id ? "is-active" : ""}" data-mode="${id}" aria-pressed="${state.mode === id}"><span>${mode.icon}</span>${mode.label}</button>`).join("");
  $$(".mode-button").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; render(); }));
}

function renderMap(ranked) {
  const best = ranked[0];
  $("#route-layer").innerHTML = [...ranked].reverse().map((route) => `<path class="route-line ${route.id === best.id ? "is-best" : ""}" data-route="${route.id}" d="${route.path}" style="--route-color:${route.color}" />`).join("");
  $$(".route-line").forEach((path) => { path.addEventListener("mouseenter", () => highlightRoute(path.dataset.route)); path.addEventListener("mouseleave", () => highlightRoute(best.id)); });
  highlightRoute(best.id);
}

function highlightRoute(id) {
  $$(".route-line").forEach((path) => path.classList.toggle("is-highlighted", path.dataset.route === id));
  $$(".route-card").forEach((card) => card.classList.toggle("is-highlighted", card.dataset.route === id));
}

function metric(label, value) { const level = exposureLevel(value); return `<div class="mini-metric"><span>${label}</span><strong style="color:${level.color}">${value}</strong></div>`; }

function renderCards(ranked) {
  const best = ranked[0];
  const fastest = ROUTES.reduce((a, b) => a.time < b.time ? a : b);
  $("#route-cards").innerHTML = ranked.map((route, index) => {
    const level = exposureLevel(route.score);
    return `<article class="route-card ${index === 0 ? "is-recommended" : ""}" data-route="${route.id}" tabindex="0"><div class="card-top"><span class="route-swatch" style="background:${route.color}"></span><div><h3>${route.name}</h3><p>${route.description}</p></div>${index === 0 ? '<span class="recommend-badge">Best fit</span>' : ""}</div><div class="card-score"><strong>${route.time}<small> min</small></strong><span style="color:${level.color}">EES ${route.score} · ${level.label}</span></div><div class="metric-grid">${metric("Air", route.air)}${metric("Heat", route.heat)}${metric("Traffic", route.traffic)}${metric("Flood", route.flood)}</div><p class="driver">Main score driver: <b>${FACTOR_LABELS[dominantFactor(route)]}</b></p></article>`;
  }).join("");
  $$(".route-card").forEach((card) => { card.addEventListener("mouseenter", () => highlightRoute(card.dataset.route)); card.addEventListener("focus", () => highlightRoute(card.dataset.route)); card.addEventListener("mouseleave", () => highlightRoute(best.id)); });
  $("#explanation").textContent = explainChoice(best, fastest);
}

function renderBudget(best) {
  const budget = exposureBudget(state.morningExposure, best.score);
  $("#budget-total").textContent = `${budget.total}%`; $("#budget-remaining").textContent = `${budget.remaining}% remaining`; $("#morning-value").textContent = `${budget.morning}%`; $("#route-value").textContent = `+${budget.route}%`;
  $("#morning-bar").style.width = `${budget.morning}%`; $("#route-bar").style.width = `${budget.route}%`; $("#route-bar").style.left = `${budget.morning}%`;
  const level = exposureLevel(budget.total); $("#budget-status").textContent = `${level.label} daily exposure`; $("#budget-status").style.color = level.color;
}

function renderWeights(best) { $("#weight-list").innerHTML = Object.entries(best.weights).map(([key, value]) => `<div class="weight-row"><span>${FACTOR_LABELS[key]}</span><div><i style="width:${Math.round(value * 100)}%"></i></div><b>${Math.round(value * 100)}%</b></div>`).join(""); }

function render() {
  renderModes();
  const ranked = rankRoutes(ROUTES, MODES[state.mode], { activeTravel: state.activeTravel, heatSensitivity: state.heatSensitivity, pollutionAvoidance: state.pollutionAvoidance }, { heavyRain: state.heavyRain });
  renderCards(ranked); renderMap(ranked); renderBudget(ranked[0]); renderWeights(ranked[0]);
  const level = exposureLevel(ranked[0].score); $("#summary-score").textContent = `EES ${ranked[0].score}`; $("#summary-level").textContent = level.label.toUpperCase(); $("#summary-level").style.background = level.color; $("#best-route-name").textContent = ranked[0].name; $("#active-mode").textContent = MODES[state.mode].label;
}

function applyScenario(id) {
  const scenario = SCENARIOS[id]; Object.assign(state, { scenario: id, morningExposure: scenario.morningExposure, heatSensitivity: scenario.heatSensitivity, pollutionAvoidance: scenario.pollutionAvoidance, activeTravel: scenario.activeTravel, heavyRain: id === "rain" });
  $("#morning-exposure").value = state.morningExposure; $("#morning-output").textContent = `${state.morningExposure}%`; $("#active-travel").checked = state.activeTravel; $("#heat-sensitivity").value = state.heatSensitivity; $("#pollution-avoidance").value = state.pollutionAvoidance;
  $$(".scenario-button").forEach((button) => button.classList.toggle("is-active", button.dataset.scenario === id)); render();
}

Object.entries(SCENARIOS).forEach(([id, scenario]) => { const button = document.createElement("button"); button.className = `scenario-button ${id === state.scenario ? "is-active" : ""}`; button.dataset.scenario = id; button.textContent = scenario.label; button.addEventListener("click", () => applyScenario(id)); $("#scenario-buttons").append(button); });
$("#morning-exposure").addEventListener("input", (event) => { state.morningExposure = Number(event.target.value); $("#morning-output").textContent = `${state.morningExposure}%`; render(); });
$("#active-travel").addEventListener("change", (event) => { state.activeTravel = event.target.checked; render(); });
$("#heat-sensitivity").addEventListener("change", (event) => { state.heatSensitivity = Number(event.target.value); render(); });
$("#pollution-avoidance").addEventListener("change", (event) => { state.pollutionAvoidance = Number(event.target.value); render(); });
$("#method-button").addEventListener("click", () => $("#method-dialog").showModal()); $("#close-dialog").addEventListener("click", () => $("#method-dialog").close()); $("#method-dialog").addEventListener("click", (event) => { if (event.target === $("#method-dialog")) $("#method-dialog").close(); });
render();
