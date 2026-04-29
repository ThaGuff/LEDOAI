# LEDO AI — Go-To-Market Playbook

## The Pitch (30-Second Version)

> "Your business misses calls every day. LEDO AI answers every single one — 24/7 — books appointments, captures leads, and texts you a summary. Setup takes 5 minutes."

**Don't sell "AI voice software." Sell outcomes:**
- Missed-call recovery
- Appointment booking on autopilot
- After-hours answering
- Lead capture while you sleep
- Live transfer when it matters

---

## Pricing Strategy

| Plan | Price | Minutes | Best For |
|---|---|---|---|
| **Starter** | $49/mo | 250 min | Solo practitioners, freelancers |
| **Professional** | $149/mo | 1,000 min | Small businesses (2-20 employees) |
| **Business** | $349/mo | 5,000 min | Multi-location, high call volume |
| **Enterprise** | Custom | Unlimited | Franchises, agencies |

**Positioning:** At $149/mo, if LEDO AI books even ONE appointment per month that would have been missed, it pays for itself. Most businesses see 10-40+ bookings/month.

**Upsells:**
- Additional minutes ($0.05/min overage)
- Extra phone numbers (+$10/mo each)
- Custom AI voice (ElevenLabs clone) (+$49/mo)
- White-label for agencies (+$199/mo)
- API access (+$99/mo)

---

## Target Verticals (Start Here)

These businesses have high call volume, strong appointment needs, and clear ROI:

1. **Dental / Medical / Chiropractic** — After-hours answering + appointment booking
2. **Law Firms** — Intake capture, never miss a hot lead
3. **Home Services** (plumbing, HVAC, roofing) — After-hours emergency capture
4. **Real Estate** — Lead capture from property inquiries 24/7
5. **Beauty / Salons / Spas** — Booking automation
6. **Restaurants** — Reservation handling, directions/hours FAQ
7. **Auto Repair / Dealerships** — Appointment + FAQ handling

**Why these?** High inbound call volume + high cost of missed calls + strong ROI story.

---

## Customer Acquisition Channels

### 1. Cold Outreach (Fastest ROI)
- Target local businesses with `>50 Google reviews` but `<4.5 stars` (often have missed-call complaints)
- Use Apollo.io or Clay for lead lists
- Sequence: LinkedIn DM → Email → Call
- Offer: "Free 30-day trial, I'll set it up for you"
- Expected: 2-5% conversion on 500-contact lists

**Cold email template:**
```
Subject: Your phone is ringing (and no one's answering)

Hi [Name],

Checked your Google reviews — a few customers mentioned leaving voicemails that never got returned.

LEDO AI answers every call instantly, books appointments, and texts you a summary. Takes 5 minutes to set up.

Want to see a demo? I'll do a free 30-day trial for [Business Name].

[Your name]
```

### 2. Agency Channel (Leverage & Scale)
- Partner with marketing agencies that serve SMBs
- Offer 30-40% referral commission or white-label resell
- Target: SEO agencies, Facebook ad agencies, web design studios
- They already have the client relationships

### 3. Content Marketing (Compound Growth)
- Write SEO content targeting: "answering service for [vertical]"
- "dental after-hours answering service"
- "law firm AI receptionist"
- "24/7 answering service for plumbers"
- YouTube: "I used AI to answer my business calls for 30 days"

### 4. Google Ads (Direct ROI)
- Keywords: "business answering service," "virtual receptionist," "missed call AI"
- Landing pages per vertical (dental, legal, home services)
- Target CPCs: $3-8 (convert at $49-149/mo = strong LTV)

### 5. AppSumo / Lifetime Deal Launch
- Launch a lifetime deal ($297 one-time) to generate initial users + reviews
- Use the cash to fund growth and get social proof
- Graduate LTD users to monthly plans as you add features

---

## Sales Process

### Inbound Lead Flow
1. Visitor hits ledo.ai → lands on pricing
2. Signs up for 14-day free trial (no CC)
3. Onboarding wizard: business name → phone setup → FAQs
4. Email sequence: tips, use cases, social proof
5. Day 12: upgrade email with 20% discount for annual plan

### Demo Call Flow (Outbound)
1. Show the live demo: call the demo number, watch it answer
2. Ask: "How many calls do you miss per week?"
3. "What would one missed appointment cost you?"
4. "LEDO AI pays for itself if it books one appointment per month"
5. Start trial on the call, configure their phone number live

---

## First 90 Days Milestones

**Month 1:** 10 paying customers (friends, referrals, cold outreach)
- Validate pricing, onboarding, and product

**Month 2:** 50 customers
- Launch agency channel
- First case studies/testimonials
- Google Ads test ($500 budget)

**Month 3:** 150 customers ($15,000-$22,000 MRR)
- Hire first customer success rep
- Launch vertical landing pages
- AppSumo deal if needed

**Year 1 Target:** 500 customers = $75,000-$100,000 MRR

---

## Key Metrics to Track

- **MRR** — Monthly recurring revenue
- **Churn rate** — Target <3%/month
- **CAC** — Customer acquisition cost (target <$200)
- **LTV** — Customer lifetime value (at $149/mo, 18-month avg = $2,682)
- **LTV:CAC ratio** — Target >3:1
- **Calls answered** — Core product metric
- **Appointments booked** — Core value metric

---

## Competitive Positioning

| Competitor | Price | LEDO Advantage |
|---|---|---|
| Ruby Receptionist | $235-$1,000/mo | 5x cheaper, instant setup |
| Goodcall | $49-$299/mo | More AI, better dashboard |
| Smith.ai | $140-$700/mo | Lower price, no human agents (which is the point) |
| Answering services | $50-$500/mo | Always on, no hold times, instant setup |

**Your moat:** AI that actually understands context + appointment booking + CRM sync + SMS summaries in one product.

---

## Launch Checklist

- [ ] Connect custom domain `ledo.ai` to Railway
- [ ] Configure Twilio account + buy demo number
- [ ] Add OpenAI API key
- [ ] Configure SendGrid for email notifications
- [ ] Set up HubSpot integration
- [ ] Configure Google OAuth for sign-in
- [ ] Set `NEXTAUTH_SECRET` to a strong random value
- [ ] Test full call flow end-to-end
- [ ] Record a demo video (Loom)
- [ ] Set up Stripe for billing (recommended: Stripe Billing)
- [ ] Create 5 vertical landing pages
- [ ] Build outreach list of 500 target businesses
- [ ] Launch ProductHunt + AppSumo

---

## Adding Stripe Billing (Next Step)

Install: `pnpm add stripe @stripe/stripe-js`

Create products in Stripe:
- Starter: $49/mo
- Professional: $149/mo
- Business: $349/mo

Add to `apps/web/src/app/api/billing/` routes for:
- `/checkout` — create Stripe checkout session
- `/portal` — Stripe customer portal for self-serve billing
- `/webhook` — Stripe webhook for subscription events

This is the #1 next feature to implement after launch.
