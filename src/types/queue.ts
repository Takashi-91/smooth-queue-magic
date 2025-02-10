
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
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  created_at: string;
}
