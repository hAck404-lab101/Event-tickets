# Tixly Event Tickets

A responsive event discovery and ticket checkout web app. The app creates an invoice through an external SME invoicing API, receives a hosted checkout URL, and redirects the customer to complete payment.

## Current foundation

- Next.js App Router with TypeScript
- Responsive event discovery homepage
- Event categories and featured event cards
- Server-side `/api/checkout` invoice adapter
- Environment variable template for the invoicing API
- GHS ticket pricing and invoice references

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Invoice integration

The client should call `POST /api/checkout` with:

```json
{
  "eventId": "accra-night-live",
  "eventName": "Accra Night Live",
  "ticketType": "Regular",
  "quantity": 2,
  "unitPrice": 120,
  "customer": {
    "name": "Sample Customer",
    "email": "customer@example.com",
    "phone": "+233200000000"
  }
}
```

The server converts the ticket order into an invoice request and returns a normalized `checkoutUrl`. Update the payload and authentication logic in `app/api/checkout/route.ts` to match the exact SME invoicing API documentation.

## Planned next milestones

1. Event details and ticket selection
2. Customer checkout form
3. Hosted invoice payment redirect
4. Payment callback and server-side verification
5. QR ticket generation
6. Customer ticket wallet
7. Organizer event and sales dashboard
8. Door scanning and ticket validation
