# Fitness Arena

Responsive Gym Website for Fitness Arena — A modern fitness platform showcasing membership plans, class schedules, trainers, and facilities. Built with HTML, CSS, and JavaScript (Node.js + Express optional). Includes responsive design, booking system, and SEO-friendly structure.

Static gym website served by an Express backend, backed by MongoDB (via
Mongoose) for the contact form, class bookings, and membership sign-ups.

## Run it

1. **Get a MongoDB instance.** Either:
   - Install MongoDB locally and run `mongod`, or
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
     and copy its connection string.

2. **Get Razorpay API keys.** Sign up at
   [dashboard.razorpay.com](https://dashboard.razorpay.com/app/keys) and
   grab your test-mode Key ID and Key Secret.

3. **Set your environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set:
   - `DB_URI` — your MongoDB connection string (local or Atlas, see comments in the file)
   - `JWT_SECRET` — any long random string (generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your Razorpay dashboard

4. **Install and start:**

   ```bash
   npm install
   npm start
   ```

   Then open [http://localhost:3000](http://localhost:3000)

   If `DB_URI` is missing or unreachable, the server logs a clear error and
   exits instead of starting in a broken state. If `JWT_SECRET` or the
   Razorpay keys are missing, it starts anyway but logs a warning — the
   affected routes (`/api/users/*`, `/api/payments/*`) will return clear
   errors until those are set. Check `GET /api/health` at any time to
   confirm the `db` field reads `"connected"`.

## Project structure

```tree
fitness-arena-website/
│
├── server.js               Entry point — connects to MongoDB, wires up routes, starts listening
├── package.json              Dependencies (express, mongoose, dotenv, bcryptjs, jsonwebtoken, razorpay)
├── .env                        Environment variables (DB_URI, JWT_SECRET, RAZORPAY_*, etc.) — never commit this
├── .env.example                  Template showing which variables the app expects
├── .gitignore                      Excludes node_modules and .env
├── README.md                         This file
│
├── public/                   Static frontend, served directly by Express
│   ├── index.html              Homepage markup, incl. Features section + checkout modal
│   ├── dashboard.html            Member dashboard (login/register, bookings, payments, admin panel)
│   ├── css/style.css             All site styles, incl. modal + dashboard styling
│   ├── js/
│   │   ├── script.js               Timetable tabs, gallery slider, contact form, Razorpay checkout flow
│   │   └── dashboard.js             Auth, dashboard data loading, admin panel rendering
│   └── images/                       (currently images are hotlinked from Unsplash —
│                                        drop real gym photos here and update the <img>
│                                        src attributes in index.html to go local)
│
├── models/                    MongoDB schemas (Mongoose)
│   ├── User.js                  name, email (unique), phone, passwordHash, role
│   ├── Contact.js                name, phone, email, message, submittedAt
│   ├── Booking.js                 user (optional ref), name, phone, email, day, time, className, bookedAt
│   ├── Signup.js                   name, phone, email, plan (enum: Monthly/Quarterly/Yearly), signedUpAt
│   └── Payment.js                   user (optional ref), plan (enum incl. Trial), amount, razorpay order/payment/signature, status
│
├── middleware/
│   └── authMiddleware.js         verifyToken (required), optionalAuth (attaches req.userId if present, never blocks), requireAdmin (role check, chain after verifyToken)
│
├── routes/                    Express routers — just wire a path to a controller
│   ├── contact.js
│   ├── bookings.js               now uses optionalAuth to link bookings to a user
│   ├── signups.js
│   ├── users.js                  register, login, me
│   ├── payments.js                create-order, verify
│   ├── dashboard.js                GET / — protected, member's own bookings + payments
│   └── admin.js                     GET /members, /bookings, /payments — protected + admin-only
│
├── controllers/                Request handling — validates input, calls the model, shapes the response
│   ├── contactController.js
│   ├── bookingController.js
│   ├── signupController.js
│   ├── userController.js          bcrypt hashing, JWT signing
│   ├── paymentController.js        Razorpay order creation + signature verification (incl. Trial)
│   ├── dashboardController.js       aggregates the logged-in user's bookings + payments
│   └── adminController.js            lists all members / bookings / payments
│
└── utils/
    └── validators.js            Shared input checks — isValidPlan (Signup, no Trial) vs. isValidPaymentPlan (Payment, incl. Trial)
```

## API

- `POST /api/contact` — `{ name, phone, email, message }` → saved to the `contacts` collection
- `POST /api/bookings` — `{ name, phone, email, day, time, className }`, optional `Authorization: Bearer <token>` → saved to the `bookings` collection, linked to the user if logged in
- `POST /api/signups` — `{ name, phone, email, plan }` where plan is `Monthly` | `Quarterly` | `Yearly` → saved to the `signups` collection (no `Trial` option here — see note below)
- `POST /api/users/register` — `{ name, phone, email, password }` → creates a member account, returns `{ token, user }`
- `POST /api/users/login` — `{ email, password }` → returns `{ token, user }`
- `GET /api/users/me` — protected → returns the logged-in user's profile
- `POST /api/payments/create-order` — `{ name, phone, email, plan }` where plan is `Trial` | `Monthly` | `Quarterly` | `Yearly`, optional `Authorization: Bearer <token>` → creates a Razorpay order + a `created` Payment record
- `POST /api/payments/verify` — `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` → verifies the signature server-side and marks the Payment `paid`
- `GET /api/dashboard` — protected → returns the logged-in user's profile, bookings, and payments
- `GET /api/admin/members` — protected + `role: "admin"` required → all registered users
- `GET /api/admin/bookings` — protected + admin → all bookings, with member name/email populated
- `GET /api/admin/payments` — protected + admin → all payments, with member name/email populated
- `GET /api/health` — uptime check, includes MongoDB connection state

**Trial vs. Signup plans:** `Signup.js`'s `plan` enum is intentionally
unchanged — `Monthly` | `Quarterly` | `Yearly` only. The ₹1 trial pass is a
_payment_, not a membership signup, so `Trial` was added to `Payment.js`'s
enum and to a separate `isValidPaymentPlan` validator instead of touching
`isValidPlan` (which `signupController.js` still uses).

The contact form, the membership "Choose [Plan]" buttons, and both the nav
bar's and hero's "Book Trial @ ₹1" buttons are wired up end-to-end. The
class timetable's "Book This Class" button still needs to be hooked up to
`POST /api/bookings` — the endpoint (and its `optionalAuth` user-linking)
is ready, just not wired to that specific button yet.

Validation happens twice, on purpose: `utils/validators.js` gives fast,
friendly error messages before hitting the database, and the Mongoose
schemas in `models/` enforce the same rules again at the data layer —
so anything that writes to the DB (not just these routes) stays consistent.

### Auth

Registration hashes passwords with bcrypt (`bcryptjs`, 10 salt rounds) and
issues a JWT signed with `JWT_SECRET`. Auth is intentionally optional for
checkout — `POST /api/payments/create-order` uses `optionalAuth`, so both
logged-in members and guests can pay; if a valid token is sent, the payment
is linked to that user's `_id`.

### Payments

`POST /api/payments/create-order` creates a Razorpay order for the plan's
price (converted to paise) and stores a matching `Payment` document with
`status: "created"`. Once Razorpay Checkout completes on the frontend, it
calls `POST /api/payments/verify` with the returned order/payment IDs and
signature. The server recomputes the HMAC-SHA256 signature using
`RAZORPAY_KEY_SECRET` and only marks the payment `"paid"` if it matches —
the frontend's claim that a payment succeeded is never trusted on its own.

## Sample document shape

```js
// contacts collection
{
  _id: ObjectId("..."),
  name: "Priya Kale",
  phone: "9876543210",
  email: "priya.kale@example.com",
  message: "Interested in the quarterly plan, do you have evening HIIT slots?",
  submittedAt: ISODate("2026-09-01T08:44:13.825Z"),
  __v: 0
}
```

```js
// bookings collection
{
  _id: ObjectId("..."),
  name: "Aakash Meshram",
  phone: "9090639005",
  email: "aakash.m@example.com",
  day: "wed",
  time: "6:00 PM",
  className: "Strength Training",
  bookedAt: ISODate("2026-09-01T09:12:05.331Z"),
  __v: 0
}
```

```js
// signups collection
{
  _id: ObjectId("..."),
  name: "Rohit Deshmukh",
  phone: "9012345678",
  email: "rohit.d@example.com",
  plan: "Quarterly",
  signedUpAt: ISODate("2026-09-01T09:18:47.902Z"),
  __v: 0
}
```

```js
// users collection — passwordHash is a bcrypt hash, never the raw password
{
  _id: ObjectId("..."),
  name: "Meera Joshi",
  email: "meera.joshi@example.com",
  phone: "9822011223",
  passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMy...",
  role: "member",
  createdAt: ISODate("2026-09-01T11:02:10.000Z"),
  __v: 0
}
```

```js
// payments collection — amount is stored in paise (smallest INR unit)
{
  _id: ObjectId("..."),
  user: ObjectId("..."),          // null for guest checkout
  name: "Meera Joshi",
  email: "meera.joshi@example.com",
  phone: "9822011223",
  plan: "Yearly",
  amount: 899900,                 // ₹8999.00
  currency: "INR",
  provider: "razorpay",
  razorpayOrderId: "order_Nk8x...",
  razorpayPaymentId: "pay_Nk8y...",
  razorpaySignature: "3f2a9c...",
  status: "paid",
  createdAt: ISODate("2026-09-01T11:05:00.000Z"),
  paidAt: ISODate("2026-09-01T11:06:32.000Z"),
  __v: 0
}
```

## Notes

- The old `data/*.json` flat-file storage has been fully replaced by
  MongoDB — that folder and `utils/jsonStore.js` are gone.
- `_id` is generated automatically by MongoDB; the app no longer needs its
  own id-generation logic.
- Razorpay is wired in and functional (order creation, Checkout widget, and
  server-side signature verification), but it's in test mode until you swap
  in live keys and complete Razorpay's KYC/activation for real payouts.
- Signup is currently split across two flows: `POST /api/signups` (no
  payment, just intent) and the Razorpay checkout flow via
  `POST /api/payments/create-order` + `/verify` (actually charges the
  card). Decide whether you want both, or whether a successful payment
  should also write a `Signup` record — that link isn't made automatically
  yet.
- **Every new registration gets `role: "member"`** — there's no signup flow
  for admins, by design (an open "become an admin" endpoint would be a
  security hole). To make someone an admin, update their document directly
  in the database, e.g. in `mongosh`:

  ```js
  db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } });
  ```

- **"Progress" tracking (Body Composition Analysis)** from the blueprint is
  not built — there's no BCA data model or measurement-history schema yet.
  The dashboard only surfaces what's actually stored: bookings and
  payments. Add a `BodyComposition.js` model (weight, body fat %, muscle
  mass, date, user ref) and a matching route/controller if you want this.
- JWT tokens are not stored or revocable server-side (standard stateless
  JWT) — if you need to force-logout a user before their token expires,
  you'd need a token blocklist or to switch to session-based auth.
- `.env` still carries SMTP placeholders for future features — nothing
  reads those yet, only `DB_URI`, `PORT`, `NODE_ENV`, `JWT_SECRET`,
  `JWT_EXPIRES_IN`, and the two `RAZORPAY_*` keys are live.
