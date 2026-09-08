import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySuperuser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'superuser' ? user : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifySuperuser(req);
  if (!admin) return res.status(403).json({ error: 'Superuser access required' });

  const { action, payload } = req.body;

  if (action === 'undo_tip') {
    const { error } = await supabase.rpc('undo_tip', { p_log_id: payload.logId });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, message: 'Tip undone' });
  }

  if (action === 'add_person') {
    const { error } = await supabase.from('rankings').insert([{ name: payload.name, points: 0 }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, message: 'Person added' });
  }

  if (action === 'remove_person') {
    const { error } = await supabase.from('rankings').delete().eq('id', payload.personId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, message: 'Person removed' });
  }

  return res.status(400).json({ error: 'Invalid action' });
}