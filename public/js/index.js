const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let personMap = {};

async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    const authBtn = document.getElementById('authBtn');
    authBtn.innerText = '⚡ Go to Dashboard';
    authBtn.href = 'dashboard.html';
  }
}

async function loadRankings() {
  const { data } = await supabaseClient.from('rankings').select('*').order('points', { ascending: false });
  const listDiv = document.getElementById('leaderboard');
  listDiv.innerHTML = '';
  
  personMap = {};
  data?.forEach(item => {
    personMap[item.id] = item.name;
    listDiv.innerHTML += `<div class="person"><span><strong>${item.name}</strong></span><span>${item.points} pts</span></div>`;
  });

  loadFeed();
}

async function loadFeed() {
  const { data } = await supabaseClient
    .from('tip_logs')
    .select('*')
    .eq('is_undone', false)
    .order('created_at', { ascending: false })
    .limit(15);

  const feedDiv = document.getElementById('feed');
  if (!data || data.length === 0) {
    feedDiv.innerHTML = '<p style="color:#777;">No recent activity.</p>';
    return;
  }

  feedDiv.innerHTML = '';
  data.forEach(log => {
    const names = (log.person_ids || []).map(id => personMap[id] || 'Someone');
    let formattedNames = names.length === 1 ? names[0] :
      names.length === 2 ? names.join(' and ') :
      names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];

    const pts = Math.abs(log.points_changed);
    const action = log.points_changed >= 0 ? 'earned' : 'lost';
    const pointLabel = pts === 1 ? 'point' : 'points';
    const reasonText = log.reason ? ` for ${log.reason}` : '';

    const mainText = `<strong>${formattedNames}</strong> ${action} ${pts} ${pointLabel}${reasonText}`;
    const descHtml = log.description ? `<div class="feed-desc">${log.description}</div>` : '';

    feedDiv.innerHTML += `
      <div class="feed-item">
        <div class="feed-text">${mainText}</div>
        ${descHtml}
      </div>`;
  });
}

// Realtime Subscriptions
supabaseClient.channel('realtime-index')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, loadRankings)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tip_logs' }, loadFeed)
  .subscribe();

checkAuth();
loadRankings();