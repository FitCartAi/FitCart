# FitCart Product Context

This document is the concise repository-level product source of truth for MVP development. The full ELE 4020 venture materials remain the broader business context.

## Product in one sentence

FitCart turns a user's fitness goals, body information, food preferences, grocery budget, location, and preferred grocery store into a practical weekly meal plan and grocery list.

## Primary job to be done

When I need to grocery shop, I want to know exactly what foods and quantities to buy for the upcoming week so that I can make progress toward my fitness goals, stay within my budget, avoid unnecessary purchases, and not forget important items.

## Initial target user

College students and young adults who:

- buy their own groceries
- care about fitness or eating healthier
- have limited grocery budgets
- want practical guidance rather than advanced nutrition analysis

Clemson is the natural first testing environment because the team can recruit and observe users directly.

## MVP objective

Prove that users find value in receiving a personalized grocery plan generated from their goals and constraints.

## Minimum useful experience

A user should be able to:

1. enter a basic profile
2. choose a fitness/health goal
3. enter a weekly grocery budget
4. provide food preferences and restrictions
5. receive a coherent seven-day meal plan
6. receive a consolidated grocery list with quantities
7. see an estimated weekly total
8. understand why the plan fits their stated goal and budget
9. swap at least one unwanted meal or ingredient

## Core inputs

Required/early inputs include:

- first name or nickname
- age
- height
- weight
- sex
- activity level
- goal: gain muscle, lose weight, maintain weight, or eat healthier
- weekly grocery budget
- days to plan
- meals per day
- dietary preferences
- allergies/restrictions
- disliked foods
- preferred grocery store

Useful additions may include cooking skill, cooking time, meal-prep preference, kitchen equipment, cuisines, protein preferences, and number of people being fed.

## Core outputs

- goal/profile summary
- general estimated daily nutrition targets
- seven-day meal plan
- consolidated grocery list grouped by category
- item quantities and approximate package/unit sizes
- estimated grocery cost
- substitutions/optimization when over budget
- concise explanation of why the plan fits

## Product principles

1. Practicality over theoretical perfection.
2. Budget is a real constraint, not an afterthought.
3. Reuse ingredients to reduce food waste.
4. Reduce decision fatigue while preserving easy substitutions.
5. Explain recommendations.
6. Keep onboarding manageable.
7. Build trust and acknowledge estimates/limitations.
8. Design for simple weekly reuse.

## What FitCart is not

The MVP is not intended to be:

- a medical nutrition service
- a substitute for a physician or registered dietitian
- a full calorie-tracking app
- a workout app
- a social network
- a grocery delivery company
- a general recipe site
- a full Instacart competitor
- a clinical diet platform

## Technical/product boundaries

- Use general planning estimates rather than medical prescriptions.
- Clearly label mock or curated grocery pricing.
- Never imply an integration is working when it is only planned.
- Keep secrets and API keys out of source control.
- Minimize collection of personal data.
- Prefer a working vertical slice over broad feature coverage.

## Internal demo profile

Use this scenario as an early fixed test case:

- college student
- goal: gain lean muscle
- height: 5'9"
- weight: 140 lb
- moderately active
- weekly budget: $85
- preferred store: Publix
- likes tacos, spicy food, chicken, ground beef/turkey
- wants easy breakfast, meal-prep lunches, simple dinners
- standard kitchen plus air fryer

Expected result:

- reasonable high-protein plan
- reused ingredients
- grocery list under or near $85
- minimal waste
- meals that feel enjoyable rather than generic “diet food”

## North star

FitCart should answer this question better and more conveniently than a generic chatbot:

> Given who I am, what I'm trying to accomplish, what I like to eat, where I shop, and what I can afford, what exactly should I buy this week?

Every early feature should materially improve accuracy, affordability, personalization, actionability, convenience, or trust.