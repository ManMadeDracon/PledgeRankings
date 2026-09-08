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

  const { action, email, password, role, userId } = req.body;

  if (action === 'create_user') {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) return res.status(500).json({ error: error.message });

    if (role === 'superuser') {
      await supabase.from('profiles').update({ role: 'superuser' }).eq('id', data.user.id);
    }
    return res.status(200).json({ success: true });
  }

  if (action === 'delete_user') {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ error: 'Invalid action' });
}