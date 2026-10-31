import { z } from 'zod'

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^[0-9+\s-]+$/, 'Invalid phone number format')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema
})

export const dailyRecordSchema = z.object({
  feed_bags_used: z.number().min(0).default(0),
  feed_cost: z.number().min(0).default(0),
  mortality_count: z.number().int().min(0).default(0),
  production_amt: z.number().min(0).default(0),
  egg_sales_amount: z.number().min(0).default(0),
  bird_sales_amount: z.number().min(0).default(0),
  manure_sales_amount: z.number().min(0).default(0),
  sales_amount: z.number().min(0).optional(),
  notes: z.string().optional(),
  record_date: z.string()
})

export const healthLogSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  details: z.string().optional(),
  cost: z.number().min(0).default(0),
  record_date: z.string()
})

export const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  expense_date: z.string().optional()
})

export const batchSchema = z.object({
  batch_name: z.string().optional(),
  animal_type: z.string().min(1, 'Animal type is required'),
  initial_count: z.number().int().positive('Count must be positive'),
  acquired_date: z.string().optional()
})

export const inventorySchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(0).default(0),
  unit: z.string().optional(),
  reorder_level: z.number().min(0).optional()
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  farm_type: z.string().min(1, 'Farm type is required')
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type DailyRecordInput = z.infer<typeof dailyRecordSchema>
export type HealthLogInput = z.infer<typeof healthLogSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type BatchInput = z.infer<typeof batchSchema>
export type InventoryInput = z.infer<typeof inventorySchema>
export type ProfileInput = z.infer<typeof profileSchema>