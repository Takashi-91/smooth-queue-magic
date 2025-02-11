
export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  provider_id: string;
  provider?: {
    name: string;
    email: string;
  };
}

export interface QueueItem {
  id: number;
  customer_name: string;
  service_id: number;
  status: string;
  created_at: string;
  reference_number: string;
  booking_status: string;
  provider_response_at?: string | null;
  service?: {
    name: string;
  };
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

