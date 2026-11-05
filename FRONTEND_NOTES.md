# Company portal — frontend notes for backend review

The company portal UI for earnings, payout settings, mechanic performance, service
history, disputes, notifications, and support is built. Screens that have no backend yet
run on **sample data** and show a "Sample data" badge. This document lists every
endpoint the UI expects so the real contracts can be agreed.

Every shape below is a **proposal**. Change anything; the UI adapts in one place per
endpoint (see "How to connect an endpoint").

## How it's wired

```
component → hook (TanStack Query)       → service function            → mockRequest(...) today
            features/<x>/hooks/*.ts        features/<x>/services/*.ts    apiClient.get(...) later
```

- **Services** hold one function per endpoint. Each has a `// TODO: connect to backend`
  comment with the method, path, params, and response shape it expects.
- **Hooks** never change when an endpoint is connected.
- `mocks/mock-request.ts` simulates latency. Outside production, add
  `?mockError=earnings` (or `disputes`, `support`, `performance`,
  `service-request-extras`, `all`) to any URL to preview error states.
- Money is always `{ amount: number, currency: ISO 4217 }`. The UI never assumes a currency.
- Lists use the envelope already used elsewhere in Sherix:
  `{ data: T[], pagination: { total, page, limit, pages } }`. `page` is 1-based.
- Dates are ISO 8601 datetimes. Date filters are `YYYY-MM-DD`, inclusive, in the company's timezone.
- Errors: `401` ends the session; `403` shows a permission state; `404` shows "not found";
  `409` means a stale `expectedVersion` or a closed record; `422` means validation errors
  (`{ message, errors }`).

### How to connect an endpoint

1. In the service function, replace `mockRequest("scope", () => …)` with the `apiClient` call
   (`services/http-client.ts` already adds auth and device headers).
2. Normalise the response to the existing type in `features/<x>/types.ts` if names differ.
3. Delete the `SampleDataBadge` from that screen, and the sample file in `features/<x>/mocks/` once unused.

## Already connected (real API)

| Method | Path | Used by |
| --- | --- | --- |
| GET | `/service-requests/company-admin/list?page&limit` | Service Requests list & detail, performance counts, dashboard |
| GET | `/service-requests/company-admin/stats` | Service Requests totals row |
| GET | `/companies/payout-settings` | Payout settings |
| PATCH | `/companies/payout-settings` | Save payout settings (`expectedVersion`, `reason`) |
| POST | `/companies/payout-settings/impact-preview` | Payout settings review step |
| GET | `/issues/company` | Employee form (issues handled) |
| POST / PUT | `/employees`, `/employees/:id` (multipart, repeated `services` and `issues`) | Add / edit employee |
| PATCH | `/employees/:id/deactivate`, `/employees/:id/reactivate` | Suspend / reactivate (roster and detail page) |
| GET / DELETE | `/employees`, `/employees/:id` | Employees |
| GET | `/notifications?page&limit` | Notification center, header menu, badges |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | Mark read |

Open points on these endpoints:

- **Payout settings writes are not live yet.** On the production API, `PATCH`/`PUT`/`POST /companies/payout-settings`
  and every method on `/impact-preview` return `404`. The docs don't name the save method; the UI uses `PATCH`
  (`UPDATE_METHOD` in `features/payout-settings/services/payout-settings-service.ts`). Please confirm.
- **Impact-preview response** is undocumented. The UI shows a before/after table computed from the form and lists
  whatever fields the response returns (`effectiveFrom` is used for the effective-date message when present).
- **Save response**: the UI refetches settings after saving, so any body works. A `409` on a stale
  `expectedVersion` shows a message and loads the latest version.
- **Service Request list**: the response shape is undocumented. The UI reads `data[]` (or `data.serviceRequests[]`)
  with `pagination.pages`, and the fields `_id, jobId, status, customerId, mechanicId, serviceId, customerAddress,
  finalCost, currency, paymentStatus | isPaid, scheduledAt, createdAt, updatedAt`. Populated `customerId`/`mechanicId`/
  `serviceId` objects are needed to show names; a `currency` field is needed to label amounts. All pages are read,
  so search and filters are client-side; server-side `search`, `status`, `mechanic`, `startDate`, `endDate` would scale better.
- **Service Request stats**: rendered generically. Every numeric field (and one level of numeric groups such as
  `byStatus`) becomes a card, so any shape works.
- **Issues**: the UI reads `_id`, `issueTitle | title`, `service` (id or populated) and hides `isActive: false`.
  Issues are filtered to the employee's selected services.
