import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, registrationKey } = req.body;

  // 1. Verify the registration key against the existing ADMIN_PASSWORD variable
  if (!registrationKey || registrationKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid secret key' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // 2. Create user with auto-confirmed email using Service Role
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, message: 'Account created successfully' });
}