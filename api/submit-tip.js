import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  // Verify user token
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { personIds, points, reason, description } = req.body;

  if (!personIds || !personIds.length || !points) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Call Supabase RPC function
  const { error } = await supabase.rpc('submit_tip', {
    p_user_id: user.id,
    p_user_email: user.email,
    p_person_ids: personIds.map(id => parseInt(id, 10)),
    p_points: parseInt(points, 10),
    p_reason: reason || '',
    p_description: description || ''
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}