- **Notifications**: please add a `category` query param and response field (see §5), and document the
  `data` payload keys used for deep links (`serviceRequestId` / `bookingId` / `employeeId` today).

## Permissions

The only role issued today is `company_admin`. The UI models two roles in `hooks/use-user-role.ts`:

| Permission | admin | staff |
| --- | --- | --- |
| `viewFinancials` | ✓ | ✓ |
| `configurePayouts` (payout settings) | ✓ | — |
| `respondToDisputes` | ✓ | — |

**Request:** return the company role and explicit permissions on the session/user payload, e.g.
`GET /auth/me → { role: "company_admin" | "company_staff", permissions: string[] }`. The backend must
enforce these on every endpoint; UI gating is convenience only. (Dev-only: `?role=staff` previews the staff UI.)

---

## 1. Earnings & transactions — `features/earnings/services/earnings-service.ts`

### GET `/company/earnings/summary`
Query: `from?`, `to?`
```json
{
  "currency": "GHS",
  "period": { "from": "2026-08-28", "to": "2026-09-26" },
  "totalEarnings": 18430.55,
  "pendingPayouts":   { "amount": 6120.40, "count": 9 },
  "completedPayouts": { "amount": 42210.00, "count": 31 },
  "failedPayouts":    { "amount": 830.15, "count": 1 },
  "outstandingBalance": 2210.80
}
```
`totalEarnings` = company share of completed transactions. `outstandingBalance` = company share not yet settled.
Totals must be computed server-side and reconcile with the transactions endpoint.

### GET `/company/earnings/transactions`
Query: `status?` (`completed|pending|failed|refunded`), `from?`, `to?`, `page`, `limit`. Newest first.
```json
{
  "data": [{
    "id": "txn_…", "reference": "TXN-880100",
    "serviceRequestId": "…", "serviceRequestRef": "SR-24100", "serviceName": "Oil change",
    "customerName": "Nana Adjei", "mechanic": { "id": "…", "name": "Kwame Asante" },
    "status": "completed", "paymentMethod": "mobile_money",
    "currency": "GHS", "createdAt": "…", "settledAt": "…",
    "breakdown": {
      "grossAmount": 850.00, "platformCommissionRate": 0.15, "platformCommission": 127.50,
      "processingFee": 16.15, "netAmount": 706.35,
      "mechanicSharePercent": 70, "mechanicPayout": 494.45, "companyShare": 211.90
    }
  }],
  "pagination": { "total": 72, "page": 1, "limit": 10, "pages": 8 }
}
```
Invariant the UI relies on: `grossAmount = platformCommission + processingFee + mechanicPayout + companyShare`.

### GET `/company/payouts`
Query: `status?` (`pending|processing|paid|failed`), `from?`, `to?`, `page`, `limit`.
```json
{ "data": [{ "id": "po_…", "reference": "PO-55200", "mechanic": { "id": "…", "name": "…" },
             "amount": 1520.30, "currency": "GHS", "status": "paid", "method": "mobile_money",
             "initiatedAt": "…", "completedAt": "…", "failureReason": null,
             "transactionIds": ["txn_…"] }],
  "pagination": { … } }
```

## 2. Mechanic performance — `features/performance/services/performance-insights-service.ts`

Completed/cancelled counts and cancellation rate already come from the real bookings list. The
"Quality & earnings" section needs:

### GET `/company/performance/insights`
Query: `from?`, `to?`, `mechanicId?`
```json
{
  "currency": "GHS", "period": { "from": "…", "to": "…" }, "bucket": "day",
  "totals": { "acceptanceRate": 0.86, "avgResponseMinutes": 11.4, "averageRating": 4.52,
              "ratingCount": 64, "earnings": 38210.40, "disputeCount": 3 },
  "mechanics": [{ "mechanicId": "…", "mechanicName": "…", "acceptanceRate": 0.91,
                  "avgResponseMinutes": 7.2, "averageRating": 4.8, "ratingCount": 12,
                  "earnings": 6120.00, "disputeCount": 0 }],
  "trend": [{ "date": "2026-09-20", "earnings": 1320.50, "averageRating": 4.6 }]
}
```
`averageRating` is `null` when there are no ratings. `bucket` is `day` for ≤31 days, otherwise `week`.
**Please confirm definitions:** acceptance = accepted ÷ offered; response time = assignment → acceptance;
earnings = mechanic payouts; disputes = opened in the period.

## 3. Service Request detail — `features/requests/services/service-request-extras-service.ts`

The list is real. The detail page needs a detail endpoint with fields the list lacks:

