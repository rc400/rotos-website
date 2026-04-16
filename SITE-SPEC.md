# ROTO's TCG Website — Full Build Spec

## Project Overview
Single-page landing site for ROTO's TCG, a Pokémon card vending brand. The PRIMARY goal is email/contact collection from people looking to sell their cards. The site should feel immersive and fantastical — like entering a world — not a generic business landing page.

## Tech Stack
- Static HTML + CSS + vanilla JavaScript
- No frameworks, no build tools, no dependencies
- Single `index.html` file with embedded CSS and JS (or separate files in same folder)
- Mobile-first responsive design
- Hosted as static files

## Design System
Read and follow `design-system.md` in this same directory EXACTLY. Key points:
- Color palette: cream (#FFF8E5), near-black (#040707), burnt orange accent (#D56C3F), teal sparingly (#376B76)
- Fonts: Space Grotesk (headings) + DM Sans (body) from Google Fonts
- Scroll-triggered animations (use Intersection Observer, no libraries)
- NO purple gradients, NO random emojis, NO generic startup UI
- Generous whitespace, the design breathes

## Assets (in ./assets/ folder)
- `logo-no-bg.png` — ROTO's logo, transparent background (USE THIS in navbar and hero)
- `logo.png` — ROTO's logo with cream background
- `hero-artwork.png` — fantastical trading cards on ancient table, painterly style (1792x1024)
- `marketplace-artwork.png` — bustling fantasy marketplace/vendor scene (1792x1024)
- `origin-story-artwork.png` — two adventurers on a road trip, fantasy landscape (1792x1024)
- `sell-cards-artwork.png` — hands examining a glowing rare card (1024x1024)

## Page Structure (Single Page, Scroll Sections)

### 1. Navigation Bar (sticky)
- ROTO's logo (left, use logo-no-bg.png, reasonable size)
- Nav links: About | Events | Sell Your Cards | Contact
- All links are anchor scrolls to sections on the same page
- On scroll: navbar gets subtle background blur/cream fill
- Mobile: hamburger menu

### 2. Hero Section
- Full viewport height
- Background: hero-artwork.png with a dark overlay gradient (bottom darker for text readability)
- Subtle Ken Burns effect (slow zoom) or parallax on the background image
- Large headline: "Where Every Card Has a Story"
- Subtext: "Toronto & Waterloo's trusted Pokémon card specialists. Whether you're buying, selling, or trading — you've found your people."
- Primary CTA button: "Sell Us Your Cards" (scrolls to form)
- Secondary link: "See Where We'll Be Next" (scrolls to events)

### 3. What We Do Section
- Clean section on cream background
- Section heading: "Buy. Sell. Trade."
- Three cards/columns layout:
  - **Buy**: "From sealed packs to chase singles, we stock what collectors want. Online store coming soon." (icon or small illustration)
  - **Sell**: "Got cards collecting dust? We buy collections of all sizes. Fair prices, easy process." (icon or small illustration)  
  - **Trade**: "Looking for specific cards? Bring what you have and let's make a deal." (icon or small illustration)
- Each card fades in on scroll
- Below the cards: "We've helped hundreds of collectors across Ontario find exactly what they're looking for."

### 4. Events / Where to Find Us
- Dark section (#040707 background, cream text) for contrast
- Section heading: "On the Road"
- Subtext: "We've set up at events across Ontario and we're always looking for the next one."
- Event badges/list showing past events: HobbyCon, NACE, CSC, Collectors Clash, Cardfesta, Mewtopia, and more
- Display these as a horizontal scrolling row of styled badges/tags or a subtle animated marquee
- marketplace-artwork.png displayed alongside or as section background with overlay
- CTA: "Follow us on Instagram for event updates" → links to https://www.instagram.com/rotos_tcg/

### 5. Our Story
- Cream background, storytelling layout
- Section heading: "The Origin"
- origin-story-artwork.png displayed prominently (can be full-width or large side image)
- Story text (write this as engaging narrative copy):
  
  Ron and Tom — the story starts simply. Two friends, a road trip, and way too many packs to open. Back then it was Lotad Cards: just a camera, some pulls, and a lot of laughing.
  
  Their friends at Uptown Cards and Collectibles offered them two free tables at a Waterloo night market. First time vending. They barely broke even, but something clicked. The energy of trading, the conversations with collectors, the thrill of someone finding exactly what they'd been hunting for.
  
  What started as a hobby became a mission. Show after show, city after city — from intimate night markets to massive conventions — ROTO's grew. Ron holds it down in Toronto, Tom in Waterloo. Two cities, one brand, and an ever-growing community of collectors who know that when ROTO's sets up, it's worth stopping by.
  
- Keep the tone warm, authentic, not corporate

### 6. Sell Your Cards (THE MAIN SECTION — email capture priority)
- This is the most important section. Make it prominent and inviting.
- Cream/light background, sell-cards-artwork.png as accent
- Section heading: "Got Cards? Let's Talk."
- Subtext: "Whether it's a binder full of childhood memories or a fresh pull worth a fortune, we want to hear from you. Fill out the form below and we'll get back to you within 48 hours."

#### Contact Form Fields:
1. **Name** (required, text input)
2. **Email** (required, email input)
3. **Phone** (optional, tel input)
4. **City / Location** (required, text input)
5. **Describe the cards you're looking to sell** (required, textarea — "Tell us what you've got. Sets, conditions, anything notable.")
6. **Roughly, what do you have the market value as?** (required, text input — "$" prefix hint)
7. **What resources did you use to get the market value?** (required, text input — placeholder: "e.g., TCGPlayer, eBay sold listings, PriceCharting...")
8. **What value would make you happy to sell these cards for?** (required, text input — "$" prefix hint)
9. **Upload Photos** (optional, file input accepting images, max 5 files — "Show us what you've got. Up to 5 photos.")
10. **Subscribe to updates** (checkbox, default checked — "Keep me posted on events, deals, and drops.")

- Submit button: "Send It Over" (burnt orange, prominent)
- Below form: "We review every submission personally. No bots, no algorithms — just Ron and Tom."
- Form should use FormSubmit (formsubmit.co) or similar free service to send to an email address. Use a placeholder action URL that Ron can configure later. For now use action="https://formsubmit.co/YOUR_EMAIL_HERE" method="POST" enctype="multipart/form-data"

### 7. Streaming / Online
- Small section, cream background
- "Watch Us Live" heading
- Brief text: "Catch our live breaks and auctions on Whatnot. Online store coming soon."
- Link to Whatnot: https://www.whatnot.com/s/sPpusQs4
- Keep this section minimal — it's a teaser, not a feature

### 8. Footer
- Dark background (#040707)
- ROTO's logo (small)
- Social links: Instagram (https://www.instagram.com/rotos_tcg/), Whatnot (https://www.whatnot.com/s/sPpusQs4)
- "Toronto & Waterloo, ON"
- "© 2025 ROTO's TCG. All rights reserved."
- Small email signup form (duplicate — email only, for people who scroll to bottom without filling main form)
- "Ron Chai & Thomas Shivas"

## Animation & Interaction Details
- Use Intersection Observer API for scroll-triggered animations
- Sections fade in + slide up slightly when entering viewport
- Navbar: transparent initially, fills with cream + blur on scroll
- Hero image: subtle slow zoom (Ken Burns) via CSS animation
- Event badges: consider a slow infinite marquee/scroll
- Form inputs: subtle focus animations (border color transition to accent)
- Smooth scroll behavior for anchor links
- All transitions: 200-400ms ease-out, nothing bouncy

## SEO Requirements
- Proper meta title: "ROTO's TCG | Buy, Sell & Trade Pokémon Cards — Toronto & Waterloo"
- Meta description: "Toronto and Waterloo's trusted Pokémon card specialists. Sell us your collection, find us at events across Ontario, or shop online."
- Open Graph tags for social sharing (use hero artwork as og:image)
- Semantic HTML (proper heading hierarchy, landmarks, alt text)
- Schema.org LocalBusiness structured data

## Performance
- Lazy load images below the fold
- Optimize images (use loading="lazy" attribute)
- Minimal JS — no libraries/frameworks
- Fonts: use display=swap for Google Fonts

## File Structure
```
rotos-website/
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── logo-no-bg.png
│   ├── logo.png
│   ├── hero-artwork.png
│   ├── marketplace-artwork.png
│   ├── origin-story-artwork.png
│   └── sell-cards-artwork.png
├── design-system.md
└── SITE-SPEC.md
```

## IMPORTANT NOTES
- This is a REAL business website, not a demo. Quality matters.
- The form is the #1 priority. Make it easy, inviting, and prominent.
- Do NOT include any Pokémon imagery or official Pokémon branding/IP directly. The artworks provided are fantastical and original.
- The copy should be warm and authentic, not corporate or salesy.
- Test that everything works: smooth scrolling, form validation, responsive layout, animations.
- The site should look like it was designed by a human with taste, not generated by AI.
