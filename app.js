// Panel management
let panelOpen = false;
let chatHistory = [];
let currentPanelSection = 'chat';
const DAY_HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const DAY_SLOT_HEIGHT = 72;
const DAY_EVENT_HEIGHT = 56;
let planningState = {
  view: 'day',
  currentDate: new Date(),
  events: [],
  selectedEventId: null,
  nextEventId: 1
};

const panel = document.getElementById('panel');
const panelHandle = document.getElementById('panel-handle');
const chatPanel = document.getElementById('panel-chat');
const planningPanel = document.getElementById('panel-planning');
const miloBtnWrap = document.querySelector('.milo-btn-wrap');
const miloBtn = document.getElementById('milo-btn');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const chatHistoryEl = document.getElementById('chat-history');
const panelLabel = document.getElementById('panel-label');
const panelDragState = {
  active: false,
  pointerId: null,
  captureTarget: null,
  startY: 0,
  startX: 0,
  deltaY: 0,
  dragging: false,
  requireActivation: false
};

// Settings menu
const settingsMenu = document.getElementById('settings-menu');
const settingsMenuTrigger = document.getElementById('settings-menu-trigger');
const settingsMenuTriggerAvatar = document.getElementById('settings-menu-trigger-avatar');
const settingsMenuTriggerEducation = document.getElementById('settings-menu-trigger-education');
const settingsMenuTriggerPersonal = document.getElementById('settings-menu-trigger-personal');
const settingsMenuClose = document.getElementById('settings-menu-close');
const themeToggle = document.getElementById('theme-toggle');
const avatarPageTriggers = document.querySelectorAll('[data-open-avatar-page]');
const avatarImages = document.querySelectorAll('.profile-avatar-image');
const profileFirstNameInput = document.getElementById('profile-first-name');
const profileEmailInput = document.getElementById('profile-email');
const profilePhoneInput = document.getElementById('profile-phone');
const profileLanguageSelect = document.getElementById('profile-language');
const profileAccountTypeSelect = document.getElementById('profile-account-type');
const profilePhotoButton = document.getElementById('profile-photo-button');
const profilePhotoRemoveButton = document.getElementById('profile-photo-remove');
const profilePhotoInput = document.getElementById('profile-photo-input');
const profileSaveButton = document.getElementById('profile-save-btn');
const profileStorageKey = 'milo.profile';
let savedProfileSnapshot = null;
let currentProfilePhotoData = '';

function toggleSettingsMenu(event) {
  if (!settingsMenu) return;
  event.stopPropagation();
  settingsMenu.classList.toggle('open');
}

function closeSettingsMenu(event) {
  if (event) {
    event.stopPropagation();
  }
  if (settingsMenu) {
    settingsMenu.classList.remove('open');
  }
}

[settingsMenuTrigger, settingsMenuTriggerAvatar, settingsMenuTriggerEducation, settingsMenuTriggerPersonal].filter(Boolean).forEach(trigger => {
  trigger.addEventListener('click', toggleSettingsMenu);
});

if (settingsMenuClose) {
  settingsMenuClose.addEventListener('click', closeSettingsMenu);
}

document.addEventListener('click', (event) => {
  if (!settingsMenu) return;

  const clickedOnTrigger = [settingsMenuTrigger, settingsMenuTriggerAvatar, settingsMenuTriggerEducation, settingsMenuTriggerPersonal]
    .filter(Boolean)
    .some(trigger => trigger.contains(event.target));

  if (!settingsMenu.contains(event.target) && !clickedOnTrigger) {
    closeSettingsMenu();
  }
});

let isLightTheme = false;

function applyTheme(light) {
  isLightTheme = light;
  document.body.classList.toggle('light-theme', light);
  if (themeToggle) {
    themeToggle.classList.toggle('on', light);
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(!isLightTheme);
    showToast(isLightTheme ? 'Mode clair activé' : 'Mode sombre activé');
  });
}

// démarrer en sombre
applyTheme(false);

const initialProfileData = loadProfileData();
applyProfileData(initialProfileData);
savedProfileSnapshot = profileDataToSnapshot(initialProfileData);
initializeProfileForm();
updateProfileSaveState();

