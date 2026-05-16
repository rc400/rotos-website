import { initLoadedViewer, supabase, updateCardStatus } from '../loaded.js';

const loginShell = document.querySelector('#loginShell');
const adminShell = document.querySelector('#adminShell');
const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');
const adminMessage = document.querySelector('#adminMessage');
const userIdText = document.querySelector('#userIdText');
const copyLinkButton = document.querySelector('#copyLinkButton');
const signOutButton = document.querySelector('#signOutButton');

let currentUser = null;

boot();

async function boot() {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    await showAdmin(data.session.user);
  } else {
    showLogin();
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setLoginMessage('Signing in...');

  const email = document.querySelector('#emailInput').value.trim();
  const password = document.querySelector('#passwordInput').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setLoginMessage(error.message, true);
    return;
  }

  await showAdmin(data.user);
});

signOutButton.addEventListener('click', async () => {
  await supabase.auth.signOut();
  currentUser = null;
  showLogin();
});

copyLinkButton.addEventListener('click', async () => {
  if (!currentUser) return;
  const publicUrl = `https://rotostcg.ca/loaded/?u=${currentUser.id}`;

  try {
    await navigator.clipboard.writeText(publicUrl);
    setAdminMessage(`Copied ${publicUrl}`);
  } catch {
    setAdminMessage(publicUrl);
  }
});

async function showAdmin(user) {
  currentUser = user;
  loginShell.hidden = true;
  adminShell.hidden = false;
  userIdText.textContent = user.id;
  setLoginMessage('');
  setAdminMessage('');

  await initLoadedViewer({
    userId: user.id,
    mode: 'admin',
    onStatusChange: async (cardId, nextStatus) => {
      setAdminMessage(nextStatus === 'gone' ? 'Marking pulled...' : 'Restoring...');
      const { error } = await updateCardStatus(cardId, nextStatus);
      if (error) {
        setAdminMessage(error.message, true);
        return;
      }
      setAdminMessage(nextStatus === 'gone' ? 'Marked pulled.' : 'Restored.');
    },
  });
}

function showLogin() {
  loginShell.hidden = false;
  adminShell.hidden = true;
}

function setLoginMessage(message, isError = false) {
  loginMessage.textContent = message;
  loginMessage.classList.toggle('is-error', isError);
}

function setAdminMessage(message, isError = false) {
  adminMessage.textContent = message;
  adminMessage.classList.toggle('is-error', isError);
}
