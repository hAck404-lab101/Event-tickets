import { Database } from './database'

export type Event = Database['public']['Tables']['events']['Row']
// Add more domain types that omit system fields or map to view models
