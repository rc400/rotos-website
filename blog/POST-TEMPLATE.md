# Blog Post Template Guide

Quick reference for authoring the next ROTO's blog post. Copy an existing post file and swap the pieces below.

## 1. Create the file

Path: `blog/posts/<slug>.html`
- **Slug rules:** lowercase, hyphenated, keyword-forward (e.g., `psa-vs-cgc-for-modern-slabs`)
- Copy `blog/posts/uniform-toploaders-sleeves-vendor-tip.html` as your starting point and rename it.

## 2. Fields to update in `<head>`

Search and replace these values in the new file:

| Field | Where | Notes |
| --- | --- | --- |
| `<title>` | `<head>` | Under 60 chars ideal. Format: `<Post Title> \| ROTO's TCG` |
| `<meta name="description">` | `<head>` | Under 160 chars. This is what shows up in Google search results. |
| `og:title`, `og:description`, `twitter:title`, `twitter:description` | `<head>` | Match `<title>` / meta description. |
| `og:url`, `canonical` href | `<head>` | Full URL: `https://rotostcg.ca/blog/posts/<slug>.html` |
| `article:published_time` | `<head>` | ISO date, e.g. `2026-08-01` |
| BlogPosting JSON-LD | `<head>` | Update `headline`, `description`, `datePublished`, `dateModified`, `mainEntityOfPage.@id`, `articleSection` |
| BreadcrumbList JSON-LD | `<head>` | Update the third `ListItem.name` to the new post title |

## 3. Fields to update in `<body>`

- Breadcrumb final `<span aria-current="page">` → post title
- `.post-category` → category name (e.g. "Vendor Tips", "Buying Guides", "Storage")
- `<h1 class="post-title">` → post title
- `.post-subhead` → one-line lede
- `.post-meta` → publish date (both the human string and the `datetime` attribute) and read time
- Body copy inside `.post-body > .post-shell`

The **affiliate disclosure banner** stays exactly as-is on every post. Do not rewrite it.

## 4. Body content structure

- Use `<h2>` for main sections, `<h3>` for sub-points
- `<blockquote>` for pull-quotes (burnt orange left border, cream tinted bg)
- Inline product mentions: use `<a class="inline-cta">` with the same `rel` and `target` attributes as the product cards
- Keep paragraphs tight — every one earns its spot
- Voice: direct, warm, spoken-from-experience. No "In today's fast-paced world." No listicle vibes.

## 5. Product cards

Full product card block — drop into the body wherever it fits the flow.

```html
<aside class="product-card" data-product="SLUG-HERE">
  <div class="product-card__body">
    <p class="product-card__eyebrow">Recommended</p>
    <h3 class="product-card__title">PRODUCT TITLE</h3>
    <p class="product-card__pitch">One-line pitch — why we use it.</p>
  </div>
  <div class="product-card__actions">
    <a class="product-card__btn product-card__btn--primary"
       href="https://amzn.to/CA_SHORTLINK"
       rel="sponsored nofollow noopener"
       target="_blank"
       data-affiliate-region="CA">
      <span class="flag" aria-hidden="true">🇨🇦</span>
      Buy on Amazon.ca
    </a>
    <a class="product-card__btn product-card__btn--secondary"
       href="https://amzn.to/US_SHORTLINK"
       rel="sponsored nofollow noopener"
       target="_blank"
       data-affiliate-region="US">
      <span class="flag" aria-hidden="true">🇺🇸</span>
      Buy on Amazon.com
    </a>
  </div>
</aside>
```

### Non-negotiable rules on affiliate anchors

- **`rel="sponsored nofollow noopener"`** on every affiliate link. Required by Amazon Associates and Google. Do not omit any of the three values.
- **`target="_blank"`** on every affiliate link.
- Flag emoji only inside a `<span class="flag" aria-hidden="true">` — never in body copy or headings.
- Don't add tracking JS. Amazon handles reporting via the tag baked into the shortlink.

## 6. Affiliate link formats

Ron supplies affiliate links from Amazon SiteStripe as short links:

- Canadian: `https://amzn.to/XXXXXXX` (bound to `kipscollectin-20`)
- US: `https://amzn.to/XXXXXXX` (bound to `rotostcg-20`)

Drop the exact short link Ron sends into the `href`. Do not rewrite them to direct `amazon.ca/dp/ASIN` format unless Ron asks — the short links already carry the correct tag.

If a link is missing for a region at publish time, leave a placeholder `href="CA_LINK_TODO"` or `href="US_LINK_TODO"` and flag it in the commit message so it doesn't ship live.

## 7. Inline mini-CTAs

For mid-paragraph product mentions:

```html
We use
<a class="inline-cta"
   href="https://amzn.to/CA_SHORTLINK"
   rel="sponsored nofollow noopener"
   target="_blank"
   data-affiliate-region="CA">
  Ultra Pro's 2,000-pack
</a>
for exactly this reason.
```

The `→` glyph is added automatically via CSS `::after` — do not include it in the anchor text.

## 8. Closing CTA

Keep the dark closing CTA block at the end of every post. Change the headline/subcopy if the post's tone calls for a different angle, but always link to `../../index.html#sell` — that's the money page.

## 9. After publishing

1. Add a new `.post-card` to `blog/index.html` at the top of the `.post-grid`
2. Update the `blogPost` array in `blog/index.html`'s Blog JSON-LD
3. Add a new `<url>` entry to `/sitemap.xml`
4. If there are now 2+ posts, uncomment / add a "Keep reading" related posts section at the end of each post

## 10. Verification checklist

- [ ] Renders without console errors
- [ ] All affiliate anchors have `rel="sponsored nofollow noopener"` and `target="_blank"`
- [ ] Disclosure banner present under article header
- [ ] BlogPosting + BreadcrumbList JSON-LD present in `<head>`
- [ ] Canonical URL matches file path
- [ ] Sitemap updated
- [ ] Blog index card added
- [ ] Buttons stack on mobile (< 560px) and are side-by-side above that
