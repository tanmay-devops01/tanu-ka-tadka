# Tanu Ka Tadka — Design Directions

## Three Possible Directions

### 1. After-Hours Saloon Ledger
**Very Brief Intro:** A tactile, low-lit barber-shop keepsake built from sepia paper, faded sign-painting, radio dials, and remembered song requests. It feels like a well-thumbed appointment ledger left beside an old transistor.

**Probability:** 0.07

### 2. Monsoon Cassette Club
**Very Brief Intro:** A rainy cassette-listening room, using indigo dusk, chrome audio hardware, and handwritten tape labels. It creates a more romantic, city-night version of the radio ritual.

**Probability:** 0.03

### 3. Cinema Ticket Barbershop
**Very Brief Intro:** A lively collage that combines hair-cut coupons, film tickets, painted cinema boards, and bright street-market color. It is playful, kinetic, and a little louder.

**Probability:** 0.09

## Chosen Direction: After-Hours Saloon Ledger

### Design Movement
**Indian vernacular sign-painting meets tactile ephemera editorial design.** The page should look collected rather than constructed: a 2000s Odisha and North Indian mohalla saloon seen at dusk, with a weathered stool, wall calendar, and a radio that has outlasted several rewinds.

### Core Principles
1. **Worn, human materials:** Ink bleed, paper grain, painted borders, and old-metal highlights replace glossy cards and sterile UI panels.
2. **Deliberate asymmetry:** The hero moves from saloon storefront to transistor rather than centering every element in a conventional landing-page stack.
3. **Listening is the hero:** The radio controls remain physical, large, and legible; visual decoration supports the act of pressing play.
4. **Lived-in bilingual voice:** Hindi, Odia, and English appear as natural neighbourhood signage rather than translation pairs placed side-by-side.

### Color Philosophy
The base is the near-black brown of a saloon after shutters close (**#120806**), so brass gold, cardamom cream, aged aqua, and faded coral read like light catching paint and chrome. Gold is the proprietary warmth—not a generic luxury treatment—while aqua is used sparingly to suggest an analogue tuner display.

### Layout Paradigm
A **saloon counter composition** guides the page. The left edge holds the business-sign and scene; a slanted, paper-taped player panel overlaps the lower right as the “counter.” The following sections read as pinned notes, receipts, and a painted back-wall—never as a row of uniform cards.

### Signature Elements
1. A **brass-ringed transistor dial** with a sweeping radio needle.
2. **Hand-painted barber-pole stripes** as dividers, rule lines, and meter accents.
3. **Taped paper labels** with uneven edges for song memory, notices, and calls-to-action.

### Interaction Philosophy
Interactions should feel tactile and reliable: a toggle flicks like a radio switch, controls depress slightly, and rotating quotes change like someone has swapped a note behind the mirror. All primary controls keep explicit labels and keyboard focus states.

### Animation
Use only light, analogue motion: a slow breathing glow in the tuner, a measured sweep of the playhead, occasional grain drift, and 180ms–260ms springy press states. Quote swaps should gently slide and fade. Respect `prefers-reduced-motion` by keeping content static.

### Typography System
**Yatra One** anchors Devanagari display text and painted sign energy. **Noto Serif Devanagari** supports Hindi/Odia language fragments and section labels. **DM Sans** handles functional English copy and controls with compact, high-legibility rhythm. Headline scale stays dramatic; utility labels use uppercase tracking rather than tiny text.

### Brand Essence
**A free online radio counter for people who miss the songs, rain, and familiar chatter of a 2000s Odisha–North India neighbourhood saloon.**

**Personality:** Warm, remembered, unpretentious.

### Brand Voice
Headlines are fond, specific, and spoken like a regular at the shop; CTAs are gentle invitations rather than conversion language. Avoid generic startup phrasing.

Example lines:

> “Ek number side fade. Aur ek number gaana.”

> “Kain sunuchha? Puruna dinara tune, bas eka click dura.”

### Wordmark & Logo
The wordmark uses an arched, hand-painted Devanagari treatment for **तनु का तड़का**, with a small abstract transistor-and-scissor mark: a brass radio circle split by two slim, crossed scissor blades. The mark is recognisable without type and appears clearly in the header and favicon.

### Signature Brand Color
**Tadka Brass — #D69A35.** A toasted, sign-painter’s brass that signals warmth, analogue music, and the late-afternoon saloon bulb.

## Style Decisions

- Bilingual voice uses actual **Devanagari and Odia script** as recurring visual signage on every major section; Romanized Hinglish remains flavour rather than the sole locality cue.
- Every section must read as a physical saloon artifact—**painted wall, ledger paper, taped notice, or radio hardware**—rather than a generic marketing band.
- The radio-and-scissor symbol repeats as a small **brass station stamp** on key section headers and notices to reinforce brand recall.
