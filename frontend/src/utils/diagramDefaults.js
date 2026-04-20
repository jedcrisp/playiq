export const OFFENSE_ROLES = ["X", "Z", "H", "Y", "RB", "QB", "OL"];
export const DEFENSE_ROLES = ["CB", "S", "LB", "Edge", "DL"];

export function emptyCanvas() {
  return {
    field: "half",
    offenseMarkers: [],
    defenseMarkers: [],
    routes: [],
    motionPaths: [],
    blockPaths: [],
  };
}

export function createEmptyDiagram({ name = "Untitled play", link = {} }) {
  const now = new Date().toISOString();
  return {
    name,
    playName: "",
    linkedConceptName: link.linkedConceptName ?? null,
    linkedGameplanId: link.linkedGameplanId ?? null,
    linkedOpponentId: link.linkedOpponentId ?? null,
    linkedCallSheetRank: link.linkedCallSheetRank ?? null,
    installNote: "",
    referenceImageUrl: null,
    canvas: emptyCanvas(),
    createdAt: now,
    updatedAt: now,
  };
}
