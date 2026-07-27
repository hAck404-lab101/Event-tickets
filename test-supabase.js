require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.auth.admin.createUser({
    phone: '+233999999999',
    password: 'password123',
    phone_confirm: false,
  });
  if (error) {
    console.error("Create error:", error);
  } else {
    console.log("Success:", data);
  }
}

test();
