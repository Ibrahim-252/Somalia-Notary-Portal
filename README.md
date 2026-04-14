# Daftarka - Somalia Notary System Portal

A clean, modern web portal for Somali notary offices to register, log in, and manage their documents digitally. Built with plain HTML, CSS, and JavaScript,no frameworks, no build tools, no server required.

**Last updated: April 14, 2026**

## What It Is

Daftarka replaces paper logbooks and scattered physical files with a simple digital registry. Notary offices sign up once, then use the portal to submit and track documents from any browser.

The name **Daftarka** means "the book" or "the ledger" in Somali — exactly what this system is.

## The Problem It Solves

Most notary offices in Somalia still rely on paper records. This creates real problems:

- Documents get lost, damaged, or destroyed
- Finding a specific record can take hours of searching
- There's no audit trail — no way to know who submitted what, or when
- Physical storage doesn't scale as an office grows

Daftarka solves all of this with a lightweight, browser-based registry that any office can start using in minutes.

## Features

- **Office registration** with duplicate email detection
- **Secure login** with session management
- **Personalized dashboard** showing office name, document stats, and member date
- **Submit documents** with title, type, date, parties, and notes
- **Live search** across all submitted documents
- **Responsive design** — works on desktop, tablet, and mobile
- **No server needed** — runs entirely in the browser

## Project Structure

Somali Notry System/
│
├── index.html          # Homepage — explains the system, links to sign up
├── signup.html         # Office registration page
├── login.html          # Login page
├── dashboard.html      # Office dashboard (protected)
│
├── styles/
│   └── style.css       # All styles — layout, components, responsive rules
│
├── scripts/
│   ├── storage.js      # Simulated backend (localStorage read/write, sessions)
│   ├── home.js         # Homepage scroll animations
│   ├── signup.js       # Registration form logic and validation
│   ├── login.js        # Login form logic and auth check
│   └── dashboard.js    # Dashboard: stats, document list, add-doc modal
│
├── data/
│   ├── documents.json  # Sample document data
│   └── offices.json    # Sample office data
│
└── pages/
    ├── dashboard.html  # Office dashboard (protected)
    ├── index.html      # Additional index page
    ├── login.html      # Login page
    └── signup.html     # Office registration page
│
└── data/
    ├── offices.json    # Schema reference for office records
    └── documents.json  # Schema reference for document records

## How to Run

No installation. No terminal. Just open a file.

1. Download or clone the project folder
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
3. Click **Get started** to create your first office account
4. Log in and start submitting documents

> All data is stored in your browser's `localStorage`. Nothing is sent to a server.

## Pages Walkthrough

### Homepage (`index.html`)
- Explains what Daftarka is and why it exists
- Shows sample document cards to give a feel for the product
- Links to sign up and a "How it works" section

### Sign Up (`signup.html`)
- Fields: Office Name, Contact Person, Email, Phone Number, Password
- Validates all fields before submission
- Checks for duplicate email addresses
- On success, creates a session and redirects to the dashboard

### Login (`login.html`)
- Fields: Email and Password
- Checks credentials against stored offices
- On success, creates a session and redirects to the dashboard
- Shows a clear error if credentials are wrong

### Dashboard (`dashboard.html`)
- Protected — redirects to login if no session is found
- Displays a greeting with the office name
- Shows four stat cards: Total Documents, Verified, Pending, Member Since
- "Submit new document" opens a modal form
- Document table is searchable in real time
- Log out button clears the session and returns to homepage

## Data Storage

Since this is a frontend-only MVP, data is stored using the browser's `localStorage` under two keys:

| Key | Contents |
|---|---|
| `daftarka_offices` | Array of registered office objects |
| `daftarka_documents` | Array of submitted document objects |

Sessions are stored in `sessionStorage` and expire when the browser tab is closed.

### Office record shape
```json
{
  "id": "off_1712345678901",
  "officeName": "Mogadishu Central Notary",
  "contactPerson": "Ahmed Omar",
  "email": "ahmed@centralnotary.so",
  "phone": "+252 61 234 5678",
  "password": "••••••••",
  "createdAt": "2026-04-06T08:00:00.000Z"
}

### Document record shape
json
{
  "id": "doc_1712345678902",
  "officeId": "off_1712345678901",
  "title": "Land Transfer Agreement",
  "type": "Land Transfer",
  "date": "2026-04-06",
  "parties": "Ahmed Omar, Fatima Hassan",
  "notes": "Property in Hodan district",
  "status": "Pending",
  "createdAt": "2026-04-06T09:15:00.000Z"
}
```

---

## Design Decisions

- **Fonts:** DM Serif Display (headings) + Sora (body) — editorial and trustworthy
- **Colors:** Deep ink (`#16120e`) + warm sand (`#f5efe6`) + gold accent (`#c8963c`) — professional, warm, grounded
- **No inline styles or scripts** — all CSS lives in `style.css`, all JS in separate files
- **No frameworks** — plain HTML, CSS, and vanilla JavaScript only
- **Human-readable code** — variables are named clearly, functions do one thing, comments explain intent

## Upgrading to a Real Backend

When you're ready to move beyond localStorage, the `storage.js` file is the only thing that needs to change. Replace its functions with `fetch()` calls to a REST API and the rest of the code stays the same.

Suggested stack for a real backend:

- **Node.js + Express** for the API
- **MongoDB** or **PostgreSQL** for the database
- **JWT** for proper authentication
- **bcrypt** for password hashing

## Browser Support

Works in all modern browsers. Requires JavaScript to be enabled.

| Browser | Supported |
|---|---|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |

## License

Free to use and modify for any Somali public service or government office.

*Built for Somalia. Designed to last.*
