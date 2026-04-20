"""Additional concept bundles for expanded shells (Phase 3)."""

from __future__ import annotations

from .concept_library import make
from .models import ConceptPlan

# Pattern-match / quarters family (Match Quarters, Palms, Cover 6)

MATCH_AND_PALMS: tuple[ConceptPlan, ...] = (
    make(
        concept="Stick",
        why_it_works="Stick triangle distribution stresses pattern-match rules: the sit route "
        "attacks linebackers who carry vertical stems while flats hold width.",
        formation="3x1 stick with tagged flat control; slot can carry sit",
        motion="Orbit to confirm nickel alignment and cloud vs hard corner",
        expected_adjustment="Banjo/switch calls underneath; safeties stay capped on vertical",
        counter="Glance replace if safeties squat; RB arrow into wide void",
        coaching_note="QB read flat → stick → hook—teach landmarks vs carry teams.",
        stresses_defender="Nickel/hook defender and the flat defender who must declare width.",
        space_leverage="Intermediate void between hook and flat; width to control cloud support.",
        ideal_down_distance="2nd–3rd & 3–7 (rhythm throws); can tag quick on 3rd & long vs pressure.",
    ),
    make(
        concept="Smash",
        why_it_works="High–low stress on the flat defender is the classic answer to aggressive "
        "pattern-match corners who drive short.",
        formation="2x2 smash side; hitch outside with corner over top",
        motion="Z short motion to declare off coverage",
        expected_adjustment="Corner sinks; nickel expands; safety triggers over hitch",
        counter="Corner pump → hitch-and-go; glance if safety sits",
        coaching_note="Patience on hitch—let the flat defender declare before climbing.",
        stresses_defender="Curl/flat defender and the safety who caps the corner route.",
        space_leverage="Sideline width + high corner window over flat expanders.",
        ideal_down_distance="1st–3rd & 5–10 when you expect soft flat players.",
    ),
    make(
        concept="Levels",
        why_it_works="Three-level distribution forces pattern-match droppers to declare depth; "
        "it creates windows between carry rules and collision defenders.",
        formation="2x2 levels strong with clear high-low tags",
        motion="Trade motion to change strength and hold apex defenders",
        expected_adjustment="Hook players sink; safeties split vertical stress",
        counter="Dig behind sinking hooks; seam replace if safety triggers",
        coaching_note="Landmark discipline—QB climbs with eyes through hook defenders first.",
        stresses_defender="Hook/curl players and the nickel who walls inside routes.",
        space_leverage="Horizontal stretch across intermediate zones; vertical windows vs squat.",
        ideal_down_distance="1st–2nd & 6+ when you need efficient movement.",
    ),
)

TWO_MAN_ROBBER: tuple[ConceptPlan, ...] = (
    make(
        concept="Mesh",
        why_it_works="Two-high man structures still trail in traffic—mesh timing creates "
        "natural separation vs tight-hip defenders.",
        formation="2x2 tight mesh or 3x1 bunches",
        motion="Shift to bunch to confirm man and set picks legally",
        expected_adjustment="Switch/banjo; trail; safety help declared late",
        counter="Pivot/wheel off switch; glance if safety sits",
        coaching_note="Drill mesh depth—timing beats long speed when spacing is consistent.",
        stresses_defender="Inside nickel/slot defender and the man defender who gets picked.",
        space_leverage="Short-area separation at the LOS; conflict in pick window.",
        ideal_down_distance="2nd & short–medium; red-zone tight red area.",
    ),
    make(
        concept="Rub slant",
        why_it_works="Stack releases create legal rubs—robber players can be wrong if they "
        "trigger early vs mesh traffic.",
        formation="2x2 stack; slant from inside release",
        motion="Motion into stack late to reduce declaration time",
        expected_adjustment="Off coverage; trail; robber shows vs crossers",
        counter="Sluggo off press; post if robber triggers flat",
        coaching_note="Sell vertical stems—rub wins when DBs run through wash.",
        stresses_defender="Robber/hole player and the slot defender in traffic.",
        space_leverage="Quick inside window before safety overlap.",
        ideal_down_distance="2nd & 3–6; goal-line / tight field packages.",
    ),
    make(
        concept="Glance / RPO glance",
        why_it_works="Glance wins behind linebackers when safeties rotate late—pairs well with "
        "pull reads vs aggressive robber fills.",
        formation="3x1 with isolated glance and tagged flat",
        motion="Ghost motion to hold apex and confirm one-high",
        expected_adjustment="Robber rotates; linebackers wall glance window",
        counter="Alert flat if robber jumps; hitch replace if they bail",
        coaching_note="QB read is key defender first—glance is timing, not arm strength.",
        stresses_defender="Robber player and hook defender who walls the window.",
        space_leverage="Intermediate hole between linebackers and rotating safety.",
        ideal_down_distance="2nd & 5–8; RPO tags on favorable box counts.",
    ),
)

