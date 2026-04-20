"""Curated concept bundles (football-specific coaching language)."""

from __future__ import annotations

from .concept_library import make
from .models import ConceptPlan

# --- Cover 3: stress flat/curl player + rotation timing ---

COVER3_ROTATION_WEAKNESS: tuple[ConceptPlan, ...] = (
    make(
        concept="Flood (Hi-Lo)",
        why_it_works="You stress the curl/flat defender with a true hi-lo: flat controls "
        "width, corner sits on top, and the sail or out cuts in front of the deep third. "
        "Against Cover 3, a safety who is late to rotate cannot help three levels on the "
        "same side before the ball is out.",
        formation="3x1 field (trips) or 2x2 with tagged flood side to the field/boundary",
        motion="Jet/orbit to force a bump or declare rotation, then snap back into flood leverage",
        expected_adjustment="Flat defender expands; curl/flat player widens; safety triggers "
        "flat-to-vertical late—hook players collision underneath",
        counter="Pump the flat and climb to the corner; weak-side dig replaces if they rob the sail",
        coaching_note="Teach the QB to read flat first, then climb—don't stare the corner until "
        "the flat defender declares.",
    ),
    make(
        concept="Sail",
        why_it_works="The sail sits in the seam/hook void while the corner carries vertical "
        "and the flat defender handles width. It attacks the natural hole between curl/flat "
        "carry and deep-third help when rotation is a step slow.",
        formation="2x2 with sail tagged to the isolated side (boundary sail is common)",
        motion="Z across to change strength and hold the nickel/overhang from folding early",
        expected_adjustment="Hook defender carries vertical longer; safety tries to rob the sail; "
        "curl/flat widens to cloud support",
        counter="Nod the sail to sit; Alabama replace underneath; backside post if safety robs",
        coaching_note="Landmarks beat speed—QB progression is flat → sail → corner with "
        "shoulder discipline.",
    ),
    make(
        concept="Y-Cross (drive crosser)",
        why_it_works="Crossers pull hook players and force safeties to declare—late rotation "
        "opens grass behind linebackers and in front of thirds. The Y at 12–14 yards stresses "
        "collision teams and rat players.",
        formation="11 personnel 2x2 or 3x1 with Y as the primary crosser",
        motion="Trade motion to confirm shell and corner leverage pre-snap",
        expected_adjustment="Safeties overlap crossers; linebackers jam/carry; flat defenders widen",
        counter="Pump cross, hit delay flat, or wheel off collision to replace vertical stress",
        coaching_note="Time the crosser off the shallow drive—spacing vs collision is the drill.",
    ),
)

# --- Cover 2: stress Mike as vertical/hole player ---

COVER2_MIKE_WEAKNESS: tuple[ConceptPlan, ...] = (
    make(
        concept="Four verts (seam stress)",
        why_it_works="Four vertical stems force the Mike to carry #3 vertical in the seam "
        "or split between curl/flat and vertical carry. If the Mike is the conflict player, "
        "the natural window shows between seam carry and underneath droppers.",
        formation="2x2 or 3x1 with seam tags and stack alignment to muddy curl-flat reads",
        motion="Stack release to cloud the nickel's leverage and hold the hole defender",
        expected_adjustment="Safeties squeeze seams; Tampa corners sink; curl/flat players widen",
        counter="Seam-stop routes, bend posts off safety squeeze, or check seam replace",
        coaching_note="Verts win with stems first—teach outside receivers to threaten vertical "
        "before breaking.",
    ),
    make(
        concept="Dagger (dig + post hold)",
        why_it_works="The dig occupies the Mike window and holds safeties while the post "
        "threatens the deep half. Cover 2 hole players conflict when the dig wins inside "
        "the linebacker wall late.",
        formation="2x2 dagger strong with dig declared to the conflict side",
        motion="Orbit RB to hold the hook/curl defender and widen the Mike's fit",
        expected_adjustment="Mike sinks under dig; safety triggers early on dig; corner bails",
        counter="Glance/bang-8 if safety jumps; check flat control if corner sinks",
        coaching_note="Progression: dig window first, then post off safety behavior—eyes stay "
        "inside-out.",
    ),
    make(
        concept="Mills (post-wheel)",
        why_it_works="Post-wheel layers the half-field safety: the post occupies vertical "
        "eyes while the wheel wins flat leverage. The Mike shows when he conflicts between "
        "walling the dig and carrying vertical.",
        formation="2x2 Mills tagged to the best safety leverage side",
        motion="Jet to wheel side to soften edge support and hold flat defenders",
        expected_adjustment="Corner bails; safety splits post/wheel late; curl/flat expands",
        counter="Pump wheel, snap dig backside, RB flare replace if safety jumps post",
        coaching_note="Sell vertical stems—wheel wins when the safety hesitates on the post.",
    ),
)

