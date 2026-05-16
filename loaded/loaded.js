import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://sksnzpinpswzwmaophiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrc256cGlucHN3endtYW9waGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTA0MzEsImV4cCI6MjA5MDIyNjQzMX0.IhbJ1EXEymJlWaA1jPC8rH0JJwRTNoJLWlQUsJZTuUw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const TIERS = ['Legendary', 'Epic', 'Rare', 'Common'];

const TIER_STYLES = {
  Legendary: { color: 'rgb(255, 115, 0)', glow: 'rgba(255, 115, 0, 0.65)', ink: '#040707' },
  Epic: { color: 'rgb(178, 76, 255)', glow: 'rgba(178, 76, 255, 0.55)', ink: '#fff8e5' },
  Rare: { color: 'rgb(76, 153, 255)', glow: 'rgba(76, 153, 255, 0.55)', ink: '#040707' },
  Common: { color: '#ffffff', glow: 'rgba(4, 7, 7, 0.14)', ink: '#040707' },
};

const state = {
  packSet: null,
  cards: [],
  channel: null,
  mode: 'public',
  onStatusChange: null,
};

const els = {
  packTitle: document.querySelector('#packTitle'),
  packMeta: document.querySelector('#packMeta'),
  oddsGrid: document.querySelector('#oddsGrid'),
  cardsWrap: document.querySelector('#cardsWrap'),
  statusBanner: document.querySelector('#statusBanner'),
  modal: document.querySelector('#imageModal'),
  modalImage: document.querySelector('#modalImage'),
  modalTitle: document.querySelector('#modalTitle'),
  modalMeta: document.querySelector('#modalMeta'),
};

export async function initLoadedViewer({ userId, mode = 'public', onStatusChange = null } = {}) {
  state.mode = mode;
  state.onStatusChange = onStatusChange;
  bindModal();

  if (!userId) {
    showStatus('Missing public link user ID. Use /loaded/?u=<user_id>.', true);
    renderEmpty();
    return null;
  }

  await loadPackSet(userId);
  return state;
}

export async function loadPackSet(userId) {
  showStatus('Loading pack...', false);

  const { data: packSet, error: packError } = await supabase
    .from('pack_sets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (packError) {
    showStatus(`Could not load pack set: ${packError.message}`, true);
    renderEmpty();
    return;
  }

  if (!packSet) {
    showStatus('No active loaded pack set found for this user.', true);
    renderEmpty();
    return;
  }

  state.packSet = packSet;
  await loadCards();
  subscribeToCards();
  hideStatus();
}

export async function loadCards() {
  if (!state.packSet) return;

  const { data, error } = await supabase
    .from('pack_set_cards')
    .select('*')
    .eq('pack_set_id', state.packSet.id)
    .order('sort_order', { ascending: true });

  if (error) {
    showStatus(`Could not load cards: ${error.message}`, true);
    return;
  }

  state.cards = data || [];
  render();
}

export async function updateCardStatus(cardId, status) {
  const existingCard = state.cards.find((card) => card.id === cardId);
  if (!existingCard) return { error: new Error('Card not found') };

  const previousStatus = existingCard.status;
  existingCard.status = status;
  render();

  const { error } = await supabase
    .from('pack_set_cards')
    .update({ status })
    .eq('id', cardId)
    .eq('pack_set_id', state.packSet.id);

  if (error) {
    existingCard.status = previousStatus;
    render();
    return { error };
  }

  await loadCards();
  return { error: null };
}