FIRE_ZONE_FAMILY: tuple[ConceptPlan, ...] = (
    make(
        concept="Snag",
        why_it_works="Snag creates horizontal answers vs zone blitz—triangle reads beat "
        "replacement zones when rush lanes overload.",
        formation="2x2 snag with sit in the middle",
        motion="Tempo to the line; reduce late rotation",
        expected_adjustment="Wall routes underneath; rat players replace hook",
        counter="Wheel replace; seam hot if interior mug",
        coaching_note="5-5-5 spacing landmarks—discipline vs simulated pressure.",
        stresses_defender="Hook/rat defender and nickel who expands to wall snag.",
        space_leverage="Flat voids outside wall defenders; quick rhythm windows.",
        ideal_down_distance="3rd & 3–6 and red-zone when you need a fast ball.",
    ),
    make(
        concept="Spacing",
        why_it_works="Five quick outlets stress overload integrity—ball out before the fifth "
        "rusher wins.",
        formation="Empty 3x2 with spacing landmarks",
        motion="RB jet check to empty to force linebackers to declare",
        expected_adjustment="Peel replace; zone replacement behind blitz",
        counter="RB angle if peel shows; hot seam if mug",
        coaching_note="Hat count first—if short, work hot rules and sight adjust.",
        stresses_defender="Replacement defenders and the linebacker who peeks at RB.",
        space_leverage="Width across the field; quick flats and sit routes.",
        ideal_down_distance="3rd & long vs pressure; two-minute when protection is thin.",
    ),
    make(
        concept="Tunnel screen",
        why_it_works="Screens punish aggressive rush lanes and linebackers who sprint to "
        "coverage—space replaces where defenders vacate.",
        formation="2x2 or 3x1 with tunnel tag to field",
        motion="Jet or orbit to widen edge and sell vertical",
        expected_adjustment="Peel/trail by linebackers; safeties trigger late",
        counter="RB slip if peel; glance if safeties squat",
        coaching_note="Sell pass set first—timing with OL releases wins vs speed rush.",
        stresses_defender="Conflict linebackers and edge players who rush past the throw.",
        space_leverage="Behind LOS width—run through daylight created by vertical stems.",
        ideal_down_distance="Any down vs heavy pressure; change-up on long yardage.",
    ),
)