avatarPageTriggers.forEach(trigger => {
  trigger.addEventListener('click', showAvatarDevPage);
});

if (profilePhotoButton && profilePhotoInput) {
  profilePhotoButton.addEventListener('click', () => profilePhotoInput.click());
  profilePhotoInput.addEventListener('change', handleProfilePhotoChange);
}

if (profilePhotoRemoveButton) {
  profilePhotoRemoveButton.addEventListener('click', removeProfilePhoto);
}

if (profileSaveButton) {
  profileSaveButton.addEventListener('click', saveProfileData);
}

function openPanel() {
  panelOpen = true;
  panel.classList.remove('dragging');
  panel.style.transition = '';
  panel.style.transform = '';
  panel.classList.add('open');
}

function closePanel() {
  panelOpen = false;
  resetPanelDrag();
  panel.classList.remove('dragging');
  panel.style.transition = '';
  panel.style.transform = '';

  // fermeture visuelle
  panel.classList.remove('open');
  panel.classList.remove('fullscreen');

  // reset états Milo
  miloBtn.classList.remove('thinking', 'listening');
  setPanelState('idle');

  // reset sections (IMPORTANT)
  document.querySelectorAll('.panel-section').forEach(s => {
    s.style.display = 'none';
  });

  // reset section active
  currentPanelSection = null;
}

function showHome() {
  closePanel();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 0));
  document.getElementById('home-page').style.display = 'block';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'none';
  if (miloBtnWrap) miloBtnWrap.style.display = 'block';
}

function showEducation() {
  closePanel();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 2));
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'block';
  document.getElementById('personal-info-page').style.display = 'none';
  if (miloBtnWrap) miloBtnWrap.style.display = 'block';
}

function showPersonalInfo() {
  closePanel();
  closeSettingsMenu();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 3));
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'flex';
  if (miloBtnWrap) miloBtnWrap.style.display = 'none';
}

function showAvatarDevPage() {
  closePanel();
  closeSettingsMenu();
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'flex';
  if (miloBtnWrap) miloBtnWrap.style.display = 'none';
}

function getDefaultAvatarData() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#1e1e28"/><circle cx="32" cy="24" r="12" fill="#7c6df0"/><path d="M14 56c3-11 11-17 18-17s15 6 18 17" fill="#7c6df0"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function updateAvatarImages(photoData) {
  const src = photoData || getDefaultAvatarData();
  avatarImages.forEach(image => {
    image.src = src;
  });
}

function getDefaultProfile() {
  return {
    firstName: 'Maxim',
    email: 'maxim@example.com',
    phone: '',
    language: 'Français',
    accountType: 'Personnel',
    photo: ''
  };
}

function loadProfileData() {
  const defaults = getDefaultProfile();

  try {
    const rawProfile = window.localStorage.getItem(profileStorageKey);
    if (!rawProfile) {
      return defaults;
    }

    return { ...defaults, ...JSON.parse(rawProfile) };
  } catch {
    return defaults;
  }
}

function applyProfileData(profile) {
  currentProfilePhotoData = profile.photo || '';
  if (profileFirstNameInput) profileFirstNameInput.value = profile.firstName || '';
  if (profileEmailInput) profileEmailInput.value = profile.email || '';
  if (profilePhoneInput) profilePhoneInput.value = profile.phone || '';
  if (profileLanguageSelect) profileLanguageSelect.value = profile.language || 'Français';
  if (profileAccountTypeSelect) profileAccountTypeSelect.value = profile.accountType || 'Personnel';
  updateAvatarImages(currentProfilePhotoData);
}

function collectProfileData() {
  return {
    firstName: profileFirstNameInput?.value.trim() || '',
    email: profileEmailInput?.value.trim() || '',
    phone: profilePhoneInput?.value.trim() || '',
    language: profileLanguageSelect?.value || 'Français',
    accountType: profileAccountTypeSelect?.value || 'Personnel',
    photo: currentProfilePhotoData || ''
  };
}

function profileDataToSnapshot(profile) {
  return JSON.stringify(profile);
}

