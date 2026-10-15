/**
 * A company-assigned Service Request as returned by
 * `GET /service-requests/company-admin/list`. Fields the backend did not send are
 * null rather than defaulted, so the UI can say "Not available" instead of
 * displaying invented values.
 */
export interface CompanyServiceRequest {
  /** Backend record id, used for routing. */
  id: string;
  /** Human-facing Service Request reference (falls back to the record id). */
  reference: string;
  /** Backend status normalised to snake_case, e.g. "mechanic_accepted". */
  status: string | null;
  customerName: string | null;
  mechanicId: string | null;
  mechanicName: string | null;
  serviceName: string | null;
  location: string | null;
  paymentStatus: string | null;
  amount: number | null;
  currency: string | null;
  /** Booking date, or creation date when the booking has no scheduled date. */
  date: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type ServiceRequestSort = "newest" | "oldest";

export interface ServiceRequestFilters {
  search: string;
  /** "" means all statuses. */
  status: string;
  /** Mechanic key from `getMechanicKey`; "" means all mechanics. */
  mechanic: string;
  /** "" means all payment statuses. */
  paymentStatus: string;
  /** Inclusive local dates in YYYY-MM-DD form; "" means unbounded. */
  from: string;
  to: string;
  sort: ServiceRequestSort;
}

/** One numeric figure from GET /service-requests/company-admin/stats. */
export interface ServiceRequestStat {
  key: string;
  label: string;
  value: number;
}

export interface CompanyServiceRequestPage {
  requests: CompanyServiceRequest[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ReassignableMechanic {
  id: string;
  name: string;
}
