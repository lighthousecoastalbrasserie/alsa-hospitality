# ALSA Hospitality — MVP foundation

Next.js 15 + TypeScript + Neon PostgreSQL starter. Includes public pricing and a working database-backed quote request endpoint. **Not production-ready.**

## Run locally
1. `npm install`
2. Create a dedicated Neon PostgreSQL database and execute `db/schema.sql` in the Neon SQL editor.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
4. `npm run dev` then open `http://localhost:3000`.

## Included
- Responsive landing page and public quote request form.
- Well ($25), Standard ($35), Premium ($50) per guest, minimum 20 guests.
- Optional glassware +$5/guest and extra sparkling selection +$5/guest.
- $500 deposit displayed as credited to the event, not added as a fee.
- Database tables for customers, users, invitations, events, quotes, assignments and checklists.
- Server-side validation and parameterized SQL.

## Important: not yet implemented
- Authentication, invitations, admin and employee portal features. These are **placeholders**, not working dashboards.
- Per-spirit upgrades, detailed mixer/wine selections, travel fees, taxes, gratuity, payments, contracts, email notifications, 4+ hour pricing and event calendar.
- Production hardening: bot protection, rate limiting, privacy policy, email verification, audit logs, access policies, tests and deployment.
- Never put `DATABASE_URL` into client-side code. Do not deploy publicly before abuse controls and operational review.

## Next milestones
1. Implement authentication and invitation acceptance with verified admin-only role assignment.
2. Build administrator dashboard, event review and employee scheduling.
3. Build employee dashboard with assignment-only access.
4. Expand package configurator with all agreed drink selection and upgrade rules.
5. Add payments, documents, notifications, automated tests and production deployment.

## Authentication milestone (v0.2)

- Run `db/schema.sql`, then `db/auth-migration.sql` on a dedicated Neon database.
- Set `DATABASE_URL`, `AUTH_SECRET` (32+ random characters), and `APP_URL` in `.env.local`.
- Create the first administrator manually using a **bcrypt** password hash (cost 12) and a SQL insert into `app_users` with `role='admin'`, `status='active'`, and `password_hash` set. Do not store plaintext passwords.
- Admin signs in at `/login` and can create an employee invitation using `POST /api/admin/invitations` with JSON `{ "email": "employee@example.com" }`. This returns a one-time invitation URL; email delivery is **not implemented**.
- Employee opens `/invite?token=...`, chooses a 12+ character password, then signs in. Invitations expire after 48 hours.
- Admin and employee pages are checked server-side; employee sees only their assigned events.

### Before production
Add login rate limiting, email delivery, password reset, audit logs, CSRF/origin protections for sensitive POST operations, secure administrator bootstrap, and integration tests. Current authentication is a development milestone, not a production security certification.

## Current development status

The admin portal lists recent inquiries and provides a form to create employee invitation links. The customer portal lists only events explicitly linked to its user account. Employee dates use US formatting. The navigation includes all three portals.

This remains a development build. Customer registration and automatic linking of quote requests to customer accounts are not implemented. The existing custom authentication requires production hardening, including rate limiting, origin/CSRF protection, password recovery, and secure account bootstrap. Database-backed flows have not been tested against a live Neon project. Do not use this build for real customer or employee data until those issues are resolved and access controls are independently tested.

For Vercel, import the GitHub repository as a Next.js project and configure server-only DATABASE_URL, AUTH_SECRET, and APP_URL in the project environment. Set APP_URL to the deployed origin. Never commit secrets. The intended Neon project is dry-bar-58426950, branch production; verify the branch and existing schema before running any migrations.
