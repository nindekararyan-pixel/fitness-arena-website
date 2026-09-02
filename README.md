# fitness-arena-website

Responsive Gym Website for Fitness Arena — A modern fitness platform showcasing membership plans, class schedules, trainers, and facilities. Built with HTML, CSS, and JavaScript (Node.js + Express optional). Includes responsive design, booking system, and SEO-friendly structure.
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
│                                        drop real gym photos here and update image
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
