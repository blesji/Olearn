# Senior User Pilot Study Protocol & Usability Evaluation — OLearn

## 1. Study Objective & Ethical Framework

### 1.1 Objective
The objective of this pilot study is to evaluate the usability, learning efficacy, and emotional comfort of OLearn among senior citizens and digitally inexperienced adults in India. Specifically, it assesses whether elderly learners can independently navigate simulated WhatsApp and Google Pay workflows using voice narration and single-action visual guidance without experiencing technological anxiety.

### 1.2 Ethical Consent & Safety Briefing
Prior to beginning any evaluation session, the facilitator must conduct an explicit, plain-language consent briefing in the participant's preferred language (English, Hindi, or Malayalam):
1. **Fictional & Simulated Environment**: Explicitly reassure the participant:
   *"This phone is running practice training. The WhatsApp and Google Pay apps you see are safe practice copies. No real money can ever be sent or received, and no real bank account is connected."*
2. **Voluntary Participation & Right to Stop**: Participants are informed that they may pause, take a break, or stop the session at any time without providing a reason.
3. **Evaluation of Software, Not the Learner**: Reassure the participant:
   *"We are testing the application to see where it is confusing or difficult to use. You cannot make a mistake. Any difficulty you encounter is a flaw in our software that we need to fix."*
4. **Data Privacy**: All observations and timing metrics are recorded using anonymized participant identifiers (`P01`, `P02`, etc.). No personal phone numbers, real banking info, or audio/video recordings are made without separate written consent.

---

## 2. Participant Cohort & Sampling Plan

| Cohort Dimension | Pilot Specification | Rationale |
|---|---|---|
| **Target Sample Size** | $N = 6$ participants (small exploratory qualitative pilot) | Sufficient to discover 80%+ of high-severity usability defects (Nielsen Norman Group). |
| **Age Range** | 62 to 78 years old | Represents core senior demographic with presbyopia and reduced digital fluency. |
| **Language Preferences** | 2 English, 2 Hindi, 2 Malayalam | Ensures trilingual evaluation across all supported voice narration tracks. |
| **Smartphone Experience** | Basic call/SMS only; no prior independent use of UPI payments. | Focuses on digitally inexperienced non-expert learners. |

---

## 3. Representative Pilot Task Battery

Participants are asked to complete **6 representative tasks** covering both communication and financial domains:

| Task # | Task ID | Core Activity | Success Criteria |
|---|---|---|---|
| **T1** | `whatsapp_send_text` | Send a text message | Types text and taps send arrow; outgoing bubble appears. |
| **T2** | `whatsapp_send_photo` | Select and send a photo | Opens attachment sheet, selects photo, taps send arrow. |
| **T3** | `whatsapp_voice_call` | Start and end a voice call | Taps phone icon, confirms call, taps red End Call button. |
| **T4** | `gpay_check_balance` | Check bank account balance | Navigates to balance, enters mock PIN, reads ₹14,250 balance. |
| **T5** | `gpay_scan_qr` | Scan shop QR & complete payment | Aligns viewfinder, proceeds to pay ₹200, enters mock PIN. |
| **T6** | `gpay_transaction_history` | View a past transaction receipt | Opens history list, taps top transaction, reviews receipt. |

---

## 4. Observation Protocol (Non-Coaching Methodology)

### 4.1 First Attempt: Pure Independent Execution
During the initial attempt at each task, the observer **must remain silent and avoid coaching or intervening**. The participant is allowed to follow the voice narration and screen highlights at their own pace.

### 4.2 Standardized Observation Sheet Template

```markdown
### Participant Identifier: [ e.g. P01 ]
- **Age**: [ e.g. 68 ] | **Gender**: [ M/F ] | **Preferred Language**: [ EN / HI / ML ]
- **Device Used**: [ e.g. Samsung Galaxy A14 (Android 13) ]

| Task | Independent Completion? | Assistance Needed? | Wrong Tap Count | Hesitation Steps (>5s) | Narration Understood? | Recovery After Mistake? |
|---|---|---|---|---|---|---|
| T1 (Text) | [ Yes / No ] | [ None / Verbal / Physical ] | [ # ] | [ Step # ] | [ Yes / Partial / No ] | [ Immediate / Confused ] |
| T2 (Photo) | [ Yes / No ] | [ None / Verbal / Physical ] | [ # ] | [ Step # ] | [ Yes / Partial / No ] | [ Immediate / Confused ] |
| T3 (Call) | [ Yes / No ] | [ None / Verbal / Physical ] | [ # ] | [ Step # ] | [ Yes / Partial / No ] | [ Immediate / Confused ] |
| T4 (Balance)| [ Yes / No ] | [ None / Verbal / Physical ] | [ # ] | [ Step # ] | [ Yes / Partial / No ] | [ Immediate / Confused ] |
| T5 (QR Pay) | [ Yes / No ] | [ None / Verbal / Physical ] | [ # ] | [ Step # ] | [ Yes / Partial / No ] | [ Immediate / Confused ] |
| T6 (Receipt)| [ Yes / No ] | [ None / Verbal / Physical ] | [ # ] | [ Step # ] | [ Yes / Partial / No ] | [ Immediate / Confused ] |
```

---

## 5. Quantitative & Qualitative Metrics Definition

1. **Task Completion Rate (TCR)**: Percentage of tasks completed to the end screen (with or without assistance):
   $$\text{TCR} = \frac{\text{Completed Tasks}}{\text{Total Assigned Tasks}} \times 100\%$$
2. **Independent Completion Rate (ICR)**: Percentage of tasks completed with **zero** verbal or physical intervention from the observer:
   $$\text{ICR} = \frac{\text{Independently Completed Tasks}}{\text{Total Assigned Tasks}} \times 100\%$$
3. **Assistance Frequency**: Average number of observer interventions per task.
4. **Wrong Tap Rate**: Frequency of taps landing on inactive areas per step.
5. **Defect Severity Triage**:
   - **Severity 1 (Blocker)**: Learner cannot advance or software freezes/crashes.
   - **Severity 2 (High Risk / Anxiety)**: Learner expresses fear that real money was deducted or that they damaged their device.
   - **Severity 3 (Usability Friction)**: Learner misinterprets instruction text or misses the highlighted button for $> 10$ seconds.
   - **Severity 4 (Cosmetic)**: Minor visual misalignment or voice inflection feedback.

---

## 6. Pilot Execution Status & Recommendations

> [!NOTE]
> This protocol establishes the verified operational framework for OLearn field testing.
> Automated simulation tests across all 6 representative tasks (`nineTutorials.test.tsx`) show 100% deterministic completion.
> When conducting on-site field sessions with senior participants, observers should strictly follow the non-coaching guidelines in Section 4 and record findings in the standardized observation tables above.