### GET `/service-requests/company-admin/:id`
The list record plus:
```json
{
  "timeline": [{ "id": "…", "type": "accepted", "label": "Mechanic accepted", "at": "…", "actor": "Mechanic" }],
  "financials": { "currency": "GHS", "transactionReference": "TXN-…", "payoutStatus": "paid",
                  "breakdown": { /* same shape as transactions */ } },
  "dispute": { "id": "…", "status": "under_review" }
}
```
`financials` and `dispute` are `null` when not applicable. `404` if not assigned to the company.

## 4. Disputes — `features/disputes/services/disputes-service.ts`

### GET `/company/disputes`
Query: `status?` (`open|under_review|resolved`), `search?`, `page`, `limit`. Most recently updated first.
```json
{
  "data": [{ "id": "dsp_…", "reference": "DSP-7300", "status": "open", "category": "Service quality",
             "serviceRequest": { "id": "…", "reference": "SR-24140", "serviceName": "…" },
             "customerName": "…", "mechanic": { "id": "…", "name": "…" },
             "amountInDispute": 420.00, "currency": "GHS",
             "openedAt": "…", "updatedAt": "…", "responseDueAt": "…" }],
  "pagination": { … },
  "counts": { "all": 14, "open": 5, "under_review": 4, "resolved": 5 }
}
```
`counts` ignores the status filter but respects `search` (used for the tab badges).

### GET `/company/disputes/:id`
The list fields plus `customerStatement`, `serviceRequest.date`, `serviceRequest.amount`,
`paymentStatus` (`paid|refunded|partially_refunded`), `payoutStatus` (`on_hold|released|withheld`),
`timeline[] { id, type, label, actor: customer|company|mechanic|sherix, at, note? }`,
`evidence[] { id, fileName, mimeType, sizeBytes, uploadedBy, uploadedAt }` (**no file URLs**),
`companyResponse { message, submittedAt, submittedBy } | null`,
`resolution { outcome: refund_customer|partial_refund|release_to_company|dismissed, summary, refundAmount | null, resolvedAt } | null`.

### POST `/company/disputes/:id/responses` — `multipart/form-data`
Fields: `message` (20–2000 chars), `evidence[]` (0–5 files). Returns the updated dispute.
The UI shows upload progress via axios `onUploadProgress` and keeps the draft on failure so the user can retry.
`409` if resolved (the UI already hides the form), `413/422` for invalid files. Can a company respond more than
once? The UI currently allows follow-ups while not resolved.

**Please set the real evidence limits.** The UI placeholders are JPG/PNG/WEBP/PDF, ≤ 10 MB each, ≤ 5 files
(`features/disputes/utils/evidence-files.ts`). Validate type by content server-side, not just extension.

### GET `/company/disputes/:id/evidence/:evidenceId/download`
`{ "url": "…", "expiresAt": "…" }`: a short-lived, authorized URL served with `Content-Disposition: attachment`.
The UI opens it in a new tab with `noopener`. It never renders evidence inline from a permanent URL.

## 5. Notifications (real API — additions requested)

The UI groups notifications into `assignment`, `verification`, `payout`, `cancellation`, `dispute`,
`mechanic_status`, `announcement`, `other` by keyword-matching `type` and `title`
(`features/notifications/utils/notification-categories.ts`). Please add:

- A `category` field on each notification using the values above.
- A `category` query param on `GET /notifications`. The type filter currently only filters the loaded page.
- Optionally a `deliveryStatus` (`sent|delivered|failed`) if it should be shown.

## 6. Support — `features/support/services/support-chat-service.ts`

### GET `/company/support/conversation`
```json
{ "id": "conv_…", "status": "open", "subject": "Payout for SR-24117 not received",
  "agent": { "name": "Selasi (Sherix Support)" },
  "messages": [{ "id": "msg_…", "author": "agent", "authorName": "…", "body": "…", "sentAt": "…" }] }
```
`author`: `company|agent|system`, oldest first. Never include internal agent notes. The UI polls every
5 seconds; a WebSocket/SSE channel can replace polling later.

### POST `/company/support/conversation/messages`
Body: `{ body (1–2000 chars), clientMessageId }` → returns the created message. `clientMessageId`
de-duplicates retries, and the UI resends the same id when the user taps Retry.

**Contacts:** phone and email come from `NEXT_PUBLIC_SUPPORT_PHONE` / `NEXT_PUBLIC_SUPPORT_EMAIL`.
Until those are set, the page shows labelled placeholders (`support@example.com`, `+1 555 0100`).
Alternatively, provide `GET /support/contacts → { phone, email }`.

---

## Frontend-only notes

- New dependency: **Recharts** (performance trend charts). No charting library existed before.
- `features/requests/data.ts` contains older, unused template records and is not used by any screen.
