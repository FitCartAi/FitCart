"use client";

import { useState, type FormEvent } from "react";

type Feedback = {
  weeklyUse: string;
  clarity: string;
  budgetValue: string;
  strongestValue: string;
  missing: string;
  concern: string;
};

const initial: Feedback = {
  weeklyUse: "",
  clarity: "",
  budgetValue: "",
  strongestValue: "",
  missing: "",
  concern: "",
};

export function FeedbackForm() {
  const [form, setForm] = useState(initial);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");

  function set<K extends keyof Feedback>(key: K, value: Feedback[K]) {
    setForm(current => ({ ...current, [key]: value }));
    setStatus("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.weeklyUse || !form.clarity || !form.budgetValue || !form.strongestValue) {
      setStatus("Please answer the four required questions before generating your feedback summary.");
      return;
    }

    const text = [
      "FitCart prototype feedback",
      "Would use weekly: " + form.weeklyUse,
      "Questionnaire clarity (1-5): " + form.clarity,
      "Budget feature usefulness (1-5): " + form.budgetValue,
      "Strongest value: " + form.strongestValue,
      "What feels missing: " + (form.missing.trim() || "No response"),
      "Biggest concern or confusion: " + (form.concern.trim() || "No response"),
    ].join("\n");

    setSummary(text);
    setStatus("Summary generated. Copy it and send it to the FitCart team.");
  }

  async function copySummary() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("Copied. You can now paste the feedback into a text, email, class document, or team chat.");
    } catch {
      setStatus("Automatic copy was unavailable. Select the summary text below and copy it manually.");
    }
  }

  return (
    <section className="panel">
      <form onSubmit={submit}>
        <div className="feedback-grid">
          <fieldset className="choice-group wide">
            <legend>Would you use something like FitCart on a weekly basis? *</legend>
            <div className="feedback-options">
              {["Yes", "Maybe", "No"].map(option => (
                <label className="check feedback-option" key={option}>
                  <input type="radio" name="weeklyUse" checked={form.weeklyUse === option} onChange={() => set("weeklyUse", option)} />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>How clear was the questionnaire? *</span>
            <select aria-label="How clear was the questionnaire? *" value={form.clarity} onChange={event => set("clarity", event.target.value)}>
              <option value="">Choose 1-5</option>
              <option value="1">1 - Very unclear</option>
              <option value="2">2</option>
              <option value="3">3 - Neutral</option>
              <option value="4">4</option>
              <option value="5">5 - Very clear</option>
            </select>
          </label>

          <label className="field">
            <span>How useful is including a grocery budget? *</span>
            <select aria-label="How useful is including a grocery budget? *" value={form.budgetValue} onChange={event => set("budgetValue", event.target.value)}>
              <option value="">Choose 1-5</option>
              <option value="1">1 - Not useful</option>
              <option value="2">2</option>
              <option value="3">3 - Neutral</option>
              <option value="4">4</option>
              <option value="5">5 - Very useful</option>
            </select>
          </label>

          <label className="field wide">
            <span>Which part of FitCart feels most valuable? *</span>
            <select aria-label="Which part of FitCart feels most valuable? *" value={form.strongestValue} onChange={event => set("strongestValue", event.target.value)}>
              <option value="">Choose one</option>
              <option value="Budgeting">Budgeting</option>
              <option value="Fitness-goal personalization">Fitness-goal personalization</option>
              <option value="Meal planning">Meal planning</option>
              <option value="Consolidated grocery list">Consolidated grocery list</option>
              <option value="Having all four in one place">Having all four in one place</option>
            </select>
          </label>

          <label className="field wide">
            <span>What feels missing or would make you more likely to use FitCart?</span>
            <textarea rows={4} maxLength={500} value={form.missing} onChange={event => set("missing", event.target.value)} placeholder="For example: real store prices, faster meals, pantry tracking..." />
          </label>

          <label className="field wide">
            <span>What is your biggest concern or point of confusion?</span>
            <textarea rows={4} maxLength={500} value={form.concern} onChange={event => set("concern", event.target.value)} placeholder="Anything that made you hesitate, wonder, or want more information." />
          </label>
        </div>

        {status && <p className="notice" role="status">{status}</p>}
        <div className="form-actions">
          <span />
          <button className="button primary" type="submit">Generate feedback summary <span aria-hidden="true">&rarr;</span></button>
        </div>
      </form>

      {summary && (
        <div className="feedback-summary">
          <div className="section-heading">
            <div><p className="eyebrow">READY TO SHARE</p><h2>Your feedback summary</h2></div>
            <button className="button secondary" type="button" onClick={copySummary}>Copy summary</button>
          </div>
          <pre data-testid="feedback-summary">{summary}</pre>
          <p className="help">Nothing on this page is submitted to a FitCart server. Copying only places this text on your device clipboard.</p>
        </div>
      )}
    </section>
  );
}
