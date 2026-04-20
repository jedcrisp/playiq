from __future__ import annotations

from collections import Counter, defaultdict

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from ..models import ScoutingPlay


def _filters_to_predicates(filters: dict):
    preds = []
    if filters.get("team_id") is not None:
        preds.append(ScoutingPlay.team_id == filters["team_id"])
    if filters.get("opponent_profile_id") is not None:
        preds.append(ScoutingPlay.opponent_profile_id == filters["opponent_profile_id"])
    if filters.get("game_label"):
        preds.append(ScoutingPlay.game_label == filters["game_label"])
    if filters.get("down"):
        preds.append(ScoutingPlay.down == int(filters["down"]))
    if filters.get("distance_bucket"):
        preds.append(ScoutingPlay.distance_bucket == filters["distance_bucket"])
    if filters.get("field_zone"):
        preds.append(ScoutingPlay.field_zone == filters["field_zone"])
    if filters.get("side"):
        preds.append(ScoutingPlay.side == filters["side"])
    return preds


def fetch_filtered_plays(
    db: Session,
    filters: dict,
    *,
    user_id: int,
    team_ids: list[int] | None = None,
) -> list[ScoutingPlay]:
    preds = _filters_to_predicates(filters)
    preds.append(
        or_(
            ScoutingPlay.created_by == user_id,
            ScoutingPlay.team_id.in_(team_ids or [-1]),
        )
    )
    q = select(ScoutingPlay)
    if preds:
        q = q.where(and_(*preds))
    q = q.order_by(ScoutingPlay.created_at.desc())
    return list(db.scalars(q).all())


def top_frequencies(plays: list[ScoutingPlay], attr: str, limit: int = 6) -> list[dict]:
    c = Counter((getattr(p, attr) or "").strip() for p in plays if (getattr(p, attr) or "").strip())
    total = sum(c.values()) or 1
    out = []
    for k, v in c.most_common(limit):
        out.append({"label": k, "count": v, "pct": round((v / total) * 100, 1)})
    return out


def pressure_by_field_zone(plays: list[ScoutingPlay]) -> list[dict]:
    zones = defaultdict(lambda: {"total": 0, "pressure": 0})
    for p in plays:
        z = p.field_zone or "unknown"
        zones[z]["total"] += 1
        if (p.pressure_type or "").strip():
            zones[z]["pressure"] += 1
    rows = []
    for z, vals in zones.items():
        pct = (vals["pressure"] / vals["total"] * 100) if vals["total"] else 0
        rows.append({"zone": z, "pressure_pct": round(pct, 1), "sample": vals["total"]})
    return sorted(rows, key=lambda x: x["pressure_pct"], reverse=True)


def coverage_by_down_distance(plays: list[ScoutingPlay]) -> list[dict]:
    buckets = defaultdict(Counter)
    for p in plays:
        key = f"{p.down} & {p.distance_bucket or 'unknown'}"
        cov = p.coverage_shell or "unknown"
        buckets[key][cov] += 1
    out = []
    for key, counter in buckets.items():
        total = sum(counter.values()) or 1
        top_cov, top_count = counter.most_common(1)[0]
        out.append(
            {
                "situation": key,
                "top_coverage": top_cov,
                "pct": round((top_count / total) * 100, 1),
                "sample": total,
            }
        )
    return sorted(out, key=lambda x: x["sample"], reverse=True)


def explosive_by_coverage(plays: list[ScoutingPlay]) -> list[dict]:
    by_cov = defaultdict(lambda: {"snaps": 0, "explosive": 0})
    for p in plays:
        c = p.coverage_shell or "unknown"
        by_cov[c]["snaps"] += 1
        if p.explosive:
            by_cov[c]["explosive"] += 1
    rows = []
    for c, vals in by_cov.items():
        pct = (vals["explosive"] / vals["snaps"] * 100) if vals["snaps"] else 0
        rows.append({"coverage": c, "explosive_pct": round(pct, 1), "sample": vals["snaps"]})
    return sorted(rows, key=lambda x: x["explosive_pct"], reverse=True)


def explosive_rate_by_attr(plays: list[ScoutingPlay], attr: str) -> list[dict]:
    by_attr = defaultdict(lambda: {"snaps": 0, "explosive": 0})
    for p in plays:
        k = getattr(p, attr) or "unknown"
        by_attr[k]["snaps"] += 1
        if p.explosive:
            by_attr[k]["explosive"] += 1
    rows = []
    for k, vals in by_attr.items():
        pct = (vals["explosive"] / vals["snaps"] * 100) if vals["snaps"] else 0
        rows.append({"label": k, "explosive_pct": round(pct, 1), "sample": vals["snaps"]})
    return sorted(rows, key=lambda x: x["explosive_pct"], reverse=True)


def success_rate_by_attr(plays: list[ScoutingPlay], attr: str) -> list[dict]:
    by_attr = defaultdict(lambda: {"snaps": 0, "success": 0})
    for p in plays:
        k = getattr(p, attr) or "unknown"
        by_attr[k]["snaps"] += 1
        if p.success:
            by_attr[k]["success"] += 1
    rows = []
    for k, vals in by_attr.items():
        pct = (vals["success"] / vals["snaps"] * 100) if vals["snaps"] else 0
        rows.append({"label": k, "success_pct": round(pct, 1), "sample": vals["snaps"]})
    return sorted(rows, key=lambda x: x["success_pct"], reverse=True)


def simple_insights(plays: list[ScoutingPlay]) -> list[str]:
    if not plays:
        return []
    cov = top_frequencies(plays, "coverage_shell", limit=1)
    front = top_frequencies(plays, "defensive_front", limit=1)
    pressure = [p for p in plays if (p.pressure_type or "").strip()]
    pressure_pct = round((len(pressure) / len(plays)) * 100, 1) if plays else 0
    out = []
    if cov:
        out.append(f"{cov[0]['label']} appears on {cov[0]['pct']}% of tracked snaps.")
    if front:
        out.append(f"Most common front: {front[0]['label']} ({front[0]['pct']}%).")
    out.append(f"Pressure tagged on {pressure_pct}% of snaps.")
    return out

