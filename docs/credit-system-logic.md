
# Chat Pilot: Credit & Pricing Engine

This document explains the architecture of our consumption-based billing system.

## 1. Credit Definition
A **Credit** is the internal unit of value for Chat Pilot.
- **1 Credit** = 1 AI Model Inference (API Call).
- Credits are consumed whenever the widget generates a response for an end-user.

## 2. Pricing Tiers vs. Monthly Credits
Each plan provides a fixed bucket of credits per month:
- **Starter ($0)**: 500 Credits/mo.
- **Pro ($49)**: 5,000 Credits/mo. (~$0.009 per credit)
- **Business ($199)**: 25,000 Credits/mo. (~$0.007 per credit)

## 3. Top-ups (Pay-as-you-go)
Users can purchase "packs" if they exhaust their monthly allotment:
- **Standard Pack**: 1,000 credits for $15.
- These credits never expire (rollover), unlike monthly plan credits which reset at the end of the billing cycle.

## 4. Implementation Logic
1. **Request Middleware**: Every request to `/api/v1/chat` checks the user's `used_credits` vs `total_credits`.
2. **Locking**: If `used >= total`, the API returns a `402 Payment Required` status.
3. **Decrement**: Upon successful model response, the system increments the `used_credits` count in the `workspaces` table via an atomic SQL operation.

## 5. Cost Attribution
The system calculates the ROI by comparing the cost of credits ($0.007-$0.01) against the cost of a human agent session (~$5.00), visualized in the Analytics dashboard as "Savings".
