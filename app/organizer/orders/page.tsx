import { createServerClient, getAdminClient } from "@/lib/supabase/server";
import OrdersClient from "./OrdersClient";

export default async function OrganizerOrdersPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminSupabase = getAdminClient();

  let orders: any[] = [];

  if (user) {
    const { data: organizer } = await adminSupabase
      .from('organizers')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (organizer) {
      const { data: eventIds } = await adminSupabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizer.id);
        
      const ids = eventIds?.map(e => e.id) || [];
      
      if (ids.length > 0) {
        const { data: ordersData } = await adminSupabase
          .from('orders')
          .select('*, events(title), order_items(quantity, unit_price, ticket_types(name))')
          .in('event_id', ids)
          .order('created_at', { ascending: false });
          
        if (ordersData) orders = ordersData;
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Orders</h1>
        <p className="text-muted mt-1">View and manage all ticket orders.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <OrdersClient orders={orders} />
      </div>
    </div>
  );
}