function updateProfileSaveState() {
  if (!profileSaveButton) return;

  const currentSnapshot = profileDataToSnapshot(collectProfileData());
  const hasChanges = currentSnapshot !== savedProfileSnapshot;
  profileSaveButton.disabled = !hasChanges;
}

function saveProfileData() {
  const profile = collectProfileData();
  window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  savedProfileSnapshot = profileDataToSnapshot(profile);
  updateProfileSaveState();
  showToast('Profil enregistré');
}

function handleProfilePhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    showToast('Importe un fichier JPEG ou PNG');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentProfilePhotoData = typeof reader.result === 'string' ? reader.result : '';
    updateAvatarImages(currentProfilePhotoData);
    updateProfileSaveState();
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeProfilePhoto() {
  currentProfilePhotoData = '';
  updateAvatarImages('');
  updateProfileSaveState();
}

function initializeProfileForm() {
  const profileFields = [
    profileFirstNameInput,
    profileEmailInput,
    profilePhoneInput,
    profileLanguageSelect,
    profileAccountTypeSelect
  ].filter(Boolean);

  profileFields.forEach(field => {
    field.addEventListener('input', updateProfileSaveState);
    field.addEventListener('change', updateProfileSaveState);
  });
}

function openPanelSection(section) {
  currentPanelSection = section;
  document.querySelectorAll('.panel-section').forEach(s => s.style.display = 'none');
  
  const titles = {
    'chat': 'Milo',
    'planning': 'Planning',
    'documents': 'Documents',
    'settings': 'Paramètres'
  };
  document.getElementById('panel-title').textContent = titles[section] || 'Panel';
  
  // Add fullscreen class for non-chat sections
  if (section !== 'chat') {
    panel.classList.add('fullscreen');
  } else {
    panel.classList.remove('fullscreen');
  }
  
  const sectionEl = document.getElementById('panel-' + section);
  if (sectionEl) {
    sectionEl.style.display = 'flex';
    if (section === 'planning') {
      renderPlanningPanel();
    }
  }
  
  openPanel();
}

function setPanelState(state) {
  if (currentPanelSection === 'chat') {
    if (state === 'idle') {
      panelLabel.textContent = 'Écris un message ou parle à Milo';
    } else if (state === 'listening') {
      panelLabel.textContent = 'J\'écoute…';
    } else if (state === 'thinking') {
      panelLabel.textContent = 'Milo réfléchit…';
    }
  }
}

function getPanelCloseThreshold() {
  return panel.classList.contains('fullscreen') ? 180 : 90;
}

function resetPanelDrag() {
  panelDragState.active = false;
  panelDragState.pointerId = null;
  panelDragState.captureTarget = null;
  panelDragState.startY = 0;
  panelDragState.startX = 0;
  panelDragState.deltaY = 0;
  panelDragState.dragging = false;
  panelDragState.requireActivation = false;
}

function beginPanelDrag({ pointerId = null, clientX, clientY, captureTarget = null, requireActivation = false }) {
  if (!panelOpen) return;

  panelDragState.active = true;
  panelDragState.pointerId = pointerId;
  panelDragState.captureTarget = captureTarget;
  panelDragState.startX = clientX;
  panelDragState.startY = clientY;
  panelDragState.deltaY = 0;
  panelDragState.dragging = !requireActivation;
  panelDragState.requireActivation = requireActivation;

  if (panelDragState.dragging) {
    panel.classList.add('dragging');
    panel.style.transition = 'none';
  }

  if (captureTarget?.setPointerCapture && pointerId !== null) {
    captureTarget.setPointerCapture(pointerId);
  }
}

function updatePanelDrag(clientX, clientY) {
  if (!panelDragState.active) return;

  const deltaX = clientX - panelDragState.startX;
  const rawDeltaY = clientY - panelDragState.startY;

  if (!panelDragState.dragging) {
    const isDownwardSwipe = rawDeltaY > 26 && rawDeltaY > Math.abs(deltaX);
    if (!isDownwardSwipe) return;

    panelDragState.dragging = true;
    panel.classList.add('dragging');
    panel.style.transition = 'none';
  }

  const activationOffset = panelDragState.requireActivation ? 26 : 0;
  const deltaY = Math.max(0, rawDeltaY - activationOffset);
  panelDragState.deltaY = deltaY;
  panel.style.transform = `translateY(${deltaY}px)`;
}

