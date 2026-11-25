# Values still to supply

Do not commit secrets. Public contact details are fine once the club approves them.
Find every spot to fill by searching `src/index.html` for `to be completed` (it is rendered from the `TODO` constant) and for `SITE_URL`.

| Value | Where it goes in `src/index.html` |
|---|---|
| `SITE_URL` (final site URL, no trailing slash) | Replace the text `SITE_URL` in: canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD (`url`, `logo`); also in `src/sitemap.xml`, `src/robots.txt`, `src/404.html`. Already done for the free Pages URL; redo when a custom domain is connected. |
| `GA_ID` (GA4 measurement ID, `G-XXXXXXXXXX`) | `var GA_ID='';` in the first `<script>` block (near the Analytics snippet). Empty means analytics is off. |
| Official club e-mail | Contact page, item `['E-mail','Official club e-mail'+TODO,'']`; also `LEGAL_C` (legal notice) and the FAQ text "the official club e-mail is coming soon". |
| WhatsApp number | Contact page, item `['WhatsApp','Club number'+TODO,'']`. |
| LinkedIn link | Contact page, item `['Social','Instagram @lcs.fegf · LinkedIn'+TODO,'']`. |
| Facebook, TikTok, YouTube links | Not present yet. Add alongside the Instagram links (nav icon, mobile menu, contact page) and to `sameAs` in the JSON-LD block in `<head>`. |
| Partner logos | Partners page (`#partenaires`), the `.logos` placeholder grid. |
| Photos and reels | `type:'ph'` placeholder items such as `'Photo · Workshop'` and `'Reel · Aftermovie'` (Club life, Events and Actualités pages), plus the event image placeholders (`et-img`). |
| Member quotes / testimonials | Placeholder "Member testimonials" card on the members area page; no real quotes exist yet. |
| Members portal | The sign-in form is a front-end preview only (shows "portal opens soon"). Real authentication is out of scope. |
