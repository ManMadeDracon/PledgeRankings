const API = {
  // Submit points to one or multiple people
  async submitTip(token, { personIds, points, reason, description }) {
    const res = await fetch('/api/submit-tip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ personIds, points, reason, description })
    });
    return res.json();
  },

  // Perform administrative actions (undo_tip, add_person, remove_person)
  async adminAction(token, action, payload) {
    const res = await fetch('/api/admin-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action, payload })
    });
    return res.json();
  },

  // Manage accounts (create_user, update_role, delete_user)
  async manageUsers(token, payload) {
    const res = await fetch('/api/manage-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Secret user registration
  async register(email, password, registrationKey) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, registrationKey })
    });
    return res.json();
  }
};