function finishPanelDrag() {
  if (!panelDragState.active) return;

  const shouldClose = panelDragState.dragging && panelDragState.deltaY > getPanelCloseThreshold();

  if (panelDragState.captureTarget?.releasePointerCapture && panelDragState.pointerId !== null) {
    panelDragState.captureTarget.releasePointerCapture(panelDragState.pointerId);
  }

  resetPanelDrag();
  panel.classList.remove('dragging');
  panel.style.transition = '';

  if (shouldClose) {
    closePanel();
    return;
  }

  panel.style.transform = '';
}

function startPanelDrag(event) {
  beginPanelDrag({
    pointerId: event.pointerId,
    clientX: event.clientX,
    clientY: event.clientY,
    captureTarget: panelHandle,
    requireActivation: false
  });
}

function movePanelDrag(event) {
  if (panelDragState.pointerId !== null && event.pointerId !== panelDragState.pointerId) return;
  updatePanelDrag(event.clientX, event.clientY);
}

function endPanelDrag(event) {
  if (panelDragState.pointerId !== null && event.pointerId !== panelDragState.pointerId) return;
  finishPanelDrag();
}

function canStartPlanningSurfaceDrag(target) {
  if (!panelOpen || currentPanelSection !== 'planning' || !planningPanel) return false;
  if (planningPanel.scrollTop > 0) return false;
  if (!(target instanceof Element)) return true;
  return !target.closest('button, input, textarea, select, a, label');
}

function startPlanningSurfacePointerDrag(event) {
  if (event.pointerType === 'touch') return;
  if (!canStartPlanningSurfaceDrag(event.target)) return;

  beginPanelDrag({
    pointerId: event.pointerId,
    clientX: event.clientX,
    clientY: event.clientY,
    captureTarget: planningPanel,
    requireActivation: true
  });
}

function movePlanningSurfacePointerDrag(event) {
  if (!panelDragState.active || panelDragState.pointerId !== event.pointerId) return;
  updatePanelDrag(event.clientX, event.clientY);
}

function endPlanningSurfacePointerDrag(event) {
  if (!panelDragState.active || panelDragState.pointerId !== event.pointerId) return;
  finishPanelDrag();
}

function getPrimaryTouch(event) {
  return event.changedTouches[0] || event.touches[0] || null;
}

function startPlanningSurfaceTouchDrag(event) {
  if (!canStartPlanningSurfaceDrag(event.target)) return;

  const touch = getPrimaryTouch(event);
  if (!touch) return;

  beginPanelDrag({
    clientX: touch.clientX,
    clientY: touch.clientY,
    requireActivation: true
  });
}

function movePlanningSurfaceTouchDrag(event) {
  if (!panelDragState.active) return;

  const touch = getPrimaryTouch(event);
  if (!touch) return;

  updatePanelDrag(touch.clientX, touch.clientY);
  if (panelDragState.dragging) {
    event.preventDefault();
  }
}

function endPlanningSurfaceTouchDrag() {
  finishPanelDrag();
}

function canStartChatSurfaceDrag(target) {
  if (!panelOpen || currentPanelSection !== 'chat' || !chatPanel || !chatHistoryEl) return false;
  if (chatHistoryEl.scrollTop > 0) return false;
  if (!(target instanceof Element)) return true;
  return !target.closest('button, input, textarea, select, a, label, .input-row');
}

function startChatSurfacePointerDrag(event) {
  if (event.pointerType === 'touch') return;
  if (!canStartChatSurfaceDrag(event.target)) return;

  beginPanelDrag({
    pointerId: event.pointerId,
    clientX: event.clientX,
    clientY: event.clientY,
    captureTarget: chatPanel,
    requireActivation: true
  });
}

function moveChatSurfacePointerDrag(event) {
  if (!panelDragState.active || panelDragState.pointerId !== event.pointerId) return;
  updatePanelDrag(event.clientX, event.clientY);
}

