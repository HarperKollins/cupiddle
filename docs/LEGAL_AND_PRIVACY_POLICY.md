# Cupiddle — Legal, Privacy, Safety & Community Guidelines

**Effective Date:** November 2026  
**Jurisdiction:** Nigeria (Compliant with the Nigeria Data Protection Act — NDPA 2023) & International Standards  
**Philosophy:** Curiosity is attractive.  
**Commercial Standard:** 100% Free Platform (No paywalled safety, no subscription lockouts)

---

## 1. Terms of Service & Adult Eligibility (18+ Requirement)

Cupiddle is strictly for adults aged 18 and older.

1. **Age Assurance:** All members must provide an authentic date of birth during onboarding. Any account suspected or reported as belonging to an individual under 18 years of age is immediately quarantined and permanently removed following trust & safety review.
2. **Curiosity & Respect:** Cupiddle facilitates intellectual, romantic, and conversational connections through shared ideas, Rabbit Holes, and thoughtful Sparks. Harassment, sexual solicitation, hate speech, spam, and non-consensual explicit material are strictly prohibited.
3. **No Commercial Paywalls:** Cupiddle does not charge users for discovering other members, sending Sparks, messaging mutual connections, or using trust & safety controls.

---

## 2. Privacy Policy & NDPA Compliance

In strict compliance with the Nigeria Data Protection Act (NDPA) and global data protection regulations:

1. **Lawful Basis of Processing:** We collect and process personal data solely to facilitate genuine social discovery, secure authentication, safety moderation, and real-time communication with explicit user consent.
2. **Geographic Coordinate Protection:**
   - Raw GPS coordinates (latitude and longitude) are strictly protected on the backend server.
   - Raw coordinates are **NEVER** exposed in public API responses or visible to other members.
   - The platform calculates approximate distance bands (e.g. "12 km away" or "Lagos") to protect real-time home and workplace privacy.
3. **Audio Introductions & Media:**
   - 30-second audio rants are optional and require explicit recording consent.
   - Audio is never autoplays without user interaction.
4. **Data Subject Rights & Permanent Deletion:**
   - Users retain complete ownership of their data.
   - Members can update, download, or permanently erase their profile, photographs, matches, and chat history instantly through the in-app "Request Account Deletion" control (`DELETE /api/auth/account`).
   - Upon deletion confirmation, user records are immediately purged across database tables in cascading sequence.

---

## 3. Community Guidelines & The Spark Standard

1. **The Spark Rule:** A Spark must reference a genuine piece of content (a Rabbit Hole, a Defend This Take opinion, a Teach Me Something prompt, or a photograph). Senders are encouraged to lead with substantive inquiry rather than superficial greetings.
2. **Rabbit Holes Etiquette:** Discussions in topic spaces (AI, Philosophy, Film, Books, Anime, Gaming) must remain constructive, curious, and welcoming to participants of all experience levels.
3. **Zero Tolerance Violations:** Immediate permanent ban for impersonation, financial scams, harassment, hate speech, or sharing unconsented media.

---

## 4. Trust & Safety Moderation Protocol

1. **Report Workflow:** Every profile, conversation, and community contribution includes a multi-category reporting mechanism (`POST /api/safety/report`).
2. **Staff Console Oversight:** All reports generate immutable case records in the administration dashboard queue. Human moderators review reported content, previous incident history, and decide appropriate sanctions (Official Warning, 7-Day Suspension, or Permanent Ban).
3. **Two-Way Blocking:** Blocking an account (`POST /api/safety/block`) permanently severs discovery visibility, terminates existing matches, and closes active conversations.
