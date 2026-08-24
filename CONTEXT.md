# Salon Booking

Persian-language marketplace where customers book appointments with beauty businesses and their professionals.

## Language

**User**:
A person identified by a unique phone number, with role Customer or Professional.
_Avoid_: Account, client

**Customer**:
A User who books appointments.
_Avoid_: Client, guest, buyer

**Professional**:
A User who works at one Business and whose working hours and bookings occupy time.
_Avoid_: Barber, staff, employee, stylist

**Business**:
A salon or shop with a public profile, services, and one or more Professionals.
_Avoid_: Salon, shop, venue, location (until branches exist)

**Service**:
A named offering of a Business with category, duration, price in IRR, and active flag.
_Avoid_: Product, treatment, item

**WorkingHour**:
A weekly time window for one Professional on one weekday in Asia/Tehran. A missing weekday means closed.
_Avoid_: Schedule, shift, availability rule

**Slot**:
A server-computed start time when a Service can be booked with a Professional without overlapping an active Booking and inside WorkingHours.
_Avoid_: Availability (as a stored entity)

**Booking**:
A reserved interval `[startsAt, endsAt)` tying a Customer, Professional, Business, and Service, with a status and a price snapshot.
_Avoid_: Appointment, reservation, order

**Booking status**:
`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`. This slice creates bookings as `CONFIRMED`.
_Avoid_: State, phase
