# Data and Normalization Method

## Prototype input contract

Each candidate route contains:

| Field | Range or unit | Meaning |
|---|---|---|
| `time` | minutes | Estimated journey duration |
| `distance` | kilometres | Candidate route length |
| `air` | 0–100 | Relative pollution exposure risk |
| `heat` | 0–100 | Relative heat and shade exposure risk |
| `traffic` | 0–100 | Relative traffic-conflict risk |
| `flood` | 0–100 | Relative flood exposure risk |

All risk indices use the same direction: **0 is lower risk and 100 is higher risk**.

## Travel-time normalization

Travel time is converted to a comparable score:

```text
time_score = route_time / longest_candidate_time × 100
```

This keeps the comparison local to the current candidate set and prevents minutes from being added directly to risk indices.

## Weight personalization

The chosen mode provides the base weights. The algorithm then adds bounded adjustments for:

- walking or cycling
- heat sensitivity
- pollution avoidance
- heavy rain
- percentage of today's exposure budget already used

Finally:

```text
normalized_weight = adjusted_weight / sum(all_adjusted_weights)
```

Therefore, the active weights always total 1.00 (100%).

## Production data pathway

Live services would be transformed through factor-specific adapters before entering the scoring engine. Each adapter would record a timestamp, source, geographic resolution, and confidence flag. Missing or stale inputs should be disclosed to the user and should lower the recommendation confidence.

The current dataset is intentionally fixed and labeled as illustrative so every judge receives the same reproducible demonstration.
