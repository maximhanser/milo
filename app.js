    // Panel management
    let panelOpen = false;
    let chatHistory = [];
    let educationChatHistory = [];
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
    let taskModalState = {
      open: false,
      mode: 'view',
      eventId: null,
      swipedEventId: null,
      pointerId: null,
      startX: 0,
      deltaX: 0,
      activeEventId: null,
      dragging: false
    };

    const panel = document.getElementById('panel');
    const panelHandle = document.getElementById('panel-handle');
    const chatPanel = document.getElementById('panel-chat');
    const educationChatPanel = document.getElementById('panel-education-chat');
    const planningPanel = document.getElementById('panel-planning');
    const miloBtnWrap = document.querySelector('.milo-btn-wrap');
    const miloBtn = document.getElementById('milo-btn');
    const textInput = document.getElementById('text-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistoryEl = document.getElementById('chat-history');
    const educationTextInput = document.getElementById('education-text-input');
    const educationSendBtn = document.getElementById('education-send-btn');
    const educationChatHistoryEl = document.getElementById('education-chat-history');
    const panelLabel = document.getElementById('panel-label');
    const educationPanelLabel = document.getElementById('education-panel-label');
    const educationFilesToggle = document.getElementById('education-files-toggle');
    const educationUploadPanel = document.getElementById('education-upload-panel');
    const educationDropzone = document.getElementById('education-dropzone');
    const educationChatFilesList = document.getElementById('education-chat-files-list');
    const educationFilesCount = document.getElementById('education-files-count');
    const educationClearFilesBtn = document.getElementById('education-clear-files-btn');
    const educationDocumentInput = document.getElementById('education-document-input');
    const educationSourceTextArea = document.getElementById('education-source-text');
    const clearDocBtn = document.getElementById('clear-doc-btn');
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
    const chatSessionStorageKey = 'milo.chatSessionId';
    const educationDocumentsStorageKey = 'milo.educationDocuments';
    const educationSourceStorageKey = 'milo.educationSourceText';
    const planningStorageKey = 'milo.planning';
    const monthlyPrimaryTasksStorageKey = 'milo.monthlyPrimaryTasks';
    let savedProfileSnapshot = null;
    let currentProfilePhotoData = '';
    let currentLanguage = 'fr';
    let isAgentRequestPending = false;
    let isEducationAgentRequestPending = false;
    let isEducationUploadPanelOpen = false;
    let educationDocuments = [];
    let selectedEducationDocumentId = null;
    let monthlyPrimaryTasks = [];
    let pendingMonthlyTaskPrompt = null;

    const translations = {
      fr: {
        navHome: 'Accueil',
        navPlanning: 'Planning',
        navEducation: 'Éducation',
        navProgress: 'Progress',
        homeToday: 'Aujourd\'hui',
        homeTomorrow: 'Demain',
        homeMonthlyPrimary: 'Tâches principales mensuelles',
        homeEmptyToday: 'Aucune tâche prévue aujourd\'hui.',
        homeEmptyTomorrow: 'Aucune tâche prévue demain.',
        homeEmptyMonthlyPrimary: 'Aucune tâche principale pour ce mois.',
        homeEmptyKicker: 'Aucun rappel',
        homeMonthlyPrimaryBadge: '{count} rappels ce mois',
        homeMonthBadge: 'Mois actif',
        monthlyTaskSuggestion: 'Je viens de créer {count} rappels ce mois pour {title}. Veux-tu aussi l\'ajouter à ta liste des tâches principales mensuelles ? Réponds par oui ou non.',
        monthlyTaskAddedConfirm: '{title} a été ajouté à tes tâches principales mensuelles.',
        monthlyTaskSkippedConfirm: 'Très bien, je ne l\'ajoute pas à la liste mensuelle.',
        monthlyTaskClarify: 'Réponds simplement par oui ou non pour me dire si je dois ajouter cette tâche à la liste mensuelle.',
        homeCard1Title: 'Révision — Maths',
        homeCard1Sub: '14h00 · 45 min',
        homeCard1Badge: 'Planifié par Milo',
        homeCard2Title: 'Courses à faire',
        homeCard2Sub: 'Lait, pain, tomates…',
        homeCard2Badge: 'Rappel 18h00',
        homeCard3Title: 'Sport — Running',
        homeCard3Sub: '07h30 · 30 min',
        homeCard3Badge: 'Objectif semaine',
        homeCard4Title: 'Révision — Histoire',
        homeCard4Sub: '19h00 · 1h',
        homeCard4Badge: 'Planifié par Milo',
        progressTitle: 'Progress',
        profileTitle: 'Profil',
        profileHeroTitle: 'Ton espace personnel',
        profileHeroSubtitle: 'Retrouve ici les informations principales de ton profil dans une vraie page dédiée, comme pour Éducation.',
        profileSection: 'Profil',
        profileFirstName: 'Prénom',
        profileEmail: 'Email',
        profilePhone: 'Téléphone',
        profilePhoto: 'Photo de profil',
        profilePhotoName: 'Photo actuelle',
        profilePhotoHelp: 'JPEG ou PNG uniquement',
        profileImport: 'Importer',
        profileRemove: 'Retirer',
        profilePreferences: 'Préférences',
        profileLanguage: 'Langue',
        profileAccount: 'Compte',
        languageOptionFr: 'Français',
        languageOptionEn: 'English',
        languageOptionEs: 'Español',
        accountPersonal: 'Personnel',
        accountStudent: 'Étudiant',
        accountProfessional: 'Professionnel',
        profileSave: 'Enregistrer',
        educationTitle: 'Éducation',
        educationWelcome: 'Bienvenue dans Éducation',
        educationCardTitle: 'Utilisez la barre latérale pour accéder aux fonctionnalités',
        educationCardSub: 'Chat IA pour poser des questions sur vos documents',
        educationChatButton: 'Chat IA',
        educationDocumentsButton: 'Documents',
        educationChatEmpty: 'Aucun échange pour le moment',
        educationChatIdle: 'Colle un texte ou choisis un document puis demande une fiche, une reformulation ou un quiz.',
        educationChatThinking: 'Milo Éducation prépare ta réponse…',
        educationChatPlaceholder: 'Demande une fiche, un quiz ou une reformulation…',
        educationDownloadPdf: 'Télécharger en PDF',
        educationPdfFallbackTitle: 'Document Milo Education',
        educationPdfUnavailable: 'Le module PDF n\'est pas disponible pour le moment.',
        educationFilesToggleLabel: 'Ajouter des fichiers',
        educationDropzoneTitle: 'Dépose jusqu\'à 3 fichiers',
        educationDropzoneHelp: 'TXT, MD, CSV ou JSON. Tu peux ensuite ajouter une consigne dans le chat.',
        educationFilesCount: '{count}/3 fichiers',
        educationFilesEmpty: 'Aucun fichier ajouté',
        educationClearFiles: 'Vider les fichiers',
        educationFilesLimit: 'Tu peux ajouter jusqu\'à 3 fichiers maximum.',
        educationPasteLabel: 'Texte de travail',
        educationSourcePlaceholder: 'Colle ici un cours, un chapitre ou un extrait pour créer des fiches, reformulations et quiz.',
        educationDocumentsHelp: 'Importe un document texte ou colle un passage. Le chat IA d\'Éducation utilisera ce contenu comme base de travail.',
        clearText: 'Effacer le texte',
        educationNoSource: 'Ajoute un texte ou sélectionne un document avant de lancer une consigne d\'étude.',
        unsupportedDocument: 'Importe un document texte (.txt, .md, .csv ou .json).',
        importedDocumentMeta: '{count} caractères',
        settingsTitle: 'Paramètres',
        settingsTheme: 'Thème',
        settingsPreferences: 'Préférences',
        chatEmpty: 'Aucun échange pour le moment',
        chatIdle: 'Écris un message ou parle à Milo',
        chatListening: 'J\'écoute…',
        chatThinking: 'Milo réfléchit…',
        chatPlaceholder: 'Écris à Milo…',
        planningDay: 'Jour',
        planningMonth: 'Mois',
        planningNewTask: '+ Nouvelle tâche',
        taskTitle: 'Titre',
        taskDescription: 'Description',
        taskTitlePlaceholder: 'Titre de la tâche',
        taskDescriptionPlaceholder: 'Ajouter une description',
        taskPlaceholder: 'Touchez une tâche pour ouvrir son détail.',
        taskModalReadTitle: 'Détail de la tâche',
        taskModalEditTitle: 'Modifier la tâche',
        taskModalEmptyDescription: 'Aucune description ajoutée.',
        taskModalClose: 'Fermer',
        taskModalSave: 'Enregistrer',
        weekday1: 'Lun', weekday2: 'Mar', weekday3: 'Mer', weekday4: 'Jeu', weekday5: 'Ven', weekday6: 'Sam', weekday7: 'Dim',
        createFolder: 'Créer dossier',
        uploadDocument: 'Télécharger document',
        documentsEmpty: 'Aucun document ou dossier',
        settingsDev: 'Paramètres en développement',
        avatarAlt: 'Photo de profil',
        avatarPreviewAlt: 'Aperçu photo de profil',
        panelChat: 'Milo',
        panelEducationChat: 'Milo Éducation',
        panelPlanning: 'Planning',
        panelDocuments: 'Documents',
        panelSettings: 'Paramètres',
        toastLight: 'Mode clair activé',
        toastDark: 'Mode sombre activé',
        toastProfileSaved: 'Profil enregistré',
        toastImportImage: 'Importe un fichier JPEG ou PNG',
        toastSpeechUnavailable: 'La reconnaissance vocale n\'est pas disponible.',
        chatUnknown: 'Je n\'ai pas compris.',
        errorServerPrefix: 'Erreur serveur : ',
        reminderDefaultTitle: 'Rappel',
        reminderConfirm: 'Très bien, je vais ajouter un rappel à {time} pour : {title}',
        voiceAddedMeta: 'Ajouté par commande vocale',
        noTasksToday: 'Aucune tâche ce jour-là. Ajoute-en une pour la voir se placer dans la journée.',
        promptTaskTitle: 'Titre de la tâche:',
        promptTaskTime: 'Heure (HH:mm):',
        promptTimeInvalid: 'Format invalide. Utilisez HH:mm',
        untitledTask: 'Sans titre'
      },
      en: {
        navHome: 'Home',
        navPlanning: 'Planning',
        navEducation: 'Education',
        navProgress: 'Progress',
        homeToday: 'Today',
        homeTomorrow: 'Tomorrow',
        homeMonthlyPrimary: 'Main monthly tasks',
        homeEmptyToday: 'No task scheduled today.',
        homeEmptyTomorrow: 'No task scheduled tomorrow.',
        homeEmptyMonthlyPrimary: 'No main task for this month.',
        homeEmptyKicker: 'No reminder',
        homeMonthlyPrimaryBadge: '{count} reminders this month',
        homeMonthBadge: 'Active month',
        monthlyTaskSuggestion: 'I just created {count} reminders this month for {title}. Do you also want me to add it to your main monthly tasks list? Answer yes or no.',
        monthlyTaskAddedConfirm: '{title} was added to your main monthly tasks list.',
        monthlyTaskSkippedConfirm: 'Okay, I will not add it to the monthly list.',
        monthlyTaskClarify: 'Reply with yes or no so I know whether to add this task to the monthly list.',
        homeCard1Title: 'Study session — Math',
        homeCard1Sub: '2:00 PM · 45 min',
        homeCard1Badge: 'Planned by Milo',
        homeCard2Title: 'Groceries to buy',
        homeCard2Sub: 'Milk, bread, tomatoes…',
        homeCard2Badge: 'Reminder 6:00 PM',
        homeCard3Title: 'Workout — Running',
        homeCard3Sub: '7:30 AM · 30 min',
        homeCard3Badge: 'Weekly goal',
        homeCard4Title: 'Study session — History',
        homeCard4Sub: '7:00 PM · 1h',
        homeCard4Badge: 'Planned by Milo',
        progressTitle: 'Progress',
        profileTitle: 'Profile',
        profileHeroTitle: 'Your personal space',
        profileHeroSubtitle: 'Find your main profile information here in a full dedicated page, just like Education.',
        profileSection: 'Profile',
        profileFirstName: 'First name',
        profileEmail: 'Email',
        profilePhone: 'Phone',
        profilePhoto: 'Profile photo',
        profilePhotoName: 'Current photo',
        profilePhotoHelp: 'JPEG or PNG only',
        profileImport: 'Import',
        profileRemove: 'Remove',
        profilePreferences: 'Preferences',
        profileLanguage: 'Language',
        profileAccount: 'Account',
        languageOptionFr: 'French',
        languageOptionEn: 'English',
        languageOptionEs: 'Spanish',
        accountPersonal: 'Personal',
        accountStudent: 'Student',
        accountProfessional: 'Professional',
        profileSave: 'Save',
        educationTitle: 'Education',
        educationWelcome: 'Welcome to Education',
        educationCardTitle: 'Use the sidebar to access features',
        educationCardSub: 'AI chat to ask questions about your documents',
        educationChatButton: 'AI Chat',
        educationDocumentsButton: 'Documents',
        educationChatEmpty: 'No conversation yet',
        educationChatIdle: 'Paste text or choose a document, then ask for notes, a rewrite or a quiz.',
        educationChatThinking: 'Milo Education is preparing your answer…',
        educationChatPlaceholder: 'Ask for notes, a quiz or a rewrite…',
        educationDownloadPdf: 'Download PDF',
        educationPdfFallbackTitle: 'Milo Education Document',
        educationPdfUnavailable: 'The PDF module is not available right now.',
        educationFilesToggleLabel: 'Add files',
        educationDropzoneTitle: 'Drop up to 3 files',
        educationDropzoneHelp: 'TXT, MD, CSV or JSON. You can still add an instruction in chat afterwards.',
        educationFilesCount: '{count}/3 files',
        educationFilesEmpty: 'No file added',
        educationClearFiles: 'Clear files',
        educationFilesLimit: 'You can add up to 3 files maximum.',
        educationPasteLabel: 'Study text',
        educationSourcePlaceholder: 'Paste a lesson, chapter or excerpt here to create notes, rewrites and quizzes.',
        educationDocumentsHelp: 'Import a text document or paste a passage. The Education AI chat will use this content as its study base.',
        clearText: 'Clear text',
        educationNoSource: 'Add text or select a document before asking for a study task.',
        unsupportedDocument: 'Import a text document (.txt, .md, .csv or .json).',
        importedDocumentMeta: '{count} characters',
        settingsTitle: 'Settings',
        settingsTheme: 'Theme',
        settingsPreferences: 'Preferences',
        chatEmpty: 'No conversation yet',
        chatIdle: 'Type a message or speak to Milo',
        chatListening: 'I\'m listening…',
        chatThinking: 'Milo is thinking…',
        chatPlaceholder: 'Write to Milo…',
        planningDay: 'Day',
        planningMonth: 'Month',
        planningNewTask: '+ New task',
        taskTitle: 'Title',
        taskDescription: 'Description',
        taskTitlePlaceholder: 'Task title',
        taskDescriptionPlaceholder: 'Add a description',
        taskPlaceholder: 'Tap a task to open its details.',
        taskModalReadTitle: 'Task details',
        taskModalEditTitle: 'Edit task',
        taskModalEmptyDescription: 'No description added.',
        taskModalClose: 'Close',
        taskModalSave: 'Save',
        weekday1: 'Mon', weekday2: 'Tue', weekday3: 'Wed', weekday4: 'Thu', weekday5: 'Fri', weekday6: 'Sat', weekday7: 'Sun',
        createFolder: 'Create folder',
        uploadDocument: 'Upload document',
        documentsEmpty: 'No document or folder',
        settingsDev: 'Settings under development',
        avatarAlt: 'Profile photo',
        avatarPreviewAlt: 'Profile photo preview',
        panelChat: 'Milo',
        panelEducationChat: 'Milo Education',
        panelPlanning: 'Planning',
        panelDocuments: 'Documents',
        panelSettings: 'Settings',
        toastLight: 'Light mode enabled',
        toastDark: 'Dark mode enabled',
        toastProfileSaved: 'Profile saved',
        toastImportImage: 'Import a JPEG or PNG file',
        toastSpeechUnavailable: 'Voice recognition is not available.',
        chatUnknown: "I didn't understand.",
        errorServerPrefix: 'Server error: ',
        reminderDefaultTitle: 'Reminder',
        reminderConfirm: 'Okay, I will add a reminder at {time} for: {title}',
        voiceAddedMeta: 'Added by voice command',
        noTasksToday: 'No tasks for this day. Add one to place it in your schedule.',
        promptTaskTitle: 'Task title:',
        promptTaskTime: 'Time (HH:mm):',
        promptTimeInvalid: 'Invalid format. Use HH:mm',
        untitledTask: 'Untitled'
      }
    };

function normalizeAppLanguage(value) {
  return value === 'English' ? 'en' : 'fr';
}

function getCurrentLocale() {
  return currentLanguage === 'en' ? 'en-US' : 'fr-FR';
}

function t(key, vars = {}) {
  const dictionary = translations[currentLanguage] || translations.fr;
  const template = dictionary[key] ?? translations.fr[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, token) => vars[token] ?? '');
}

