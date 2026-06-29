import { apiClient } from "@/services/http-client";
import type {
  AdminRequest,
  RequestPriority,
  RequestStatus,
} from "@/features/requests/types";

type BackendEntity = {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  email?: string;
  title?: string;
};

type BackendBooking = {
  _id?: string;
  id?: string;
  requestId?: string;
  request_id?: string;
  service?: string | BackendEntity;
  serviceName?: string;
  service_name?: string;
  customer?: string | BackendEntity;
  provider?: string | BackendEntity;
  mechanic?: string | BackendEntity;
  employee?: string | BackendEntity;
  location?: string;
  coverage_area?: string;
  amount?: number;
  status?: string;
  priority?: string;
  paymentStatus?: string;
  payment_status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  bookingDate?: string;
  booking_date?: string;
};

type BackendBookingsResponse =
  | BackendBooking[]
  | {
      data?:
        | BackendBooking[]
        | {
            bookings?: BackendBooking[];
            docs?: BackendBooking[];
            results?: BackendBooking[];
          };
      bookings?: BackendBooking[];
      docs?: BackendBooking[];
      results?: BackendBooking[];
    };

function isBackendBooking(value: unknown): value is BackendBooking {
  return Boolean(value) && typeof value === "object";
}

function normalizeBookingList(bookings: unknown): BackendBooking[] {
  return Array.isArray(bookings) ? bookings.filter(isBackendBooking) : [];
}

function unwrapBookings(response: BackendBookingsResponse | null | undefined): BackendBooking[] {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return normalizeBookingList(response);
  }

  if (Array.isArray(response.data)) {
    return normalizeBookingList(response.data);
  }

  return normalizeBookingList(
    response.data?.bookings ??
    response.data?.docs ??
    response.data?.results ??
    response.bookings ??
      response.docs ??
      response.results ??
      [],
  );
}

function getEntityName(entity: string | BackendEntity | null | undefined, fallback: string) {
  if (!entity) {
    return fallback;
  }

  if (typeof entity === "string") {
    return entity;
  }

  return (
    entity.name ??
    entity.fullName ??
    entity.full_name ??
    entity.title ??
    entity.email ??
    fallback
  );
}

function normalizeStatus(status: string | undefined): RequestStatus {
  const normalized = status?.toLowerCase().replace(/[_-]/g, " ") ?? "";

  if (normalized.includes("complete")) {
    return "Completed";
  }

  if (normalized.includes("approve") || normalized.includes("accept")) {
    return "Approved";
  }

  if (normalized.includes("reject") || normalized.includes("cancel")) {
    return "Rejected";
  }

  if (normalized.includes("review") || normalized.includes("progress")) {
    return "In Review";
  }

  return "Pending";
}

function normalizePriority(priority: string | undefined): RequestPriority {
  const normalized = priority?.toLowerCase() ?? "";

  if (normalized === "urgent") {
    return "Urgent";
  }

  if (normalized === "high") {
    return "High";
  }

  if (normalized === "low") {
    return "Low";
  }

  return "Medium";
}

function normalizeBooking(booking: BackendBooking): AdminRequest {
  const id = booking.requestId ?? booking.request_id ?? booking._id ?? booking.id ?? "BOOKING";
  const date =
    booking.bookingDate ??
    booking.booking_date ??
    booking.createdAt ??
    booking.created_at ??
    booking.updatedAt ??
    new Date().toISOString();

  return {
    id,
    employeeName: getEntityName(booking.customer, "Unknown customer"),
    department: booking.location ?? booking.coverage_area ?? "Booking",
    requestType:
      booking.serviceName ??
      booking.service_name ??
      getEntityName(booking.service, "Service booking"),
    date: Number.isNaN(new Date(date).getTime()) ? new Date().toISOString() : date,
    priority: normalizePriority(booking.priority),
    status: normalizeStatus(booking.status),
    assignedTo: getEntityName(
      booking.mechanic ?? booking.employee ?? booking.provider,
      "Unassigned",
    ),
  };
}

export async function getAdminBookings(): Promise<AdminRequest[]> {
  const response = await apiClient.get<BackendBookingsResponse>(
    "/bookings/company-admin/bookings",
  );

  return unwrapBookings(response.data).map(normalizeBooking);
}
