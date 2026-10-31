export interface Farmer {
  id: string;
  email?: string;
  full_name?: string;
  name?: string;
  farm_type?: string;
  bird_types?: string[];
  created_at: string;
  updated_at?: string;
  is_premium?: boolean;
}

export interface DailyRecord {
  id: string;
  farmer_id: string;
  feed_bags_used: number;
  feed_cost: number;
  mortality_count: number;
  production_amt: number;
  sales_amount: number;
  egg_sales_amount?: number;
  bird_sales_amount?: number;
  manure_sales_amount?: number;
  notes?: string;
  record_date: string;
  created_at: string;
}

export interface HealthLog {
  id: string;
  farmer_id: string;
  action: string;
  details?: string;
  cost: number;
  record_date: string;
  created_at: string;
}

export interface Expense {
  id: string;
  farmer_id: string;
  category: string;
  description?: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

export interface Batch {
  id: string;
  farmer_id: string;
  batch_name?: string;
  animal_type?: string;
  initial_count: number;
  current_count: number;
  acquired_date: string;
  created_at: string;
}

export interface AIAlert {
  id: string;
  farmer_id: string;
  alert_type: 'mortality' | 'production' | 'feed_cost' | 'health' | 'inventory' | 'general';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
}

export interface Inventory {
  id: string;
  farmer_id: string;
  item_name: string;
  quantity: number;
  unit?: string;
  reorder_level?: number;
  created_at: string;
}

export interface FarmStats {
  totalSales: number;
  totalMortality: number;
  avgProduction: number;
  totalFeedCost: number;
}

export interface DailyRecordInput {
  farmer_id: string;
  feed_bags_used: number;
  feed_cost: number;
  mortality_count: number;
  production_amt: number;
  egg_sales_amount: number;
  bird_sales_amount: number;
  manure_sales_amount: number;
  sales_amount?: number;
  notes?: string;
  record_date: string;
}

export interface HealthLogInput {
  farmer_id: string;
  action: string;
  details?: string;
  cost: number;
  record_date: string;
}

export interface ExpenseInput {
  farmer_id: string;
  category: string;
  description?: string;
  amount: number;
  expense_date?: string;
}

export interface BatchInput {
  farmer_id: string;
  batch_name?: string;
  animal_type?: string;
  initial_count: number;
  acquired_date?: string;
}

export interface InventoryInput {
  farmer_id: string;
  item_name: string;
  quantity?: number;
  unit?: string;
  reorder_level?: number;
}

export interface AIAlertInput {
  farmer_id: string;
  alert_type: AIAlert['alert_type'];
  title: string;
  message: string;
  severity?: AIAlert['severity'];
}

export interface WeeklyDataPoint {
  date: string;
  dayName: string;
  eggs: number;
  feed: number;
}

export interface SyncOperation {
  id: string;
  timestamp: string;
  type: string;
  payload: any;
}