function setText(id, key) {
  const element = document.getElementById(id);
  if (element) element.textContent = t(key);
}

function setPlaceholder(id, key) {
  const element = document.getElementById(id);
  if (element) element.placeholder = t(key);
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'fr';
  setText('home-today-label', 'homeToday');
  setText('home-tomorrow-label', 'homeTomorrow');
  setText('home-monthly-primary-label', 'homeMonthlyPrimary');
  setText('home-card-1-title', 'homeCard1Title');
  setText('home-card-1-sub', 'homeCard1Sub');
  setText('home-card-1-badge', 'homeCard1Badge');
  setText('home-card-2-title', 'homeCard2Title');
  setText('home-card-2-sub', 'homeCard2Sub');
  setText('home-card-2-badge', 'homeCard2Badge');
  setText('home-card-3-title', 'homeCard3Title');
  setText('home-card-3-sub', 'homeCard3Sub');
  setText('home-card-3-badge', 'homeCard3Badge');
  setText('home-card-4-title', 'homeCard4Title');
  setText('home-card-4-sub', 'homeCard4Sub');
  setText('home-card-4-badge', 'homeCard4Badge');
  setText('progress-page-title', 'progressTitle');
  setText('profile-page-title', 'profileTitle');
  setText('profile-hero-title', 'profileHeroTitle');
  setText('profile-hero-subtitle', 'profileHeroSubtitle');
  setText('profile-section-label', 'profileSection');
  setText('profile-first-name-label', 'profileFirstName');
  setText('profile-email-label', 'profileEmail');
  setText('profile-phone-label', 'profilePhone');
  setText('profile-photo-label', 'profilePhoto');
  setText('profile-photo-name', 'profilePhotoName');
  setText('profile-photo-help', 'profilePhotoHelp');
  setText('profile-photo-button', 'profileImport');
  setText('profile-photo-remove', 'profileRemove');
  setText('profile-preferences-label', 'profilePreferences');
  setText('profile-language-label', 'profileLanguage');
  setText('profile-account-label', 'profileAccount');
  setText('profile-language-option-fr', 'languageOptionFr');
  setText('profile-language-option-en', 'languageOptionEn');
  setText('profile-language-option-es', 'languageOptionEs');
  setText('profile-account-option-personal', 'accountPersonal');
  setText('profile-account-option-student', 'accountStudent');
  setText('profile-account-option-professional', 'accountProfessional');
  setText('profile-save-btn', 'profileSave');
  setText('nav-home-label', 'navHome');
  setText('nav-planning-label', 'navPlanning');
  setText('nav-education-label', 'navEducation');
  setText('nav-progress-label', 'navProgress');
  setText('education-page-title', 'educationTitle');
  setText('education-welcome-label', 'educationWelcome');
  setText('education-card-title', 'educationCardTitle');
  setText('education-card-sub', 'educationCardSub');
  setText('education-chat-btn', 'educationChatButton');
  setText('education-documents-btn', 'educationDocumentsButton');
  if (educationFilesToggle) {
    educationFilesToggle.setAttribute('aria-label', t('educationFilesToggleLabel'));
    educationFilesToggle.setAttribute('title', t('educationFilesToggleLabel'));
  }
  setText('education-dropzone-title', 'educationDropzoneTitle');
  setText('education-dropzone-help', 'educationDropzoneHelp');
  setText('education-clear-files-btn', 'educationClearFiles');
  setText('settings-menu-title', 'settingsTitle');
  setText('theme-label', 'settingsTheme');
  setText('settings-preferences-item', 'settingsPreferences');
  setText('chat-empty-initial', 'chatEmpty');
  setText('education-chat-empty', 'educationChatEmpty');
  setText('view-day-btn-panel', 'planningDay');
  setText('view-month-btn-panel', 'planningMonth');
  setText('btn-new-task', 'planningNewTask');
  setText('task-title-label', 'taskTitle');
  setText('task-description-label', 'taskDescription');
  setPlaceholder('task-title-input', 'taskTitlePlaceholder');
  setPlaceholder('task-description-input', 'taskDescriptionPlaceholder');
  setText('task-modal-cancel', 'taskModalClose');
  setText('task-modal-save', 'taskModalSave');
  setText('weekday-1', 'weekday1');
  setText('weekday-2', 'weekday2');
  setText('weekday-3', 'weekday3');
  setText('weekday-4', 'weekday4');
  setText('weekday-5', 'weekday5');
  setText('weekday-6', 'weekday6');
  setText('weekday-7', 'weekday7');
  setText('create-folder-btn', 'createFolder');
  setText('upload-doc-btn', 'uploadDocument');
  setText('clear-doc-btn', 'clearText');
  setText('documents-empty-text', 'documentsEmpty');
  setText('education-paste-label', 'educationPasteLabel');
  setText('documents-help-text', 'educationDocumentsHelp');
  setText('settings-dev-text', 'settingsDev');
  setPlaceholder('text-input', 'chatPlaceholder');
  setPlaceholder('education-text-input', 'educationChatPlaceholder');
  setPlaceholder('education-source-text', 'educationSourcePlaceholder');
  setPlaceholder('profile-first-name', 'profileFirstName');
  setPlaceholder('profile-phone', 'profilePhone');
  document.querySelectorAll('.profile-avatar-image').forEach((image) => {
    image.alt = t('avatarAlt');
  });
  const avatarPreview = document.getElementById('profile-photo-preview');
  if (avatarPreview) avatarPreview.alt = t('avatarPreviewAlt');
  setPanelState('idle');
  renderChatHistory();
  renderEducationChatHistory();
  renderDocumentsList();
  if (currentPanelSection === 'planning') renderPlanningPanel();
  if (currentPanelSection && currentPanelSection !== 'planning') {
    const panelTitles = {
      chat: 'panelChat',
      'education-chat': 'panelEducationChat',
      planning: 'panelPlanning',
      documents: 'panelDocuments',
      settings: 'panelSettings'
    };
    const panelTitleKey = panelTitles[currentPanelSection];
    if (panelTitleKey) {
      const titleEl = document.getElementById('panel-title');
      if (titleEl) titleEl.textContent = t(panelTitleKey);
    }
  }
  renderHomePage();
}

