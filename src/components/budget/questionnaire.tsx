'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { allergens, appliances, fieldsByStep, labels, sampleDraft, steps, stores, updateAppliance, validateStep, withoutNutrition, type Draft, type Errors, type Field } from '@/lib/v2/profile';
import { useBudget } from './provider';
import { BudgetSummary } from './summary';

export function BudgetQuestionnaire() {
  const { draft: d, ready, update, finish, remember, setRemember, clear, notice } = useBudget();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [ack, setAck] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const pendingFocus = useRef<Field | null>(null);
  const router = useRouter();
  useEffect(() => { if (ready) heading.current?.focus(); }, [ready, step]);
  useEffect(() => {
    if (!pendingFocus.current) return;
    const target = form.current?.querySelector<HTMLElement>(`[data-field="${pendingFocus.current}"]`);
    (target?.matches('input,select,textarea') ? target : target?.querySelector<HTMLElement>('input,select,textarea'))?.focus();
    pendingFocus.current = null;
  }, [errors, step]);
  function set<K extends Field>(key: K, value: Draft[K]) {
    update({ ...d, [key]: value });
    setErrors(previous => ({ ...previous, [key]: undefined }));
    setAck(false);
  }
  function go(next: number) { setStep(next); setErrors({}); setReviewError(''); }
  function field(key: Field, label: string, control: ReactNode, help?: string) {
    return <div className="field" key={key}><label htmlFor={`v2-${key}`}>{label}</label>{control}{help && <p className="help" id={`help-${key}`}>{help}</p>}{errors[key] && <p className="field-error" id={`error-${key}`}>{errors[key]}</p>}</div>;
  }
  function attrs(key: Field, help?: string) {
    return { id: `v2-${key}`, 'data-field': key, 'aria-invalid': !!errors[key], 'aria-describedby': [help ? `help-${key}` : '', errors[key] ? `error-${key}` : ''].filter(Boolean).join(' ') || undefined };
  }
  function input(key: Field, label: string, help?: string, numeric = false) {
    return field(key, label, <input {...attrs(key, help)} type="text" inputMode={numeric ? 'decimal' : 'text'} value={d[key] as string} onChange={e => set(key, e.target.value)} maxLength={numeric ? 12 : 300} autoComplete="off" />, help);
  }
  function select(key: Field, label: string, values: string[], help?: string) {
    return field(key, label, <select {...attrs(key, help)} value={d[key] as string} onChange={e => set(key, e.target.value)}><option value="">Choose an option</option>{values.map(v => <option key={v} value={v}>{labels[v] ?? v}</option>)}</select>, help);
  }
  function radio(key: Field, legend: string, values: [string, string, string][]) {
    return <fieldset className="choice-group v2-options wide" data-field={key}><legend>{legend}</legend>{values.map(([value, title, hint]) => <label className="v2-option" key={value}><input type="radio" name={`v2-${key}`} value={value} checked={d[key] === value} onChange={() => set(key, value as Draft[Field])} /><span><strong>{title}</strong><small>{hint}</small></span></label>)}{errors[key] && <p className="field-error">{errors[key]}</p>}</fieldset>;
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateStep(d, step);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0] as Field;
      pendingFocus.current = first;
      setErrors(found);
      if (step === 5) setStep(fieldsByStep.findIndex(keys => keys.includes(first)));
      return;
    }
    if (step < 5) { go(step + 1); return; }
    if (!ack) { setReviewError('Please acknowledge the sample-data limitations.'); return; }
    if (finish()) router.push('/cart');
  }
  if (!ready) return <p role="status">Opening your budget questionnaire...</p>;
  return <div className="wizard-layout v2-wizard">
    <aside className="wizard-aside"><p className="eyebrow">YOUR BUDGET COMES FIRST</p><h1>A smarter starting point for your next shop.</h1><p>No account or fitness details required.</p><ol className="steps" aria-label="Budget questionnaire progress">{steps.map((title, i) => <li key={title} aria-current={i === step ? 'step' : undefined}><span>{i < step ? 'OK' : i + 1}</span>{title}</li>)}</ol><div className="aside-note">V2A tests the budget workflow. Store prices are invented; this is not a live shopping service.</div></aside>
    <section className="panel wizard-panel">
      <div className="form-top"><span className="eyebrow">STEP {step + 1} OF 6</span><button type="button" className="text-button" onClick={() => { clear(); go(0); setAck(false); }}>Clear V2 answers</button></div>
      <progress value={step + 1} max={6} aria-label="Budget setup progress" />
      <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
      {step === 0 && <><p className="muted">Start with the amount you want to spend, not your body measurements.</p><button type="button" className="button secondary sample-button" onClick={() => { update(sampleDraft()); setErrors({}); setAck(false); }}>Use sample answers</button></>}
      <form ref={form} aria-label="Budget questionnaire" noValidate onSubmit={submit}>
        {Object.values(errors).some(Boolean) && <div className="notice error" role="alert" aria-label="Budget questionnaire errors">Please correct the highlighted answers. Your other answers are still here.</div>}
        {step === 0 && <div className="fields">
          {radio('budgetStyle', 'How should we handle your budget?', [['hard', 'Hard limit', 'Flag any cart above this amount. Never silently raise the limit.'], ['target', 'Target budget', 'Show how far above or below your target the cart lands.'], ['lowest', 'Lowest cost', 'Compare the lowest example totals. A spending cap is optional.']])}
          {input('budget', d.budgetStyle === 'lowest' ? 'Spending cap (USD, optional)' : 'Grocery budget (USD)', 'Total for the selected days and people, not per person. We do not automatically prorate it.', true)}
          {select('days', 'Days to plan', ['1', '2', '3', '4', '5', '6', '7'])}
          {select('people', 'People being fed', ['1', '2', '3', '4', '5', '6'])}
          {select('meals', 'Meals per day', ['1', '2', '3', '4'])}
          {radio('savingsMode', 'Your savings mode', [['convenience', 'Convenience first', 'Start with one store and small brand changes.'], ['balanced', 'Balanced', 'Also explore lower-cost ingredient formats.'], ['maximum', 'Maximum savings', 'Also explore bigger meal substitutions. Every change remains your choice.']])}
        </div>}
        {step === 1 && <div className="fields">
          <fieldset className="choice-group wide" data-field="stores"><legend>Which retailers would you consider?</legend><div className="check-grid">{stores.map(s => <label className="v2-option" key={s}><input type="checkbox" checked={d.stores.includes(s)} onChange={e => set('stores', e.target.checked ? [...d.stores, s] : d.stores.filter(x => x !== s))} /><span><strong>{labels[s]}</strong><small>Sample prices only</small></span></label>)}</div>{errors.stores && <p className="field-error">{errors.stores}</p>}</fieldset>
          {input('location', 'Shopping area (optional)', 'Clemson-area concept. Exact branches, availability and local prices have not been verified in V2A.')}
          {radio('trip', 'How many stops work for you?', [['single', 'One store only', 'Compare single-store baskets.'], ['two', 'Up to two stores', 'Show a split option, but start with one store until you accept it.'], ['both', 'Show both options', 'Compare the best single-store total and an optional split.']])}
          <p className="notice wide">Comparison uses the same example basket and pack sizes at each retailer. No real stores or loyalty accounts are connected.</p>
        </div>}
        {step === 2 && <div className="fields">
          {select('diet', 'Dietary preference', ['any', 'vegetarian', 'vegan', 'pescatarian', 'other'])}
          {select('allergyStatus', 'Any food allergies?', ['no', 'yes'])}
          {d.allergyStatus === 'yes' && <><fieldset className="choice-group wide" data-field="allergens"><legend>Reported allergies</legend><div className="check-grid">{allergens.map(a => <label className="check" key={a}><input type="checkbox" checked={d.allergens.includes(a)} onChange={e => set('allergens', e.target.checked ? [...d.allergens, a] : d.allergens.filter(x => x !== a))} />{a}</label>)}</div>{errors.allergens && <p className="field-error">{errors.allergens}</p>}</fieldset>{input('otherAllergies', 'Other allergies (optional)')}</>}
          {input('restrictions', 'Other dietary restrictions')}{input('dislikes', 'Foods you dislike (optional)')}{input('favorites', 'Favorite foods or cuisines (optional)')}
          <div className="wide"><h3>Use what you already have</h3><p className="help">Enter remaining amounts, not package counts. Only these three measured staples reduce the sample shopping quantities. Blank means unknown, not free.</p></div>
          {input('pantryOats', 'Oats already at home (grams)', undefined, true)}{input('pantryRice', 'Dry rice already at home (grams)', undefined, true)}{input('pantryOil', 'Olive oil already at home (milliliters)', undefined, true)}
          {input('pantryNotes', 'Other pantry items (notes only)', 'Saved for review; free-text items do not reduce the example total.')}
          <p className="notice warning wide">Food preferences and reported allergies are saved for future planning. They do not filter the V2A sample basket. Do not use it as an allergy-safe or personalized eating plan.</p>
        </div>}
        {step === 3 && <div className="fields">
          <fieldset className="choice-group wide" data-field="appliances"><legend>Appliances you have access to</legend><div className="check-grid">{appliances.map(a => <label className="v2-option" key={a}><input type="checkbox" checked={d.appliances.includes(a)} onChange={e => { update(updateAppliance(d, a, e.target.checked)); setAck(false); setErrors({}); }} /><span>{labels[a]}</span></label>)}</div><label className="check v2-space"><input type="checkbox" checked={d.noCook} onChange={e => { update({ ...d, noCook: e.target.checked, appliances: [], preferred: [] }); setAck(false); setErrors({}); }} />Minimal / no-cook setup only</label>{errors.appliances && <p className="field-error">{errors.appliances}</p>}</fieldset>
          {!d.noCook && <fieldset className="choice-group wide" data-field="preferred"><legend>Which do you prefer? Choose up to 3.</legend><p className="help">Only available appliances appear. Leaving this blank means no preference.</p><div className="check-grid">{d.appliances.map(a => <label className="check" key={a}><input type="checkbox" checked={d.preferred.includes(a)} disabled={!d.preferred.includes(a) && d.preferred.length >= 3} onChange={e => set('preferred', e.target.checked ? [...d.preferred, a] : d.preferred.filter(x => x !== a))} />Prefer {labels[a]}</label>)}</div>{errors.preferred && <p className="field-error">{errors.preferred}</p>}</fieldset>}
          {select('skill', 'Cooking confidence', ['beginner', 'intermediate', 'experienced'])}{select('minutes', 'Minutes available per meal', ['10', '20', '30', '45', '60'])}{select('repeat', 'Happy to repeat meals or meal prep?', ['yes', 'no', 'flexible'])}
        </div>}
        {step === 4 && <><p className="muted">Entirely optional. Your budget comparison works without fitness goals or body measurements.</p><div className="fields">
          {select('goal', 'Optional health or fitness goal', ['none', 'healthier', 'muscle', 'lose', 'maintain'])}
          <label className="check wide"><input type="checkbox" checked={d.nutritionOptIn} onChange={e => { update(e.target.checked ? { ...d, nutritionOptIn: true } : withoutNutrition(d)); setAck(false); setErrors({}); }} />Add optional nutrition details</label>
          {d.nutritionOptIn && <>{input('age', 'Age (optional, adults 18+)', undefined, true)}{select('sex', 'Sex (optional)', ['female', 'male', 'prefer_not_to_say'])}{select('activity', 'Activity (optional)', ['low', 'light', 'moderate', 'high'])}{input('heightCm', 'Height (cm, optional)', undefined, true)}{input('weightKg', 'Weight (kg, optional)', undefined, true)}<p className="notice wide">These details are not used to calculate targets in V2A. Turning this option off clears them. Avoid entering medical history.</p></>}</div>
          <button type="button" className="text-button" onClick={() => { update({ ...withoutNutrition(d), goal: 'none' }); setAck(false); go(5); }}>Skip fitness details</button>
        </>}
        {step === 5 && <><p className="notice"><strong>Your budget, your choices.</strong> Review the setup before opening the illustrative comparison.</p><BudgetSummary draft={d} /><div className="review-edit">{steps.slice(0, 5).map((title, i) => <button className="text-button" type="button" key={title} onClick={() => { go(i); setAck(false); }}>Edit {title.toLowerCase()}</button>)}</div><label className="check consent"><input type="checkbox" checked={ack} onChange={e => { setAck(e.target.checked); setReviewError(''); }} />I understand prices and savings are fictional, and this is not a personalized or allergy-screened meal plan.</label>{reviewError && <p role="alert" aria-label="Sample acknowledgement required" className="field-error">{reviewError}</p>}</>}
        <div className="privacy-box"><label className="check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Remember V2 answers in this browser tab</label><p className="help">Off by default. Answers stay in memory unless enabled; no questionnaire answers are sent to a server. Refreshing clears memory-only answers. Tab restore can retain opted-in answers; clear them before leaving a shared computer.</p>{notice && <p role="status">{notice}</p>}</div>
        <div className="form-actions">{step > 0 ? <button type="button" className="button secondary" onClick={() => go(step - 1)}>Back</button> : <span />}<button className="button primary" type="submit">{step === 5 ? 'Compare sample cart' : 'Continue'}</button></div>
      </form>
    </section>
  </div>;
}
