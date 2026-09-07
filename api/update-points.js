import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the Secret Role Key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { personId, points, adminPassword } = req.body;

  // 1. Verify Password against Environment Variable
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect Password' });
  }

  // 2. Increment points safely using the database function created in SQL
  const { error } = await supabase.rpc('increment_points', {
    person_id: personId,
    amount: parseInt(points, 10)
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, message: 'Points added!' });
}