# --- Man / man-free: stress DB in space ---

MAN_WEAK_DB: tuple[ConceptPlan, ...] = (
    make(
        concept="Mesh",
        why_it_works="Legal rub spacing forces man defenders to fight through traffic—slow "
        "or tight-hip DBs lose leverage at the mesh point. It is a timing answer vs man "
        "and man-match teams that trail.",
        formation="2x2 tight or 3x1 bunches with mesh declared to the field",
        motion="Shift to bunch, then snap mesh on rhythm to reduce declaration time",
        expected_adjustment="Switch/banjo calls; trail technique; safety help over the top late",
        counter="Pivot sit behind trail; wheel off switch; sluggo if they press",
        coaching_note="Drill the 5-yard under at a consistent depth—timing beats long speed.",
    ),
    make(
        concept="Rub slant (natural pick)",
        why_it_works="Stack releases create natural rubs—man defenders get picked by route "
        "paths, not blocks. Overaggressive DBs run into wash.",
        formation="2x2 stack or tight slot with slant from inside release",
        motion="Motion into stack to confirm man and set leverage",
        expected_adjustment="Off coverage; trail; press with safety help declared",
        counter="Sluggo off press; fade-stop if they bail; glance if safety sits",
        coaching_note="Spacing is legal—receivers win with stems; no offensive pass interference.",
    ),
    make(
        concept="Choice (isolated leverage)",
        why_it_works="Choice lets the WR declare inside/out based on DB leverage—man defenders "
        "show their hip early. It isolates a weak DB on the boundary or field.",
        formation="3x1 with isolated backside choice or single-side iso",
        motion="Ghost motion to hold apex/nickel and confirm man",
        expected_adjustment="Bracket/double mable; safety rotation over the top",
        counter="Alert smash if safety sits; hitch if they run; post if one-high rotates",
        coaching_note="QB-WR key must match—read hip of DB first, then safety rotation.",
    ),
)

# --- Quarters: stress flat defender who jumps short ---

COVER4_BOUNDARY_JUMP: tuple[ConceptPlan, ...] = (
    make(
        concept="Post-dig (vertical replace)",
        why_it_works="Quarters corners pattern-match short-to-deep. A vertical double move "
        "stresses the quarter defender's fit rules—if he drives short, the post replaces "
        "behind him before safety overlap arrives.",
        formation="3x1 boundary isolated with vertical tags to the single side",
        motion="Orbit to hold the flat defender and widen the nickel's fit",
        expected_adjustment="Safety overlaps post; corner stays high; nickel expands flat",
        counter="Dig settles in the void; RB check-release flat if they wall vertical",
        coaching_note="Tag the boundary post with a safety read—sell vertical before the break.",
    ),
    make(
        concept="Smash (hitch + corner)",
        why_it_works="Smash attacks the curl/flat player in Quarters: low hitch controls "
        "width, high corner stresses the flat defender who wants to jump underneath.",
        formation="2x2 smash declared to the boundary/field based on leverage",
        motion="Short motion to confirm soft/off coverage and nickel alignment",
        expected_adjustment="Corner sinks; nickel expands; safety triggers over the hitch",
        counter="Hitch-and-go off pump; glance if safety jumps the hitch",
        coaching_note="QB read is hitch-to-corner—patience wins vs jumpers.",
    ),
    make(
        concept="Corner-post (smash answer)",
        why_it_works="When the flat defender drives the hitch, the corner-post replaces "
        "vertical stress into the alley before safety help gets width.",
        formation="2x2 with tagged corner route from slot or boundary",
        motion="Jet fake to hold edge support and widen the curl/flat player",
        expected_adjustment="Safety triggers to post; flat widens; nickel walls short",
        counter="Check down RB arrow/flat replace if safety sits high",
        coaching_note="Sell smash first—post is the constraint answer to aggressive flats.",
    ),
)