function endChatSurfacePointerDrag(event) {
  if (!panelDragState.active || panelDragState.pointerId !== event.pointerId) return;
  finishPanelDrag();
}

function startChatSurfaceTouchDrag(event) {
  if (!canStartChatSurfaceDrag(event.target)) return;

  const touch = getPrimaryTouch(event);
  if (!touch) return;

  beginPanelDrag({
    clientX: touch.clientX,
    clientY: touch.clientY,
    requireActivation: true
  });
}

function moveChatSurfaceTouchDrag(event) {
  if (!panelDragState.active) return;

  const touch = getPrimaryTouch(event);
  if (!touch) return;

  updatePanelDrag(touch.clientX, touch.clientY);
  if (panelDragState.dragging) {
    event.preventDefault();
  }
}

function endChatSurfaceTouchDrag() {
  finishPanelDrag();
}

function renderChatHistory() {
  if (!chatHistoryEl) return;
  if (chatHistory.length === 0) {
    chatHistoryEl.innerHTML = `<div class="chat-empty">Aucun échange pour le moment</div>`;
    return;
  }
  chatHistoryEl.innerHTML = chatHistory.map(msg => `<div class="chat-bubble ${msg.role}">${msg.text}</div>`).join('');
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

function addMessageToHistory(role, text) {
  chatHistory.push({role, text});
  renderChatHistory();
}

sendBtn.addEventListener('click', sendFromInput);
textInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendFromInput(); });
miloBtn.addEventListener('click', function() {
  openPanelSection('chat');
  miloBtn.classList.add('listening');
  setPanelState('listening');
  startListening();
});

if (panelHandle) {
  panelHandle.addEventListener('pointerdown', startPanelDrag);
  panelHandle.addEventListener('pointermove', movePanelDrag);
  panelHandle.addEventListener('pointerup', endPanelDrag);
  panelHandle.addEventListener('pointercancel', endPanelDrag);
}

if (chatPanel) {
  chatPanel.addEventListener('pointerdown', startChatSurfacePointerDrag);
  chatPanel.addEventListener('pointermove', moveChatSurfacePointerDrag);
  chatPanel.addEventListener('pointerup', endChatSurfacePointerDrag);
  chatPanel.addEventListener('pointercancel', endChatSurfacePointerDrag);
  chatPanel.addEventListener('touchstart', startChatSurfaceTouchDrag, { passive: true });
  chatPanel.addEventListener('touchmove', moveChatSurfaceTouchDrag, { passive: false });
  chatPanel.addEventListener('touchend', endChatSurfaceTouchDrag);
  chatPanel.addEventListener('touchcancel', endChatSurfaceTouchDrag);
}

if (planningPanel) {
  planningPanel.addEventListener('pointerdown', startPlanningSurfacePointerDrag);
  planningPanel.addEventListener('pointermove', movePlanningSurfacePointerDrag);
  planningPanel.addEventListener('pointerup', endPlanningSurfacePointerDrag);
  planningPanel.addEventListener('pointercancel', endPlanningSurfacePointerDrag);
  planningPanel.addEventListener('touchstart', startPlanningSurfaceTouchDrag, { passive: true });
  planningPanel.addEventListener('touchmove', movePlanningSurfaceTouchDrag, { passive: false });
  planningPanel.addEventListener('touchend', endPlanningSurfaceTouchDrag);
  planningPanel.addEventListener('touchcancel', endPlanningSurfaceTouchDrag);
}

// Voice recognition
let recognition = null;
function startListening() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('La reconnaissance vocale n\'est pas disponible.');
    setPanelState('idle');
    miloBtn.classList.remove('listening');
    return;
  }
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRec();
  recognition.lang = 'fr-FR';
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    sendCommand(transcript, 'voice');
  };
  recognition.onerror = () => {
    miloBtn.classList.remove('listening');
    setPanelState('idle');
  };
  recognition.onend = () => {
    miloBtn.classList.remove('listening');
    setPanelState('idle');
  };
  recognition.start();
}

function sendFromInput() {
  const v = textInput.value.trim();
  if (v) {
    openPanelSection('chat');
    addMessageToHistory('user', v);
    textInput.value = '';
    sendCommand(v, 'text');
  }
}

