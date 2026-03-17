# Buyer Survey — First-Time Homebuyer Intake Flow

Multi-step form organized into 9 sections. Each screen has 2-4 related questions.
Conditional logic is noted inline — questions only appear when relevant.

---

## Section 1: About You

- How old are you?
- Are you buying on your own or with someone else?
  - *If "with someone else":* What's your relationship to them? *(Married / Family member / Other)*

---

## Section 2: Your Income

- What's your gross annual income?
- How do you earn it? *(Salaried / Hourly / Commission / Self-employed / Combination)*
  - *If Combination:* How much from each source?
  - *If Self-employed:* Have you filed taxes as self-employed for 2+ years? *(Yes / No / Under 2 years)*
  - *If any type:* Have you changed jobs or industries in the past 2 years? *(Yes / No)*
- Any other income to report? *(rental, alimony, disability, investments)* — if yes, amount
- *[If co-buyer]:* Co-buyer's gross annual income and income type?

---

## Section 3: Your Finances

- How much do you have saved to put toward a home?
- What are your total assets? *(savings, investments, retirement accounts — rough estimate is fine)*
  - *Note shown to user: We'll recommend how to deploy these toward your down payment while keeping a healthy cash cushion.*
- Any large expenses coming up in the next 12 months that would reduce your savings?

---

## Section 4: Credit & Debt

- What's your approximate credit score? *(Below 580 / 580-619 / 620-659 / 660-699 / 700-739 / 740+)*
- *[If co-buyer]:* What's your co-buyer's approximate credit score? *(same ranges)*
- Any credit dings in the past few years? *(missed payments, collections, bankruptcy, foreclosure)* — if yes, brief free text
- What are your total monthly debt payments across all loans and cards? *($____/mo)*

---

## Section 5: Budget & Timeline

- What's the maximum purchase price you have in mind?
  - *Note shown to user: We'll also calculate a recommended range based on your income and debt.*
- What state are you planning to buy in?
  - *[Used internally to surface down payment assistance programs — not shown as an explicit question]*
- When are you hoping to move in? *(ASAP / 3-6 months / 6-12 months / 1-2 years / Just exploring)*
- Any major life events on the horizon that could affect your plans? *(new job, baby, marriage, relocation)* — if yes, brief free text

---

## Section 6: Your Goals

- What's your main motivation for buying? *(multi-select chips: Build wealth / Stop paying rent / More space / Stability / Investment / Other)*
- What matters more to you right now — building equity as fast as possible, or keeping your monthly payment low? *(Equity / Low payment / Both equally)*
- How long do you plan to stay in this home? *(2-3 years / 3-5 years / 5-10 years / Long-term / Not sure)*
- Are you thinking of this as a starter home or a long-term home? *(Starter / Long-term / Not sure)*
- Would you consider house hacking — buying a duplex or small multi-unit, living in one unit, and renting the others to offset your mortgage? *(Yes, interested / Maybe / No / What's that?)*
  - *If "What's that?":* Show short explanation before they answer.

---

## Section 7: The Home

- Do you have a property type preference, or are you open to anything? *(Single-family / Condo / Townhouse / Multi-unit / Open to anything)*
- How many bedrooms do you need? How many bathrooms?
- Are you willing to buy a home that needs renovation? *(Yes / No / Depends on how much)*
- Do you have target areas in mind, or are you flexible? *(Structured input: user enters one or more city/state pairs or zip codes — or selects "Open / Flexible". Store as structured data, not free text — required for downstream features like pre-filled property search links.)*
- Are there hard geographic constraints on where you can buy? *(job location, family, school district)* — if yes, brief free text
- Does school district quality matter in your decision? *(Yes / No / Will matter in the future)*
- What kind of neighborhood feel are you looking for? *(Urban / Suburban / Quiet-rural / Doesn't matter)*

---

## Section 8: Mindset & Readiness

- *[If co-buyer]:* How aligned is your co-buyer on this decision? *(Fully aligned / Mostly aligned / Still working through it)*
- What concerns or fears do you have about buying? *(multi-select chip cloud — pre-populated options below, plus free text option)*
  - Overpaying for a home
  - Not qualifying for a mortgage
  - Picking the wrong location
  - Being house-poor after buying
  - The market dropping after I buy
  - Not understanding the process
  - Draining my savings
  - Other *(free text)*
- How familiar are you with the mortgage process? *(1 = totally new / 5 = very familiar)*
- Do you currently have a real estate agent? *(Yes / No / Interviewing a few)*
- Is there anything specific about the homebuying process you feel like you don't understand yet? *(optional free text)*

---

## Section 9: Special Situations

> Check anything that applies to you — these may open up special loan programs or resources:

- [ ] I am a veteran or active military
- [ ] I am a teacher, nurse, firefighter, first responder, or other public servant
- [ ] I would be buying in a rural area
- [ ] I have had a prior foreclosure or bankruptcy
- [ ] None of these apply

---

## Automated / Calculated Fields (Never Asked Directly)

| Field | How it's determined |
|---|---|
| Below 80% AMI eligibility | Calculated from income + target state |
| Available DPA programs | Pulled by state/county from program database |
| Recommended max purchase price | Calculated from DTI (targeting under 43-50%) |
| Recommended down payment vs. cash reserve split | Based on total assets and monthly obligations |

---

## Estimated Completion Times

| User type | Screens | Est. time |
|---|---|---|
| Simple (solo, salaried, clear goals) | ~7 sections | ~2 min |
| Moderate (co-buyer, some complexity) | ~8 sections | ~3 min |
| Complex (self-employed, co-buyer, special situations) | All 9 sections | ~4-5 min |