ROTATION_HEAVY: tuple[ConceptPlan, ...] = (
    make(
        concept="Flood (Hi-Lo)",
        why_it_works="Rotation-heavy shells still have to pass off hi-lo—late rotation opens "
        "windows if you stress three levels on one side.",
        formation="3x1 field flood with clear flat control",
        motion="Jet/orbit to force rotation declaration",
        expected_adjustment="Safety triggers late; hook players widen; flat expands",
        counter="Pump flat → corner; weak-side dig replaces",
        coaching_note="QB reads flat first—rotation tells you when to climb.",
        stresses_defender="Flat defender and rotating safety who must choose levels.",
        space_leverage="Wide side hi-lo stress; vertical shot if safety stays flat.",
        ideal_down_distance="1st–2nd & 6+ when you expect post-snap rotation.",
    ),
    make(
        concept="Y-Cross",
        why_it_works="Crossers force safeties and linebackers to declare—rotation-heavy teams "
        "collision crossers and open grass behind them.",
        formation="11 personnel 2x2/3x1 with Y cross at 12–14",
        motion="Trade motion to confirm shell",
        expected_adjustment="Overlap rules; linebackers carry; safeties rob",
        counter="Delay flat; wheel off collision",
        coaching_note="Time crosser off drive—spacing vs collision is the weekly drill.",
        stresses_defender="Hook/rat players and safeties who overlap crossers.",
        space_leverage="Intermediate cross-zone voids between linebackers and deep help.",
        ideal_down_distance="2nd & 6–10; move chains with completion-friendly throws.",
    ),
    make(
        concept="Dagger",
        why_it_works="Dig + post layers safeties in rotation—when linebackers expand late, "
        "the dig window widens.",
        formation="2x2 dagger with dig declared to conflict side",
        motion="Orbit RB to hold hook defender",
        expected_adjustment="Safety jumps dig; corner bails; rotation swaps",
        counter="Glance if safety triggers; flat control if corner sinks",
        coaching_note="Progression is dig first—post is off safety behavior.",
        stresses_defender="Mike/hook defender and safety who must split dig/post.",
        space_leverage="Intermediate window between linebackers and half-field help.",
        ideal_down_distance="2nd & 7+ and two-minute when you need chunk completions.",
    ),
)

COVER6_FAMILY: tuple[ConceptPlan, ...] = (
    make(
        concept="Dagger",
        why_it_works="Cover 6 stress mirrors quarters with a middle-of-field player—dagger "
        "attacks the hook window while post holds vertical eyes.",
        formation="2x2 dagger with post/dig spacing to field",
        motion="Z across to set nickel leverage",
        expected_adjustment="Safeties split; hook players sink; nickel walls",
        counter="Bang-8 if safety jumps; check flat if they cloud",
        coaching_note="Teach dig timing vs wall linebackers—eyes stay inside-out.",
        stresses_defender="Nickel/hook defender and safety who caps vertical.",
        space_leverage="Intermediate void between curl/flat carry and deep help.",
        ideal_down_distance="2nd & 6–10 vs split-safety shells.",
    ),
    make(
        concept="Mills",
        why_it_works="Post-wheel stresses split safeties who must cap vertical and help flat—"
        "leverage wins when safeties hesitate.",
        formation="2x2 Mills tagged to best leverage side",
        motion="Jet to wheel side to soften edge support",
        expected_adjustment="Safety splits post/wheel; corner bails",
        counter="Pump wheel; dig backside replace",
        coaching_note="Sell vertical stems—wheel is late in progression.",
        stresses_defender="Half-field safety and flat defender who must carry wheel.",
        space_leverage="Alley and flat—vertical shot vs soft safety.",
        ideal_down_distance="2nd & 5+; red-zone when you need a constraint throw.",
    ),
    make(
        concept="Y-Cross",
        why_it_works="Crossers stress hook players in 6-man spacing and force safeties to "
        "overlap—good vs teams that rotate late to trips.",
        formation="3x1 with Y cross primary",
        motion="Orbit to hold overhang",
        expected_adjustment="Overlap and collision rules; safeties trigger",
        counter="Underneath replace; RB flare",
        coaching_note="Drive footwork sets linebackers—crosser at correct depth.",
        stresses_defender="Hook/rat players and safeties who overlap crossers.",
        space_leverage="Intermediate middle void vs split safeties.",
        ideal_down_distance="1st–2nd & 6+ vs two-high families.",
    ),
)