function parseReminder(text) {
  const match = /(?:ajou(?:te|ter) un rappel(?: à)?\s*)(\d{1,2}(?:h|H)(?:\d{2})?)(?:\s*(?:pour|:)?\s*(.*))?/i.exec(text);
  if (!match) return null;
  const timeRaw = match[1].replace('H', 'h');
  let time = timeRaw;
  if (/^\d{1,2}h$/.test(timeRaw)) {
    time = timeRaw.replace(/h$/i, ':00');
  } else if (/^\d{1,2}h\d{2}$/.test(timeRaw)) {
    time = timeRaw.replace(/h/i, ':');
  }
  const title = (match[2] || 'Rappel').trim();
  return {time, title};
}

async function sendCommand(text, mode = 'text') {
  miloBtn.classList.add('thinking');
  setPanelState('thinking');

  const systemPrompt = `Tu es Milo, un assistant personnel. Réponds TOUJOURS en français, très court (1-2 phrases). Sois chaleureux et efficace.`;

  const reminder = parseReminder(text);
  if (reminder) {
    const key = formatDateKey(planningState.currentDate);
    const reminderEvent = createPlanningEvent({
      date: key,
      time: reminder.time,
      title: reminder.title,
      description: '',
      meta: 'Ajouté par commande vocale'
    });
    planningState.events.push(reminderEvent);
    planningState.selectedEventId = reminderEvent.id;
    renderPlanningPanel();
    const confirm = `Très bien, je vais ajouter un rappel à ${reminder.time} pour : ${reminder.title}`;
    miloBtn.classList.remove('thinking');
    setPanelState('idle');
    if (mode === 'text') {
      addMessageToHistory('milo', confirm);
    }
    return;
  }

    try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await res.json();
    const reply = data.reply || "Je n'ai pas compris.";

    miloBtn.classList.remove('thinking');
    setPanelState('idle');

    if (mode === 'text') {
      addMessageToHistory('milo', reply);
    } else {
      showToast(reply);
    }
  } catch (err) {
    console.error('Error in sendCommand:', err);
    miloBtn.classList.remove('thinking');
    setPanelState('idle');

    if (mode === 'text') {
      addMessageToHistory('milo', 'Erreur serveur : ' + err.message);
    } else {
      showToast('Erreur serveur : ' + err.message);
    }
  }
}

// Toast
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 5000);
}
function hideToast() {
  document.getElementById('toast').classList.remove('show');
}

// Planning
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createPlanningEvent({ date, time, title, description = '', meta = '' }) {
  const normalizedTime = normalizeTimeString(time);
  return {
    id: planningState.nextEventId++,
    date,
    time: normalizedTime || time,
    title,
    description,
    meta
  };
}

function ensurePlanningEventsStructure() {
  planningState.events = planningState.events.map(event => {
    if (typeof event.id !== 'number') {
      event.id = planningState.nextEventId++;
    } else if (event.id >= planningState.nextEventId) {
      planningState.nextEventId = event.id + 1;
    }

    if (typeof event.description !== 'string') {
      event.description = '';
    }

    if (typeof event.meta !== 'string') {
      event.meta = '';
    }

    const normalizedTime = normalizeTimeString(event.time);
    if (normalizedTime) {
      event.time = normalizedTime;
    }

    return event;
  });
}

function parseTimeParts(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec((time || '').trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return { hours, minutes };
}

function normalizeTimeString(time) {
  const parts = parseTimeParts(time);
  if (!parts) return null;
  return `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`;
}

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function getEventTopOffset(time) {
  const parts = parseTimeParts(time);
  if (!parts) return 0;
  return (parts.hours * 60 + parts.minutes) * (DAY_SLOT_HEIGHT / 60);
}

function getSelectedPlanningEvent() {
  return planningState.events.find(event => event.id === planningState.selectedEventId) || null;
}

function selectPlanningEvent(eventId) {
  planningState.selectedEventId = eventId;
  renderPlanningPanel();
}

function openPlanningDay(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return;

  planningState.currentDate = new Date(year, month - 1, day);
  planningState.view = 'day';
  const dayEvents = planningState.events
    .filter(event => event.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));
  planningState.selectedEventId = dayEvents[0]?.id || null;
  renderPlanningPanel();
}

