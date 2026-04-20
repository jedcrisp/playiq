from __future__ import annotations

from collections import Counter, defaultdict

from .analytics_service import top_frequencies


def _safe_pct(num: int, den: int) -> float:
    if den <= 0:
        return 0.0
    return round((num / den) * 100, 1)


def _defense_by_formation(plays):
    by_form = defaultdict(list)
    for p in plays:
        form = (p.formation or "unknown").strip() or "unknown"
        by_form[form].append(p)
    rows = []
    for form, snaps in by_form.items():
        front = top_frequencies(snaps, "defensive_front", limit=1)
        cov = top_frequencies(snaps, "coverage_shell", limit=1)
        rows.append(
            {
                "formation": form,
                "sample": len(snaps),
                "top_front": front[0]["label"] if front else "unknown",
                "top_front_pct": front[0]["pct"] if front else 0,
                "top_coverage": cov[0]["label"] if cov else "unknown",
                "top_coverage_pct": cov[0]["pct"] if cov else 0,
            }
        )
    return sorted(rows, key=lambda x: x["sample"], reverse=True)


def _pressure_by_formation(plays):
    by_form = defaultdict(lambda: {"sample": 0, "pressure": 0})
    for p in plays:
        form = (p.formation or "unknown").strip() or "unknown"
        by_form[form]["sample"] += 1
        if (p.pressure_type or "").strip():
            by_form[form]["pressure"] += 1
    return sorted(
        [
            {
                "formation": form,
                "sample": vals["sample"],
                "pressure_pct": _safe_pct(vals["pressure"], vals["sample"]),
            }
            for form, vals in by_form.items()
        ],
        key=lambda x: x["pressure_pct"],
        reverse=True,
    )


def _rate_by_formation(plays, attr: str, out_key: str):
    by_form = defaultdict(lambda: {"sample": 0, "hits": 0})
    for p in plays:
        form = (p.formation or "unknown").strip() or "unknown"
        by_form[form]["sample"] += 1
        if getattr(p, attr):
            by_form[form]["hits"] += 1
    return sorted(
        [
            {
                "formation": form,
                "sample": vals["sample"],
                out_key: _safe_pct(vals["hits"], vals["sample"]),
            }
            for form, vals in by_form.items()
        ],
        key=lambda x: x[out_key],
        reverse=True,
    )


def _concept_usage_by_formation(plays):
    by_form = defaultdict(Counter)
    for p in plays:
        form = (p.formation or "unknown").strip() or "unknown"
        concept = (p.concept_name or "unknown").strip() or "unknown"
        by_form[form][concept] += 1
    rows = []
    for form, counter in by_form.items():
        total = sum(counter.values()) or 1
        concept, count = counter.most_common(1)[0]
        rows.append(
            {
                "formation": form,
                "top_concept": concept,
                "top_concept_pct": _safe_pct(count, total),
                "sample": total,
            }
        )
    return sorted(rows, key=lambda x: x["sample"], reverse=True)


def _run_pass_by_formation(plays):
    by_form = defaultdict(lambda: {"run": 0, "pass": 0, "other": 0})
    for p in plays:
        form = (p.formation or "unknown").strip() or "unknown"
        t = (p.play_type or "other").strip().lower()
        if t not in {"run", "pass"}:
            t = "other"
        by_form[form][t] += 1
    rows = []
    for form, vals in by_form.items():
        total = vals["run"] + vals["pass"] + vals["other"]
        rows.append(
            {
                "formation": form,
                "sample": total,
                "run_pct": _safe_pct(vals["run"], total),
                "pass_pct": _safe_pct(vals["pass"], total),
                "other_pct": _safe_pct(vals["other"], total),
            }
        )
    return sorted(rows, key=lambda x: x["sample"], reverse=True)


def _motion_by_formation(plays):
    by_form = defaultdict(lambda: {"sample": 0, "with_motion": 0})
    for p in plays:
        form = (p.formation or "unknown").strip() or "unknown"
        by_form[form]["sample"] += 1
        if (p.motion or "").strip():
            by_form[form]["with_motion"] += 1
    rows = []
    for form, vals in by_form.items():
        rows.append(
            {
                "formation": form,
                "sample": vals["sample"],
                "motion_pct": _safe_pct(vals["with_motion"], vals["sample"]),
            }
        )
    return sorted(rows, key=lambda x: x["motion_pct"], reverse=True)


def _down_distance_by_formation(plays):
    by_form = defaultdict(Counter)
    for p in plays:
        form = (p.formation or "unknown").strip() or "unknown"
        key = f"{p.down}&{(p.distance_bucket or 'unknown').strip() or 'unknown'}"
        by_form[form][key] += 1
    rows = []
    for form, counter in by_form.items():
        total = sum(counter.values()) or 1
        top_bucket, count = counter.most_common(1)[0]
        rows.append(
            {
                "formation": form,
                "sample": total,
                "top_down_distance": top_bucket,
                "top_down_distance_pct": _safe_pct(count, total),
            }
        )
    return sorted(rows, key=lambda x: x["sample"], reverse=True)


def _insights(plays, defense_by_form, concept_by_form, explosive_by_form):
    if not plays:
        return []
    out = []
    if defense_by_form:
        d = defense_by_form[0]
        out.append(
            f"Vs {d['formation']}, opponent most often shows {d['top_coverage']} ({d['top_coverage_pct']}%)."
        )
    if concept_by_form:
        c = concept_by_form[0]
        out.append(
            f"From {c['formation']}, your top concept is {c['top_concept']} ({c['top_concept_pct']}% of tracked calls)."
        )
    if explosive_by_form:
        e = explosive_by_form[0]
        out.append(
            f"{e['formation']} has the highest explosive rate ({e['explosive_pct']}%) in the current filtered sample."
        )
    return out


def build_formation_intelligence(plays) -> dict:
    defense_by_form = _defense_by_formation(plays)
    concept_by_form = _concept_usage_by_formation(plays)
    explosive_by_form = _rate_by_formation(plays, "explosive", "explosive_pct")
    out = {
        "sample_size": len(plays),
        "formation_frequency": top_frequencies(plays, "formation"),
        "defense_by_formation": defense_by_form,
        "pressure_by_formation": _pressure_by_formation(plays),
        "explosive_by_formation": explosive_by_form,
        "success_by_formation": _rate_by_formation(plays, "success", "success_pct"),
        "concept_usage_by_formation": concept_by_form,
        "run_pass_by_formation": _run_pass_by_formation(plays),
        "motion_by_formation": _motion_by_formation(plays),
        "down_distance_by_formation": _down_distance_by_formation(plays),
        "insights": _insights(plays, defense_by_form, concept_by_form, explosive_by_form),
    }
    return out