function applyLanguage(languageValue) {
  currentLanguage = normalizeAppLanguage(languageValue);
  applyTranslations();
}

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
    showToast(isLightTheme ? t('toastLight') : t('toastDark'));
  });
}

// démarrer en sombre
applyTheme(false);

const initialProfileData = loadProfileData();
applyProfileData(initialProfileData);
savedProfileSnapshot = profileDataToSnapshot(initialProfileData);
initializeProfileForm();
loadEducationState();
loadPlanningState();
loadMonthlyPrimaryTasks();
applyLanguage(initialProfileData.language);
updateProfileSaveState();

avatarPageTriggers.forEach(trigger => {
  trigger.addEventListener('click', showPersonalInfo);
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

if (educationDocumentInput) {
  educationDocumentInput.addEventListener('change', handleEducationDocumentUpload);
}

if (educationFilesToggle && educationDocumentInput) {
  educationFilesToggle.addEventListener('click', () => {
    setEducationUploadPanelOpen(true);
    educationDocumentInput.click();
  });
}

if (educationDropzone && educationDocumentInput) {
  educationDropzone.addEventListener('click', () => educationDocumentInput.click());
  educationDropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    educationDropzone.classList.add('dragover');
  });
  educationDropzone.addEventListener('dragleave', () => {
    educationDropzone.classList.remove('dragover');
  });
  educationDropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    educationDropzone.classList.remove('dragover');
    if (!event.dataTransfer?.files?.length) return;
    handleEducationDocumentUpload({ target: { files: event.dataTransfer.files, value: '' } });
  });
}

if (educationSourceTextArea) {
  educationSourceTextArea.addEventListener('input', persistEducationState);
}

if (clearDocBtn) {
  clearDocBtn.addEventListener('click', clearEducationSourceText);
}

if (educationClearFilesBtn) {
  educationClearFilesBtn.addEventListener('click', clearEducationDocuments);
}

const uploadDocumentButton = document.getElementById('upload-doc-btn');
if (uploadDocumentButton && educationDocumentInput) {
  uploadDocumentButton.addEventListener('click', () => educationDocumentInput.click());
}

document.addEventListener('click', (event) => {
  const downloadButton = event.target.closest('[data-download-education-message-index]');
  if (downloadButton) {
    downloadEducationMessagePdf(Number(downloadButton.dataset.downloadEducationMessageIndex));
    return;
  }

  const removeButton = event.target.closest('[data-remove-document-id]');
  if (removeButton) {
    removeEducationDocument(removeButton.dataset.removeDocumentId);
    return;
  }

  const documentButton = event.target.closest('[data-document-id]');
  if (!documentButton) return;
  selectEducationDocument(documentButton.dataset.documentId);
});

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
  renderHomePage();
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
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'flex';
  if (miloBtnWrap) miloBtnWrap.style.display = 'none';
}