function renderDayAgenda(events) {
  const agenda = document.getElementById('day-agenda-panel');
  if (!agenda) return;

  const hourRows = DAY_HOURS.map(hour => (
    `<div class="agenda-hour">${formatHourLabel(hour)}</div><div class="agenda-slot" data-hour="${hour}"></div>`
  )).join('');

  const eventCards = events.map(event => {
    const isActive = event.id === planningState.selectedEventId ? 'active' : '';
    const top = getEventTopOffset(event.time);
    const safeMeta = event.meta ? `<div class="agenda-meta">${event.meta}</div>` : '';
    return `<button type="button" class="agenda-event ${isActive}" data-event-id="${event.id}" style="top: ${top}px; height: ${DAY_EVENT_HEIGHT}px;"><div class="agenda-event-time">${event.time}</div><div class="agenda-name">${event.title}</div>${safeMeta}</button>`;
  }).join('');

  const emptyState = events.length
    ? ''
    : '<div class="agenda-empty">Aucune tâche ce jour-là. Ajoute-en une pour la voir se placer dans la journée.</div>';

  agenda.innerHTML = `<div class="day-agenda-scroll"><div class="day-agenda-grid">${hourRows}<div class="agenda-events-layer">${eventCards}</div>${emptyState}</div></div>`;

  if (planningState.selectedEventId !== null) {
    const selectedEvent = agenda.querySelector('.agenda-event.active');
    const scrollContainer = agenda.querySelector('.day-agenda-scroll');
    if (selectedEvent && scrollContainer) {
      const targetTop = Math.max(0, selectedEvent.offsetTop - 140);
      scrollContainer.scrollTop = targetTop;
    }
  }
}

function renderTaskEditor() {
  const editor = document.getElementById('task-editor-panel');
  const placeholder = document.getElementById('task-editor-placeholder');
  const titleInput = document.getElementById('task-title-input');
  const descriptionInput = document.getElementById('task-description-input');
  if (!editor || !placeholder || !titleInput || !descriptionInput) return;

  const selectedEvent = getSelectedPlanningEvent();
  if (!selectedEvent || planningState.view !== 'day') {
    editor.classList.add('hidden');
    placeholder.style.display = 'block';
    titleInput.value = '';
    descriptionInput.value = '';
    return;
  }

  editor.classList.remove('hidden');
  placeholder.style.display = 'none';
  titleInput.value = selectedEvent.title;
  descriptionInput.value = selectedEvent.description;
}

