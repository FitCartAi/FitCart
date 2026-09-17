"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { activities, allergyChoices, diets, equipmentChoices, goals, labels, sampleDraft, stepFields, validateDraft, validateStep, type Draft, type Errors, type Field } from "@/lib/profile";
import { useProfile } from "./profile-provider";
import { ProfileSummary } from "./profile-summary";

const steps = ["About you", "Food preferences", "Your grocery budget", "Your kitchen", "Review"];
const descriptions = ["Start with your goal. Sample answers are available for a no-personal-data demo.", "Tell us what belongs on your list and what should stay off it.", "Make room for a plan that works in real life.", "A few optional details to make future plans more practical.", "Check your answers before exploring the prototype."];

function FieldBox({ id, label, error, help, children }: { id: string; label: string; error?: string; help?: string; children: ReactNode }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{children}{help && <p id={`${id}-help`} className="help">{help}</p>}{error && <p id={`${id}-error`} className="field-error">{error}</p>}</div>;
}
export function OnboardingForm() {
  const { draft: d, ready, remember, notice, update, finish, setRemember, clear } = useProfile();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (ready) heading.current?.focus(); }, [step, ready]);
  function set<K extends Field>(key: K, value: Draft[K]) {
    update({ ...d, [key]: value });
    setErrors(prev => ({ ...prev, [key]: undefined }));
    setAcknowledged(false);
  }
  function input(key: Field, label: string, type = "text", help?: string, maxLength?: number) {
    return <FieldBox key={key} id={key} label={label} error={errors[key]} help={help}><input id={key} name={key} type={type} value={d[key] as string} onChange={event => set(key, event.target.value)} maxLength={maxLength ?? 80} inputMode={type === "number" ? "decimal" : undefined} step={type === "number" ? "any" : undefined} autoComplete="off" aria-invalid={!!errors[key]} aria-describedby={[help ? `${key}-help` : "", errors[key] ? `${key}-error` : ""].filter(Boolean).join(" ") || undefined} /></FieldBox>;
  }
  function select(key: Field, label: string, values: readonly string[], placeholder = "Choose an option", help?: string) {
    return <FieldBox key={key} id={key} label={label} error={errors[key]} help={help}><select id={key} value={d[key] as string} onChange={event => set(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={[help ? `${key}-help` : "", errors[key] ? `${key}-error` : ""].filter(Boolean).join(" ") || undefined}><option value="">{placeholder}</option>{values.map(v => <option key={v} value={v}>{labels[v] ?? v}</option>)}</select></FieldBox>;
  }
  function checkGroup(key: "equipment" | "allergens", values: readonly string[], legend: string) {
    return <fieldset className="wide choice-group" id={key} aria-describedby={errors[key] ? `${key}-error` : undefined}><legend>{legend}</legend><div className="check-grid">{values.map(v => <label className="check" key={v}><input type="checkbox" checked={d[key].includes(v)} onChange={e => set(key, e.target.checked ? [...d[key], v] : d[key].filter(x => x !== v))} />{v}</label>)}</div>{errors[key] && <p className="field-error" id={`${key}-error`}>{errors[key]}</p>}</fieldset>;
  }
  function move(next: number) { setStep(next); setErrors({}); setReviewError(""); }
  function submit(e: FormEvent) {
    e.preventDefault();
    const found = step === 4 ? validateDraft(d) : validateStep(d, step);
    if (Object.keys(found).length) {
      setErrors(found);
      if (step === 4) { const first = Object.keys(found)[0] as Field; setStep(stepFields.findIndex(fields => fields.includes(first))); }
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    if (step < 4) { move(step + 1); return; }
    if (!acknowledged) { setReviewError("Please acknowledge the prototype limitations before continuing."); return; }
    finish(); router.push("/plan");
  }
  if (!ready) return <p className="panel" role="status">Opening your questionnaire...</p>;
  return <div className="wizard-layout">
    <aside className="wizard-aside"><p className="eyebrow">BUILD MY CART</p><h1>A little about you.<br />A better starting point.</h1><p>One questionnaire. Four short sections. No account needed.</p><ol className="steps" aria-label="Questionnaire progress">{steps.map((s, i) => <li key={s} aria-current={i === step ? "step" : undefined}><span>{i < step ? "OK" : i + 1}</span>{s}</li>)}</ol><div className="aside-note"><strong>Prototype, not a prescription.</strong><p>We are testing the questions and screens first. No AI recommendations or nutrition targets are generated yet.</p></div></aside>
    <section className="panel wizard-panel">
      <div className="form-top"><span className="eyebrow">STEP {step + 1} OF 5</span><button type="button" className="text-button" onClick={() => { clear(); move(0); setAcknowledged(false); }}>Forget my answers</button></div>
      <progress value={step + 1} max={5} aria-label="Onboarding progress" />
      <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2><p className="muted">{descriptions[step]}</p>
      {step === 0 && <button className="button secondary sample-button" type="button" onClick={() => { update(sampleDraft()); setErrors({}); }}>Use sample answers</button>}
      <form noValidate onSubmit={submit}>
        {Object.values(errors).some(Boolean) && <div className="notice error" role="alert">Please check the highlighted fields. Your other answers have been kept.</div>}
        {step === 0 && <div className="fields">
          {input("nickname", "First name or nickname", "text", "A nickname is fine. Please do not enter your full legal name.", 40)}
          {select("goal", "Primary goal", goals)}
          {input("age", "Age", "number", "The initial prototype is for adults 18 and older.")}
          {select("sex", "Sex", ["female", "male", "prefer_not_to_say"], "Choose an option", "Reserved for future planning estimates. No targets are calculated in this version.")}
          {select("activity", "Activity level", activities)}
          {select("heightUnit", "Height units", ["imperial", "cm"])}
          {d.heightUnit === "cm" ? input("heightCm", "Height (cm)", "number") : <>{input("feet", "Height (feet)", "number")}{input("inches", "Height (inches)", "number")}</>}
          {input("weight", "Weight", "number")}{select("weightUnit", "Weight units", ["lb", "kg"])}
        </div>}
        {step === 1 && <div className="fields">
          {select("diet", "Dietary preference", diets)}
          <div className="wide"><fieldset className="choice-group"><legend>Any food allergies?</legend><div className="check-grid">{["no", "yes"].map(v => <label className="check" key={v}><input type="radio" name="allergyStatus" value={v} checked={d.allergyStatus === v} onChange={() => { update({ ...d, allergyStatus: v, allergens: v === "no" ? [] : d.allergens, otherAllergies: v === "no" ? "" : d.otherAllergies }); setErrors(prev => ({ ...prev, allergyStatus: undefined, allergens: undefined })); }} aria-invalid={!!errors.allergyStatus} aria-describedby={errors.allergyStatus ? "allergyStatus-error" : undefined} />{v === "no" ? "None to report" : "Yes"}</label>)}</div>{errors.allergyStatus && <p id="allergyStatus-error" className="field-error">{errors.allergyStatus}</p>}</fieldset></div>
          {d.allergyStatus === "yes" && <>{checkGroup("allergens", allergyChoices, "Select reported allergies")}{input("otherAllergies", "Other allergies (optional)", "text", "Separate entries with commas. This form records allergies; the sample plan is not allergy-screened.", 300)}</>}
          {input("restrictions", d.diet === "other" ? "Describe your dietary restrictions" : "Other dietary restrictions (optional)", "text", "For example, gluten-free. Avoid entering medical history.", 300)}
          {input("dislikes", "Foods you dislike (optional)", "text", "Separate foods with commas, such as mushrooms, olives.", 300)}
          <p className="notice wide">Allergies and restrictions are collected for future development. Do not use the fixed demo as a safe or personalized eating plan.</p>
        </div>}
        {step === 2 && <div className="fields">
          {input("budget", "Weekly grocery budget (USD)", "number", "Your total grocery budget for a full week, for everyone included below.")}
          {select("days", "Days to plan", ["1", "2", "3", "4", "5", "6", "7"], "Choose days", "Fewer days will not automatically prorate your weekly budget in this prototype.")}
          {select("meals", "Meals per day", ["1", "2", "3", "4"])}{select("people", "People being fed", ["1", "2", "3", "4", "5", "6"])}
          {input("store", "Preferred grocery store (optional)", "text", "Preference only. We do not have live store pricing or inventory.")}
          {input("location", "City or ZIP code (optional)", "text", "No street address or device-location access needed.")}
        </div>}
        {step === 3 && <div className="fields">
          {select("skill", "Cooking skill", ["beginner", "intermediate", "experienced"])}
          {select("minutes", "Minutes available per meal", ["10", "20", "30", "45", "60"])}
          {select("mealPrep", "Happy to repeat meals / meal prep?", ["yes", "no", "flexible"])}
          {checkGroup("equipment", equipmentChoices, "Kitchen equipment (optional)")}
          {input("favorites", "Favorite foods or cuisines (optional)", "text", "For example, tacos, spicy food, chicken.", 300)}
        </div>}
        {step === 4 && <><ProfileSummary draft={d} /><div className="review-edit">{steps.slice(0, 4).map((s, i) => <button className="text-button" type="button" key={s} onClick={() => move(i)}>Edit {s.toLowerCase()}</button>)}</div><label className="check consent"><input type="checkbox" checked={acknowledged} onChange={e => { setAcknowledged(e.target.checked); setReviewError(""); }} />I understand this is a prototype, not a personalized meal plan or medical advice.</label>{reviewError && <p role="alert" className="field-error">{reviewError}</p>}</>}
        <div className="privacy-box"><label className="check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Remember my answers in this browser tab</label><p className="help">Off by default. Without it, refreshing clears your answers. When enabled, answers use session storage, not a FitCart account. Browser session restore may retain them; use Forget my answers on shared computers. This version does not send form answers to a server.</p>{notice && <p className="field-error" role="status">{notice}</p>}</div>
        <div className="form-actions">{step > 0 ? <button className="button secondary" type="button" onClick={() => move(step - 1)}>Back</button> : <span />}<button className="button primary" type="submit">{step === 4 ? "Save and continue" : "Continue"}<span aria-hidden="true"> &rarr;</span></button></div>
      </form>
    </section>
  </div>;
}
