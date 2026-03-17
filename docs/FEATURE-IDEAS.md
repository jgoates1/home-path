# Feature Ideas

Backlog of product ideas to revisit when building.

---

## Pre-Filled Property Search Link

**Status:** Not started
**Effort:** Low

After a buyer completes the survey, use their target zip codes/cities, max purchase price, and bed/bath preferences to generate a pre-built Zillow search URL. Present it as a one-click button — "Browse homes in your target area" — that drops them directly into a filtered search.

**Why:** Gets the buyer into a real search immediately without extra steps. Zillow search URLs are structured and support filters for location, price range, beds, baths, and home type.

**URL structure:**
```
https://www.zillow.com/homes/for_sale/<ZIP>_rb/<MIN>-<MAX>_price/<BEDS>_beds/
```

Multiple zip codes can be comma-separated or handled as separate links. Price range comes from `financial_metrics.down_payment_amount` + qualifying loan amount. Beds/baths come from the survey.

**Implementation notes:**
- Target areas field in the survey must be stored as structured data (zip codes or city/state pairs), not free text
- Build the URL server-side after plan generation
- Surface it on the dashboard alongside the plan — not buried
- Consider also generating a Realtor.com equivalent link as a secondary option: `https://www.realtor.com/realestateandhomes-search/<CITY_STATE>/`

**Follow-on:** If this gets traction, explore building native in-app listing alerts using a property data API (ATTOM, Bridge Interactive, or Rentcast) so buyers don't have to leave HomePath.