function initializePlanningInteractions() {
  const dayBtn = document.getElementById('view-day-btn-panel');
  const monthBtn = document.getElementById('view-month-btn-panel');
  const newTaskBtn = document.getElementById('btn-new-task');
  const prevBtn = document.getElementById('planning-prev-panel');
  const nextBtn = document.getElementById('planning-next-panel');
  const agenda = document.getElementById('day-agenda-panel');
  const monthGrid = document.getElementById('month-grid-panel');
  const titleInput = document.getElementById('task-title-input');
  const descriptionInput = document.getElementById('task-description-input');

  if (!dayBtn || dayBtn._initialized) return;
  dayBtn._initialized = true;

  dayBtn.addEventListener('click', () => {
    planningState.view = 'day';
    renderPlanningPanel();
  });

  monthBtn.addEventListener('click', () => {
    planningState.view = 'month';
    renderPlanningPanel();
  });

  prevBtn.addEventListener('click', () => {
    if (planningState.view === 'day') {
      planningState.currentDate.setDate(planningState.currentDate.getDate() - 1);
    } else {
      planningState.currentDate.setMonth(planningState.currentDate.getMonth() - 1);
    }
    renderPlanningPanel();
  });

  nextBtn.addEventListener('click', () => {
    if (planningState.view === 'day') {
      planningState.currentDate.setDate(planningState.currentDate.getDate() + 1);
    } else {
      planningState.currentDate.setMonth(planningState.currentDate.getMonth() + 1);
    }
    renderPlanningPanel();
  });

  newTaskBtn.addEventListener('click', () => {
    const title = prompt('Titre de la tâche:');
    if (!title) return;

    const time = prompt('Heure (HH:mm):');
    if (!parseTimeParts(time)) {
      alert('Format invalide. Utilisez HH:mm');
      return;
    }

    const key = formatDateKey(planningState.currentDate);
    const newEvent = createPlanningEvent({ date: key, time, title, description: '', meta: '' });
    planningState.events.push(newEvent);
    planningState.selectedEventId = newEvent.id;
    renderPlanningPanel();
  });

  agenda.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-event-id]');
    if (!trigger) return;
    selectPlanningEvent(Number(trigger.dataset.eventId));
  });

  monthGrid.addEventListener('click', (event) => {
    const dayCell = event.target.closest('[data-date-key]');
    if (!dayCell) return;
    openPlanningDay(dayCell.dataset.dateKey);
  });

  titleInput.addEventListener('input', (event) => {
    const selectedEvent = getSelectedPlanningEvent();
    if (!selectedEvent) return;
    selectedEvent.title = event.target.value;

    const activeTitle = document.querySelector('.agenda-event.active .agenda-name');
    if (activeTitle) {
      activeTitle.textContent = selectedEvent.title || 'Sans titre';
    }
  });

  descriptionInput.addEventListener('input', (event) => {
    const selectedEvent = getSelectedPlanningEvent();
    if (!selectedEvent) return;
    selectedEvent.description = event.target.value;
  });
}

function formatLongDate(date) {
  return date.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
}

function formatMonthLabel(date) {
  return date.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function renderPlanningPanel() {
  ensurePlanningEventsStructure();
  initializePlanningInteractions();

  const dayBtn = document.getElementById('view-day-btn-panel');
  const monthBtn = document.getElementById('view-month-btn-panel');
  const newTaskBtn = document.getElementById('btn-new-task');
  const dayView = document.getElementById('planning-day-view-panel');
  const monthView = document.getElementById('planning-month-view-panel');
  const prevBtn = document.getElementById('planning-prev-panel');
  const nextBtn = document.getElementById('planning-next-panel');
  const label = document.getElementById('planning-label-panel');

  if (planningState.view === 'day') {
    dayBtn.classList.add('active');
    monthBtn.classList.remove('active');
    dayView.style.display = 'block';
    monthView.style.display = 'none';
    label.textContent = formatLongDate(planningState.currentDate);
    
    const key = formatDateKey(planningState.currentDate);
    const events = planningState.events.filter(e => e.date === key).sort((a, b) => a.time.localeCompare(b.time));
    if (!events.some(event => event.id === planningState.selectedEventId)) {
      planningState.selectedEventId = events[0]?.id || null;
    }

    renderDayAgenda(events);
    renderTaskEditor();
  } else {
    dayBtn.classList.remove('active');
    monthBtn.classList.add('active');
    dayView.style.display = 'none';
    monthView.style.display = 'block';
    label.textContent = formatMonthLabel(planningState.currentDate);
    renderTaskEditor();

    const current = planningState.currentDate;
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDay = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({date: new Date(year, month - 1, daysInPrevMonth - i), outside: true});
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({date: new Date(year, month, day), outside: false});
    }
    while (cells.length % 7 !== 0) {
      const day = cells.length - (startDay + daysInMonth) + 1;
      cells.push({date: new Date(year, month + 1, day), outside: true});
    }

    const today = new Date();
    const grid = document.getElementById('month-grid-panel');
    grid.innerHTML = cells.map(cell => {
      const key = formatDateKey(cell.date);
      const hasEvent = planningState.events.some(e => e.date === key);
      const todayClass = sameDay(cell.date, today) ? 'today' : '';
      const outsideClass = cell.outside ? 'outside' : '';
      return `<button type="button" class="month-day ${outsideClass} ${todayClass}" data-date-key="${key}"><div class="month-day-number">${cell.date.getDate()}</div>${hasEvent ? '<div class="month-day-dot"></div>' : ''}</button>`;
    }).join('');

    
  }
}