# --- Blitz: quick game + hot answers ---

BLITZ_QUICK_GAME: tuple[ConceptPlan, ...] = (
    make(
        concept="Stick (triangle read)",
        why_it_works="Stick gives three quick outlets vs simulated pressure: spacing beats "
        "replacement zones when rush lanes win early. Ball is gone before edge pressure "
        "flattens the pocket.",
        formation="3x1 stick with declared flat control side",
        motion="RB swing/check release to widen replacement defenders",
        expected_adjustment="Zone replacement behind blitz; linebackers wall underneath",
        counter="RB seam replace; glance if nickel walks",
        coaching_note="Pre-snap count hats—if you're short, work stick spacing and hot answers.",
    ),
    make(
        concept="Snag (spot concept)",
        why_it_works="Snag creates a triangle read vs man pressure: sit, flat, and snag "
        "spacing gives horizontal answers when linebackers mug.",
        formation="2x2 snag with sit route declared inside",
        motion="No motion—tempo to the line to deny late rotation",
        expected_adjustment="Banjo/switch underneath; trail technique by linebackers",
        counter="Alert slant if press; wheel replace if they banjo",
        coaching_note="Landmarks: 5-5-5 spacing—discipline beats disguise.",
    ),
    make(
        concept="Spacing (all-go quick)",
        why_it_works="Five quick outlets stress overloaded rush integrity—QB rhythm throws "
        "before the fifth rusher wins.",
        formation="Empty 3x2 or 2x3 with spacing landmarks",
        motion="RB jet check to empty to force linebackers to declare",
        expected_adjustment="Peel replace with linebackers; edge contain rules",
        counter="RB angle if peel; hot seam if interior mug",
        coaching_note="No hitch unless edge contains—ball timing is the protection.",
    ),
)

# --- Play action vs linebackers who bite ---

PLAY_ACTION_BITER: tuple[ConceptPlan, ...] = (
    make(
        concept="Yankee (over/post)",
        why_it_works="Yankee clears safeties when linebackers step to run—post/over layers "
        "attack one-high and two-high answers off the same run-action.",
        formation="11/12 personnel with heavy PA footwork and split-zone look",
        motion="Shift to I/Z look to sell gap scheme",
        expected_adjustment="Safeties bite; corners carry vertical; hook players expand late",
        counter="Check seam if post is capped; glance if safety sits",
        coaching_note="Sell mesh point—QB hides ball on turn; shoulders sell run first.",
    ),
    make(
        concept="PA boot (naked/keep)",
        why_it_works="Boot attacks flat defenders who chase run action—throwing lanes open "
        "behind flowing linebackers when edge contain is wrong.",
        formation="21/12 boot weak with U/Y releasing late flat",
        motion="U/Y across formation to widen conflict defenders",
        expected_adjustment="Flat defender retraces late; safety triggers crossers",
        counter="Naked keep if edge crashes; check seam if flat widens",
        coaching_note="QB depth and shoulders sell run—eyes manipulate second-level keys.",
    ),
    make(
        concept="Post-dig (PA)",
        why_it_works="PA lifts linebackers—dig settles in the window they vacate while "
        "safeties react to vertical stems.",
        formation="2x2 with dig declared to the hook void",
        motion="Orbit to hold overhang and widen nickel fit",
        expected_adjustment="Safety triggers to post; Mike sinks under dig",
        counter="Dig window widens if safety stays high; flat replace if they wall",
        coaching_note="Two-hand tag fake—time dig at linebacker depth, not receiver speed.",
    ),
)