RUN_GAME_COMPLEMENTS: tuple[ConceptPlan, ...] = (
    make(
        concept="Duo / Inside zone read",
        why_it_works="Duo creates double-teams to linebackers and isolates second-level fits—"
        "pairs with play-action and RPO glances off aggressive fronts.",
        formation="11 personnel tight 2x2 or 1-back power look",
        motion="Jet/orbit to change strength and hold edge",
        expected_adjustment="Safeties roll down; linebackers fit fast; edge spill",
        counter="Keep/pull answers if edge crashes; RPO glance if linebackers trigger",
        coaching_note="Track MIKE declaration—double teams win with angles, not size.",
        stresses_defender="A-gap linebackers and safeties who trigger run fits.",
        space_leverage="Interior vertical lanes; conflict at second level.",
        ideal_down_distance="Short yardage and normal down when you need efficient runs.",
    ),
    make(
        concept="Draw",
        why_it_works="Draw punishes aggressive rush lanes—linebackers vacate underneath when "
        "they treat pass first.",
        formation="11/12 with draw tagged from gun",
        motion="Hard play-fake motion to sell vertical",
        expected_adjustment="DL upfield; linebackers scrape late",
        counter="Alert screen if linebackers run under",
        coaching_note="QB sell shot first—draw wins with patience and OL landmarks.",
        stresses_defender="Interior DL and linebackers who trigger vertical pass rush.",
        space_leverage="A-gap and B-gap late—behind LOS conflict.",
        ideal_down_distance="2nd & long and vs heavy line movement teams.",
    ),
    make(
        concept="RB screen",
        why_it_works="RB screens replace where linebackers wall—quick outlet vs simulated "
        "pressure and man-match teams.",
        formation="2x2 with RB screen tagged weak/strong",
        motion="Jet to widen edge and sell vertical",
        expected_adjustment="Peel/trail; safeties trigger late",
        counter="Slip route if peel; glance if safeties squat",
        coaching_note="Timing with OL—sell pass set, throw on rhythm.",
        stresses_defender="Linebackers in conflict and edge rushers who run past throw.",
        space_leverage="Flat and wide—space created by vertical stems.",
        ideal_down_distance="3rd & medium-long vs pressure; change-up series.",
    ),
)

SLOT_FADE_SPACING: tuple[ConceptPlan, ...] = (
    make(
        concept="Slot fade",
        why_it_works="Slot fade isolates a matchup vs leverage—stress safeties who rotate "
        "late or nickels who are undersized.",
        formation="3x1 with slot fade to trips side",
        motion="Orbit to confirm soft coverage",
        expected_adjustment="Safety rotates over top; nickel trails",
        counter="Dig replace if safety sits; hitch if off",
        coaching_note="Win with release—stem stems safety before stacking vertical.",
        stresses_defender="Nickel/slot defender and safety help declared late.",
        space_leverage="Vertical boundary/alley from slot alignment.",
        ideal_down_distance="2nd & 4–8; red-zone when you need isolation shot.",
    ),
    make(
        concept="Spacing",
        why_it_works="Spacing distributes answers quickly vs soft zones and keeps chains "
        "moving without holding the ball.",
        formation="Empty 3x2 spacing",
        motion="RB jet to empty",
        expected_adjustment="Peel replace; zone droppers wall",
        counter="Hot seam if mug",
        coaching_note="Rhythm throws—landmarks beat disguise.",
        stresses_defender="Zone droppers who must wall multiple routes.",
        space_leverage="Width and quick flats across the field.",
        ideal_down_distance="2nd & 6+ vs soft shells.",
    ),
    make(
        concept="Glance / RPO glance",
        why_it_works="Glance + spacing tags attack linebackers who trigger run keys—pairs "
        "with RPO mechanics without losing structure.",
        formation="3x1 glance with flat tagged",
        motion="Ghost motion to hold apex",
        expected_adjustment="Linebackers wall glance; safety rotates",
        counter="Flat replace; hitch if they bail",
        coaching_note="Read conflict defender first—ball placement beats velocity.",
        stresses_defender="Conflict linebacker and hook defender.",
        space_leverage="Intermediate window behind linebackers.",
        ideal_down_distance="2nd & 5–8 with RPO tags.",
    ),
)
