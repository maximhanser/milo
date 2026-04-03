function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const clock = document.getElementById('clock');
  if (clock) clock.textContent = t;

  const clockEducation = document.getElementById('clock-education');
  if (clockEducation) clockEducation.textContent = t;
}
updateClock();
setInterval(updateClock, 10000);

// Panel management
let panelOpen = false;
let chatHistory = [];
let currentPanelSection = 'chat';
let planningState = {
  view: 'day',
  currentDate: new Date(2026, 0, 1),
  events: []
};

const panel = document.getElementById('panel');
const panelHandle = document.getElementById('panel-handle');
const miloBtn = document.getElementById('milo-btn');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const chatHistoryEl = document.getElementById('chat-history');
const panelLabel = document.getElementById('panel-label');
const panelDragState = {
  active: false,
  pointerId: null,
  startY: 0,
  deltaY: 0
};

// Settings menu
const settingsMenu = document.getElementById('settings-menu');
const settingsMenuTrigger = document.getElementById('settings-menu-trigger');
const settingsMenuTriggerEducation = document.getElementById('settings-menu-trigger-education');
const settingsMenuClose = document.getElementById('settings-menu-close');
const themeToggle = document.getElementById('theme-toggle');

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

[settingsMenuTrigger, settingsMenuTriggerEducation].filter(Boolean).forEach(trigger => {
  trigger.addEventListener('click', toggleSettingsMenu);
});

if (settingsMenuClose) {
  settingsMenuClose.addEventListener('click', closeSettingsMenu);
}

document.addEventListener('click', (event) => {
  if (!settingsMenu) return;

  const clickedOnTrigger = [settingsMenuTrigger, settingsMenuTriggerEducation]
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

function openPanel() {
  panelOpen = true;
  panel.classList.remove('dragging');
  panel.style.transition = '';
  panel.style.transform = '';
  panel.classList.add('open');
}

function closePanel() {
  panelOpen = false;
  panelDragState.active = false;
  panelDragState.pointerId = null;
  panelDragState.startY = 0;
  panelDragState.deltaY = 0;
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
  document.getElementById('education-page').style.display = 'none';
}

function showEducation() {
  closePanel();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 2));
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'block';
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
  return panel.classList.contains('fullscreen') ? 120 : 90;
}

function startPanelDrag(event) {
  if (!panelOpen) return;

  panelDragState.active = true;
  panelDragState.pointerId = event.pointerId;
  panelDragState.startY = event.clientY;
  panelDragState.deltaY = 0;

  panel.classList.add('dragging');
  panel.style.transition = 'none';

  if (panelHandle.setPointerCapture) {
    panelHandle.setPointerCapture(event.pointerId);
  }
}

function movePanelDrag(event) {
  if (!panelDragState.active) return;

  const deltaY = Math.max(0, event.clientY - panelDragState.startY);
  panelDragState.deltaY = deltaY;
  panel.style.transform = `translateY(${deltaY}px)`;
}

function endPanelDrag(event) {
  if (!panelDragState.active) return;

  const shouldClose = panelDragState.deltaY > getPanelCloseThreshold();

  if (panelHandle.releasePointerCapture && panelDragState.pointerId !== null) {
    panelHandle.releasePointerCapture(panelDragState.pointerId);
  }

  panelDragState.active = false;
  panelDragState.pointerId = null;
  panelDragState.startY = 0;
  panelDragState.deltaY = 0;
  panel.classList.remove('dragging');
  panel.style.transition = '';

  if (shouldClose) {
    closePanel();
    return;
  }

  panel.style.transform = '';
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
    planningState.events.push({date: key, time: reminder.time, title: reminder.title, meta: 'Ajouté par commande vocale'});
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
  const dayBtn = document.getElementById('view-day-btn-panel');
  const monthBtn = document.getElementById('view-month-btn-panel');
  const newTaskBtn = document.getElementById('btn-new-task');
  const dayView = document.getElementById('planning-day-view-panel');
  const monthView = document.getElementById('planning-month-view-panel');
  const prevBtn = document.getElementById('planning-prev-panel');
  const nextBtn = document.getElementById('planning-next-panel');
  const label = document.getElementById('planning-label-panel');

  // Only set up listeners once
  if (!dayBtn._initialized) {
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
      if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        alert('Format invalide. Utilisez HH:mm');
        return;
      }
      const key = formatDateKey(planningState.currentDate);
      planningState.events.push({date: key, time: time, title: title, meta: ''});
      renderPlanningPanel();
    });
  }

  if (planningState.view === 'day') {
    dayBtn.classList.add('active');
    monthBtn.classList.remove('active');
    dayView.style.display = 'block';
    monthView.style.display = 'none';
    label.textContent = formatLongDate(planningState.currentDate);
    
    const key = formatDateKey(planningState.currentDate);
    const events = planningState.events.filter(e => e.date === key).sort((a, b) => a.time.localeCompare(b.time));
    const agenda = document.getElementById('day-agenda-panel');
    
    if (!events.length) {
      agenda.innerHTML = `<div class="agenda-empty">Aucun événement</div>`;
    } else {
      agenda.innerHTML = events.map(e => `<div class="agenda-card"><div class="agenda-time">${e.time}</div><div class="agenda-main"><div class="agenda-name">${e.title}</div><div class="agenda-meta">${e.meta}</div></div></div>`).join('');
    }
  } else {
    dayBtn.classList.remove('active');
    monthBtn.classList.add('active');
    dayView.style.display = 'none';
    monthView.style.display = 'block';
    label.textContent = formatMonthLabel(planningState.currentDate);

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
      return `<div class="month-day ${outsideClass} ${todayClass}"><div class="month-day-number">${cell.date.getDate()}</div>${hasEvent ? '<div class="month-day-dot"></div>' : ''}</div>`;
    }).join('');

    
  }
}