function subscribeToCards() {
  if (!state.packSet) return;

  if (state.channel) {
    supabase.removeChannel(state.channel);
  }

  state.channel = supabase
    .channel(`pack_set_cards_changes_${state.packSet.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pack_set_cards',
        filter: `pack_set_id=eq.${state.packSet.id}`,
      },
      () => {
        loadCards();
      },
    )
    .subscribe();
}

function render() {
  renderHeader();
  renderOdds();
  renderCards();
}

function renderHeader() {
  const price = formatPrice(state.packSet?.price);
  els.packTitle.textContent = state.packSet ? `${state.packSet.name} — ${price}` : 'Loaded Pack';
  els.packMeta.textContent = `${availableCards().length} of ${state.cards.length} cards remaining`;
}

function renderOdds() {
  const totalAvailable = availableCards().length;
  els.oddsGrid.innerHTML = '';

  TIERS.forEach((tier) => {
    const count = state.cards.filter((card) => card.rarity_tier === tier && card.status !== 'gone').length;
    const percentage = totalAvailable > 0 ? (count / totalAvailable) * 100 : 0;
    const card = document.createElement('article');
    card.className = 'odds-card';
    applyTierStyle(card, tier);
    card.innerHTML = `
      <span class="tier-dot" aria-hidden="true"></span>
      <span>
        <span class="odds-name">${escapeHtml(tier)}</span>
        <span class="odds-count">${count} remaining</span>
      </span>
      <span class="odds-percent">${formatPercent(percentage)}</span>
    `;
    els.oddsGrid.append(card);
  });
}

function renderCards() {
  els.cardsWrap.innerHTML = '';

  if (!state.cards.length) {
    renderEmpty('No cards have been added to this pack yet.');
    return;
  }

  TIERS.forEach((tier) => {
    const tierCards = state.cards
      .filter((card) => card.rarity_tier === tier)
      .sort((a, b) => statusRank(a.status) - statusRank(b.status) || (a.sort_order || 0) - (b.sort_order || 0));

    if (!tierCards.length) return;

    const section = document.createElement('section');
    section.className = 'tier-section';
    applyTierStyle(section, tier);

    const remaining = tierCards.filter((card) => card.status !== 'gone').length;
    section.innerHTML = `
      <div class="tier-heading">
        <div class="tier-title">
          <span class="tier-badge">${escapeHtml(tier)}</span>
          <h3>${escapeHtml(tier)}</h3>
        </div>
        <span class="tier-count">${remaining}/${tierCards.length} left</span>
      </div>
      <div class="card-grid"></div>
    `;

    const grid = section.querySelector('.card-grid');
    tierCards.forEach((card) => grid.append(renderCard(card)));
    els.cardsWrap.append(section);
  });
}

function renderCard(card) {
  const tile = document.createElement('article');
  tile.className = `card-tile ${card.status === 'gone' ? 'is-gone' : ''}`;

  const imageUrl = card.image_url_small || card.image_url_large || '';
  const statusButton = state.mode === 'admin'
    ? `<div class="card-actions">
        <button class="action-btn ${card.status === 'gone' ? 'restore' : ''}" type="button" data-card-action="${card.id}" data-next-status="${card.status === 'gone' ? 'available' : 'gone'}">
          ${card.status === 'gone' ? 'Restore' : 'Mark pulled'}
        </button>
      </div>`
    : '';

  tile.innerHTML = `
    <button class="card-image-button" type="button" data-card-preview="${card.id}" aria-label="Open ${escapeHtml(card.card_name)} image">
      <img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(card.card_name)}" loading="lazy">
    </button>
    <div>
      <p class="card-name">${escapeHtml(card.card_name)}</p>
      <p class="card-meta">${escapeHtml(card.set_name || 'Unknown set')} ${card.card_number ? `#${escapeHtml(card.card_number)}` : ''}</p>
    </div>
    ${statusButton}
  `;

  tile.querySelector('[data-card-preview]').addEventListener('click', () => openModal(card));

  const actionButton = tile.querySelector('[data-card-action]');
  if (actionButton) {
    actionButton.addEventListener('click', async () => {
      actionButton.disabled = true;
      const nextStatus = actionButton.dataset.nextStatus;
      if (state.onStatusChange) {
        await state.onStatusChange(card.id, nextStatus);
      }
    });
  }

  return tile;
}

function openModal(card) {
  els.modalImage.src = card.image_url_large || card.image_url_small || '';
  els.modalImage.alt = card.card_name;
  els.modalTitle.textContent = card.card_name;
  els.modalMeta.textContent = `${card.set_name || 'Unknown set'}${card.card_number ? ` #${card.card_number}` : ''}`;
  els.modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function bindModal() {
  if (!els.modal || els.modal.dataset.bound === 'true') return;
  els.modal.dataset.bound = 'true';
  els.modal.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.modal.hidden) closeModal();
  });
}

function closeModal() {
  els.modal.hidden = true;
  els.modalImage.src = '';
  document.body.style.overflow = '';
}

function renderEmpty(message = 'Nothing to show yet.') {
  if (els.packTitle && !state.packSet) els.packTitle.textContent = 'Loaded Pack';
  if (els.packMeta && !state.packSet) els.packMeta.textContent = 'Waiting for an active pack set.';
  if (els.oddsGrid) els.oddsGrid.innerHTML = '';
  if (els.cardsWrap) {
    els.cardsWrap.innerHTML = `<div class="panel empty-state">${escapeHtml(message)}</div>`;
  }
}

function showStatus(message, isError = false) {
  if (!els.statusBanner) return;
  els.statusBanner.hidden = false;
  els.statusBanner.textContent = message;
  els.statusBanner.classList.toggle('is-error', isError);
}

function hideStatus() {
  if (!els.statusBanner) return;
  els.statusBanner.hidden = true;
  els.statusBanner.textContent = '';
  els.statusBanner.classList.remove('is-error');
}

function availableCards() {
  return state.cards.filter((card) => card.status !== 'gone');
}

function statusRank(status) {
  return status === 'gone' ? 1 : 0;
}

function applyTierStyle(element, tier) {
  const style = TIER_STYLES[tier] || TIER_STYLES.Common;
  element.style.setProperty('--tier-color', style.color);
  element.style.setProperty('--tier-glow', style.glow);
  element.style.setProperty('--tier-ink', style.ink);
}

function formatPrice(price) {
  const numericPrice = Number(price);
  if (Number.isFinite(numericPrice)) {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    }).format(numericPrice);
  }
  return `$${price}`;
}

function formatPercent(value) {
  if (value === 0) return '0%';
  if (value < 10) return `${value.toFixed(1)}%`;
  return `${Math.round(value)}%`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value = '') {
  return escapeHtml(value);
}

const params = new URLSearchParams(window.location.search);
if (document.querySelector('[data-mode="public"]')) {
  initLoadedViewer({ userId: params.get('u'), mode: 'public' });
}
