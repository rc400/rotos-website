# ROTO's TCG Website — Full Build Spec (v2 — No Artwork, Logo-Centric)

## Project Overview
Single-page landing site for ROTO's TCG, a Pokémon TCG vending brand. The PRIMARY goal is email/contact collection from people looking to sell their cards. The design should be clean, premium, and logo-forward — no stock photos, no AI art, no placeholder images. The ROTO's logo IS the visual identity.

## Tech Stack
- Static HTML + CSS + vanilla JavaScript
- No frameworks, no build tools, no external dependencies (except Google Fonts)
- Single index.html with separate styles.css and script.js
- Mobile-first responsive design

## Design System
Read and follow `design-system.md` in this same directory. Key points:
- Color palette: cream (#FFF8E5), near-black (#040707), burnt orange accent (#D56C3F), teal sparingly (#376B76)
- Fonts: Space Grotesk (headings) + DM Sans (body) from Google Fonts
- Scroll-triggered animations using Intersection Observer
- NO purple gradients, NO random emojis, NO generic startup UI
- NO stock photos, NO AI-generated images, NO placeholder images
- Generous whitespace, the design breathes

## Visual Approach — Logo-Centric
Since there are no photographs or illustrations, the visual interest comes from:
1. **The ROTO's logo** — featured prominently in the hero, with an interactive floating/parallax effect that responds to mouse position (subtle tilt/drift, not extreme). On mobile, use a gentle idle floating animation instead.
2. **Typography** — bold, dramatic headings that command attention. Use size contrast and weight to create visual hierarchy.
3. **Color blocking** — alternating cream and dark (#040707) sections to create rhythm and contrast.
4. **Subtle background textures** — very faint noise/grain on the cream sections for warmth. CSS-only, no images.
5. **Geometric accents** — thin lines, small dots, or minimal decorative elements in the accent color to add visual interest without images.
6. **Micro-animations** — scroll reveals, subtle hover effects, smooth transitions. The movement IS the visual interest.

## Assets (in ./assets/ folder)
- `logo-no-bg.png` — ROTO's logo, transparent background (USE THIS for hero floating logo and navbar)
- `logo.png` — ROTO's logo with cream background (use for og:image/social sharing)

## Page Structure (Single Page, Scroll Sections)

### 1. Navigation Bar (sticky)
- ROTO's logo (left, small, use logo-no-bg.png)
- Nav links: About | Events | Sell Your Cards | Contact
- All links are anchor scrolls to sections on the same page
- On scroll: navbar gets background with subtle blur
- Mobile: hamburger menu with smooth slide-in

### 2. Hero Section
- Full viewport height, cream background (#FFF8E5) with very subtle CSS noise texture
- ROTO's logo LARGE and centered — this is the centerpiece
- **Interactive parallax/float effect on the logo**: logo subtly tilts and drifts based on mouse position (use transform: perspective + rotateX/rotateY). On mobile, use a gentle CSS floating animation (up/down bob).
- Below the logo:
  - Large headline: "Where Every Card Has a Story"
  - Subtext: "Toronto & Waterloo's trusted Pokémon card specialists. Whether you're buying, selling, or trading — you've found your people."
  - Primary CTA button: "Sell Us Your Cards" → scrolls to form
  - Secondary text link: "See Where We'll Be Next" → scrolls to events
- The overall hero should feel spacious and confident — the logo floats in a sea of warm cream

### 3. What We Do Section
- Cream background, clean layout
- Section heading: "Buy. Sell. Trade." (large, bold)
- Three columns/cards:
  - **Buy**: "From sealed packs to chase singles, we stock what collectors want. Online store coming soon."
  - **Sell**: "Got cards collecting dust? We buy collections of all sizes. Fair prices, easy process."
  - **Trade**: "Looking for specific cards? Bring what you have and let's make a deal."
- Each card: dark (#040707) background with cream text, burnt orange accent line on top, medium border radius
- Cards fade in + stagger on scroll
- Below: "We've helped hundreds of collectors across Ontario find exactly what they're looking for."

### 4. Events / Where to Find Us
- DARK section (#040707 background, cream text) — strong visual contrast
- Section heading: "On the Road" (large, cream)
- Subtext: "We've set up at events across Ontario and we're always looking for the next one."
- Event names displayed as a horizontal marquee/infinite scroll: HobbyCon • NACE • CSC • Collectors Clash • Cardfesta • Mewtopia • and more
- Style the event names as elegant typography, not badges — large, slightly transparent, scrolling slowly
- CTA: "Follow us on Instagram for event updates" → https://www.instagram.com/rotos_tcg/
- Maybe add a thin burnt orange accent line or geometric element for visual interest

### 5. Our Story
- Cream background
- Section heading: "The Origin" (large)
- Story text — write as engaging narrative, warm and authentic:

  It started the way most good things do — with no plan at all. Ron and Tom were just two friends with a camera and way too many packs to open. Back then it was Lotad Cards: road trips, pulls, and a lot of laughing.

  Their friends at Uptown Cards and Collectibles offered them two free tables at a Waterloo night market. First time vending. They barely broke even, but something clicked — the energy of trading, the conversations with collectors, the thrill of someone finding exactly what they'd been hunting for.

  What started as a hobby became a mission. Show after show, city after city — from intimate night markets to massive conventions — ROTO's grew. Ron holds it down in Toronto, Tom in Waterloo. Two cities, one brand, and a growing community of collectors who know that when ROTO's sets up, it's worth stopping by.

- Layout: text-focused, generous line height, maybe a subtle decorative element (thin line, small accent) separating paragraphs
- The text itself is the visual here — make the typography beautiful

### 6. Sell Your Cards (THE MAIN SECTION)
- This is the MOST IMPORTANT section. Email capture is the #1 priority.
- Light cream background with a subtle tinted area for the form container
- Section heading: "Got Cards? Let's Talk."
- Subtext: "Whether it's a binder full of childhood memories or a fresh pull worth a fortune, we want to hear from you. Fill out the form below and we'll get back to you within 48 hours."

#### Contact Form Fields:
1. **Name** (required, text)
2. **Email** (required, email)
3. **Phone** (optional, tel)
4. **City / Location** (required, text)
5. **Describe the cards you're looking to sell** (required, textarea — placeholder: "Tell us what you've got. Sets, conditions, anything notable.")
6. **Roughly, what do you have the market value as?** (required, text — "$" prefix)
7. **What resources did you use to get the market value?** (required, text — placeholder: "e.g., TCGPlayer, eBay sold listings, PriceCharting...")
8. **What value would make you happy to sell these cards for?** (required, text — "$" prefix)
9. **Upload Photos** (optional, file input, max 5 images — label: "Show us what you've got. Up to 5 photos.")
10. **Subscribe to updates** (checkbox, default checked — "Keep me posted on events, deals, and drops.")

- Submit button: "Send It Over" (burnt orange #D56C3F, cream text, prominent)
- Below form: "We review every submission personally. No bots, no algorithms — just Ron and Tom."
- Form action: action="https://formsubmit.co/YOUR_EMAIL_HERE" method="POST" enctype="multipart/form-data"
- Client-side validation on required fields

### 7. Streaming / Online
- Small section, dark background (#040707)
- "Watch Us Live" heading (cream)
- Brief text: "Catch our live breaks and auctions on Whatnot. Online store coming soon."
- Link to Whatnot: https://www.whatnot.com/s/sPpusQs4
- Keep minimal — just a teaser

### 8. Footer
- Dark background (#040707)
- ROTO's logo (small, cream version or transparent)
- Social links: Instagram (https://www.instagram.com/rotos_tcg/), Whatnot (https://www.whatnot.com/s/sPpusQs4)
- "Toronto & Waterloo, ON"
- "© 2025 ROTO's TCG. All rights reserved."
- Small email signup (email-only input + submit, for bottom-of-page captures)
- "Ron Chai & Thomas Shivas"

## Animation & Interaction Details
- **Hero logo parallax**: on mousemove, apply subtle transform with perspective(1000px) rotateX/rotateY based on cursor position relative to center. Max rotation: ~5-8 degrees. Smooth with transition. On mobile: CSS @keyframes floating animation (gentle up-down bob, 3-4s loop).
- **Scroll reveals**: Intersection Observer, elements fade in + translateY(20px→0) when entering viewport. Stagger cards by 100-150ms each.
- **Navbar**: starts transparent, adds cream bg + backdrop-filter blur on scroll past hero.
- **Event marquee**: CSS animation, infinite horizontal scroll, paused on hover.
- **Form inputs**: smooth border-color transition on focus (#CEC7BB → #D56C3F).
- **Smooth scroll**: css scroll-behavior: smooth + JS for cross-browser.
- **All transitions**: 200-400ms ease-out, nothing bouncy or playful.

## SEO Requirements
- Title: "ROTO's TCG | Buy, Sell & Trade Pokémon Cards — Toronto & Waterloo"
- Meta description: "Toronto and Waterloo's trusted Pokémon card specialists. Sell us your collection, find us at events across Ontario, or shop online."
- Open Graph tags (use logo.png as og:image)
- Semantic HTML (heading hierarchy, landmarks, alt text on logo)
- Schema.org LocalBusiness structured data

## Performance
- Lazy load logo images below fold
- Minimal JS — vanilla only, no libraries
- Google Fonts with display=swap
- CSS noise texture generated with CSS (radial-gradient or SVG filter), not an image file

## File Structure
```
rotos-website/
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── logo-no-bg.png
│   └── logo.png
├── design-system.md
└── SITE-SPEC.md
```

## IMPORTANT
- This is a REAL business website. Quality matters.
- The form is #1 priority — make it easy, inviting, prominent.
- No placeholder images. No AI art. No stock photos. Typography, color, and spacing do the work.
- The floating logo interaction should feel premium, not gimmicky.
- The copy is warm and authentic, not corporate.
- Must look like it was designed by a human with taste.
