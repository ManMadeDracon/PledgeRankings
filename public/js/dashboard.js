const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let sessionToken = '';
let currentUserRole = 'standard';
let personMap = {};

// Log Pagination Variables
let logOffset = 0;
const LOG_LIMIT = 10;
let isLoadingLogs = false;
let hasMoreLogs = true;

async function init() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }

  sessionToken = session.access_token;
  
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
  currentUserRole = profile?.role || 'standard';

  document.getElementById('userInfo').innerText = `Logged in as: ${session.user.email} (${currentUserRole.toUpperCase()})`;

  // Load people first to build personMap before rendering logs
  await loadPeople();

  if (currentUserRole === 'superuser') {
    document.querySelectorAll('.superuser-only').forEach(el => el.style.display = 'block');
    setupLogsScrollListener();
    loadLogs(true);
    loadUsers();
  }
}

async function loadPeople() {
  const { data } = await supabaseClient.from('rankings').select('*').order('name');
  const select = document.getElementById('personSelect');
  const list = document.getElementById('peopleList');
  select.innerHTML = '';
  if (list) list.innerHTML = '';

  personMap = {};
  data?.forEach(person => {
    personMap[person.id] = person.name;
    select.innerHTML += `<option value="${person.id}">${person.name} (${person.points} pts)</option>`;
    if (list && currentUserRole === 'superuser') {
      list.innerHTML += `<li>${person.name} <button onclick="removePerson(${person.id})">Remove</button></li>`;
    }
  });
}

// Paginated Logs Loader
async function loadLogs(reset = false) {
  if (reset) {
    logOffset = 0;
    hasMoreLogs = true;
    document.querySelector('#logsTable tbody').innerHTML = '';
  }

  if (!hasMoreLogs || isLoadingLogs) return;
  isLoadingLogs = true;

  const { data, error } = await supabaseClient
    .from('tip_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(logOffset, logOffset + LOG_LIMIT - 1);

  if (error || !data || data.length === 0) {
    hasMoreLogs = false;
    isLoadingLogs = false;
    return;
  }

  if (data.length < LOG_LIMIT) {
    hasMoreLogs = false;
  }

  const tbody = document.querySelector('#logsTable tbody');

  data.forEach(log => {
    // Map person IDs to recipient names
    const recipientNames = (log.person_ids || [])
      .map(id => personMap[id] || 'Unknown')
      .join(', ');

    const rowClass = log.is_undone ? 'undone' : '';
    const actionBtn = log.is_undone ? 'Undone' : `<button onclick="undoTip(${log.id})">Undo</button>`;
    const pointsFormatted = log.points_changed > 0 ? `+${log.points_changed}` : log.points_changed;

    tbody.innerHTML += `
      <tr class="${rowClass}">
        <td>${new Date(log.created_at).toLocaleString()}</td>
        <td>${log.user_email || 'System'}</td>
        <td><strong>${recipientNames}</strong></td>
        <td>${pointsFormatted}</td>
        <td>${log.reason || ''}</td>
        <td>${log.description || ''}</td>
        <td>${actionBtn}</td>
      </tr>`;
  });

  logOffset += data.length;
  isLoadingLogs = false;
}

// Scroll listener for lazy loading logs
function setupLogsScrollListener() {
  const scrollContainer = document.getElementById('logsScrollContainer');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      const nearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 20;
      if (nearBottom) {
        loadLogs(false);
      }
    });
  }
}

async function loadUsers() {
  const { data } = await supabaseClient.from('profiles').select('*');
  const list = document.getElementById('usersList');
  list.innerHTML = '';
  
  data?.forEach(u => {
    const nextRole = u.role === 'superuser' ? 'standard' : 'superuser';
    const buttonLabel = u.role === 'superuser' ? 'Demote to Standard' : 'Promote to Superuser';

    list.innerHTML += `
      <li style="margin-bottom: 8px;">
        <strong>${u.email}</strong> [${u.role}] 
        <button onclick="updateUserRole('${u.id}', '${nextRole}')">${buttonLabel}</button>
        <button onclick="deleteUser('${u.id}')">Delete</button>
      </li>`;
  });
}

// Form Handlers
document.getElementById('tipForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const personIds = Array.from(document.getElementById('personSelect').selectedOptions).map(o => o.value);
  const points = document.getElementById('pointsInput').value;
  const reason = document.getElementById('reasonInput').value;
  const description = document.getElementById('descInput').value;

  const result = await API.submitTip(sessionToken, { personIds, points, reason, description });
  const statusMsg = document.getElementById('statusMsg');

  if (result.success) {
    statusMsg.style.color = 'green';
    statusMsg.innerText = 'Points updated successfully!';
    loadPeople();
    if (currentUserRole === 'superuser') loadLogs(true);
  } else {
    statusMsg.style.color = 'red';
    statusMsg.innerText = result.error;
  }
});

async function undoTip(logId) {
  await API.adminAction(sessionToken, 'undo_tip', { logId });
  loadLogs(true);
  loadPeople();
}

async function removePerson(personId) {
  await API.adminAction(sessionToken, 'remove_person', { personId });
  loadPeople();
}

async function updateUserRole(userId, role) {
  const res = await API.manageUsers(sessionToken, { action: 'update_role', userId, role });
  if (res.success) loadUsers();
  else alert('Failed to update role: ' + res.error);
}

async function deleteUser(userId) {
  await API.manageUsers(sessionToken, { action: 'delete_user', userId });
  loadUsers();
}

document.getElementById('addPersonForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('newPersonName').value;
  await API.adminAction(sessionToken, 'add_person', { name });
  document.getElementById('newPersonName').value = '';
  loadPeople();
});

document.getElementById('createUserForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('newUserEmail').value;
  const password = document.getElementById('newUserPass').value;
  const role = document.getElementById('newUserRole').value;

  await API.manageUsers(sessionToken, { action: 'create_user', email, password, role });
  loadUsers();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
});

init();