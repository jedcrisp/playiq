from __future__ import annotations

import csv
import io

REQUIRED_HEADERS = [
    "opponent_name",
    "game_label",
    "side",
    "down",
    "distance_bucket",
    "field_zone",
    "hash",
    "personnel",
    "formation",
    "motion",
    "defensive_front",
    "coverage_shell",
    "pressure_type",
    "concept_name",
    "yards",
    "explosive",
    "success",
    "play_type",
    "result_notes",
    "tags",
]
VALID_SIDES = {"offense", "defense", "self"}
VALID_PLAY_TYPES = {"run", "pass", "other"}


def parse_bool(x: str) -> bool:
    v = (x or "").strip().lower()
    return v in {"1", "true", "yes", "y"}


def parse_csv_rows(raw_text: str) -> tuple[list[dict], list[str]]:
    reader = csv.DictReader(io.StringIO(raw_text))
    raw_headers = reader.fieldnames or []
    header_map = {h.strip().lower(): h for h in raw_headers if h}
    missing = [h for h in REQUIRED_HEADERS if h not in header_map]
    if missing:
        return [], [f"Missing required headers: {', '.join(missing)}"]

    rows: list[dict] = []
    errors: list[str] = []
    for idx, row in enumerate(reader, start=2):
        try:
            if not any((v or "").strip() for v in row.values()):
                continue
            get = lambda k: (row.get(header_map[k]) or "").strip()  # noqa: E731
            down = int(get("down") or "0")
            if down < 1 or down > 4:
                raise ValueError("down must be 1-4")
            side = (get("side") or "defense").lower()
            if side not in VALID_SIDES:
                raise ValueError(f"side must be one of: {', '.join(sorted(VALID_SIDES))}")
            play_type = (get("play_type") or "pass").lower()
            if play_type not in VALID_PLAY_TYPES:
                raise ValueError(
                    f"play_type must be one of: {', '.join(sorted(VALID_PLAY_TYPES))}"
                )
            yards = int(get("yards") or "0")
            rows.append(
                {
                    "opponent_name": get("opponent_name"),
                    "game_label": get("game_label"),
                    "side": side,
                    "down": down,
                    "distance_bucket": get("distance_bucket"),
                    "field_zone": get("field_zone"),
                    "hash": get("hash"),
                    "personnel": get("personnel"),
                    "formation": get("formation"),
                    "motion": get("motion"),
                    "defensive_front": get("defensive_front"),
                    "coverage_shell": get("coverage_shell"),
                    "pressure_type": get("pressure_type"),
                    "concept_name": get("concept_name"),
                    "yards": yards,
                    "explosive": parse_bool(get("explosive")),
                    "success": parse_bool(get("success")),
                    "play_type": play_type,
                    "result_notes": get("result_notes"),
                    "tags": get("tags"),
                }
            )
        except Exception as exc:  # noqa: BLE001
            errors.append(f"Row {idx}: {exc}")
    return rows, errors


def csv_template_text() -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=REQUIRED_HEADERS)
    writer.writeheader()
    writer.writerow(
        {
            "opponent_name": "Springfield HS",
            "game_label": "Week 3",
            "side": "defense",
            "down": 3,
            "distance_bucket": "medium",
            "field_zone": "middle",
            "hash": "right",
            "personnel": "11",
            "formation": "Trips",
            "motion": "Jet",
            "defensive_front": "4-2-5",
            "coverage_shell": "Cover 3",
            "pressure_type": "5-man fire zone",
            "concept_name": "Flood",
            "yards": 14,
            "explosive": "yes",
            "success": "yes",
            "play_type": "pass",
            "result_notes": "Hit sail route vs squat corner",
            "tags": "third down, explosive",
        }
    )
    return output.getvalue()