function showAvatarDevPage() {
  closePanel();
  closeSettingsMenu();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 3));
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

function collectProfileData(options = {}) {
  const { includePhoto = true } = options;

  return {
    firstName: profileFirstNameInput?.value.trim() || '',
    email: profileEmailInput?.value.trim() || '',
    phone: profilePhoneInput?.value.trim() || '',
    language: profileLanguageSelect?.value || 'Français',
    accountType: profileAccountTypeSelect?.value || 'Personnel',
    photo: includePhoto ? (currentProfilePhotoData || '') : ''
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
  showToast(t('toastProfileSaved'));
}

function handleProfilePhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    showToast(t('toastImportImage'));
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
    field.addEventListener('input', (event) => {
      if (event.target === profileLanguageSelect) {
        applyLanguage(event.target.value);
      }
      updateProfileSaveState();
    });
    field.addEventListener('change', (event) => {
      if (event.target === profileLanguageSelect) {
        applyLanguage(event.target.value);
      }
      updateProfileSaveState();
    });
  });
}

function openPanelSection(section) {
  currentPanelSection = section;
  document.querySelectorAll('.panel-section').forEach(s => s.style.display = 'none');
  
  const titles = {
    'chat': t('panelChat'),
    'education-chat': t('panelEducationChat'),
    'planning': t('panelPlanning'),
    'documents': t('panelDocuments'),
    'settings': t('panelSettings')
  };
  document.getElementById('panel-title').textContent = titles[section] || t('panelChat');
  
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
      panelLabel.textContent = t('chatIdle');
    } else if (state === 'listening') {
      panelLabel.textContent = t('chatListening');
    } else if (state === 'thinking') {
      panelLabel.textContent = t('chatThinking');
    }
  } else if (currentPanelSection === 'education-chat' && educationPanelLabel) {
    if (state === 'idle') {
      educationPanelLabel.textContent = t('educationChatIdle');
    } else if (state === 'thinking') {
      educationPanelLabel.textContent = t('educationChatThinking');
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
    chatHistoryEl.innerHTML = `<div class="chat-empty">${t('chatEmpty')}</div>`;
    return;
  }
  chatHistoryEl.innerHTML = chatHistory.map(msg => `<div class="chat-bubble ${msg.role}">${escapeHtml(msg.text)}</div>`).join('');
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

function addMessageToHistory(role, text) {
  chatHistory.push({role, text});
  renderChatHistory();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEducationInline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function formatEducationMessage(text) {
  const normalizedText = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalizedText) return '';

  const blocks = normalizedText.split(/\n\s*\n/).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return '';

    if (lines.every(line => /^[-*]\s+/.test(line))) {
      return `<ul>${lines.map(line => `<li>${formatEducationInline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    }

    if (lines.every(line => /^\d+\.\s+/.test(line))) {
      return `<ol>${lines.map(line => `<li>${formatEducationInline(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
    }

    if (lines.length === 1 && /^\*\*(.+?)\*\*:?$/.test(lines[0])) {
      return `<h4>${formatEducationInline(lines[0].replace(/^\*\*(.+?)\*\*:?$/, '$1'))}</h4>`;
    }

    if (lines.length === 1 && /^#{1,4}\s+/.test(lines[0])) {
      return `<h4>${formatEducationInline(lines[0].replace(/^#{1,4}\s+/, ''))}</h4>`;
    }

    if (lines.length === 1 && /^[A-ZÀ-ÿ][^\n]{0,90}:$/.test(lines[0])) {
      return `<h4>${formatEducationInline(lines[0].slice(0, -1))}</h4>`;
    }

    return `<p>${lines.map(formatEducationInline).join('<br>')}</p>`;
  }).join('');
}

function stripEducationFormatting(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/^#{1,4}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .trim();
}

function extractEducationPdfTitle(text) {
  const lines = stripEducationFormatting(text).split('\n').map(line => line.trim()).filter(Boolean);
  return lines[0] || t('educationPdfFallbackTitle');
}

function slugifyEducationFileName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'milo-education';
}

function downloadEducationMessagePdf(messageIndex) {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) {
    showToast(t('educationPdfUnavailable'));
    return;
  }

  const message = educationChatHistory[messageIndex];
  if (!message || message.role !== 'milo') return;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const title = extractEducationPdfTitle(message.text);
  const body = stripEducationFormatting(message.text);

  let y = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(title, pageWidth - margin * 2);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const bodyLines = doc.splitTextToSize(body, pageWidth - margin * 2);

  bodyLines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  });

  doc.save(`${slugifyEducationFileName(title)}.pdf`);
}

function renderEducationChatHistory() {
  if (!educationChatHistoryEl) return;
  if (educationChatHistory.length === 0) {
    educationChatHistoryEl.innerHTML = `<div class="chat-empty">${t('educationChatEmpty')}</div>`;
    return;
  }

  educationChatHistoryEl.innerHTML = educationChatHistory.map((msg, index) => {
    if (msg.role === 'milo') {
      return `
        <div class="education-message-card milo">
          <div class="chat-bubble milo education-rich-message">${formatEducationMessage(msg.text)}</div>
          <button type="button" class="education-download-btn" data-download-education-message-index="${index}" title="${escapeHtml(t('educationDownloadPdf'))}" aria-label="${escapeHtml(t('educationDownloadPdf'))}">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 1.5v5.5"/>
              <path d="M3.8 5.2L6 7.5l2.2-2.3"/>
              <path d="M2 9.5h8"/>
            </svg>
            <span>${escapeHtml(t('educationDownloadPdf'))}</span>
          </button>
        </div>
      `;
    }

    return `<div class="education-message-card user"><div class="chat-bubble user">${escapeHtml(msg.text)}</div></div>`;
  }).join('');
  educationChatHistoryEl.scrollTop = educationChatHistoryEl.scrollHeight;
}

function addMessageToEducationHistory(role, text) {
  educationChatHistory.push({ role, text });
  renderEducationChatHistory();
}

function setEducationUploadPanelOpen(open) {
  isEducationUploadPanelOpen = open;
  if (educationUploadPanel) {
    educationUploadPanel.classList.toggle('open', open);
  }
  if (educationFilesToggle) {
    educationFilesToggle.classList.toggle('active', open);
  }
}

function setEducationAgentRequestPending(pending) {
  isEducationAgentRequestPending = pending;
  if (educationSendBtn) educationSendBtn.disabled = pending;
  if (educationTextInput) educationTextInput.disabled = pending;
}

function loadEducationState() {
  try {
    const rawDocuments = window.localStorage.getItem(educationDocumentsStorageKey);
    educationDocuments = rawDocuments ? JSON.parse(rawDocuments) : [];
  } catch {
    educationDocuments = [];
  }

  try {
    const sourceText = window.localStorage.getItem(educationSourceStorageKey) || '';
    if (educationSourceTextArea) educationSourceTextArea.value = sourceText;
  } catch {
    if (educationSourceTextArea) educationSourceTextArea.value = '';
  }

  selectedEducationDocumentId = educationDocuments[0]?.id || null;
  setEducationUploadPanelOpen(educationDocuments.length > 0);
}

function persistEducationState() {
  window.localStorage.setItem(educationDocumentsStorageKey, JSON.stringify(educationDocuments));
  window.localStorage.setItem(educationSourceStorageKey, educationSourceTextArea?.value || '');
}

function renderDocumentsList() {
  const listEl = document.getElementById('documents-list');
  if (!listEl) return;

  if (educationDocuments.length === 0) {
    listEl.innerHTML = `<div style="color: var(--text3); text-align: center; padding: 20px;"><span id="documents-empty-text">${t('documentsEmpty')}</span></div>`;
    return;
  }

  listEl.innerHTML = educationDocuments.map((document) => {
    const activeClass = document.id === selectedEducationDocumentId ? 'active' : '';
    return `<button type="button" class="document-item ${activeClass}" data-document-id="${document.id}"><div class="document-item-name">${document.name}</div><div class="document-item-meta">${t('importedDocumentMeta', { count: document.content.length })}</div></button>`;
  }).join('');

  if (educationChatFilesList) {
    if (educationDocuments.length === 0) {
      educationChatFilesList.innerHTML = `<span class="education-files-empty" id="education-files-empty">${t('educationFilesEmpty')}</span>`;
    } else {
      educationChatFilesList.innerHTML = educationDocuments.map(document => `
        <div class="education-file-chip">
          <span class="education-file-chip-name">${document.name}</span>
          <button type="button" class="education-file-remove" data-remove-document-id="${document.id}" aria-label="Retirer">×</button>
        </div>
      `).join('');
    }
  }

  if (educationFilesCount) {
    educationFilesCount.textContent = t('educationFilesCount', { count: educationDocuments.length });
  }
}

