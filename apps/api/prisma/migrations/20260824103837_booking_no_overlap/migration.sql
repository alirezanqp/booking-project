-- Prevent overlapping non-cancelled bookings for the same professional.
-- Prisma DateTime maps to timestamp(3) without time zone, so tsrange is IMMUTABLE.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_no_overlap"
EXCLUDE USING gist (
  "professionalId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
) WHERE (status <> 'CANCELLED');
