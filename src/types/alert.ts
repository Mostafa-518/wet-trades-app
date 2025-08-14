
export interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  project_id: string | null;
  subcontractor_id: string | null;
  total_amount: number | null;
  threshold_amount: number | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertInsert {
  type?: string;
  title: string;
  message: string;
  project_id?: string | null;
  subcontractor_id?: string | null;
  total_amount?: number | null;
  threshold_amount?: number | null;
  is_read?: boolean;
  is_dismissed?: boolean;
}

export interface AlertUpdate {
  is_read?: boolean;
  is_dismissed?: boolean;
}