function shouldUseChatMessageAsStudySource(message) {
  const value = (message || '').trim();
  return value.length >= 120 || value.includes('\n');
}

function getEducationStudyContext(fallbackText = '') {
  const pastedText = educationSourceTextArea?.value.trim() || '';
  const chatFallback = shouldUseChatMessageAsStudySource(fallbackText) ? fallbackText.trim() : '';

  return {
    pastedText: pastedText || chatFallback,
    selectedDocumentId: selectedEducationDocumentId,
    documents: educationDocuments.map(document => ({
      id: document.id,
      name: document.name,
      content: document.content
    }))
  };
}

function handleEducationDocumentUpload(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  const remainingSlots = 3 - educationDocuments.length;
  if (remainingSlots <= 0) {
    showToast(t('educationFilesLimit'));
    event.target.value = '';
    return;
  }

  const acceptedFiles = files.slice(0, remainingSlots);
  if (files.length > remainingSlots) {
    showToast(t('educationFilesLimit'));
  }

  acceptedFiles.forEach((file, index) => {
    const isTextLike = file.type.startsWith('text/') || ['application/json'].includes(file.type) || /\.(txt|md|csv|json)$/i.test(file.name);
    if (!isTextLike) {
      if (index === 0) showToast(t('unsupportedDocument'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const documentEntry = {
        id: `edu-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        content
      };

      educationDocuments.unshift(documentEntry);
      selectedEducationDocumentId = documentEntry.id;
      persistEducationState();
      renderDocumentsList();
      setEducationUploadPanelOpen(true);
    };

    reader.readAsText(file);
  });

  event.target.value = '';
}

function selectEducationDocument(documentId) {
  selectedEducationDocumentId = documentId;
  renderDocumentsList();
}

function clearEducationSourceText() {
  if (educationSourceTextArea) {
    educationSourceTextArea.value = '';
  }
  persistEducationState();
}

function removeEducationDocument(documentId) {
  educationDocuments = educationDocuments.filter(document => document.id !== documentId);
  if (selectedEducationDocumentId === documentId) {
    selectedEducationDocumentId = educationDocuments[0]?.id || null;
  }
  persistEducationState();
  renderDocumentsList();
  setEducationUploadPanelOpen(educationDocuments.length > 0);
}

function clearEducationDocuments() {
  educationDocuments = [];
  selectedEducationDocumentId = null;
  persistEducationState();
  renderDocumentsList();
  setEducationUploadPanelOpen(false);
}

function setAgentRequestPending(pending) {
  isAgentRequestPending = pending;
  if (sendBtn) sendBtn.disabled = pending;
  if (textInput) textInput.disabled = pending;
  if (miloBtn) miloBtn.disabled = pending;
}

sendBtn.addEventListener('click', sendFromInput);
textInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendFromInput(); });
if (educationSendBtn) educationSendBtn.addEventListener('click', sendEducationFromInput);
if (educationTextInput) educationTextInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendEducationFromInput(); });
miloBtn.addEventListener('click', function() {
  if (isAgentRequestPending) {
    showToast(t('chatThinking'));
    return;
  }
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

if (educationChatPanel) {
  educationChatPanel.addEventListener('pointerdown', startChatSurfacePointerDrag);
  educationChatPanel.addEventListener('pointermove', moveChatSurfacePointerDrag);
  educationChatPanel.addEventListener('pointerup', endChatSurfacePointerDrag);
  educationChatPanel.addEventListener('pointercancel', endChatSurfacePointerDrag);
  educationChatPanel.addEventListener('touchstart', startChatSurfaceTouchDrag, { passive: true });
  educationChatPanel.addEventListener('touchmove', moveChatSurfaceTouchDrag, { passive: false });
  educationChatPanel.addEventListener('touchend', endChatSurfaceTouchDrag);
  educationChatPanel.addEventListener('touchcancel', endChatSurfaceTouchDrag);
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
  if (isAgentRequestPending) {
    showToast(t('chatThinking'));
    return;
  }
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast(t('toastSpeechUnavailable'));
    setPanelState('idle');
    miloBtn.classList.remove('listening');
    return;
  }
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRec();
  recognition.lang = getCurrentLocale();
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
  if (isAgentRequestPending) {
    showToast(t('chatThinking'));
    return;
  }

  const v = textInput.value.trim();
  if (v) {
    openPanelSection('chat');
    addMessageToHistory('user', v);
    textInput.value = '';
    sendCommand(v, 'text');
  }
}

function sendEducationFromInput() {
  if (isEducationAgentRequestPending) {
    showToast(t('educationChatThinking'));
    return;
  }

  const v = educationTextInput?.value.trim();
  const studyContext = getEducationStudyContext(v);
  if (!v) return;

  openPanelSection('education-chat');
  addMessageToEducationHistory('user', v);
  educationTextInput.value = '';
  sendCommand(v, 'education-text');
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
  const title = (match[2] || t('reminderDefaultTitle')).trim();
  return {time, title};
}

function getChatSessionId() {
  const existing = window.localStorage.getItem(chatSessionStorageKey);
  if (existing) return existing;

  const generated = `milo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(chatSessionStorageKey, generated);
  return generated;
}

function getAgentRequestPayload(message) {
  return {
    message,
    history: chatHistory,
    language: currentLanguage,
    sessionId: getChatSessionId(),
    profile: collectProfileData({ includePhoto: false }),
    planning: {
      view: planningState.view,
      currentDate: planningState.currentDate.toISOString(),
      selectedEventId: planningState.selectedEventId,
      events: planningState.events.map(event => ({
        id: event.id,
        date: event.date,
        time: event.time,
        title: event.title,
        description: event.description,
        meta: event.meta
      }))
    }
  };
}

function parseBooleanReply(text) {
  const normalized = (text || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

  if (/^(oui|ouais|yes|yep|ok|okay|vas-y|go|ajoute|ajoute-la|ajoute le)$/i.test(normalized)) {
    return true;
  }

  if (/^(non|no|nope|annule|laisse|laisse tomber|n'ajoute pas|ne l'ajoute pas)$/i.test(normalized)) {
    return false;
  }

  return null;
}

function getMonthKeyFromDateKey(dateKey = '') {
  return /^\d{4}-\d{2}/.test(dateKey) ? dateKey.slice(0, 7) : '';
}

function parseDateKeyString(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey || '');
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
}

function parseMonthKey(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey || '');
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, 1, 12, 0, 0, 0);
}

function formatMonthKey(date) {
  return formatDateKey(date).slice(0, 7);
}

function getCanonicalTaskTitle(title = '') {
  const cleanTitle = (title || '')
    .replace(/\s+(?:seance|séance|session)\s+\d+$/i, '')
    .trim();
  return cleanTitle || (title || '').trim() || t('untitledTask');
}

function normalizeTaskIdentityTitle(title = '') {
  return getCanonicalTaskTitle(title)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getMonthlyTaskIdentity(monthKey, title) {
  return `${monthKey}::${normalizeTaskIdentityTitle(title)}`;
}

function loadPlanningState() {
  try {
    const rawPlanning = window.localStorage.getItem(planningStorageKey);
    if (!rawPlanning) {
      ensurePlanningEventsStructure();
      return;
    }

    const parsedPlanning = JSON.parse(rawPlanning);
    planningState.view = parsedPlanning?.view === 'month' ? 'month' : 'day';
    planningState.currentDate = parsedPlanning?.currentDate ? new Date(parsedPlanning.currentDate) : new Date();
    if (Number.isNaN(planningState.currentDate.getTime())) {
      planningState.currentDate = new Date();
    }
    planningState.events = Array.isArray(parsedPlanning?.events) ? parsedPlanning.events : [];
    planningState.selectedEventId = typeof parsedPlanning?.selectedEventId === 'number' ? parsedPlanning.selectedEventId : null;
    planningState.nextEventId = typeof parsedPlanning?.nextEventId === 'number' ? parsedPlanning.nextEventId : 1;
    ensurePlanningEventsStructure();
  } catch {
    planningState.currentDate = new Date();
    planningState.events = [];
    planningState.selectedEventId = null;
    planningState.nextEventId = 1;
  }
}

function persistPlanningState() {
  window.localStorage.setItem(planningStorageKey, JSON.stringify({
    view: planningState.view,
    currentDate: planningState.currentDate.toISOString(),
    selectedEventId: planningState.selectedEventId,
    nextEventId: planningState.nextEventId,
    events: planningState.events
  }));
}

function loadMonthlyPrimaryTasks() {
  try {
    const rawTasks = window.localStorage.getItem(monthlyPrimaryTasksStorageKey);
    if (!rawTasks) {
      monthlyPrimaryTasks = [];
      return;
    }

    monthlyPrimaryTasks = JSON.parse(rawTasks)
      .filter(task => task && typeof task.title === 'string' && typeof task.monthKey === 'string')
      .map(task => ({
        id: typeof task.id === 'string' ? task.id : `monthly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: getCanonicalTaskTitle(task.title),
        monthKey: task.monthKey,
        reminderCount: Number.isFinite(task.reminderCount) ? task.reminderCount : 0,
        createdAt: typeof task.createdAt === 'number' ? task.createdAt : Date.now()
      }));
  } catch {
    monthlyPrimaryTasks = [];
  }
}

function persistMonthlyPrimaryTasks() {
  window.localStorage.setItem(monthlyPrimaryTasksStorageKey, JSON.stringify(monthlyPrimaryTasks));
}

function findMonthlyPrimaryTask(monthKey, title) {
  const identity = getMonthlyTaskIdentity(monthKey, title);
  return monthlyPrimaryTasks.find(task => getMonthlyTaskIdentity(task.monthKey, task.title) === identity) || null;
}

function addMonthlyPrimaryTask({ monthKey, title, reminderCount }) {
  const canonicalTitle = getCanonicalTaskTitle(title);
  const existingTask = findMonthlyPrimaryTask(monthKey, canonicalTitle);

  if (existingTask) {
    existingTask.reminderCount = Math.max(existingTask.reminderCount || 0, reminderCount || 0);
    persistMonthlyPrimaryTasks();
    renderHomePage();
    return existingTask;
  }

  const task = {
    id: `monthly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: canonicalTitle,
    monthKey,
    reminderCount: reminderCount || 0,
    createdAt: Date.now()
  };

  monthlyPrimaryTasks.push(task);
  monthlyPrimaryTasks.sort((left, right) => (right.reminderCount - left.reminderCount) || left.title.localeCompare(right.title));
  persistMonthlyPrimaryTasks();
  renderHomePage();
  return task;
}

function getCurrentHomeMonthKey() {
  return formatMonthKey(new Date());
}

function getEventBadgeClass(event) {
  if ((event.meta || '').includes('Milo')) return 'badge-purple';
  if ((event.meta || '').toLowerCase().includes('voice')) return 'badge-amber';
  return 'badge-teal';
}

function getEventDotColor(event) {
  if ((event.meta || '').includes('Milo')) return 'var(--accent)';
  if ((event.meta || '').toLowerCase().includes('voice')) return 'var(--amber)';
  return 'var(--teal)';
}

function formatHomeEventSubtitle(event) {
  const segments = [event.time || ''];
  if (event.description) {
    segments.push(event.description);
  }
  return segments.filter(Boolean).join(' · ');
}

function formatMonthLabelFromKey(monthKey) {
  const date = parseMonthKey(monthKey);
  if (!date) return monthKey;
  return date.toLocaleDateString(getCurrentLocale(), { month: 'long', year: 'numeric' });
}

function renderHomeEmptyState(message) {
  return `<div class="home-empty-card"><div>${escapeHtml(message)}</div><div class="home-empty-kicker">${escapeHtml(t('homeEmptyKicker'))}</div></div>`;
}

function renderHomeEventCards(events = []) {
  return events.map((event) => {
    const badgeClass = getEventBadgeClass(event);
    const badgeMarkup = event.meta ? `<span class="badge ${badgeClass}">${escapeHtml(event.meta)}</span>` : '';
    return `<button type="button" class="card" data-home-date-key="${escapeHtml(event.date)}" style="text-align:left;"><div class="card-dot" style="background:${getEventDotColor(event)}"></div><div class="card-body"><div class="card-title">${escapeHtml(event.title || t('untitledTask'))}</div><div class="card-sub">${escapeHtml(formatHomeEventSubtitle(event))}</div>${badgeMarkup}</div></button>`;
  }).join('');
}

function renderMonthlyPrimaryCards(tasks = []) {
  return tasks.map((task) => (`<button type="button" class="card home-monthly-card" data-home-month-key="${escapeHtml(task.monthKey)}" style="text-align:left;"><div class="card-dot" style="background:var(--accent)"></div><div class="card-body"><div class="card-title">${escapeHtml(task.title)}</div><div class="card-sub">${escapeHtml(formatMonthLabelFromKey(task.monthKey))}</div><div class="home-monthly-meta"><span class="badge badge-purple">${escapeHtml(t('homeMonthlyPrimaryBadge', { count: task.reminderCount }))}</span><span class="home-monthly-subtle">${escapeHtml(t('homeMonthBadge'))}</span></div></div></button>`)).join('');
}

function renderHomePage() {
  const todayList = document.getElementById('home-today-list');
  const tomorrowList = document.getElementById('home-tomorrow-list');
  const monthlyList = document.getElementById('home-monthly-primary-list');
  if (!todayList || !tomorrowList || !monthlyList) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(tomorrow);
  const currentMonthKey = getCurrentHomeMonthKey();

  const sortByTime = (left, right) => (left.time || '').localeCompare(right.time || '');
  const todayEvents = planningState.events.filter(event => event.date === todayKey).sort(sortByTime);
  const tomorrowEvents = planningState.events.filter(event => event.date === tomorrowKey).sort(sortByTime);
  const monthTasks = monthlyPrimaryTasks
    .filter(task => task.monthKey === currentMonthKey)
    .sort((left, right) => (right.reminderCount - left.reminderCount) || left.title.localeCompare(right.title));

  todayList.innerHTML = todayEvents.length ? renderHomeEventCards(todayEvents) : renderHomeEmptyState(t('homeEmptyToday'));
  tomorrowList.innerHTML = tomorrowEvents.length ? renderHomeEventCards(tomorrowEvents) : renderHomeEmptyState(t('homeEmptyTomorrow'));
  monthlyList.innerHTML = monthTasks.length ? renderMonthlyPrimaryCards(monthTasks) : renderHomeEmptyState(t('homeEmptyMonthlyPrimary'));
}

function openPlanningMonth(monthKey) {
  const monthDate = parseMonthKey(monthKey);
  if (!monthDate) return;
  planningState.currentDate = monthDate;
  planningState.view = 'month';
  openPanelSection('planning');
}

function maybeHandleMonthlyTaskPromptReply(text, mode = 'text') {
  if (!pendingMonthlyTaskPrompt) return false;

  const answer = parseBooleanReply(text);
  if (answer === null) {
    if (mode === 'text') {
      addMessageToHistory('milo', t('monthlyTaskClarify'));
    } else {
      showToast(t('monthlyTaskClarify'));
    }
    return true;
  }

  const prompt = pendingMonthlyTaskPrompt;
  pendingMonthlyTaskPrompt = null;

  if (answer) {
    addMonthlyPrimaryTask({
      monthKey: prompt.monthKey,
      title: prompt.title,
      reminderCount: prompt.reminderCount
    });
    if (mode === 'text') {
      addMessageToHistory('milo', t('monthlyTaskAddedConfirm', { title: prompt.title }));
    } else {
      showToast(t('monthlyTaskAddedConfirm', { title: prompt.title }));
    }
    return true;
  }

  if (mode === 'text') {
    addMessageToHistory('milo', t('monthlyTaskSkippedConfirm'));
  } else {
    showToast(t('monthlyTaskSkippedConfirm'));
  }
  return true;
}

function maybePromptForMonthlyPrimaryTasks(events = [], mode = 'text') {
  if (!Array.isArray(events) || !events.length || pendingMonthlyTaskPrompt) return;

  const groupedCandidates = new Map();
  events.forEach((event) => {
    const monthKey = getMonthKeyFromDateKey(event.date);
    const canonicalTitle = getCanonicalTaskTitle(event.title);
    const identity = getMonthlyTaskIdentity(monthKey, canonicalTitle);
    if (!monthKey || !canonicalTitle) return;

    const totalCount = planningState.events.filter((planningEvent) => (
      getMonthKeyFromDateKey(planningEvent.date) === monthKey
      && normalizeTaskIdentityTitle(planningEvent.title) === normalizeTaskIdentityTitle(canonicalTitle)
    )).length;

    if (totalCount <= 6 || findMonthlyPrimaryTask(monthKey, canonicalTitle)) return;

    groupedCandidates.set(identity, {
      monthKey,
      title: canonicalTitle,
      reminderCount: totalCount
    });
  });

  const candidate = groupedCandidates.values().next().value;
  if (!candidate) return;

  pendingMonthlyTaskPrompt = candidate;
  const promptText = t('monthlyTaskSuggestion', {
    count: candidate.reminderCount,
    title: candidate.title
  });

  if (mode === 'text') {
    addMessageToHistory('milo', promptText);
  } else {
    showToast(promptText);
  }
}

function getEducationAgentRequestPayload(message) {
  return {
    message,
    history: educationChatHistory,
    language: currentLanguage,
    sessionId: `${getChatSessionId()}-education`,
    profile: collectProfileData({ includePhoto: false }),
    studyContext: getEducationStudyContext(message),
    agent: 'education'
  };
}

function getApiUrl(pathname) {
  if (window.location?.origin && /^https?:/i.test(window.location.origin)) {
    return `${window.location.origin}${pathname}`;
  }

  return `http://localhost:3000${pathname}`;
}

function applyAgentActions(actions = []) {
  if (!Array.isArray(actions) || actions.length === 0) return [];

  const createdEvents = [];

  actions.forEach((action) => {
    if (action.type === 'add_planning_event') {
      if (!action?.event) return;

      const existingEvent = planningState.events.find((event) => (
        event.date === action.event.date
        && event.time === action.event.time
        && event.title === action.event.title
        && event.description === (action.event.description || '')
      ));

      if (existingEvent) {
        planningState.selectedEventId = existingEvent.id;
        return;
      }

      const createdEvent = createPlanningEvent({
        date: action.event.date,
        time: action.event.time,
        title: action.event.title,
        description: action.event.description || '',
        meta: action.event.meta || ''
      });

      if (typeof action.event.id === 'number') {
        createdEvent.id = action.event.id;
        if (createdEvent.id >= planningState.nextEventId) {
          planningState.nextEventId = createdEvent.id + 1;
        }
      }

      planningState.events.push(createdEvent);
      planningState.selectedEventId = createdEvent.id;
      createdEvents.push(createdEvent);

      if (action.openPlanning && action.event.date) {
        openPlanningDay(action.event.date);
      }
      return;
    }

    if (action.type === 'update_planning_event') {
      const existingEvent = planningState.events.find((event) => (
        (typeof action.eventId === 'number' && event.id === action.eventId)
        || (typeof action.event.id === 'number' && event.id === action.event.id)
      ));

      if (!existingEvent) return;

      existingEvent.title = action.event.title || existingEvent.title;
      existingEvent.date = action.event.date || existingEvent.date;
      existingEvent.time = action.event.time || existingEvent.time;
      existingEvent.description = action.event.description ?? existingEvent.description;
      existingEvent.meta = action.event.meta || existingEvent.meta;
      planningState.selectedEventId = existingEvent.id;

      if (action.openPlanning && existingEvent.date) {
        openPlanningDay(existingEvent.date);
      }

      return;
    }

    if (action.type === 'delete_planning_event') {
      const existingEvent = planningState.events.find((event) => (
        (typeof action.eventId === 'number' && event.id === action.eventId)
        || (typeof action.event?.id === 'number' && event.id === action.event.id)
      ));

      if (!existingEvent) return;

      planningState.events = planningState.events.filter((event) => event.id !== existingEvent.id);

      if (planningState.selectedEventId === existingEvent.id) {
        const sameDayEvents = planningState.events
          .filter((event) => event.date === existingEvent.date)
          .sort((left, right) => left.time.localeCompare(right.time));
        planningState.selectedEventId = sameDayEvents[0]?.id || null;
      }

      if (action.openPlanning && existingEvent.date) {
        openPlanningDay(existingEvent.date);
      }
    }
  });

  renderPlanningPanel();
  return createdEvents;
}

async function sendCommand(text, mode = 'text') {
  const isEducationMode = mode === 'education-text';

  if (!isEducationMode && maybeHandleMonthlyTaskPromptReply(text, mode)) {
    return;
  }

  if (isEducationMode) {
    if (isEducationAgentRequestPending) return;
    setEducationAgentRequestPending(true);
    if (educationPanelLabel) educationPanelLabel.textContent = t('educationChatThinking');
  }

  if (isAgentRequestPending) {
    if (!isEducationMode) return;
  }

  if (!isEducationMode) {
    setAgentRequestPending(true);
    miloBtn.classList.add('thinking');
    setPanelState('thinking');
  }

  const reminder = parseReminder(text);
  if (!isEducationMode && reminder) {
    const today = new Date();
    const key = formatDateKey(today);
    const reminderEvent = createPlanningEvent({
      date: key,
      time: reminder.time,
      title: reminder.title,
      description: '',
      meta: t('voiceAddedMeta')
    });
    planningState.events.push(reminderEvent);
    planningState.selectedEventId = reminderEvent.id;
    renderPlanningPanel();
    const confirm = t('reminderConfirm', { time: reminder.time, title: reminder.title });
    setAgentRequestPending(false);
    miloBtn.classList.remove('thinking');
    setPanelState('idle');
    if (mode === 'text') {
      addMessageToHistory('milo', confirm);
    }
    return;
  }

    try {
    const res = await fetch(getApiUrl('/api/chat'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(isEducationMode ? getEducationAgentRequestPayload(text) : getAgentRequestPayload(text))
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.reply || `${res.status} ${res.statusText}`.trim());
    }

    const reply = data.reply || t('chatUnknown');
    let createdEvents = [];
    if (!isEducationMode) {
      createdEvents = applyAgentActions(data.actions);
      setAgentRequestPending(false);
      miloBtn.classList.remove('thinking');
      setPanelState('idle');
    } else {
      setEducationAgentRequestPending(false);
      if (educationPanelLabel) educationPanelLabel.textContent = t('educationChatIdle');
    }

    if (mode === 'text') {
      addMessageToHistory('milo', reply);
      if (!isEducationMode) {
        maybePromptForMonthlyPrimaryTasks(createdEvents, mode);
      }
    } else if (isEducationMode) {
      addMessageToEducationHistory('milo', reply);
    } else {
      showToast(reply);
      if (!isEducationMode) {
        maybePromptForMonthlyPrimaryTasks(createdEvents, mode);
      }
    }
  } catch (err) {
    console.error('Error in sendCommand:', err);
    if (!isEducationMode) {
      setAgentRequestPending(false);
      miloBtn.classList.remove('thinking');
      setPanelState('idle');
    } else {
      setEducationAgentRequestPending(false);
      if (educationPanelLabel) educationPanelLabel.textContent = t('educationChatIdle');
    }

    if (mode === 'text') {
      addMessageToHistory('milo', t('errorServerPrefix') + err.message);
    } else if (isEducationMode) {
      addMessageToEducationHistory('milo', t('errorServerPrefix') + err.message);
    } else {
      showToast(t('errorServerPrefix') + err.message);
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
    const isSwiped = taskModalState.swipedEventId === event.id ? 'swiped' : '';
    const swipeTranslate = isSwiped ? '50%' : '0%';
    const actionsTranslate = isSwiped ? '0%' : '100%';
    const actionsOpacity = isSwiped ? '1' : '0';
    return `<div class="agenda-event ${isActive} ${isSwiped}" data-event-id="${event.id}" style="top: ${top}px; height: ${DAY_EVENT_HEIGHT}px; --swipe-translate: ${swipeTranslate}; --actions-translate: ${actionsTranslate}; --actions-opacity: ${actionsOpacity};"><div class="agenda-event-track"><div class="agenda-event-actions"><button type="button" class="agenda-event-action edit" data-edit-event-id="${event.id}">✎</button><button type="button" class="agenda-event-action delete" data-delete-event-id="${event.id}">×</button></div><button type="button" class="agenda-event-content" data-open-event-id="${event.id}"><div class="agenda-name">${event.title}</div></button></div></div>`;
  }).join('');

  const emptyState = events.length
    ? ''
    : `<div class="agenda-empty">${t('noTasksToday')}</div>`;

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

function closeTaskModal() {
  taskModalState.open = false;
  taskModalState.mode = 'view';
  taskModalState.eventId = null;
  renderTaskModal();
}

function openTaskModal(eventId, mode = 'view') {
  const event = planningState.events.find((entry) => entry.id === eventId);
  if (!event) return;

  planningState.selectedEventId = event.id;
  taskModalState.open = true;
  taskModalState.mode = mode;
  taskModalState.eventId = event.id;
  taskModalState.swipedEventId = null;
  renderPlanningPanel();
}

function renderTaskModal() {
  const backdrop = document.getElementById('task-modal-backdrop');
  const modalTitle = document.getElementById('task-modal-title');
  const titleValue = document.getElementById('task-title-value');
  const descriptionValue = document.getElementById('task-description-value');
  const titleInput = document.getElementById('task-title-input');
  const descriptionInput = document.getElementById('task-description-input');
  const saveButton = document.getElementById('task-modal-save');
  if (!backdrop || !modalTitle || !titleValue || !descriptionValue || !titleInput || !descriptionInput || !saveButton) return;

  const selectedEvent = planningState.events.find((event) => event.id === taskModalState.eventId) || null;
  if (!taskModalState.open || !selectedEvent || planningState.view !== 'day') {
    backdrop.classList.remove('open');
    titleInput.value = '';
    descriptionInput.value = '';
    return;
  }

  backdrop.classList.add('open');
  modalTitle.textContent = taskModalState.mode === 'edit' ? t('taskModalEditTitle') : t('taskModalReadTitle');
  titleValue.textContent = selectedEvent.title || t('untitledTask');
  descriptionValue.textContent = selectedEvent.description || t('taskModalEmptyDescription');
  descriptionValue.classList.toggle('task-modal-empty', !selectedEvent.description);
  titleInput.value = selectedEvent.title;
  descriptionInput.value = selectedEvent.description;

  const isEditMode = taskModalState.mode === 'edit';
  titleValue.style.display = isEditMode ? 'none' : 'block';
  descriptionValue.style.display = isEditMode ? 'none' : 'block';
  titleInput.style.display = isEditMode ? 'block' : 'none';
  descriptionInput.style.display = isEditMode ? 'block' : 'none';
  saveButton.style.display = isEditMode ? 'inline-flex' : 'none';
}

function saveTaskModalChanges() {
  const selectedEvent = planningState.events.find((event) => event.id === taskModalState.eventId);
  const titleInput = document.getElementById('task-title-input');
  const descriptionInput = document.getElementById('task-description-input');
  if (!selectedEvent || !titleInput || !descriptionInput) return;

  selectedEvent.title = titleInput.value.trim() || t('untitledTask');
  selectedEvent.description = descriptionInput.value.trim();
  persistPlanningState();
  renderHomePage();
  taskModalState.mode = 'view';
  renderPlanningPanel();
}

function removePlanningEventById(eventId) {
  const existingEvent = planningState.events.find((event) => event.id === eventId);
  if (!existingEvent) return;

  planningState.events = planningState.events.filter((event) => event.id !== eventId);
  if (planningState.selectedEventId === eventId) {
    const sameDayEvents = planningState.events
      .filter((event) => event.date === existingEvent.date)
      .sort((left, right) => left.time.localeCompare(right.time));
    planningState.selectedEventId = sameDayEvents[0]?.id || null;
  }
  if (taskModalState.eventId === eventId) {
    closeTaskModal();
  }
  taskModalState.swipedEventId = null;
  renderPlanningPanel();
}

function resetAgendaSwipeState() {
  taskModalState.pointerId = null;
  taskModalState.startX = 0;
  taskModalState.deltaX = 0;
  taskModalState.activeEventId = null;
  taskModalState.dragging = false;
}

function setAgendaEventReveal(eventId, revealRatio) {
  const eventElement = document.querySelector(`.agenda-event[data-event-id="${eventId}"]`);
  if (!eventElement) return;

  const clampedRatio = Math.max(0, Math.min(1, revealRatio));
  eventElement.style.setProperty('--swipe-translate', `${clampedRatio * 50}%`);
  eventElement.style.setProperty('--actions-translate', `${100 - (clampedRatio * 100)}%`);
  eventElement.style.setProperty('--actions-opacity', `${clampedRatio}`);
}

function handleAgendaPointerDown(event) {
  const trigger = event.target.closest('.agenda-event-content');
  if (!trigger) return;

  const eventCard = trigger.closest('.agenda-event');
  if (!eventCard) return;

  taskModalState.pointerId = event.pointerId;
  taskModalState.startX = event.clientX;
  taskModalState.deltaX = 0;
  taskModalState.activeEventId = Number(eventCard.dataset.eventId);
  taskModalState.dragging = false;
}

function handleAgendaPointerMove(event) {
  if (taskModalState.pointerId !== event.pointerId || taskModalState.activeEventId === null) return;
  const deltaX = event.clientX - taskModalState.startX;
  taskModalState.deltaX = deltaX;
  if (Math.abs(deltaX) > 16) {
    taskModalState.dragging = true;
  }

  const revealRatio = deltaX < 0 ? Math.min(Math.abs(deltaX) / 120, 1) : 0;
  setAgendaEventReveal(taskModalState.activeEventId, revealRatio);
}

function handleAgendaPointerUp(event) {
  if (taskModalState.pointerId !== event.pointerId || taskModalState.activeEventId === null) return;

  const targetEventId = taskModalState.activeEventId;
  const swipedLeft = taskModalState.deltaX < -48;
  const swipedBack = taskModalState.deltaX > 36;
  const wasDragging = taskModalState.dragging;

  if (swipedLeft) {
    taskModalState.swipedEventId = targetEventId;
    planningState.selectedEventId = targetEventId;
    renderPlanningPanel();
  } else if (swipedBack && taskModalState.swipedEventId === targetEventId) {
    taskModalState.swipedEventId = null;
    renderPlanningPanel();
  } else if (!wasDragging) {
    openTaskModal(targetEventId, 'view');
  } else if (taskModalState.swipedEventId !== null && taskModalState.swipedEventId !== targetEventId) {
    taskModalState.swipedEventId = null;
    renderPlanningPanel();
  }

  resetAgendaSwipeState();
}

function initializePlanningInteractions() {
  const dayBtn = document.getElementById('view-day-btn-panel');
  const monthBtn = document.getElementById('view-month-btn-panel');
  const newTaskBtn = document.getElementById('btn-new-task');
  const prevBtn = document.getElementById('planning-prev-panel');
  const nextBtn = document.getElementById('planning-next-panel');
  const agenda = document.getElementById('day-agenda-panel');
  const monthGrid = document.getElementById('month-grid-panel');
  const modalBackdrop = document.getElementById('task-modal-backdrop');
  const modalClose = document.getElementById('task-modal-close');
  const modalCancel = document.getElementById('task-modal-cancel');
  const modalSave = document.getElementById('task-modal-save');

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
    const title = prompt(t('promptTaskTitle'));
    if (!title) return;

    const time = prompt(t('promptTaskTime'));
    if (!parseTimeParts(time)) {
      alert(t('promptTimeInvalid'));
      return;
    }

    const key = formatDateKey(planningState.currentDate);
    const newEvent = createPlanningEvent({ date: key, time, title, description: '', meta: '' });
    planningState.events.push(newEvent);
    planningState.selectedEventId = newEvent.id;
    renderPlanningPanel();
  });

  agenda.addEventListener('pointerdown', handleAgendaPointerDown);
  agenda.addEventListener('pointermove', handleAgendaPointerMove);
  agenda.addEventListener('pointerup', handleAgendaPointerUp);
  agenda.addEventListener('pointercancel', resetAgendaSwipeState);
  agenda.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-event-id]');
    if (editButton) {
      event.stopPropagation();
      openTaskModal(Number(editButton.dataset.editEventId), 'edit');
      return;
    }

    const deleteButton = event.target.closest('[data-delete-event-id]');
    if (deleteButton) {
      event.stopPropagation();
      removePlanningEventById(Number(deleteButton.dataset.deleteEventId));
      return;
    }
  });

  monthGrid.addEventListener('click', (event) => {
    const dayCell = event.target.closest('[data-date-key]');
    if (!dayCell) return;
    openPlanningDay(dayCell.dataset.dateKey);
  });

  modalClose?.addEventListener('click', closeTaskModal);
  modalCancel?.addEventListener('click', closeTaskModal);
  modalSave?.addEventListener('click', saveTaskModalChanges);
  modalBackdrop?.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeTaskModal();
    }
  });
}

function formatLongDate(date) {
  return date.toLocaleDateString(getCurrentLocale(), {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
}

function formatMonthLabel(date) {
  return date.toLocaleDateString(getCurrentLocale(), {month: 'long', year: 'numeric'});
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function renderPlanningPanel() {
  ensurePlanningEventsStructure();
  persistPlanningState();
  initializePlanningInteractions();
  renderHomePage();

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
    renderTaskModal();
  } else {
    dayBtn.classList.remove('active');
    monthBtn.classList.add('active');
    dayView.style.display = 'none';
    monthView.style.display = 'block';
    label.textContent = formatMonthLabel(planningState.currentDate);
    closeTaskModal();

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

document.addEventListener('click', (event) => {
  const homeDayCard = event.target.closest('[data-home-date-key]');
  if (homeDayCard) {
    openPlanningDay(homeDayCard.dataset.homeDateKey);
    openPanelSection('planning');
    return;
  }

  const homeMonthCard = event.target.closest('[data-home-month-key]');
  if (homeMonthCard) {
    openPlanningMonth(homeMonthCard.dataset.homeMonthKey);
  }
});