# --- Nickel slow in space ---

NICKEL_SLOW_SPACE: tuple[ConceptPlan, ...] = (
    make(
        concept="Speed out / choice",
        why_it_works="Horizontal stress forces the nickel to play in space—speed outs and "
        "choice routes win leverage vs tight hips and long speed deficits.",
        formation="3x1 nickel isolated to the field/boundary",
        motion="Jet touch to widen alignment and confirm soft support",
        expected_adjustment="Safety rolls down; curl/flat expands; apex sinks",
        counter="Post over the top if safety jumps; dig replace if they sink",
        coaching_note="Tempo matters—ball on the perimeter before help arrives.",
    ),
    make(
        concept="Stick nod",
        why_it_works="Stick sets the nickel vertical—nod breaks back to grass when he "
        "expands to cushion.",
        formation="2x2 stick side tagged to nickel conflict",
        motion="RB return motion to change strength and hold linebackers",
        expected_adjustment="Mike walls stick; hook defender carries vertical",
        counter="RB flat replace if nickel sinks; glance if safety walks",
        coaching_note="Teach nod at the top of the stick stem—sell vertical first.",
    ),
    make(
        concept="RB wheel",
        why_it_works="Wheel forces the nickel to carry a vertical route in space—if he "
        "struggles in space, the wheel wins late in the progression.",
        formation="2x2 with RB wheel tagged from backfield",
        motion="Orbit to confirm man/zone and soften edge",
        expected_adjustment="Safety picks wheel; curl/flat expands",
        counter="Dig replaces safety window; flat control if they trail",
        coaching_note="Protection first—wheel is late in progression, not early.",
    ),
)

# --- Generic fallback (unknown shell / mixed) ---

DEFAULT_PROGRESSION: tuple[ConceptPlan, ...] = (
    make(
        concept="Levels",
        why_it_works="Levels stretches zone droppers horizontally and vertically—hook/curl "
        "defenders conflict when multiple routes enter their zone at different depths.",
        formation="2x2 levels strong with declared high-low tags",
        motion="Z across to change strength and hold second-level players",
        expected_adjustment="Hook players sink; safeties split vertical stress",
        counter="Dig behind sinking hooks; seam replace if safety jumps",
        coaching_note="Teach landmark discipline—QB climbs with eyes, not with feet first.",
    ),
    make(
        concept="Drive (shallow)",
        why_it_works="Shallow drive occupies underneath defenders and clears grass for "
        "dig/drive reads—timing beats pattern-match when linebackers wall.",
        formation="3x1 drive with shallow declared strong",
        motion="Orbit RB to widen conflict linebackers",
        expected_adjustment="Wall routes by linebackers; nickel expands flat",
        counter="Wheel off wall; RB replace flat",
        coaching_note="Timing: drive at ~4 yards, dig at ~12—rhythm throw off three-step.",
    ),
    make(
        concept="Spacing (quick)",
        why_it_works="Quick spacing attacks aggressive tendencies without holding the ball—"
        "hot answers win vs simulated pressure.",
        formation="Empty or 3x1 quick with spacing landmarks",
        motion="Jet check to force linebackers to declare",
        expected_adjustment="Peel and replacement underneath",
        counter="Hot seams if plus-one rush shows",
        coaching_note="Pre-snap hat count—if short, work hot rules and sight adjustments.",
    ),
)
