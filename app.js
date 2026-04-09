    // Panel management
    let panelOpen = false;
    let chatHistory = [];
    let chatConversations = [];
    let activeChatConversationId = '';
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
    let progressTaskModalState = {
      open: false,
      eventId: null
    };

    const panel = document.getElementById('panel');
    const panelHandle = document.getElementById('panel-handle');
    const chatPanel = document.getElementById('panel-chat');
    const educationChatPanel = document.getElementById('panel-education-chat');
    const planningPanel = document.getElementById('panel-planning');
    const miloBtnWrap = document.querySelector('.milo-btn-wrap');
    const miloBtn = document.getElementById('milo-btn');
    const miloBtnLabel = document.getElementById('milo-btn-label');
    const textInput = document.getElementById('text-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistoryEl = document.getElementById('chat-history');
    const chatThreadListEl = document.getElementById('chat-thread-list');
    const panelNewChatBtn = document.getElementById('panel-new-chat-btn');
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
    const educationInstructionsInput = document.getElementById('education-instructions');
    const educationSheetLengthSelect = document.getElementById('education-sheet-length');
    const educationSheetLengthWrap = document.getElementById('education-sheet-length-wrap');
    const educationQuizCountSelect = document.getElementById('education-quiz-count');
    const educationQuizCountWrap = document.getElementById('education-quiz-count-wrap');
    const educationGoBtn = document.getElementById('education-go-btn');
    const educationDownloadLatestBtn = document.getElementById('education-download-latest-btn');
    const educationQuizPage = document.getElementById('education-quiz-page');
    const educationQuizPageBody = document.getElementById('education-quiz-page-body');
    const educationQuizPageActions = document.getElementById('education-quiz-page-actions');
    const educationQuizPageProgress = document.getElementById('education-quiz-page-progress');
    const educationQuizPageKicker = document.getElementById('education-quiz-page-kicker');
    const educationQuizCloseBtn = document.getElementById('education-quiz-close-btn');
    const educationQuizHistoryLabel = document.getElementById('education-quiz-history-label');
    const educationQuizHistoryList = document.getElementById('education-quiz-history-list');
    const educationActionButtons = document.querySelectorAll('[data-education-action]');
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
    const settingsPreferencesItem = document.getElementById('settings-preferences-item');
    const settingsLogoutItem = document.getElementById('settings-logout-item');
    const themeToggle = document.getElementById('theme-toggle');
    const homeDailyNewsList = document.getElementById('home-daily-news-list');
    const avatarPageTriggers = document.querySelectorAll('[data-open-avatar-page]');
    const accessScreen = document.getElementById('access-screen');
    const accessLaunchOverlay = document.getElementById('access-launch-overlay');
    const accessLaunchWord = document.getElementById('access-launch-word');
    const accessLaunchPortal = document.getElementById('access-launch-portal');
    const accessBadge = document.getElementById('access-badge');
    const accessTitle = document.getElementById('access-title');
    const accessCopy = document.getElementById('access-copy');
    const accessUsernameLabel = document.getElementById('access-username-label');
    const accessPasswordLabel = document.getElementById('access-password-label');
    const accessUsernameInput = document.getElementById('access-username');
    const accessPasswordInput = document.getElementById('access-password');
    const accessPasswordToggle = document.getElementById('access-password-toggle');
    const accessPasswordToggleIcon = document.getElementById('access-password-toggle-icon');
    const accessError = document.getElementById('access-error');
    const accessPrimaryButton = document.getElementById('access-primary-btn');
    const accessGuestButton = document.getElementById('access-guest-btn');
    const accessFootnote = document.getElementById('access-footnote');
    const avatarImages = document.querySelectorAll('.profile-avatar-image');
    const profileFirstNameInput = document.getElementById('profile-first-name');
    const profileEmailInput = document.getElementById('profile-email');
    const profilePhoneInput = document.getElementById('profile-phone');
    const profileLanguageSelect = document.getElementById('profile-language');
    const profileAccountTypeSelect = document.getElementById('profile-account-type');
    const profilePhotoButton = document.getElementById('profile-photo-button');
    const profilePhotoRemoveButton = document.getElementById('profile-photo-remove');
    const profilePhotoInput = document.getElementById('profile-photo-input');
    const profilePhotoPreview = document.getElementById('profile-photo-preview');
    const profilePhotoLightbox = document.getElementById('profile-photo-lightbox');
    const profilePhotoLightboxImage = document.getElementById('profile-photo-lightbox-image');
    const profileSaveButton = document.getElementById('profile-save-btn');
    const profileStorageKey = 'milo.profile';
    const preferencesStorageKey = 'milo.preferences';
    const chatSessionStorageKey = 'milo.chatSessionId';
    const chatConversationsStorageKey = 'milo.chatConversations';
    const activeChatConversationStorageKey = 'milo.chatActiveConversationId';
    const educationDocumentsStorageKey = 'milo.educationDocuments';
    const educationSourceStorageKey = 'milo.educationSourceText';
    const educationQuizHistoryStorageKey = 'milo.educationQuizHistory';
    const planningStorageKey = 'milo.planning';
    const monthlyPrimaryTasksStorageKey = 'milo.monthlyPrimaryTasks';
    const localAccessAccountStorageKey = 'milo.localAccessAccount';
    const localAccessSessionStorageKey = 'milo.localAccessSession';
    const navHomeItem = document.getElementById('nav-home-item');
    const navPlanningItem = document.getElementById('nav-planning-item');
    const navEducationItem = document.getElementById('nav-education-item');
    const navProgressItem = document.getElementById('nav-progress-item');
    const bottomNav = document.querySelector('.bottom-nav');
    let savedProfileSnapshot = null;
    let currentProfilePhotoData = '';
    let currentLanguage = 'fr';
    let isAgentRequestPending = false;
    let isEducationAgentRequestPending = false;
    let isEducationUploadPanelOpen = false;
    let educationDocuments = [];
    let selectedEducationDocumentId = null;
    let selectedEducationAction = 'explain';
    let selectedEducationSheetLength = 'medium';
    let selectedEducationQuizQuestionCount = 5;
    let lastEducationTaskSignature = '';
    let educationQuizUiState = {};
    let educationQuizHistory = [];
    let educationQuizPageState = {
      open: false,
      loading: false,
      error: '',
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      feedback: null,
      completed: false,
      lastPrompt: '',
      historySaved: false,
      historyTitle: ''
    };
    let educationQuizHistorySwipeState = {
      swipedEntryId: '',
      pointerId: null,
      captureTarget: null,
      startX: 0,
      deltaX: 0,
      startOffset: 0,
      currentOffset: 0,
      activeEntryId: '',
      dragging: false
    };
    let monthlyPrimaryTasks = [];
    let pendingMonthlyTaskPrompt = null;
    let dailyNewsTheme = 'none';
    let accessState = {
      mode: 'locked',
      username: '',
      hasLocalAccount: false
    };
    let isAccessPasswordVisible = false;
    let isAccessLaunchAnimationRunning = false;
    let dailyNewsState = {
      cacheKey: '',
      entry: null,
      status: 'idle',
      source: 'none'
    };
    let dailyNewsDragState = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      deltaX: 0,
      axis: null
    };

    const translations = {
      fr: {
        navHome: 'Accueil',
        navPlanning: 'Planning',
        navEducation: 'Éducation',
        navProgress: 'Progress',
        homeDailyNews: 'Daily News',
        homeToday: 'Aujourd\'hui',
        homeTomorrow: 'Demain',
        homeMonthlyPrimary: 'Tâches principales mensuelles',
        homeDailyNewsEmptyTitle: 'Choisis un thème d\'actualité',
        homeDailyNewsEmptySub: 'Ouvre Paramètres pour sélectionner un thème et afficher une news quotidienne sur l\'accueil.',
        homeDailyNewsBadge: 'News web',
        homeDailyNewsFallbackBadge: 'Erreur web · local',
        homeDailyNewsLoadingTitle: 'Chargement des news du jour',
        homeDailyNewsLoadingSub: 'Milo prépare une synthèse depuis le web pour ce thème.',
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
        progressSection: 'Tâches terminées',
        progressEmpty: 'Aucune tâche terminée pour le moment.',
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
        educationActionExplain: 'Aide',
        educationActionReformulate: 'Reformuler',
        educationActionSheet: 'Fiche',
        educationActionQuiz: 'Quiz',
        educationInstructionsLabel: 'Indications',
        educationInstructionsPlaceholder: 'Optionnel : précise le ton, le niveau, les points à détailler ou les éléments à éviter.',
        educationSheetLengthLabel: 'Format de fiche',
        educationQuizCountLabel: 'Nombre de questions',
        educationSheetShort: 'Court',
        educationSheetMedium: 'Moyen',
        educationSheetLong: 'Long',
        educationGo: 'Go',
        educationQuizTitle: 'Quiz Milo',
        educationQuizLoading: 'Milo prépare ton quiz…',
        educationQuizInvalidCount: 'Choisis au moins 1 question pour lancer le quiz.',
        educationQuizCompleted: 'Quiz terminé',
        educationQuizRestartSame: 'Recommencer',
        educationQuizRegenerate: 'Régénérer',
        educationQuizExit: 'Quitter',
        educationQuizProgress: 'Question {current}/{total}',
        educationQuizCheck: 'Corriger',
        educationQuizRetry: 'Rejouer',
        educationQuizScore: '{score}/{total} bonnes réponses',
        educationQuizHistoryLabel: 'Historique des quiz',
        educationQuizHistoryEmpty: 'Aucun quiz terminé pour le moment.',
        educationQuizHistoryMeta: '{count} questions · {date}',
        educationQuizQuestion: 'Question {number}',
        educationQuizCorrect: 'Bonne réponse',
        educationQuizIncorrect: 'Réponse incorrecte',
        educationQuizIncomplete: 'Réponds à toutes les questions avant de corriger.',
        educationDownloadLatest: 'Télécharger la réponse PDF',
        clearText: 'Effacer le texte',
        educationNoSource: 'Ajoute un texte ou sélectionne un document avant de lancer une consigne d\'étude.',
        unsupportedDocument: 'Importe un document texte (.txt, .md, .csv ou .json).',
        importedDocumentMeta: '{count} caractères',
        settingsTitle: 'Paramètres',
        settingsTheme: 'Thème',
        settingsNotifications: 'Notifications navigateur',
        settingsTestNotification: 'Tester les notifications',
        settingsDailyNewsTheme: 'Thème Daily News',
        settingsPreferences: 'Préférences',
        settingsLogout: 'Déconnexion',
        settingsExitGuest: 'Quitter le mode sans compte',
        accessKicker: 'Milo local',
        accessBadge: 'Mémoire locale sur cet appareil',
        accessTitleCreate: 'Créer un espace local',
        accessTitleLogin: 'Connexion locale',
        accessCopyCreate: 'Ton identifiant et ta mémoire restent sur cet appareil. Aucun compte serveur n’est nécessaire.',
        accessCopyLogin: 'Retrouve ton espace local sur cet appareil avec ton identifiant et ton mot de passe.',
        accessUsername: 'Identifiant',
        accessPassword: 'Mot de passe',
        accessPasswordShow: 'Afficher le mot de passe',
        accessPasswordHide: 'Masquer le mot de passe',
        accessUsernamePlaceholderCreate: 'Choisis un identifiant',
        accessUsernamePlaceholderLogin: 'Ton identifiant local',
        accessPasswordPlaceholderCreate: 'Choisis un mot de passe',
        accessPasswordPlaceholderLogin: 'Ton mot de passe local',
        accessPrimaryCreate: 'Créer mon espace local',
        accessPrimaryLogin: 'Se connecter',
        accessGuest: 'Continuer sans compte',
        accessFootnote: 'Le mode sans compte donne uniquement accès au chat Milo IA et à Éducation.',
        guestHomeLabel: 'Mode sans compte',
        guestHomeTitle: 'Accès rapide à Milo IA',
        guestHomeSub: 'Sur cet appareil, le mode sans compte donne accès au chat Milo IA et à Éducation sans mémoire personnelle locale.',
        guestHomeChatHint: 'Appuie sur Milo pour ouvrir le chat IA.',
        guestHomeEducationHint: 'Utilise Éducation depuis la barre du bas.',
        toastAccessMissingCredentials: 'Renseigne un identifiant et un mot de passe.',
        toastAccessCreated: 'Espace local créé sur cet appareil.',
        toastAccessLoggedIn: 'Connexion locale réussie.',
        toastAccessInvalid: 'Identifiant ou mot de passe incorrect.',
        accessInlineInvalid: 'Mot de passe incorrect.',
        toastGuestModeEnabled: 'Mode sans compte activé.',
        toastGuestProfileUnavailable: 'Le profil n’est pas disponible en mode sans compte.',
        toastGuestPlanningUnavailable: 'Le planning n’est pas disponible en mode sans compte.',
        toastNotificationsUnsupported: 'Les notifications navigateur ne sont pas disponibles ici.',
        toastNotificationsDenied: 'La permission de notifications a été refusée.',
        toastNotificationsEnabled: 'Notifications navigateur activées.',
        toastNotificationsDisabled: 'Notifications navigateur désactivées.',
        toastNotificationTestSent: 'Test envoyé au navigateur. Si aucune bannière n’apparaît, vérifie les notifications Chrome dans les réglages macOS.',
        toastNotificationTestError: 'Le navigateur a refusé d’afficher la notification de test.',
        toastNotificationsFallback: 'Les rappels Milo s’afficheront dans l’app tant qu’elle reste ouverte.',
        newsThemeNone: 'Aucun',
        newsThemeMusic: 'Musique',
        newsThemePolitics: 'Politique',
        newsThemeEconomy: 'Économie',
        newsThemeArt: 'Sport',
        chatEmpty: 'Aucun échange pour le moment',
        chatIdle: 'Écris un message ou parle à Milo',
        chatListening: 'J\'écoute…',
        chatThinking: 'Milo réfléchit…',
        chatPlaceholder: 'Écris à Milo…',
        newChat: 'Nouveau chat',
        chatThreadsLabel: 'Discussions',
        chatUntitledConversation: 'Nouvelle discussion',
        chatRenameAction: 'Renommer',
        chatDeleteAction: 'Supprimer',
        chatDeleteConfirm: 'Supprimer la discussion « {title} » ?',
        chatRenamePrompt: 'Nouveau nom de la discussion :',
        chatGreetingNamed: 'Bonjour {name}, que puis-je faire pour toi aujourd\'hui ?',
        chatGreetingGuest: 'Bonjour invité, que puis-je faire pour toi aujourd\'hui ?',
        chatGreetingFallback: 'Bonjour, que puis-je faire pour toi aujourd\'hui ?',
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
        taskScheduledDate: 'Date de réalisation',
        taskCompletedDate: 'Date cochée',
        taskCompleteAria: 'Valider la tâche',
        taskUncompleteAria: 'Remettre la tâche dans l agenda',
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
        toastDailyNewsThemeSaved: 'Daily News réglé sur : {theme}',
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
        homeDailyNews: 'Daily News',
        homeToday: 'Today',
        homeTomorrow: 'Tomorrow',
        homeMonthlyPrimary: 'Main monthly tasks',
        homeDailyNewsEmptyTitle: 'Choose a news theme',
        homeDailyNewsEmptySub: 'Open Settings to select a theme and show a daily news card on the home page.',
        homeDailyNewsBadge: 'Web news',
        homeDailyNewsFallbackBadge: 'Web error · local',
        homeDailyNewsLoadingTitle: 'Loading today\'s news',
        homeDailyNewsLoadingSub: 'Milo is preparing a web summary for this theme.',
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
        progressSection: 'Completed tasks',
        progressEmpty: 'No completed task yet.',
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
        educationActionExplain: 'Explain',
        educationActionReformulate: 'Rewrite',
        educationActionSheet: 'Study sheet',
        educationActionQuiz: 'Quiz',
        educationInstructionsLabel: 'Instructions',
        educationInstructionsPlaceholder: 'Optional: specify the tone, level, points to detail, or elements to avoid.',
        educationSheetLengthLabel: 'Sheet format',
        educationQuizCountLabel: 'Number of questions',
        educationSheetShort: 'Short',
        educationSheetMedium: 'Medium',
        educationSheetLong: 'Long',
        educationGo: 'Go',
        educationQuizTitle: 'Milo Quiz',
        educationQuizLoading: 'Milo is building your quiz…',
        educationQuizInvalidCount: 'Choose at least 1 question to start the quiz.',
        educationQuizCompleted: 'Quiz completed',
        educationQuizRestartSame: 'Restart',
        educationQuizRegenerate: 'Regenerate',
        educationQuizExit: 'Exit',
        educationQuizProgress: 'Question {current}/{total}',
        educationQuizCheck: 'Check answers',
        educationQuizRetry: 'Try again',
        educationQuizScore: '{score}/{total} correct answers',
        educationQuizHistoryLabel: 'Quiz history',
        educationQuizHistoryEmpty: 'No completed quiz yet.',
        educationQuizHistoryMeta: '{count} questions · {date}',
        educationQuizQuestion: 'Question {number}',
        educationQuizCorrect: 'Correct answer',
        educationQuizIncorrect: 'Incorrect answer',
        educationQuizIncomplete: 'Answer every question before checking.',
        educationDownloadLatest: 'Download response PDF',
        clearText: 'Clear text',
        educationNoSource: 'Add text or select a document before asking for a study task.',
        unsupportedDocument: 'Import a text document (.txt, .md, .csv or .json).',
        importedDocumentMeta: '{count} characters',
        settingsTitle: 'Settings',
        settingsTheme: 'Theme',
        settingsNotifications: 'Browser notifications',
        settingsTestNotification: 'Test notifications',
        settingsDailyNewsTheme: 'Daily News theme',
        settingsPreferences: 'Preferences',
        settingsLogout: 'Log out',
        settingsExitGuest: 'Exit no-account mode',
        accessKicker: 'Milo local',
        accessBadge: 'Local memory on this device',
        accessTitleCreate: 'Create a local space',
        accessTitleLogin: 'Local sign in',
        accessCopyCreate: 'Your identifier and memory stay on this device. No server account is required.',
        accessCopyLogin: 'Open your local space on this device with your identifier and password.',
        accessUsername: 'Identifier',
        accessPassword: 'Password',
        accessPasswordShow: 'Show password',
        accessPasswordHide: 'Hide password',
        accessUsernamePlaceholderCreate: 'Choose an identifier',
        accessUsernamePlaceholderLogin: 'Your local identifier',
        accessPasswordPlaceholderCreate: 'Choose a password',
        accessPasswordPlaceholderLogin: 'Your local password',
        accessPrimaryCreate: 'Create my local space',
        accessPrimaryLogin: 'Sign in',
        accessGuest: 'Continue without account',
        accessFootnote: 'No-account mode only gives access to Milo AI chat and Education.',
        guestHomeLabel: 'No-account mode',
        guestHomeTitle: 'Quick access to Milo AI',
        guestHomeSub: 'On this device, no-account mode gives access to Milo AI chat and Education without local personal memory.',
        guestHomeChatHint: 'Press Milo to open the AI chat.',
        guestHomeEducationHint: 'Use Education from the bottom bar.',
        toastAccessMissingCredentials: 'Enter an identifier and a password.',
        toastAccessCreated: 'Local space created on this device.',
        toastAccessLoggedIn: 'Local sign in successful.',
        toastAccessInvalid: 'Incorrect identifier or password.',
        accessInlineInvalid: 'Incorrect password.',
        toastGuestModeEnabled: 'No-account mode enabled.',
        toastGuestProfileUnavailable: 'Profile is not available in no-account mode.',
        toastGuestPlanningUnavailable: 'Planning is not available in no-account mode.',
        toastNotificationsUnsupported: 'Browser notifications are not available here.',
        toastNotificationsDenied: 'Notification permission was denied.',
        toastNotificationsEnabled: 'Browser notifications enabled.',
        toastNotificationsDisabled: 'Browser notifications disabled.',
        toastNotificationTestSent: 'Test sent to the browser. If no banner appears, check Chrome notifications in macOS settings.',
        toastNotificationTestError: 'The browser refused to display the test notification.',
        toastNotificationsFallback: 'Milo reminders will appear inside the app while it stays open.',
        newsThemeNone: 'None',
        newsThemeMusic: 'Music',
        newsThemePolitics: 'Politics',
        newsThemeEconomy: 'Economy',
        newsThemeArt: 'Sport',
        chatEmpty: 'No conversation yet',
        chatIdle: 'Type a message or speak to Milo',
        chatListening: 'I\'m listening…',
        chatThinking: 'Milo is thinking…',
        chatPlaceholder: 'Write to Milo…',
        newChat: 'New chat',
        chatThreadsLabel: 'Threads',
        chatUntitledConversation: 'New conversation',
        chatRenameAction: 'Rename',
        chatDeleteAction: 'Delete',
        chatDeleteConfirm: 'Delete the conversation "{title}"?',
        chatRenamePrompt: 'New conversation name:',
        chatGreetingNamed: 'Hello {name}, what can I do for you today?',
        chatGreetingGuest: 'Hello guest, what can I do for you today?',
        chatGreetingFallback: 'Hello, what can I do for you today?',
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
        taskScheduledDate: 'Scheduled date',
        taskCompletedDate: 'Checked date',
        taskCompleteAria: 'Mark task as completed',
        taskUncompleteAria: 'Move task back to agenda',
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
        toastDailyNewsThemeSaved: 'Daily News set to: {theme}',
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
      },
      es: {
        navHome: 'Inicio',
        navPlanning: 'Planificacion',
        navEducation: 'Educacion',
        navProgress: 'Progreso',
        homeDailyNews: 'Daily News',
        homeToday: 'Hoy',
        homeTomorrow: 'Manana',
        homeMonthlyPrimary: 'Tareas principales mensuales',
        homeDailyNewsEmptyTitle: 'Elige un tema de actualidad',
        homeDailyNewsEmptySub: 'Abre Ajustes para seleccionar un tema y mostrar una noticia diaria en la pantalla de inicio.',
        homeDailyNewsBadge: 'News web',
        homeDailyNewsFallbackBadge: 'Error web · local',
        homeDailyNewsLoadingTitle: 'Cargando noticias del dia',
        homeDailyNewsLoadingSub: 'Milo esta preparando un resumen desde la web para este tema.',
        homeEmptyToday: 'No hay tareas previstas hoy.',
        homeEmptyTomorrow: 'No hay tareas previstas manana.',
        homeEmptyMonthlyPrimary: 'No hay tareas principales para este mes.',
        homeEmptyKicker: 'Sin recordatorio',
        homeMonthlyPrimaryBadge: '{count} recordatorios este mes',
        homeMonthBadge: 'Mes activo',
        monthlyTaskSuggestion: 'Acabo de crear {count} recordatorios este mes para {title}. Quieres que tambien lo anada a tu lista de tareas principales mensuales? Responde si o no.',
        monthlyTaskAddedConfirm: '{title} se anadio a tu lista de tareas principales mensuales.',
        monthlyTaskSkippedConfirm: 'De acuerdo, no lo anado a la lista mensual.',
        monthlyTaskClarify: 'Responde simplemente si o no para decirme si debo anadir esta tarea a la lista mensual.',
        homeCard1Title: 'Revision - Matematicas',
        homeCard1Sub: '14:00 · 45 min',
        homeCard1Badge: 'Planificado por Milo',
        homeCard2Title: 'Compras por hacer',
        homeCard2Sub: 'Leche, pan, tomates...',
        homeCard2Badge: 'Recordatorio 18:00',
        homeCard3Title: 'Deporte - Running',
        homeCard3Sub: '07:30 · 30 min',
        homeCard3Badge: 'Objetivo semanal',
        homeCard4Title: 'Revision - Historia',
        homeCard4Sub: '19:00 · 1 h',
        homeCard4Badge: 'Planificado por Milo',
        progressTitle: 'Progreso',
        progressSection: 'Tareas completadas',
        progressEmpty: 'Todavia no hay tareas completadas.',
        profileTitle: 'Perfil',
        profileHeroTitle: 'Tu espacio personal',
        profileHeroSubtitle: 'Encuentra aqui la informacion principal de tu perfil en una pagina dedicada, igual que Educacion.',
        profileSection: 'Perfil',
        profileFirstName: 'Nombre',
        profileEmail: 'Correo',
        profilePhone: 'Telefono',
        profilePhoto: 'Foto de perfil',
        profilePhotoName: 'Foto actual',
        profilePhotoHelp: 'Solo JPEG o PNG',
        profileImport: 'Importar',
        profileRemove: 'Quitar',
        profilePreferences: 'Preferencias',
        profileLanguage: 'Idioma',
        profileAccount: 'Cuenta',
        languageOptionFr: 'Frances',
        languageOptionEn: 'Ingles',
        languageOptionEs: 'Espanol',
        accountPersonal: 'Personal',
        accountStudent: 'Estudiante',
        accountProfessional: 'Profesional',
        profileSave: 'Guardar',
        educationTitle: 'Educacion',
        educationWelcome: 'Bienvenido a Educacion',
        educationCardTitle: 'Usa la barra lateral para acceder a las funciones',
        educationCardSub: 'Chat con IA para hacer preguntas sobre tus documentos',
        educationChatButton: 'Chat IA',
        educationDocumentsButton: 'Documentos',
        educationChatEmpty: 'Todavia no hay conversacion',
        educationChatIdle: 'Pega un texto o elige un documento y luego pide una ficha, una reformulacion o un quiz.',
        educationChatThinking: 'Milo Educacion esta preparando tu respuesta...',
        educationChatPlaceholder: 'Pide una ficha, un quiz o una reformulacion...',
        educationDownloadPdf: 'Descargar PDF',
        educationPdfFallbackTitle: 'Documento Milo Educacion',
        educationPdfUnavailable: 'El modulo PDF no esta disponible por ahora.',
        educationFilesToggleLabel: 'Agregar archivos',
        educationDropzoneTitle: 'Suelta hasta 3 archivos',
        educationDropzoneHelp: 'TXT, MD, CSV o JSON. Luego puedes anadir una consigna en el chat.',
        educationFilesCount: '{count}/3 archivos',
        educationFilesEmpty: 'No se ha agregado ningun archivo',
        educationClearFiles: 'Vaciar archivos',
        educationFilesLimit: 'Puedes agregar hasta 3 archivos como maximo.',
        educationPasteLabel: 'Texto de estudio',
        educationSourcePlaceholder: 'Pega aqui una leccion, un capitulo o un extracto para crear fichas, reformulaciones y quizzes.',
        educationDocumentsHelp: 'Importa un documento de texto o pega un pasaje. El chat IA de Educacion usara este contenido como base de trabajo.',
        educationActionExplain: 'Explicar',
        educationActionReformulate: 'Reformular',
        educationActionSheet: 'Ficha',
        educationActionQuiz: 'Quiz',
        educationInstructionsLabel: 'Indicaciones',
        educationInstructionsPlaceholder: 'Opcional: precisa el tono, el nivel, los puntos que desarrollar o lo que hay que evitar.',
        educationSheetLengthLabel: 'Formato de ficha',
        educationQuizCountLabel: 'Numero de preguntas',
        educationSheetShort: 'Corto',
        educationSheetMedium: 'Medio',
        educationSheetLong: 'Largo',
        educationGo: 'Go',
        educationQuizTitle: 'Quiz Milo',
        educationQuizLoading: 'Milo esta preparando tu quiz...',
        educationQuizInvalidCount: 'Elige al menos 1 pregunta para iniciar el quiz.',
        educationQuizCompleted: 'Quiz terminado',
        educationQuizRestartSame: 'Reiniciar',
        educationQuizRegenerate: 'Regenerar',
        educationQuizExit: 'Salir',
        educationQuizProgress: 'Pregunta {current}/{total}',
        educationQuizCheck: 'Corregir',
        educationQuizRetry: 'Reintentar',
        educationQuizScore: '{score}/{total} respuestas correctas',
        educationQuizHistoryLabel: 'Historial de quizzes',
        educationQuizHistoryEmpty: 'Todavia no hay ningun quiz terminado.',
        educationQuizHistoryMeta: '{count} preguntas · {date}',
        educationQuizQuestion: 'Pregunta {number}',
        educationQuizCorrect: 'Respuesta correcta',
        educationQuizIncorrect: 'Respuesta incorrecta',
        educationQuizIncomplete: 'Responde a todas las preguntas antes de corregir.',
        educationDownloadLatest: 'Descargar la respuesta en PDF',
        clearText: 'Borrar texto',
        educationNoSource: 'Agrega un texto o selecciona un documento antes de pedir una tarea de estudio.',
        unsupportedDocument: 'Importa un documento de texto (.txt, .md, .csv o .json).',
        importedDocumentMeta: '{count} caracteres',
        settingsTitle: 'Ajustes',
        settingsTheme: 'Tema',
        settingsNotifications: 'Notificaciones del navegador',
        settingsTestNotification: 'Probar notificaciones',
        settingsDailyNewsTheme: 'Tema Daily News',
        settingsPreferences: 'Preferencias',
        settingsLogout: 'Cerrar sesión',
        settingsExitGuest: 'Salir del modo sin cuenta',
        accessKicker: 'Milo local',
        accessBadge: 'Memoria local en este dispositivo',
        accessTitleCreate: 'Crear un espacio local',
        accessTitleLogin: 'Conexion local',
        accessCopyCreate: 'Tu identificador y tu memoria se quedan en este dispositivo. No hace falta una cuenta del servidor.',
        accessCopyLogin: 'Abre tu espacio local en este dispositivo con tu identificador y tu contraseña.',
        accessUsername: 'Identificador',
        accessPassword: 'Contrasena',
        accessPasswordShow: 'Mostrar la contrasena',
        accessPasswordHide: 'Ocultar la contrasena',
        accessUsernamePlaceholderCreate: 'Elige un identificador',
        accessUsernamePlaceholderLogin: 'Tu identificador local',
        accessPasswordPlaceholderCreate: 'Elige una contrasena',
        accessPasswordPlaceholderLogin: 'Tu contrasena local',
        accessPrimaryCreate: 'Crear mi espacio local',
        accessPrimaryLogin: 'Entrar',
        accessGuest: 'Continuar sin cuenta',
        accessFootnote: 'El modo sin cuenta solo da acceso al chat IA de Milo y a Educacion.',
        guestHomeLabel: 'Modo sin cuenta',
        guestHomeTitle: 'Acceso rapido a Milo IA',
        guestHomeSub: 'En este dispositivo, el modo sin cuenta da acceso al chat IA de Milo y a Educacion sin memoria personal local.',
        guestHomeChatHint: 'Pulsa Milo para abrir el chat IA.',
        guestHomeEducationHint: 'Usa Educacion desde la barra inferior.',
        toastAccessMissingCredentials: 'Introduce un identificador y una contrasena.',
        toastAccessCreated: 'Espacio local creado en este dispositivo.',
        toastAccessLoggedIn: 'Conexion local correcta.',
        toastAccessInvalid: 'Identificador o contrasena incorrectos.',
        accessInlineInvalid: 'Contrasena incorrecta.',
        toastGuestModeEnabled: 'Modo sin cuenta activado.',
        toastGuestProfileUnavailable: 'El perfil no esta disponible en modo sin cuenta.',
        toastGuestPlanningUnavailable: 'La planificacion no esta disponible en modo sin cuenta.',
        toastNotificationsUnsupported: 'Las notificaciones del navegador no estan disponibles aqui.',
        toastNotificationsDenied: 'Se rechazo el permiso de notificaciones.',
        toastNotificationsEnabled: 'Notificaciones del navegador activadas.',
        toastNotificationsDisabled: 'Notificaciones del navegador desactivadas.',
        toastNotificationTestSent: 'Prueba enviada al navegador. Si no aparece ninguna notificacion, revisa los ajustes de Chrome en macOS.',
        toastNotificationTestError: 'El navegador rechazo mostrar la notificacion de prueba.',
        toastNotificationsFallback: 'Los recordatorios de Milo apareceran dentro de la app mientras siga abierta.',
        newsThemeNone: 'Ninguno',
        newsThemeMusic: 'Musica',
        newsThemePolitics: 'Politica',
        newsThemeEconomy: 'Economia',
        newsThemeArt: 'Deporte',
        chatEmpty: 'Todavia no hay conversacion',
        chatIdle: 'Escribe un mensaje o habla con Milo',
        chatListening: 'Te escucho...',
        chatThinking: 'Milo esta pensando...',
        chatPlaceholder: 'Escribe a Milo...',
        newChat: 'Nuevo chat',
        chatThreadsLabel: 'Chats',
        chatUntitledConversation: 'Nueva conversacion',
        chatRenameAction: 'Renombrar',
        chatDeleteAction: 'Eliminar',
        chatDeleteConfirm: 'Eliminar la conversacion "{title}"?',
        chatRenamePrompt: 'Nuevo nombre de la conversacion:',
        chatGreetingNamed: 'Hola {name}, que puedo hacer por ti hoy?',
        chatGreetingGuest: 'Hola invitado, que puedo hacer por ti hoy?',
        chatGreetingFallback: 'Hola, que puedo hacer por ti hoy?',
        planningDay: 'Dia',
        planningMonth: 'Mes',
        planningNewTask: '+ Nueva tarea',
        taskTitle: 'Titulo',
        taskDescription: 'Descripcion',
        taskTitlePlaceholder: 'Titulo de la tarea',
        taskDescriptionPlaceholder: 'Agregar una descripcion',
        taskPlaceholder: 'Toca una tarea para abrir sus detalles.',
        taskModalReadTitle: 'Detalle de la tarea',
        taskModalEditTitle: 'Editar tarea',
        taskModalEmptyDescription: 'No se ha agregado ninguna descripcion.',
        taskScheduledDate: 'Fecha de realizacion',
        taskCompletedDate: 'Fecha marcada',
        taskCompleteAria: 'Marcar la tarea como completada',
        taskUncompleteAria: 'Devolver la tarea a la agenda',
        taskModalClose: 'Cerrar',
        taskModalSave: 'Guardar',
        weekday1: 'Lun', weekday2: 'Mar', weekday3: 'Mie', weekday4: 'Jue', weekday5: 'Vie', weekday6: 'Sab', weekday7: 'Dom',
        createFolder: 'Crear carpeta',
        uploadDocument: 'Subir documento',
        documentsEmpty: 'Ningun documento o carpeta',
        settingsDev: 'Ajustes en desarrollo',
        avatarAlt: 'Foto de perfil',
        avatarPreviewAlt: 'Vista previa de la foto de perfil',
        panelChat: 'Milo',
        panelEducationChat: 'Milo Educacion',
        panelPlanning: 'Planificacion',
        panelDocuments: 'Documentos',
        panelSettings: 'Ajustes',
        toastLight: 'Modo claro activado',
        toastDark: 'Modo oscuro activado',
        toastProfileSaved: 'Perfil guardado',
        toastDailyNewsThemeSaved: 'Daily News ajustado a: {theme}',
        toastImportImage: 'Importa un archivo JPEG o PNG',
        toastSpeechUnavailable: 'El reconocimiento de voz no esta disponible.',
        chatUnknown: 'No he entendido.',
        errorServerPrefix: 'Error del servidor: ',
        reminderDefaultTitle: 'Recordatorio',
        reminderConfirm: 'De acuerdo, voy a anadir un recordatorio a las {time} para: {title}',
        voiceAddedMeta: 'Anadido por comando de voz',
        noTasksToday: 'No hay tareas para este dia. Anade una para colocarla en tu horario.',
        promptTaskTitle: 'Titulo de la tarea:',
        promptTaskTime: 'Hora (HH:mm):',
        promptTimeInvalid: 'Formato no valido. Usa HH:mm',
        untitledTask: 'Sin titulo'
      }
    };

const DAILY_NEWS_THEMES = ['economy', 'sport', 'politics', 'music'];

const dailyNewsCatalog = {
  music: {
    fr: [
      { title: 'Les concerts intimistes gagnent du terrain', sub: 'Les petites salles affichent complet grâce à des formats plus proches du public et à des sets plus courts.' },
      { title: 'Le streaming met les albums conceptuels en avant', sub: 'De plus en plus d\'artistes regroupent leurs sorties autour d\'un récit unique pour fidéliser leur audience.' },
      { title: 'Les bandes-son rétro reviennent dans les playlists', sub: 'Les titres inspirés des années 2000 progressent fortement dans les sélections quotidiennes.' }
    ],
    en: [
      { title: 'Intimate live shows keep gaining momentum', sub: 'Small venues are filling up with shorter sets and closer audience interaction.' },
      { title: 'Streaming boosts concept albums again', sub: 'More artists are grouping releases around a single narrative to build stronger loyalty.' },
      { title: 'Retro soundtracks are back in daily playlists', sub: 'Tracks inspired by the 2000s keep climbing in curated music selections.' }
    ],
    es: [
      { title: 'Los conciertos intimos siguen creciendo', sub: 'Las salas pequenas llenan gracias a formatos mas cercanos al publico y sets mas cortos.' },
      { title: 'El streaming impulsa de nuevo los albumes conceptuales', sub: 'Cada vez mas artistas agrupan sus lanzamientos en torno a una misma narrativa.' },
      { title: 'Las bandas sonoras retro vuelven a las playlists', sub: 'Las canciones inspiradas en los anos 2000 suben en las selecciones diarias.' }
    ]
  },
  politics: {
    fr: [
      { title: 'Les formats courts dominent la communication politique', sub: 'Les équipes de campagne privilégient des messages plus simples et très visuels sur mobile.' },
      { title: 'Les débats locaux reprennent de l\'importance', sub: 'Les sujets de proximité reviennent au premier plan dans de nombreuses villes.' },
      { title: 'La transparence budgétaire devient un thème central', sub: 'Les citoyens demandent davantage de lisibilité sur les dépenses publiques concrètes.' }
    ],
    en: [
      { title: 'Short-form content now drives political messaging', sub: 'Campaign teams are focusing on simpler, highly visual mobile-first communication.' },
      { title: 'Local debates are gaining weight again', sub: 'Community-level issues are returning to the center of many public discussions.' },
      { title: 'Budget transparency is becoming a central topic', sub: 'Citizens increasingly want clearer visibility into practical public spending.' }
    ],
    es: [
      { title: 'Los formatos cortos dominan la comunicacion politica', sub: 'Los equipos apuestan por mensajes mas simples y visuales pensados para movil.' },
      { title: 'Los debates locales recuperan importancia', sub: 'Los temas de proximidad vuelven al centro de muchas conversaciones publicas.' },
      { title: 'La transparencia presupuestaria gana peso', sub: 'La ciudadania pide una vision mas clara del gasto publico concreto.' }
    ]
  },
  economy: {
    fr: [
      { title: 'Les consommateurs arbitrent davantage leurs achats', sub: 'Les dépenses du quotidien se concentrent sur la valeur perçue et la durabilité.' },
      { title: 'Les petites entreprises automatisent plus vite', sub: 'Des outils simples aident désormais les indépendants à gagner du temps sans gros budget.' },
      { title: 'Le paiement fractionné continue de progresser', sub: 'Les enseignes l\'utilisent pour lisser les achats, surtout sur mobile.' }
    ],
    en: [
      { title: 'Consumers are making sharper trade-offs', sub: 'Daily spending is increasingly guided by perceived value and durability.' },
      { title: 'Small businesses are automating faster', sub: 'Lightweight tools now help independent workers save time without large budgets.' },
      { title: 'Installment payments keep expanding', sub: 'Retailers use them to smooth purchases, especially on mobile.' }
    ],
    es: [
      { title: 'Los consumidores ajustan mas sus compras', sub: 'El gasto diario se concentra en el valor percibido y la durabilidad.' },
      { title: 'Las pequenas empresas automatizan mas rapido', sub: 'Herramientas sencillas ayudan a ahorrar tiempo sin grandes presupuestos.' },
      { title: 'El pago fraccionado sigue creciendo', sub: 'Las marcas lo usan para facilitar compras, sobre todo en movil.' }
    ]
  },
  sport: {
    fr: [
      { title: 'Les sports d\'endurance attirent un public plus large', sub: 'Les courses locales et formats accessibles séduisent autant les débutants que les pratiquants réguliers.' },
      { title: 'Les clubs amateurs investissent davantage le numérique', sub: 'Réservations, suivis de performance et communication passent de plus en plus par des outils simples sur mobile.' },
      { title: 'Les événements multisports gagnent en visibilité', sub: 'Les formats mêlant plusieurs disciplines progressent grâce à leur dimension conviviale et familiale.' }
    ],
    en: [
      { title: 'Endurance sports are drawing wider audiences', sub: 'Local races and accessible formats are attracting both beginners and regular participants.' },
      { title: 'Amateur clubs are going more digital', sub: 'Bookings, performance tracking, and communication increasingly rely on simple mobile tools.' },
      { title: 'Multi-sport events are gaining visibility', sub: 'Formats mixing several disciplines are growing thanks to their social and family-friendly appeal.' }
    ],
    es: [
      { title: 'Los deportes de resistencia atraen a mas publico', sub: 'Las carreras locales y los formatos accesibles seducen tanto a principiantes como a practicantes habituales.' },
      { title: 'Los clubes amateurs se digitalizan mas', sub: 'Reservas, seguimiento del rendimiento y comunicacion pasan cada vez mas por herramientas moviles sencillas.' },
      { title: 'Los eventos multideporte ganan visibilidad', sub: 'Los formatos que mezclan varias disciplinas crecen por su aspecto social y familiar.' }
    ]
  }
};

function normalizeDailyNewsTheme(value) {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return DAILY_NEWS_THEMES.includes(normalizedValue) ? normalizedValue : 'economy';
}

function getDefaultPreferences() {
  return {
    dailyNewsTheme: 'economy'
  };
}

function loadPreferences() {
  const defaults = getDefaultPreferences();

  try {
    const rawPreferences = window.localStorage.getItem(preferencesStorageKey);
    if (!rawPreferences) return defaults;

    const parsedPreferences = JSON.parse(rawPreferences);
    return {
      ...defaults,
      ...parsedPreferences,
      dailyNewsTheme: normalizeDailyNewsTheme(parsedPreferences.dailyNewsTheme)
    };
  } catch {
    return defaults;
  }
}

function persistPreferences() {
  window.localStorage.setItem(preferencesStorageKey, JSON.stringify({
    dailyNewsTheme
  }));
}

function applyPreferences(preferences) {
  dailyNewsTheme = normalizeDailyNewsTheme(preferences?.dailyNewsTheme);
}

function getNewsThemeLabel(theme) {
  const themeKeyMap = {
    none: 'newsThemeNone',
    music: 'newsThemeMusic',
    politics: 'newsThemePolitics',
    economy: 'newsThemeEconomy',
    sport: 'newsThemeArt'
  };

  return t(themeKeyMap[normalizeDailyNewsTheme(theme)] || 'newsThemeNone');
}

function getDailyNewsThemeIndex(theme = dailyNewsTheme) {
  const normalizedTheme = normalizeDailyNewsTheme(theme);
  const currentIndex = DAILY_NEWS_THEMES.indexOf(normalizedTheme);
  return currentIndex >= 0 ? currentIndex : 0;
}

function getAdjacentDailyNewsTheme(direction = 1) {
  const currentIndex = getDailyNewsThemeIndex();
  const nextIndex = (currentIndex + direction + DAILY_NEWS_THEMES.length) % DAILY_NEWS_THEMES.length;
  return DAILY_NEWS_THEMES[nextIndex];
}

function animateDailyNewsSlide(direction = 1) {
  if (!homeDailyNewsList || typeof homeDailyNewsList.animate !== 'function') return;

  const offset = direction > 0 ? 28 : -28;
  homeDailyNewsList.animate([
    { transform: `translateX(${offset}px)`, opacity: 0.55 },
    { transform: 'translateX(0)', opacity: 1 }
  ], {
    duration: 220,
    easing: 'ease-out'
  });
}

function cycleDailyNewsTheme(direction = 1) {
  dailyNewsTheme = getAdjacentDailyNewsTheme(direction);
  persistPreferences();
  renderHomePage();
  animateDailyNewsSlide(direction);
}

function resetDailyNewsDragState(animateBack = true) {
  if (homeDailyNewsList) {
    if (animateBack) {
      homeDailyNewsList.style.transition = 'transform 180ms ease';
    }
    homeDailyNewsList.style.transform = '';
    if (animateBack) {
      window.setTimeout(() => {
        if (homeDailyNewsList) {
          homeDailyNewsList.style.transition = '';
        }
      }, 180);
    }
  }

  dailyNewsDragState = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    deltaX: 0,
    axis: null
  };
}

function handleDailyNewsPointerDown(event) {
  if (!homeDailyNewsList) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  dailyNewsDragState = {
    active: true,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    deltaX: 0,
    axis: null
  };

  if (typeof homeDailyNewsList.setPointerCapture === 'function') {
    homeDailyNewsList.setPointerCapture(event.pointerId);
  }
}

function handleDailyNewsPointerMove(event) {
  if (!homeDailyNewsList || !dailyNewsDragState.active || event.pointerId !== dailyNewsDragState.pointerId) return;

  const deltaX = event.clientX - dailyNewsDragState.startX;
  const deltaY = event.clientY - dailyNewsDragState.startY;

  if (!dailyNewsDragState.axis) {
    if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
    dailyNewsDragState.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
  }

  if (dailyNewsDragState.axis !== 'x') return;

  event.preventDefault();
  dailyNewsDragState.deltaX = deltaX;
  const clampedDeltaX = Math.max(-72, Math.min(72, deltaX));
  homeDailyNewsList.style.transition = 'none';
  homeDailyNewsList.style.transform = `translateX(${clampedDeltaX}px)`;
}

function handleDailyNewsPointerEnd(event) {
  if (!homeDailyNewsList || !dailyNewsDragState.active || event.pointerId !== dailyNewsDragState.pointerId) return;

  const shouldNavigate = dailyNewsDragState.axis === 'x' && Math.abs(dailyNewsDragState.deltaX) > 44;
  const direction = dailyNewsDragState.deltaX < 0 ? 1 : -1;

  resetDailyNewsDragState(true);

  if (shouldNavigate) {
    cycleDailyNewsTheme(direction);
  }
}

function getDailyNewsDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyNewsRequestKey(theme, language = currentLanguage) {
  return `${getDailyNewsDateKey()}::${normalizeDailyNewsTheme(theme)}::${normalizeAppLanguage(language)}`;
}

function getFallbackDailyNewsEntry(theme, language = currentLanguage) {
  const normalizedTheme = normalizeDailyNewsTheme(theme);
  if (normalizedTheme === 'none') return null;

  const localizedEntries = dailyNewsCatalog[normalizedTheme]?.[language]
    || dailyNewsCatalog[normalizedTheme]?.fr
    || [];

  if (!localizedEntries.length) return null;

  const now = new Date();
  const daySeed = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  return localizedEntries[daySeed % localizedEntries.length];
}

function normalizeDailyNewsServerEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const title = typeof entry.title === 'string' ? entry.title.trim().slice(0, 140) : '';
  const sub = typeof entry.sub === 'string' ? entry.sub.trim().slice(0, 320) : '';

  if (!title || !sub) return null;
  return { title, sub };
}

async function loadDailyNews({ force = false } = {}) {
  const normalizedTheme = normalizeDailyNewsTheme(dailyNewsTheme);
  const requestKey = getDailyNewsRequestKey(normalizedTheme, currentLanguage);

  if (normalizedTheme === 'none') {
    dailyNewsState = {
      cacheKey: requestKey,
      entry: null,
      status: 'idle',
      source: 'none'
    };
    renderHomePage();
    return;
  }

  if (!force && dailyNewsState.cacheKey === requestKey && ['loading', 'loaded'].includes(dailyNewsState.status)) {
    return;
  }

  dailyNewsState = {
    cacheKey: requestKey,
    entry: dailyNewsState.cacheKey === requestKey ? dailyNewsState.entry : null,
    status: 'loading',
    source: 'none'
  };
  renderHomePage();

  try {
    const response = await fetch(`${getApiUrl('/api/daily-news')}?theme=${encodeURIComponent(normalizedTheme)}&language=${encodeURIComponent(currentLanguage)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const entry = normalizeDailyNewsServerEntry(payload?.entry);
    if (!entry) {
      throw new Error('Missing daily news entry');
    }

    dailyNewsState = {
      cacheKey: requestKey,
      entry,
      status: 'loaded',
      source: 'remote'
    };
  } catch (error) {
    console.error('Daily news fetch error:', error);
    dailyNewsState = {
      cacheKey: requestKey,
      entry: getFallbackDailyNewsEntry(normalizedTheme, currentLanguage),
      status: 'loaded',
      source: 'error'
    };
  }

  renderHomePage();
}

function maybeRefreshDailyNews() {
  const normalizedTheme = normalizeDailyNewsTheme(dailyNewsTheme);
  if (normalizedTheme === 'none') return;

  const requestKey = getDailyNewsRequestKey(normalizedTheme, currentLanguage);
  if (dailyNewsState.cacheKey === requestKey && ['loading', 'loaded'].includes(dailyNewsState.status)) {
    return;
  }

  loadDailyNews();
}

function normalizeAppLanguage(value) {
  const normalizedValue = String(value || '').trim().toLowerCase();

  if (['en', 'english', 'anglais', 'ingles'].includes(normalizedValue)) {
    return 'en';
  }

  if (['es', 'espanol', 'español', 'spanish', 'espagnol'].includes(normalizedValue)) {
    return 'es';
  }

  return 'fr';
}

function getCurrentLocale() {
  if (currentLanguage === 'en') return 'en-US';
  if (currentLanguage === 'es') return 'es-ES';
  return 'fr-FR';
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
  document.documentElement.lang = currentLanguage;
  setText('home-daily-news-label', 'homeDailyNews');
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
  setText('progress-section-label', 'progressSection');
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
  setText('education-action-explain', 'educationActionExplain');
  setText('education-action-reformulate', 'educationActionReformulate');
  setText('education-action-sheet', 'educationActionSheet');
  setText('education-action-quiz', 'educationActionQuiz');
  setText('education-instructions-label', 'educationInstructionsLabel');
  setText('education-sheet-length-label', 'educationSheetLengthLabel');
  setText('education-quiz-count-label', 'educationQuizCountLabel');
  setText('education-quiz-history-label', 'educationQuizHistoryLabel');
  setText('education-sheet-option-short', 'educationSheetShort');
  setText('education-sheet-option-medium', 'educationSheetMedium');
  setText('education-sheet-option-long', 'educationSheetLong');
  setText('education-go-btn', 'educationGo');
  setText('education-download-latest-btn', 'educationDownloadLatest');
  if (educationFilesToggle) {
    educationFilesToggle.setAttribute('aria-label', t('educationFilesToggleLabel'));
    educationFilesToggle.setAttribute('title', t('educationFilesToggleLabel'));
  }
  if (educationQuizCloseBtn) {
    educationQuizCloseBtn.setAttribute('aria-label', t('educationQuizExit'));
    educationQuizCloseBtn.setAttribute('title', t('educationQuizExit'));
  }
  setText('education-dropzone-title', 'educationDropzoneTitle');
  setText('education-dropzone-help', 'educationDropzoneHelp');
  setText('education-clear-files-btn', 'educationClearFiles');
  setText('settings-menu-title', 'settingsTitle');
  setText('theme-label', 'settingsTheme');
  setText('settings-preferences-item', 'settingsPreferences');
  setText('access-kicker', 'accessKicker');
  setText('access-username-label', 'accessUsername');
  setText('access-password-label', 'accessPassword');
  setText('panel-new-chat-btn', 'newChat');
  setText('chat-threads-label', 'chatThreadsLabel');
  setText('chat-empty-initial', 'chatEmpty');
  setText('education-chat-empty', 'educationChatEmpty');
  setText('view-day-btn-panel', 'planningDay');
  setText('view-month-btn-panel', 'planningMonth');
  setText('btn-new-task', 'planningNewTask');
  setText('task-title-label', 'taskTitle');
  setText('task-description-label', 'taskDescription');
  setText('progress-task-title-label', 'taskTitle');
  setText('progress-task-description-label', 'taskDescription');
  setText('progress-task-scheduled-label', 'taskScheduledDate');
  setText('progress-task-completed-label', 'taskCompletedDate');
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
  setPlaceholder('education-instructions', 'educationInstructionsPlaceholder');
  setPlaceholder('profile-first-name', 'profileFirstName');
  setPlaceholder('profile-phone', 'profilePhone');
  document.querySelectorAll('.profile-avatar-image').forEach((image) => {
    image.alt = t('avatarAlt');
  });
  const avatarPreview = document.getElementById('profile-photo-preview');
  if (avatarPreview) avatarPreview.alt = t('avatarPreviewAlt');
  if (profilePhotoLightboxImage) profilePhotoLightboxImage.alt = t('avatarPreviewAlt');
  updateAccessScreenCopy();
  updateAccessModeUi();
  updateFloatingPrimaryButton();
  renderEducationComposerState();
  renderEducationQuizHistory();
  renderEducationQuizPage();
  setPanelState('idle');
  renderChatConversationList();
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
  renderProgressPage();
}

function applyLanguage(languageValue) {
  currentLanguage = normalizeAppLanguage(languageValue);
  applyTranslations();
}

function normalizeLocalAccessUsername(username = '') {
  return String(username || '').trim().replace(/\s+/g, ' ');
}

function getDefaultGuestProfile() {
  return {
    firstName: '',
    email: '',
    phone: '',
    language: currentLanguage,
    accountType: 'Guest',
    photo: ''
  };
}

function getRuntimeProfileData(options = {}) {
  if (accessState.mode === 'guest') {
    return getDefaultGuestProfile();
  }

  return collectProfileData(options);
}

function loadLocalAccessAccount() {
  try {
    const rawAccount = window.localStorage.getItem(localAccessAccountStorageKey);
    if (!rawAccount) return null;

    const parsedAccount = JSON.parse(rawAccount);
    if (!parsedAccount || typeof parsedAccount !== 'object') return null;

    const username = normalizeLocalAccessUsername(parsedAccount.username);
    const passwordHash = typeof parsedAccount.passwordHash === 'string' ? parsedAccount.passwordHash : '';
    const loginKey = typeof parsedAccount.loginKey === 'string'
      ? parsedAccount.loginKey
      : normalizeLocalAccessUsername(parsedAccount.username).toLowerCase();

    if (!username || !passwordHash || !loginKey) return null;

    return {
      username,
      loginKey,
      passwordHash,
      createdAt: typeof parsedAccount.createdAt === 'number' ? parsedAccount.createdAt : Date.now()
    };
  } catch {
    return null;
  }
}

function saveLocalAccessAccount(account) {
  window.localStorage.setItem(localAccessAccountStorageKey, JSON.stringify(account));
}

function loadLocalAccessSession() {
  try {
    const rawSession = window.localStorage.getItem(localAccessSessionStorageKey);
    if (!rawSession) return null;

    const parsedSession = JSON.parse(rawSession);
    if (!parsedSession || typeof parsedSession !== 'object') return null;

    if (parsedSession.mode === 'guest') {
      return { mode: 'guest' };
    }

    if (parsedSession.mode === 'account' && typeof parsedSession.username === 'string') {
      return {
        mode: 'account',
        username: normalizeLocalAccessUsername(parsedSession.username)
      };
    }

    return null;
  } catch {
    return null;
  }
}

function saveLocalAccessSession(session) {
  window.localStorage.setItem(localAccessSessionStorageKey, JSON.stringify(session));
}

function clearLocalAccessSession() {
  window.localStorage.removeItem(localAccessSessionStorageKey);
}

function hasLocalAccessAccount() {
  return Boolean(loadLocalAccessAccount());
}

function isGuestMode() {
  return accessState.mode === 'guest';
}

function isAccountMode() {
  return accessState.mode === 'account';
}

async function hashLocalAccessPassword(username, password) {
  const normalizedUsername = normalizeLocalAccessUsername(username).toLowerCase();
  const normalizedPassword = String(password || '');
  const payload = `milo-local-access::${normalizedUsername}::${normalizedPassword}`;
  const encoder = new TextEncoder();

  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', encoder.encode(payload));
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  return btoa(unescape(encodeURIComponent(payload)));
}

function resetConversationState() {
  chatHistory = [];
  educationChatHistory = [];
  renderChatHistory();
  renderEducationChatHistory();
}

function createChatConversationId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createChatSessionToken() {
  return `milo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneChatMessages(messages = []) {
  return messages
    .filter(message => message && typeof message === 'object')
    .map(message => ({
      role: message.role === 'user' ? 'user' : 'milo',
      text: typeof message.text === 'string' ? message.text : '',
      isGreeting: Boolean(message.isGreeting)
    }));
}

function createGreetingMessage() {
  return { role: 'milo', text: '', isGreeting: true };
}

function ensureConversationGreeting(messages = []) {
  const normalizedMessages = cloneChatMessages(messages);
  if (!normalizedMessages.some(message => message.isGreeting)) {
    normalizedMessages.unshift(createGreetingMessage());
  }
  return normalizedMessages;
}

function createChatConversation({
  id = createChatConversationId(),
  sessionId = createChatSessionToken(),
  title = '',
  customTitle = false,
  messages = [],
  createdAt = Date.now(),
  updatedAt = Date.now()
} = {}) {
  return {
    id,
    sessionId,
    title: typeof title === 'string' ? title : '',
    customTitle: Boolean(customTitle),
    messages: ensureConversationGreeting(messages),
    createdAt,
    updatedAt
  };
}

function normalizeChatConversation(rawConversation) {
  if (!rawConversation || typeof rawConversation !== 'object') return null;
  if (typeof rawConversation.id !== 'string' || !rawConversation.id.trim()) return null;

  return createChatConversation({
    id: rawConversation.id,
    sessionId: typeof rawConversation.sessionId === 'string' && rawConversation.sessionId.trim()
      ? rawConversation.sessionId
      : createChatSessionToken(),
    title: typeof rawConversation.title === 'string' ? rawConversation.title : '',
    customTitle: Boolean(rawConversation.customTitle),
    messages: Array.isArray(rawConversation.messages) ? rawConversation.messages : [],
    createdAt: typeof rawConversation.createdAt === 'number' ? rawConversation.createdAt : Date.now(),
    updatedAt: typeof rawConversation.updatedAt === 'number' ? rawConversation.updatedAt : Date.now()
  });
}

function saveChatConversationState() {
  window.localStorage.setItem(chatConversationsStorageKey, JSON.stringify(chatConversations));
  window.localStorage.setItem(activeChatConversationStorageKey, activeChatConversationId || '');
}

function loadChatConversationState() {
  try {
    const rawConversations = window.localStorage.getItem(chatConversationsStorageKey);
    const parsedConversations = rawConversations ? JSON.parse(rawConversations) : [];
    chatConversations = Array.isArray(parsedConversations)
      ? parsedConversations.map(normalizeChatConversation).filter(Boolean)
      : [];
  } catch {
    chatConversations = [];
  }

  activeChatConversationId = window.localStorage.getItem(activeChatConversationStorageKey) || '';
}

function getActiveChatConversation() {
  return chatConversations.find(conversation => conversation.id === activeChatConversationId) || null;
}

function getConversationLatestMessage(conversation) {
  if (!conversation) return null;
  for (let index = conversation.messages.length - 1; index >= 0; index -= 1) {
    const message = conversation.messages[index];
    if (!message?.isGreeting && (message?.text || '').trim()) {
      return message;
    }
  }
  return null;
}

function getConversationFirstUserMessage(conversation) {
  if (!conversation) return null;
  return conversation.messages.find(message => message?.role === 'user' && !message?.isGreeting && (message?.text || '').trim()) || null;
}

function truncateConversationText(text, maxLength = 46) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function getChatConversationTitle(conversation) {
  if (!conversation) return t('chatUntitledConversation');
  if (conversation.customTitle && conversation.title.trim()) {
    return conversation.title.trim();
  }

  const firstUserMessage = getConversationFirstUserMessage(conversation);
  if (firstUserMessage) {
    return truncateConversationText(firstUserMessage.text, 34);
  }

  return t('chatUntitledConversation');
}

function getChatConversationPreview(conversation) {
  const latestMessage = getConversationLatestMessage(conversation);
  if (latestMessage) {
    return truncateConversationText(latestMessage.text, 44);
  }
  return truncateConversationText(getChatGreetingMessage(), 44);
}

function formatChatConversationTimestamp(timestamp) {
  const value = typeof timestamp === 'number' ? timestamp : Date.now();
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString(getCurrentLocale(), { day: '2-digit', month: '2-digit' });
}

function renderChatConversationList() {
  if (!chatThreadListEl) return;

  if (chatConversations.length === 0) {
    chatThreadListEl.innerHTML = '';
    return;
  }

  const sortedConversations = [...chatConversations]
    .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));

  chatThreadListEl.innerHTML = sortedConversations.map((conversation) => {
    const title = getChatConversationTitle(conversation);
    const preview = getChatConversationPreview(conversation);
    const isActive = conversation.id === activeChatConversationId;

    return `
      <div class="milo-thread-card ${isActive ? 'active' : ''}">
        <button type="button" class="milo-thread-open" data-chat-conversation-id="${escapeHtml(conversation.id)}">
          <span class="milo-thread-title">${escapeHtml(title)}</span>
          <span class="milo-thread-preview">${escapeHtml(preview)}</span>
          <span class="milo-thread-meta">${escapeHtml(formatChatConversationTimestamp(conversation.updatedAt))}</span>
        </button>
        <div class="milo-thread-actions">
          <button type="button" class="milo-thread-action" data-chat-thread-action="rename" data-chat-thread-id="${escapeHtml(conversation.id)}" aria-label="${escapeHtml(t('chatRenameAction'))}" title="${escapeHtml(t('chatRenameAction'))}">✎</button>
          <button type="button" class="milo-thread-action delete" data-chat-thread-action="delete" data-chat-thread-id="${escapeHtml(conversation.id)}" aria-label="${escapeHtml(t('chatDeleteAction'))}" title="${escapeHtml(t('chatDeleteAction'))}">×</button>
        </div>
      </div>
    `;
  }).join('');
}

function syncActiveConversationMessages({ updateTimestamp = true } = {}) {
  const activeConversation = getActiveChatConversation();
  if (!activeConversation) return;

  activeConversation.messages = ensureConversationGreeting(chatHistory);
  if (updateTimestamp) {
    activeConversation.updatedAt = Date.now();
  }

  saveChatConversationState();
}

function activateChatConversation(conversationId) {
  const targetConversation = chatConversations.find(conversation => conversation.id === conversationId);
  if (!targetConversation) return;

  activeChatConversationId = targetConversation.id;
  chatHistory = ensureConversationGreeting(targetConversation.messages);
  targetConversation.messages = cloneChatMessages(chatHistory);
  saveChatConversationState();
  renderChatConversationList();
  renderChatHistory();
}

function isChatConversationEmpty(conversation) {
  return !conversation || !conversation.messages.some(message => !message?.isGreeting && (message?.text || '').trim());
}

function ensureActiveChatConversation() {
  let activeConversation = getActiveChatConversation();

  if (!activeConversation) {
    activeConversation = createChatConversation();
    chatConversations.unshift(activeConversation);
    activeChatConversationId = activeConversation.id;
    saveChatConversationState();
  }

  chatHistory = ensureConversationGreeting(activeConversation.messages);
  activeConversation.messages = cloneChatMessages(chatHistory);
  return activeConversation;
}

function initializeChatConversations() {
  loadChatConversationState();
  window.localStorage.removeItem(chatSessionStorageKey);

  if (chatConversations.length === 0) {
    const initialConversation = createChatConversation();
    chatConversations = [initialConversation];
    activeChatConversationId = initialConversation.id;
    saveChatConversationState();
  } else if (!chatConversations.some(conversation => conversation.id === activeChatConversationId)) {
    activeChatConversationId = chatConversations[0].id;
    saveChatConversationState();
  }

  ensureActiveChatConversation();
  renderChatConversationList();
}

function renameChatConversation(conversationId) {
  const conversation = chatConversations.find(entry => entry.id === conversationId);
  if (!conversation) return;

  const currentTitle = getChatConversationTitle(conversation);
  const nextTitle = window.prompt(t('chatRenamePrompt'), currentTitle);
  if (nextTitle === null) return;

  const normalizedTitle = nextTitle.trim();
  conversation.title = normalizedTitle;
  conversation.customTitle = Boolean(normalizedTitle);
  conversation.updatedAt = Date.now();
  saveChatConversationState();
  renderChatConversationList();
}

function deleteChatConversation(conversationId) {
  const conversation = chatConversations.find(entry => entry.id === conversationId);
  if (!conversation) return;

  const confirmed = window.confirm(t('chatDeleteConfirm', { title: getChatConversationTitle(conversation) }));
  if (!confirmed) return;

  chatConversations = chatConversations.filter(entry => entry.id !== conversationId);

  if (chatConversations.length === 0) {
    const replacementConversation = createChatConversation();
    chatConversations = [replacementConversation];
    activeChatConversationId = replacementConversation.id;
  } else if (activeChatConversationId === conversationId) {
    activeChatConversationId = chatConversations[0].id;
  }

  saveChatConversationState();
  ensureActiveChatConversation();
  renderChatConversationList();
  renderChatHistory();
}

function getChatDisplayName() {
  const profileFirstName = collectProfileData({ includePhoto: false }).firstName || '';
  if (profileFirstName) return profileFirstName;
  if (accessState.mode === 'account' && accessState.username) return accessState.username;
  return '';
}

function getChatGreetingMessage() {
  if (accessState.mode === 'guest') {
    return t('chatGreetingGuest');
  }

  const name = getChatDisplayName();
  if (name) {
    return t('chatGreetingNamed', { name });
  }
  return t('chatGreetingFallback');
}

function ensureChatGreeting() {
  chatHistory = ensureConversationGreeting(chatHistory);
  syncActiveConversationMessages({ updateTimestamp: false });
}

function startNewChatConversation(options = {}) {
  const { shouldFocus = true } = options;
  const activeConversation = getActiveChatConversation();

  if (isChatConversationEmpty(activeConversation)) {
    ensureActiveChatConversation();
    renderChatConversationList();
    renderChatHistory();
    if (shouldFocus) textInput?.focus();
    return;
  }

  const newConversation = createChatConversation();
  chatConversations.unshift(newConversation);
  activeChatConversationId = newConversation.id;
  chatHistory = cloneChatMessages(newConversation.messages);
  saveChatConversationState();
  renderChatConversationList();
  renderChatHistory();
  if (panelLabel) {
    panelLabel.textContent = t('chatIdle');
  }
  if (shouldFocus) textInput?.focus();
}

function updatePanelTopbarActions() {
  if (!panelNewChatBtn) return;
  panelNewChatBtn.classList.toggle('hidden', currentPanelSection !== 'chat');
}

function updateAccessScreenCopy() {
  const hasAccount = accessState.hasLocalAccount || hasLocalAccessAccount();

  if (accessBadge) accessBadge.textContent = t('accessBadge');
  if (accessTitle) accessTitle.textContent = t(hasAccount ? 'accessTitleLogin' : 'accessTitleCreate');
  if (accessCopy) accessCopy.textContent = t(hasAccount ? 'accessCopyLogin' : 'accessCopyCreate');
  if (accessUsernameLabel) accessUsernameLabel.textContent = t('accessUsername');
  if (accessPasswordLabel) accessPasswordLabel.textContent = t('accessPassword');
  if (accessUsernameInput) accessUsernameInput.placeholder = t(hasAccount ? 'accessUsernamePlaceholderLogin' : 'accessUsernamePlaceholderCreate');
  if (accessPasswordInput) accessPasswordInput.placeholder = t(hasAccount ? 'accessPasswordPlaceholderLogin' : 'accessPasswordPlaceholderCreate');
  if (accessPrimaryButton) accessPrimaryButton.textContent = t(hasAccount ? 'accessPrimaryLogin' : 'accessPrimaryCreate');
  if (accessGuestButton) accessGuestButton.textContent = t('accessGuest');
  if (accessFootnote) accessFootnote.textContent = t('accessFootnote');
  if (accessPasswordToggle) {
    const label = t(isAccessPasswordVisible ? 'accessPasswordHide' : 'accessPasswordShow');
    accessPasswordToggle.setAttribute('aria-label', label);
    accessPasswordToggle.setAttribute('title', label);
  }
  if (settingsLogoutItem) {
    settingsLogoutItem.textContent = isGuestMode() ? t('settingsExitGuest') : t('settingsLogout');
  }
}

function setAccessError(message = '') {
  if (!accessError) return;
  accessError.textContent = message;
}

function setAccessPasswordVisibility(visible) {
  isAccessPasswordVisible = Boolean(visible);
  if (accessPasswordInput) {
    accessPasswordInput.type = isAccessPasswordVisible ? 'text' : 'password';
  }

  if (accessPasswordToggleIcon) {
    accessPasswordToggleIcon.innerHTML = isAccessPasswordVisible
      ? '<path d="M3 3l18 18"/><path d="M10.58 10.58A2 2 0 0 0 12 16c3.27 0 6.06-1.94 8-4-1-1.37-2.15-2.57-3.48-3.45"/><path d="M6.23 6.23C4.4 7.42 3 9.08 2 12c1.94 2.06 4.73 4 10 4 1.12 0 2.16-.12 3.12-.35"/><path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5.27 0 8.06 1.94 10 4-1.02 1.09-2.17 2.06-3.46 2.84"/>'
      : '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>';
  }

  updateAccessScreenCopy();
}

function waitForUiDelay(delayMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

function shouldReduceMotion() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function updateAccessLaunchZoomTarget() {
  if (!accessLaunchOverlay || !accessLaunchWord || !accessLaunchPortal) return;

  const overlayRect = accessLaunchOverlay.getBoundingClientRect();
  const wordRect = accessLaunchWord.getBoundingClientRect();
  const portalRect = accessLaunchPortal.getBoundingClientRect();
  if (!overlayRect.width || !overlayRect.height || !wordRect.width || !wordRect.height || !portalRect.width || !portalRect.height) {
    return;
  }

  const portalCenterX = portalRect.left + (portalRect.width / 2);
  const portalCenterY = portalRect.top + (portalRect.height / 2);
  const originX = ((portalCenterX - wordRect.left) / wordRect.width) * 100;
  const originY = ((portalCenterY - wordRect.top) / wordRect.height) * 100;
  const overlayCenterX = overlayRect.left + (overlayRect.width / 2);
  const overlayCenterY = overlayRect.top + (overlayRect.height / 2);
  const panX = overlayCenterX - portalCenterX;
  const panY = (overlayCenterY - portalCenterY) + 10;

  accessLaunchWord.style.setProperty('--access-launch-origin-x', `${originX}%`);
  accessLaunchWord.style.setProperty('--access-launch-origin-y', `${originY}%`);
  accessLaunchWord.style.setProperty('--access-launch-pan-x', `${panX}px`);
  accessLaunchWord.style.setProperty('--access-launch-pan-y', `${panY}px`);
}

async function playAccessLaunchAnimation(onReveal) {
  if (typeof onReveal !== 'function') return;

  if (!accessLaunchOverlay || shouldReduceMotion() || isAccessLaunchAnimationRunning) {
    onReveal();
    return;
  }

  isAccessLaunchAnimationRunning = true;
  accessLaunchOverlay.classList.remove('pulse', 'spin', 'zoom', 'fade-out');
  accessLaunchOverlay.classList.add('open');
  void accessLaunchOverlay.offsetWidth;
  updateAccessLaunchZoomTarget();
  accessLaunchOverlay.classList.add('pulse');
  accessLaunchOverlay.classList.add('spin');

  try {
    await waitForUiDelay(1420);
    onReveal();
    accessLaunchOverlay.classList.remove('pulse');
    void accessLaunchOverlay.offsetWidth;
    accessLaunchOverlay.classList.add('zoom');
    await waitForUiDelay(1320);
    accessLaunchOverlay.classList.add('fade-out');
    await waitForUiDelay(220);
  } finally {
    accessLaunchOverlay.classList.remove('open', 'pulse', 'spin', 'zoom', 'fade-out');
    if (accessLaunchWord) {
      accessLaunchWord.style.removeProperty('--access-launch-origin-x');
      accessLaunchWord.style.removeProperty('--access-launch-origin-y');
      accessLaunchWord.style.removeProperty('--access-launch-pan-x');
      accessLaunchWord.style.removeProperty('--access-launch-pan-y');
    }
    isAccessLaunchAnimationRunning = false;
  }
}

async function enterAppFromAccessScreen() {
  await playAccessLaunchAnimation(() => {
    updateAccessModeUi();
    closeSettingsMenu();
    showHome();
  });
}

function updateAccessModeUi() {
  const isLocked = accessState.mode === 'locked';

  if (accessScreen) {
    accessScreen.classList.toggle('open', isLocked);
  }

  if (bottomNav) {
    bottomNav.style.display = isLocked ? 'none' : 'flex';
  }

  if (miloBtnWrap) {
    miloBtnWrap.style.display = isLocked ? 'none' : 'block';
  }

  if (settingsPreferencesItem) {
    settingsPreferencesItem.style.display = isAccountMode() ? 'block' : 'none';
  }

  if (settingsLogoutItem) {
    settingsLogoutItem.style.display = isLocked ? 'none' : 'block';
  }

  avatarPageTriggers.forEach((trigger) => {
    trigger.style.display = isAccountMode() ? 'flex' : 'none';
  });

  if (navPlanningItem) navPlanningItem.style.display = isGuestMode() ? 'none' : 'flex';
  if (navProgressItem) navProgressItem.style.display = isGuestMode() ? 'none' : 'flex';
  if (navHomeItem) navHomeItem.style.display = isLocked ? 'none' : 'flex';
  if (navEducationItem) navEducationItem.style.display = isLocked ? 'none' : 'flex';

  updateAccessScreenCopy();
}

function syncAccessStateFromStorage() {
  const account = loadLocalAccessAccount();
  const session = loadLocalAccessSession();

  accessState.hasLocalAccount = Boolean(account);
  accessState.username = '';
  accessState.mode = 'locked';

  if (session?.mode === 'guest') {
    accessState.mode = 'guest';
    return;
  }

  if (session?.mode === 'account' && account && session.username === account.username) {
    accessState.mode = 'account';
    accessState.username = account.username;
  }
}

async function activateAccountMode(username, { showToastMessage = true } = {}) {
  accessState.mode = 'account';
  accessState.username = normalizeLocalAccessUsername(username);
  accessState.hasLocalAccount = true;
  saveLocalAccessSession({ mode: 'account', username: accessState.username });
  setAccessError('');
  await enterAppFromAccessScreen();

  if (showToastMessage) {
    showToast(t('toastAccessLoggedIn'));
  }
}

async function activateGuestMode({ showToastMessage = true } = {}) {
  accessState.mode = 'guest';
  accessState.username = '';
  accessState.hasLocalAccount = hasLocalAccessAccount();
  saveLocalAccessSession({ mode: 'guest' });
  resetConversationState();
  setAccessError('');
  await enterAppFromAccessScreen();

  if (showToastMessage) {
    showToast(t('toastGuestModeEnabled'));
  }
}

function lockAccess() {
  clearLocalAccessSession();
  accessState.mode = 'locked';
  accessState.username = '';
  accessState.hasLocalAccount = hasLocalAccessAccount();
  closeSettingsMenu();
  closePanel();
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'none';
  resetConversationState();
  if (accessPasswordInput) accessPasswordInput.value = '';
  setAccessError('');
  setAccessPasswordVisibility(false);
  updateAccessModeUi();
}

async function submitLocalAccess() {
  const username = normalizeLocalAccessUsername(accessUsernameInput?.value);
  const password = accessPasswordInput?.value || '';
  setAccessError('');

  if (!username || !password) {
    showToast(t('toastAccessMissingCredentials'));
    return;
  }

  const existingAccount = loadLocalAccessAccount();

  if (!existingAccount) {
    const passwordHash = await hashLocalAccessPassword(username, password);
    saveLocalAccessAccount({
      username,
      loginKey: username.toLowerCase(),
      passwordHash,
      createdAt: Date.now()
    });

    const currentProfile = loadProfileData();
    if (!currentProfile.firstName || currentProfile.firstName === 'Maxim') {
      const nextProfile = {
        ...currentProfile,
        firstName: username,
        email: currentProfile.email === 'maxim@example.com' ? '' : currentProfile.email
      };
      applyProfileData(nextProfile);
      window.localStorage.setItem(profileStorageKey, JSON.stringify(nextProfile));
      savedProfileSnapshot = profileDataToSnapshot(nextProfile);
    }

    if (accessPasswordInput) accessPasswordInput.value = '';
    showToast(t('toastAccessCreated'));
    await activateAccountMode(username, { showToastMessage: false });
    return;
  }

  const passwordHash = await hashLocalAccessPassword(username, password);
  const matches = existingAccount.loginKey === username.toLowerCase() && existingAccount.passwordHash === passwordHash;

  if (!matches) {
    setAccessError(t('accessInlineInvalid'));
    showToast(t('toastAccessInvalid'));
    return;
  }

  if (accessPasswordInput) accessPasswordInput.value = '';
  await activateAccountMode(existingAccount.username);
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

if (homeDailyNewsList) {
  homeDailyNewsList.addEventListener('pointerdown', handleDailyNewsPointerDown);
  homeDailyNewsList.addEventListener('pointermove', handleDailyNewsPointerMove);
  homeDailyNewsList.addEventListener('pointerup', handleDailyNewsPointerEnd);
  homeDailyNewsList.addEventListener('pointercancel', handleDailyNewsPointerEnd);
  homeDailyNewsList.addEventListener('lostpointercapture', () => {
    if (dailyNewsDragState.active) {
      resetDailyNewsDragState(true);
    }
  });
}

// démarrer en sombre
applyTheme(false);

const initialPreferences = loadPreferences();
applyPreferences(initialPreferences);

const initialProfileData = loadProfileData();
applyProfileData(initialProfileData);
savedProfileSnapshot = profileDataToSnapshot(initialProfileData);
initializeProfileForm();
loadEducationState();
loadEducationQuizHistory();
loadPlanningState();
loadMonthlyPrimaryTasks();
applyLanguage(initialProfileData.language);
syncAccessStateFromStorage();
initializeChatConversations();
updateProfileSaveState();

if (accessState.mode === 'account' || accessState.mode === 'guest') {
  ensureActiveChatConversation();
}

if (accessState.mode === 'account' || accessState.mode === 'guest') {
  updateAccessModeUi();
  showHome();
} else {
  lockAccess();
}

avatarPageTriggers.forEach(trigger => {
  trigger.addEventListener('click', showPersonalInfo);
});

if (settingsPreferencesItem) {
  settingsPreferencesItem.addEventListener('click', () => {
    closeSettingsMenu();
    showPersonalInfo();
  });
}

if (settingsLogoutItem) {
  settingsLogoutItem.addEventListener('click', () => {
    lockAccess();
  });
}

if (accessPrimaryButton) {
  accessPrimaryButton.addEventListener('click', () => {
    submitLocalAccess();
  });
}

if (accessGuestButton) {
  accessGuestButton.addEventListener('click', () => {
    activateGuestMode();
  });
}

if (accessPasswordToggle) {
  accessPasswordToggle.addEventListener('click', () => {
    setAccessPasswordVisibility(!isAccessPasswordVisible);
  });
}

if (accessUsernameInput) {
  accessUsernameInput.addEventListener('input', () => {
    setAccessError('');
  });
}

if (accessPasswordInput) {
  accessPasswordInput.addEventListener('input', () => {
    setAccessError('');
  });
}

if (accessPasswordInput) {
  accessPasswordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitLocalAccess();
    }
  });
}

if (accessUsernameInput) {
  accessUsernameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitLocalAccess();
    }
  });
}

if (profilePhotoButton && profilePhotoInput) {
  profilePhotoButton.addEventListener('click', () => profilePhotoInput.click());
  profilePhotoInput.addEventListener('change', handleProfilePhotoChange);
}

if (profilePhotoRemoveButton) {
  profilePhotoRemoveButton.addEventListener('click', removeProfilePhoto);
}

if (profilePhotoPreview) {
  profilePhotoPreview.addEventListener('click', openProfilePhotoLightbox);
}

if (profilePhotoLightbox) {
  profilePhotoLightbox.addEventListener('click', (event) => {
    if (event.target === profilePhotoLightbox) {
      closeProfilePhotoLightbox();
    }
  });
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

if (educationInstructionsInput) {
  educationInstructionsInput.addEventListener('input', persistEducationState);
}

if (educationSheetLengthSelect) {
  educationSheetLengthSelect.addEventListener('change', (event) => {
    selectedEducationSheetLength = event.target.value;
    renderEducationComposerState();
    persistEducationState();
  });
}

if (educationQuizCountSelect) {
  educationQuizCountSelect.addEventListener('change', (event) => {
    selectedEducationQuizQuestionCount = Number(event.target.value);
    persistEducationState();
  });
}

educationActionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setEducationAction(button.dataset.educationAction);
  });
});

if (educationGoBtn) {
  educationGoBtn.addEventListener('click', runEducationTask);
}

if (educationDownloadLatestBtn) {
  educationDownloadLatestBtn.addEventListener('click', downloadLatestEducationResponsePdf);
}

if (educationQuizCloseBtn) {
  educationQuizCloseBtn.addEventListener('click', closeEducationQuizPage);
}

if (educationQuizHistoryList) {
  educationQuizHistoryList.addEventListener('pointerdown', handleEducationQuizHistoryPointerDown);
  educationQuizHistoryList.addEventListener('pointermove', handleEducationQuizHistoryPointerMove);
  educationQuizHistoryList.addEventListener('pointerup', handleEducationQuizHistoryPointerUp);
  educationQuizHistoryList.addEventListener('pointercancel', handleEducationQuizHistoryPointerCancel);
  educationQuizHistoryList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-education-quiz-id]');
    if (!deleteButton) return;
    event.stopPropagation();
    deleteEducationQuizHistoryEntry(deleteButton.dataset.deleteEducationQuizId);
  });
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
  const quizPageOption = event.target.closest('[data-education-quiz-page-option]');
  if (quizPageOption) {
    answerEducationQuizPage(quizPageOption.dataset.educationQuizPageOption || '');
    return;
  }

  const quizPageAction = event.target.closest('[data-education-quiz-page-action]');
  if (quizPageAction) {
    const action = quizPageAction.dataset.educationQuizPageAction || '';
    if (action === 'restart') {
      restartEducationQuizPage();
    } else if (action === 'regenerate') {
      requestEducationQuiz({ regenerate: true });
    }
    return;
  }

  const quizOptionButton = event.target.closest('[data-education-quiz-option]');
  if (quizOptionButton) {
    selectEducationQuizOption(
      Number(quizOptionButton.dataset.educationQuizMessageIndex),
      Number(quizOptionButton.dataset.educationQuizQuestionIndex),
      quizOptionButton.dataset.educationQuizOptionKey || ''
    );
    return;
  }

  const quizSubmitButton = event.target.closest('[data-education-quiz-submit]');
  if (quizSubmitButton) {
    submitEducationQuiz(Number(quizSubmitButton.dataset.educationQuizMessageIndex));
    return;
  }

  const quizResetButton = event.target.closest('[data-education-quiz-reset]');
  if (quizResetButton) {
    resetEducationQuiz(Number(quizResetButton.dataset.educationQuizMessageIndex));
    return;
  }

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
  if (accessState.mode === 'locked') return;
  closePanel();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 0));
  document.getElementById('home-page').style.display = 'block';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'none';
  if (miloBtnWrap) miloBtnWrap.style.display = 'block';
  updateFloatingPrimaryButton();
  renderHomePage();
}

function showEducation() {
  if (accessState.mode === 'locked') return;
  closePanel();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 2));
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'flex';
  document.getElementById('personal-info-page').style.display = 'none';
  if (miloBtnWrap) miloBtnWrap.style.display = 'block';
  updateFloatingPrimaryButton();
}

function showPersonalInfo() {
  if (isGuestMode()) {
    showToast(t('toastGuestProfileUnavailable'));
    return;
  }

  closePanel();
  closeSettingsMenu();
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'flex';
  if (miloBtnWrap) miloBtnWrap.style.display = 'none';
  updateFloatingPrimaryButton();
}

function showAvatarDevPage() {
  if (isGuestMode()) {
    showToast(t('toastGuestPlanningUnavailable'));
    return;
  }

  closePanel();
  closeSettingsMenu();
  document.querySelectorAll('.nav-item').forEach((n, i) => n.classList.toggle('active', i === 3));
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('education-page').style.display = 'none';
  document.getElementById('personal-info-page').style.display = 'none';
  document.getElementById('avatar-dev-page').style.display = 'flex';
  if (miloBtnWrap) miloBtnWrap.style.display = 'none';
  updateFloatingPrimaryButton();
  renderProgressPage();
}

function isEducationPageVisible() {
  const educationPage = document.getElementById('education-page');
  return Boolean(educationPage && educationPage.style.display !== 'none');
}

function updateFloatingPrimaryButton() {
  if (!miloBtn) return;

  const educationVisible = isEducationPageVisible();
  miloBtn.classList.toggle('education-go', educationVisible);

  if (miloBtnLabel) {
    miloBtnLabel.textContent = t('educationGo');
  }
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
  if (profilePhotoLightboxImage) {
    profilePhotoLightboxImage.src = src;
  }
}

function openProfilePhotoLightbox() {
  if (!profilePhotoLightbox || !profilePhotoLightboxImage) return;

  profilePhotoLightboxImage.src = currentProfilePhotoData || getDefaultAvatarData();
  profilePhotoLightbox.classList.add('open');
}

function closeProfilePhotoLightbox() {
  if (!profilePhotoLightbox) return;
  profilePhotoLightbox.classList.remove('open');
}

function getDefaultProfile() {
  return {
    firstName: 'Maxim',
    email: 'maxim@example.com',
    phone: '',
    language: 'fr',
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

    const parsedProfile = JSON.parse(rawProfile);
    return {
      ...defaults,
      ...parsedProfile,
      language: normalizeAppLanguage(parsedProfile.language || defaults.language)
    };
  } catch {
    return defaults;
  }
}

function applyProfileData(profile) {
  currentProfilePhotoData = profile.photo || '';
  if (profileFirstNameInput) profileFirstNameInput.value = profile.firstName || '';
  if (profileEmailInput) profileEmailInput.value = profile.email || '';
  if (profilePhoneInput) profilePhoneInput.value = profile.phone || '';
  if (profileLanguageSelect) profileLanguageSelect.value = normalizeAppLanguage(profile.language);
  if (profileAccountTypeSelect) profileAccountTypeSelect.value = profile.accountType || 'Personnel';
  updateAvatarImages(currentProfilePhotoData);
}

function collectProfileData(options = {}) {
  const { includePhoto = true } = options;

  return {
    firstName: profileFirstNameInput?.value.trim() || '',
    email: profileEmailInput?.value.trim() || '',
    phone: profilePhoneInput?.value.trim() || '',
    language: normalizeAppLanguage(profileLanguageSelect?.value),
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
  if (accessState.mode === 'locked') return;
  if (isGuestMode() && section === 'planning') {
    showToast(t('toastGuestPlanningUnavailable'));
    return;
  }

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
  updatePanelTopbarActions();
  
  // Milo et les vues outils occupent tout l'écran puis se referment par glissement.
  panel.classList.add('fullscreen');
  
  const sectionEl = document.getElementById('panel-' + section);
  if (sectionEl) {
    sectionEl.style.display = 'flex';
    if (section === 'planning') {
      renderPlanningPanel();
    } else if (section === 'chat') {
      ensureActiveChatConversation();
      renderChatConversationList();
      renderChatHistory();
    }
  }
  
  openPanel();

  if (section === 'planning') {
    scrollPlanningToSelectedEvent();
  }
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
  chatHistoryEl.innerHTML = chatHistory.map((msg) => {
    const text = msg?.isGreeting ? getChatGreetingMessage() : msg.text;
    const greetingClass = msg?.isGreeting ? ' greeting' : '';
    return `<div class="chat-bubble ${msg.role}${greetingClass}">${escapeHtml(text)}</div>`;
  }).join('');
  chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

function addMessageToHistory(role, text) {
  ensureActiveChatConversation();
  chatHistory.push({role, text});
  syncActiveConversationMessages();
  renderChatConversationList();
  renderChatHistory();
}

function handleChatThreadListClick(event) {
  const actionButton = event.target.closest('[data-chat-thread-action]');
  if (actionButton instanceof HTMLElement) {
    const conversationId = actionButton.dataset.chatThreadId || '';
    const action = actionButton.dataset.chatThreadAction || '';

    if (action === 'rename') {
      renameChatConversation(conversationId);
    } else if (action === 'delete') {
      deleteChatConversation(conversationId);
    }
    return;
  }

  const openButton = event.target.closest('[data-chat-conversation-id]');
  if (!(openButton instanceof HTMLElement)) return;

  const conversationId = openButton.dataset.chatConversationId || '';
  if (!conversationId) return;
  activateChatConversation(conversationId);
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

function getLatestEducationMiloMessageIndex() {
  for (let index = educationChatHistory.length - 1; index >= 0; index -= 1) {
    if (educationChatHistory[index]?.role === 'milo') {
      return index;
    }
  }

  return -1;
}

function parseEducationQuiz(text) {
  const normalizedText = stripEducationFormatting(text).replace(/\r\n/g, '\n').trim();
  if (!normalizedText || !/(?:^|\n)(?:ANSWER|R[EÉ]PONSE|RESPUESTA)\s*:/im.test(normalizedText)) {
    return null;
  }

  const questions = [];
  let currentQuestion = null;
  let currentField = '';

  const pushCurrentQuestion = () => {
    if (!currentQuestion) return;
    if (currentQuestion.prompt && currentQuestion.options.length >= 2 && currentQuestion.answerKey) {
      questions.push({
        prompt: currentQuestion.prompt.trim(),
        options: currentQuestion.options.map((option) => ({
          key: option.key,
          text: option.text.trim()
        })),
        answerKey: currentQuestion.answerKey,
        explanation: currentQuestion.explanation.trim()
      });
    }
    currentQuestion = null;
    currentField = '';
  };

  normalizedText.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      if (currentField === 'explanation') currentField = 'explanation';
      return;
    }

    const questionMatch = /^(?:Q(?:UESTION)?\s*\d+|\d+[\)\.:-])\s*(.+)$/i.exec(line);
    if (questionMatch) {
      pushCurrentQuestion();
      currentQuestion = {
        prompt: questionMatch[1].trim(),
        options: [],
        answerKey: '',
        explanation: ''
      };
      currentField = 'prompt';
      return;
    }

    if (!currentQuestion) {
      return;
    }

    const optionMatch = /^([A-D])[\)\.:-]\s*(.+)$/i.exec(line);
    if (optionMatch) {
      currentQuestion.options.push({
        key: optionMatch[1].toUpperCase(),
        text: optionMatch[2].trim()
      });
      currentField = 'option';
      return;
    }

    const answerMatch = /^(?:ANSWER|R[EÉ]PONSE|RESPUESTA)\s*[:\-]\s*([A-D])\b/i.exec(line);
    if (answerMatch) {
      currentQuestion.answerKey = answerMatch[1].toUpperCase();
      currentField = 'answer';
      return;
    }

    const explanationMatch = /^(?:EXPLANATION|EXPLICATION|EXPLICACION)\s*[:\-]\s*(.+)$/i.exec(line);
    if (explanationMatch) {
      currentQuestion.explanation = explanationMatch[1].trim();
      currentField = 'explanation';
      return;
    }

    if (currentField === 'prompt') {
      currentQuestion.prompt = `${currentQuestion.prompt} ${line}`.trim();
    } else if (currentField === 'option' && currentQuestion.options.length > 0) {
      const lastOption = currentQuestion.options[currentQuestion.options.length - 1];
      lastOption.text = `${lastOption.text} ${line}`.trim();
    } else if (currentField === 'explanation') {
      currentQuestion.explanation = `${currentQuestion.explanation} ${line}`.trim();
    }
  });

  pushCurrentQuestion();

  return questions.length ? { questions } : null;
}

function openEducationQuizPage() {
  educationQuizPageState.open = true;
  if (educationQuizPage) {
    educationQuizPage.classList.add('open');
    educationQuizPage.setAttribute('aria-hidden', 'false');
  }
  renderEducationQuizPage();
}

function closeEducationQuizPage() {
  educationQuizPageState.open = false;
  if (educationQuizPage) {
    educationQuizPage.classList.remove('open');
    educationQuizPage.setAttribute('aria-hidden', 'true');
  }
}

function resetEducationQuizPageState() {
  educationQuizPageState = {
    open: false,
    loading: false,
    error: '',
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
    feedback: null,
    completed: false,
    lastPrompt: '',
    historySaved: false,
    historyTitle: ''
  };
}

function loadEducationQuizHistory() {
  try {
    const rawHistory = window.localStorage.getItem(educationQuizHistoryStorageKey);
    const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
    educationQuizHistory = Array.isArray(parsedHistory) ? parsedHistory.filter(Boolean) : [];
  } catch {
    educationQuizHistory = [];
  }
}

function persistEducationQuizHistory() {
  window.localStorage.setItem(educationQuizHistoryStorageKey, JSON.stringify(educationQuizHistory));
}

function cleanEducationQuizHistoryTitle(title, maxLength = 72) {
  const normalizedTitle = String(title || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s:;,.!?-]+|[\s:;,.!?-]+$/g, '')
    .trim();

  if (!normalizedTitle) return '';
  if (normalizedTitle.length <= maxLength) return normalizedTitle;

  const truncatedTitle = normalizedTitle.slice(0, maxLength + 1);
  const lastSpaceIndex = truncatedTitle.lastIndexOf(' ');
  const safeTitle = lastSpaceIndex >= Math.floor(maxLength * 0.6)
    ? truncatedTitle.slice(0, lastSpaceIndex)
    : truncatedTitle.slice(0, maxLength);

  return `${safeTitle.trim()}…`;
}

function getEducationQuizHistoryTitle() {
  const selectedDocument = educationDocuments.find((document) => document.id === selectedEducationDocumentId);
  if (selectedDocument?.name) {
    return cleanEducationQuizHistoryTitle(selectedDocument.name.replace(/\.[a-z0-9]+$/i, ''));
  }

  const sourceText = (educationSourceTextArea?.value || '').trim();
  if (sourceText) {
    const normalizedSourceText = sourceText
      .replace(/\s+/g, ' ')
      .replace(/^[-*•\d.)\s]+/, '')
      .trim();
    const titleCandidates = normalizedSourceText
      .split(/(?<=[.!?])\s+|\s[:;-]\s+/)
      .map((segment) => cleanEducationQuizHistoryTitle(segment, 72))
      .filter(Boolean);
    const bestCandidate = titleCandidates.find((segment) => segment.length >= 24) || titleCandidates[0] || normalizedSourceText;
    return cleanEducationQuizHistoryTitle(bestCandidate, 72);
  }

  return t('educationQuizTitle');
}

function resetEducationQuizHistorySwipeState() {
  if (educationQuizHistorySwipeState.captureTarget?.releasePointerCapture && educationQuizHistorySwipeState.pointerId !== null) {
    try {
      educationQuizHistorySwipeState.captureTarget.releasePointerCapture(educationQuizHistorySwipeState.pointerId);
    } catch {}
  }

  educationQuizHistorySwipeState.pointerId = null;
  educationQuizHistorySwipeState.captureTarget = null;
  educationQuizHistorySwipeState.startX = 0;
  educationQuizHistorySwipeState.deltaX = 0;
  educationQuizHistorySwipeState.startOffset = 0;
  educationQuizHistorySwipeState.currentOffset = 0;
  educationQuizHistorySwipeState.activeEntryId = '';
  educationQuizHistorySwipeState.dragging = false;
}

function setEducationQuizHistoryReveal(entryId, revealRatio) {
  const itemElement = educationQuizHistoryList?.querySelector(`[data-quiz-history-id="${entryId}"]`);
  if (!itemElement) return;

  const clampedRatio = Math.max(0, Math.min(1, revealRatio));
  const maxOffset = 92;
  itemElement.style.setProperty('--swipe-offset', `${clampedRatio * maxOffset}px`);
  itemElement.style.setProperty('--actions-offset', `${maxOffset - (clampedRatio * maxOffset)}px`);
  itemElement.style.setProperty('--actions-opacity', `${clampedRatio}`);
}

function deleteEducationQuizHistoryEntry(entryId) {
  educationQuizHistory = educationQuizHistory.filter((entry) => entry.id !== entryId);
  if (educationQuizHistorySwipeState.swipedEntryId === entryId) {
    educationQuizHistorySwipeState.swipedEntryId = '';
  }
  persistEducationQuizHistory();
  renderEducationQuizHistory();
}

function handleEducationQuizHistoryPointerDown(event) {
  const trigger = event.target.closest('.education-quiz-history-card');
  if (!trigger) return;

  const itemElement = trigger.closest('.education-quiz-history-item');
  if (!itemElement?.dataset.quizHistoryId) return;

  educationQuizHistorySwipeState.pointerId = event.pointerId;
  educationQuizHistorySwipeState.captureTarget = itemElement;
  educationQuizHistorySwipeState.startX = event.clientX;
  educationQuizHistorySwipeState.deltaX = 0;
  educationQuizHistorySwipeState.activeEntryId = itemElement.dataset.quizHistoryId;
  educationQuizHistorySwipeState.dragging = false;
  educationQuizHistorySwipeState.startOffset = educationQuizHistorySwipeState.swipedEntryId === itemElement.dataset.quizHistoryId ? 92 : 0;
  educationQuizHistorySwipeState.currentOffset = educationQuizHistorySwipeState.startOffset;

  if (typeof itemElement.setPointerCapture === 'function') {
    itemElement.setPointerCapture(event.pointerId);
  }
}

function handleEducationQuizHistoryPointerMove(event) {
  if (educationQuizHistorySwipeState.pointerId !== event.pointerId || !educationQuizHistorySwipeState.activeEntryId) return;

  const deltaX = event.clientX - educationQuizHistorySwipeState.startX;
  educationQuizHistorySwipeState.deltaX = deltaX;
  if (Math.abs(deltaX) > 12) {
    educationQuizHistorySwipeState.dragging = true;
  }

  const maxOffset = 92;
  const currentOffset = Math.max(0, Math.min(maxOffset, educationQuizHistorySwipeState.startOffset - deltaX));
  educationQuizHistorySwipeState.currentOffset = currentOffset;
  setEducationQuizHistoryReveal(educationQuizHistorySwipeState.activeEntryId, currentOffset / maxOffset);
}

function handleEducationQuizHistoryPointerUp(event) {
  if (educationQuizHistorySwipeState.pointerId !== event.pointerId || !educationQuizHistorySwipeState.activeEntryId) return;

  const targetEntryId = educationQuizHistorySwipeState.activeEntryId;
  const shouldReveal = educationQuizHistorySwipeState.currentOffset > 44;
  const wasDragging = educationQuizHistorySwipeState.dragging;

  if (shouldReveal) {
    educationQuizHistorySwipeState.swipedEntryId = targetEntryId;
    renderEducationQuizHistory();
  } else if (!wasDragging && educationQuizHistorySwipeState.swipedEntryId && educationQuizHistorySwipeState.swipedEntryId !== targetEntryId) {
    educationQuizHistorySwipeState.swipedEntryId = '';
    renderEducationQuizHistory();
  } else if (educationQuizHistorySwipeState.swipedEntryId === targetEntryId) {
    educationQuizHistorySwipeState.swipedEntryId = '';
    renderEducationQuizHistory();
  } else {
    setEducationQuizHistoryReveal(targetEntryId, 0);
  }

  resetEducationQuizHistorySwipeState();
}

function handleEducationQuizHistoryPointerCancel() {
  if (educationQuizHistorySwipeState.activeEntryId) {
    if (educationQuizHistorySwipeState.swipedEntryId === educationQuizHistorySwipeState.activeEntryId) {
      setEducationQuizHistoryReveal(educationQuizHistorySwipeState.activeEntryId, 1);
    } else {
      setEducationQuizHistoryReveal(educationQuizHistorySwipeState.activeEntryId, 0);
    }
  }

  resetEducationQuizHistorySwipeState();
}

function renderEducationQuizHistory() {
  if (!educationQuizHistoryList || !educationQuizHistoryLabel) return;

  const isVisible = selectedEducationAction === 'quiz';
  educationQuizHistoryLabel.style.display = isVisible ? 'block' : 'none';
  educationQuizHistoryList.style.display = isVisible ? 'flex' : 'none';
  if (!isVisible) {
    educationQuizHistorySwipeState.swipedEntryId = '';
    return;
  }

  if (!educationQuizHistory.length) {
    educationQuizHistorySwipeState.swipedEntryId = '';
    educationQuizHistoryList.innerHTML = `<div class="education-quiz-history-empty">${escapeHtml(t('educationQuizHistoryEmpty'))}</div>`;
    return;
  }

  educationQuizHistoryList.innerHTML = educationQuizHistory.map((entry) => {
    const formattedDate = new Intl.DateTimeFormat(getCurrentLocale(), {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(entry.completedAt));
    const isSwiped = educationQuizHistorySwipeState.swipedEntryId === entry.id ? 'swiped' : '';
    const swipeOffset = isSwiped ? '92px' : '0px';
    const actionsOffset = isSwiped ? '0px' : '92px';
    const actionsOpacity = isSwiped ? '1' : '0';

    return `
      <div class="education-quiz-history-item ${isSwiped}" data-quiz-history-id="${escapeHtml(entry.id)}" style="--swipe-offset: ${swipeOffset}; --actions-offset: ${actionsOffset}; --actions-opacity: ${actionsOpacity};">
        <div class="education-quiz-history-track">
          <div class="education-quiz-history-actions">
            <button type="button" class="education-quiz-history-action delete" data-delete-education-quiz-id="${escapeHtml(entry.id)}" aria-label="${escapeHtml(t('chatDeleteAction'))}" title="${escapeHtml(t('chatDeleteAction'))}">
              <svg class="education-quiz-history-action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z" fill="currentColor"></path>
                <path d="M7 9h10l-.8 10.2A2 2 0 0 1 14.21 21H9.79a2 2 0 0 1-1.99-1.8L7 9Z" fill="currentColor" opacity="0.92"></path>
              </svg>
            </button>
          </div>
          <div class="education-quiz-history-card">
            <div class="education-quiz-history-top">
              <div class="education-quiz-history-title">${escapeHtml(entry.title || t('educationQuizTitle'))}</div>
              <div class="education-quiz-history-score">${escapeHtml(t('educationQuizScore', { score: String(entry.score), total: String(entry.total) }))}</div>
            </div>
            <div class="education-quiz-history-meta">${escapeHtml(t('educationQuizHistoryMeta', { count: String(entry.total), date: formattedDate }))}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function saveCompletedEducationQuizToHistory() {
  if (educationQuizPageState.historySaved || !educationQuizPageState.questions.length) return;

  educationQuizHistory.unshift({
    id: `edu-quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: educationQuizPageState.historyTitle || getEducationQuizHistoryTitle(),
    score: educationQuizPageState.score,
    total: educationQuizPageState.questions.length,
    completedAt: Date.now()
  });
  educationQuizHistory = educationQuizHistory.slice(0, 20);
  educationQuizPageState.historySaved = true;
  persistEducationQuizHistory();
  renderEducationQuizHistory();
}

function restartEducationQuizPage() {
  if (!educationQuizPageState.questions.length) return;
  educationQuizPageState.currentQuestionIndex = 0;
  educationQuizPageState.score = 0;
  educationQuizPageState.answers = Array.from({ length: educationQuizPageState.questions.length }, () => null);
  educationQuizPageState.feedback = null;
  educationQuizPageState.completed = false;
  educationQuizPageState.historySaved = false;
  renderEducationQuizPage();
}

function renderEducationQuizPage() {
  if (!educationQuizPageBody || !educationQuizPageActions || !educationQuizPageProgress || !educationQuizPageKicker) return;

  educationQuizPageKicker.textContent = t('educationQuizTitle');

  if (!educationQuizPageState.open) {
    educationQuizPageBody.innerHTML = '';
    educationQuizPageActions.innerHTML = '';
    educationQuizPageProgress.textContent = '';
    return;
  }

  if (educationQuizPageState.loading) {
    educationQuizPageProgress.textContent = '';
    educationQuizPageBody.innerHTML = `
      <div class="education-quiz-stage loading">
        <div class="education-quiz-stage-label">${escapeHtml(t('educationQuizTitle'))}</div>
        <div class="education-quiz-stage-question">${escapeHtml(t('educationQuizLoading'))}</div>
      </div>
    `;
    educationQuizPageActions.innerHTML = '';
    return;
  }

  if (educationQuizPageState.error) {
    educationQuizPageProgress.textContent = '';
    educationQuizPageBody.innerHTML = `
      <div class="education-quiz-stage error">
        <div class="education-quiz-stage-label">${escapeHtml(t('educationQuizTitle'))}</div>
        <div class="education-quiz-stage-question">${escapeHtml(t('errorServerPrefix') + educationQuizPageState.error)}</div>
      </div>
    `;
    educationQuizPageActions.innerHTML = `
      <button type="button" class="education-quiz-page-action primary" data-education-quiz-page-action="regenerate">${escapeHtml(t('educationQuizRegenerate'))}</button>
    `;
    return;
  }

  const totalQuestions = educationQuizPageState.questions.length;
  if (!totalQuestions) {
    educationQuizPageProgress.textContent = '';
    educationQuizPageBody.innerHTML = `
      <div class="education-quiz-stage error">
        <div class="education-quiz-stage-question">${escapeHtml(t('chatUnknown'))}</div>
      </div>
    `;
    educationQuizPageActions.innerHTML = `
      <button type="button" class="education-quiz-page-action primary" data-education-quiz-page-action="regenerate">${escapeHtml(t('educationQuizRegenerate'))}</button>
    `;
    return;
  }

  if (educationQuizPageState.completed) {
    educationQuizPageProgress.textContent = escapeHtml(t('educationQuizCompleted'));
    educationQuizPageBody.innerHTML = `
      <div class="education-quiz-stage summary">
        <div class="education-quiz-stage-label">${escapeHtml(t('educationQuizCompleted'))}</div>
        <div class="education-quiz-stage-question">${escapeHtml(t('educationQuizScore', { score: String(educationQuizPageState.score), total: String(totalQuestions) }))}</div>
      </div>
    `;
    educationQuizPageActions.innerHTML = `
      <button type="button" class="education-quiz-page-action secondary" data-education-quiz-page-action="restart">${escapeHtml(t('educationQuizRestartSame'))}</button>
      <button type="button" class="education-quiz-page-action primary" data-education-quiz-page-action="regenerate">${escapeHtml(t('educationQuizRegenerate'))}</button>
    `;
    return;
  }

  const currentIndex = educationQuizPageState.currentQuestionIndex;
  const currentQuestion = educationQuizPageState.questions[currentIndex];
  const feedback = educationQuizPageState.feedback;

  educationQuizPageProgress.textContent = t('educationQuizProgress', {
    current: String(currentIndex + 1),
    total: String(totalQuestions)
  });

  const optionsMarkup = currentQuestion.options.map((option) => {
    const optionClasses = ['education-quiz-page-option'];
    if (feedback) {
      if (option.key === feedback.correctKey) optionClasses.push('correct');
      else if (option.key === feedback.selectedKey && !feedback.isCorrect) optionClasses.push('incorrect');
    }

    return `
      <button type="button" class="${optionClasses.join(' ')}" data-education-quiz-page-option="${escapeHtml(option.key)}" ${feedback ? 'disabled' : ''}>
        <span class="education-quiz-page-option-key">${escapeHtml(option.key)}</span>
        <span class="education-quiz-page-option-text">${escapeHtml(option.text)}</span>
      </button>
    `;
  }).join('');

  educationQuizPageBody.innerHTML = `
    <div class="education-quiz-stage">
      <div class="education-quiz-stage-label">${escapeHtml(t('educationQuizQuestion', { number: String(currentIndex + 1) }))}</div>
      <div class="education-quiz-stage-question">${escapeHtml(currentQuestion.prompt)}</div>
      <div class="education-quiz-page-options">${optionsMarkup}</div>
      <div class="education-quiz-page-feedback ${feedback ? (feedback.isCorrect ? 'correct' : 'incorrect') : ''}">${feedback ? escapeHtml(feedback.isCorrect ? t('educationQuizCorrect') : t('educationQuizIncorrect')) : ''}</div>
    </div>
  `;
  educationQuizPageActions.innerHTML = `
    <button type="button" class="education-quiz-page-action secondary" data-education-quiz-page-action="restart">${escapeHtml(t('educationQuizRestartSame'))}</button>
    <button type="button" class="education-quiz-page-action primary" data-education-quiz-page-action="regenerate">${escapeHtml(t('educationQuizRegenerate'))}</button>
  `;
}

function advanceEducationQuizPage() {
  if (educationQuizPageState.currentQuestionIndex >= educationQuizPageState.questions.length - 1) {
    educationQuizPageState.completed = true;
    saveCompletedEducationQuizToHistory();
  } else {
    educationQuizPageState.currentQuestionIndex += 1;
  }
  educationQuizPageState.feedback = null;
  renderEducationQuizPage();
}

function answerEducationQuizPage(optionKey) {
  if (!educationQuizPageState.open || educationQuizPageState.loading || educationQuizPageState.completed || educationQuizPageState.feedback) return;

  const currentQuestion = educationQuizPageState.questions[educationQuizPageState.currentQuestionIndex];
  if (!currentQuestion) return;

  const isCorrect = optionKey === currentQuestion.answerKey;
  educationQuizPageState.answers[educationQuizPageState.currentQuestionIndex] = optionKey;
  if (isCorrect) {
    educationQuizPageState.score += 1;
  }
  educationQuizPageState.feedback = {
    selectedKey: optionKey,
    correctKey: currentQuestion.answerKey,
    isCorrect
  };
  renderEducationQuizPage();

  window.setTimeout(() => {
    advanceEducationQuizPage();
  }, 720);
}

async function requestEducationQuiz({ regenerate = false } = {}) {
  if (isEducationAgentRequestPending) {
    showToast(t('educationChatThinking'));
    return;
  }

  const studyContext = getEducationStudyContext();
  if (!studyContext.pastedText && !studyContext.documents.length) {
    showToast(t('educationNoSource'));
    return;
  }

  const questionCount = Number(educationQuizCountSelect?.value || selectedEducationQuizQuestionCount || 0);
  if (!Number.isFinite(questionCount) || questionCount <= 0) {
    showToast(t('educationQuizInvalidCount'));
    return;
  }

  selectedEducationQuizQuestionCount = questionCount;
  persistEducationState();

  const prompt = getEducationTaskPrompt();
  if (!prompt) return;

  educationQuizPageState.loading = true;
  educationQuizPageState.error = '';
  educationQuizPageState.questions = [];
  educationQuizPageState.currentQuestionIndex = 0;
  educationQuizPageState.score = 0;
  educationQuizPageState.answers = [];
  educationQuizPageState.feedback = null;
  educationQuizPageState.completed = false;
  educationQuizPageState.lastPrompt = prompt;
  educationQuizPageState.historySaved = false;
  educationQuizPageState.historyTitle = getEducationQuizHistoryTitle();
  openEducationQuizPage();
  setEducationAgentRequestPending(true);

  try {
    const res = await fetch(getApiUrl('/api/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getEducationAgentRequestPayload(prompt))
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.reply || `${res.status} ${res.statusText}`.trim());
    }

    const reply = data.reply || t('chatUnknown');
    const quizData = parseEducationQuiz(reply);
    if (!quizData || !quizData.questions.length) {
      throw new Error(t('chatUnknown'));
    }

    const questions = quizData.questions.slice(0, questionCount);
    educationQuizPageState.loading = false;
    educationQuizPageState.questions = questions;
    educationQuizPageState.currentQuestionIndex = 0;
    educationQuizPageState.score = 0;
    educationQuizPageState.answers = Array.from({ length: questions.length }, () => null);
    educationQuizPageState.feedback = null;
    educationQuizPageState.completed = false;

    renderEducationQuizPage();
  } catch (error) {
    console.error('Education quiz generation error:', error);
    educationQuizPageState.loading = false;
    educationQuizPageState.error = error.message || t('chatUnknown');
    renderEducationQuizPage();
  } finally {
    setEducationAgentRequestPending(false);
    if (educationPanelLabel) educationPanelLabel.textContent = t('educationChatIdle');
  }
}

function getEducationQuizState(messageIndex, quizData) {
  const expectedQuestions = quizData?.questions?.length || 0;
  const currentState = educationQuizUiState[messageIndex];

  if (!currentState || currentState.selectedAnswers.length !== expectedQuestions) {
    educationQuizUiState[messageIndex] = {
      selectedAnswers: Array.from({ length: expectedQuestions }, () => ''),
      submitted: false
    };
  }

  return educationQuizUiState[messageIndex];
}

function getEducationQuizScore(quizData, quizState) {
  return quizData.questions.reduce((score, question, index) => {
    return score + (quizState.selectedAnswers[index] === question.answerKey ? 1 : 0);
  }, 0);
}

function renderEducationQuizMessage(quizData, messageIndex) {
  const quizState = getEducationQuizState(messageIndex, quizData);
  const score = quizState.submitted ? getEducationQuizScore(quizData, quizState) : 0;

  const questionsMarkup = quizData.questions.map((question, questionIndex) => {
    const selectedAnswer = quizState.selectedAnswers[questionIndex] || '';
    const isCorrect = quizState.submitted && selectedAnswer === question.answerKey;
    const isIncorrect = quizState.submitted && selectedAnswer && selectedAnswer !== question.answerKey;

    const optionsMarkup = question.options.map((option) => {
      const selected = selectedAnswer === option.key;
      const revealCorrect = quizState.submitted && option.key === question.answerKey;
      const revealIncorrect = quizState.submitted && selected && option.key !== question.answerKey;
      const optionClasses = [
        'education-quiz-option',
        selected ? 'selected' : '',
        revealCorrect ? 'correct' : '',
        revealIncorrect ? 'incorrect' : ''
      ].filter(Boolean).join(' ');

      return `
        <button
          type="button"
          class="${optionClasses}"
          data-education-quiz-option="true"
          data-education-quiz-message-index="${messageIndex}"
          data-education-quiz-question-index="${questionIndex}"
          data-education-quiz-option-key="${escapeHtml(option.key)}"
          ${quizState.submitted ? 'disabled' : ''}
        >
          <span class="education-quiz-option-key">${escapeHtml(option.key)}</span>
          <span class="education-quiz-option-text">${escapeHtml(option.text)}</span>
        </button>
      `;
    }).join('');

    return `
      <section class="education-quiz-question-card ${quizState.submitted ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}">
        <div class="education-quiz-question-label">${escapeHtml(t('educationQuizQuestion', { number: String(questionIndex + 1) }))}</div>
        <div class="education-quiz-question-text">${escapeHtml(question.prompt)}</div>
        <div class="education-quiz-options">${optionsMarkup}</div>
        ${quizState.submitted ? `
          <div class="education-quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}">${escapeHtml(isCorrect ? t('educationQuizCorrect') : t('educationQuizIncorrect'))}</div>
          <div class="education-quiz-explanation">${escapeHtml(question.explanation || '')}</div>
        ` : ''}
      </section>
    `;
  }).join('');

  return `
    <div class="education-quiz-card">
      <div class="education-quiz-head">
        <div class="education-quiz-title">${escapeHtml(t('educationQuizTitle'))}</div>
        ${quizState.submitted ? `<div class="education-quiz-score">${escapeHtml(t('educationQuizScore', { score: String(score), total: String(quizData.questions.length) }))}</div>` : ''}
      </div>
      <div class="education-quiz-body">${questionsMarkup}</div>
      <div class="education-quiz-actions">
        ${quizState.submitted
          ? `<button type="button" class="education-quiz-action secondary" data-education-quiz-reset="true" data-education-quiz-message-index="${messageIndex}">${escapeHtml(t('educationQuizRetry'))}</button>`
          : `<button type="button" class="education-quiz-action primary" data-education-quiz-submit="true" data-education-quiz-message-index="${messageIndex}">${escapeHtml(t('educationQuizCheck'))}</button>`}
      </div>
    </div>
  `;
}

function selectEducationQuizOption(messageIndex, questionIndex, optionKey) {
  const message = educationChatHistory[messageIndex];
  const quizData = parseEducationQuiz(message?.text || '');
  if (!quizData) return;

  const quizState = getEducationQuizState(messageIndex, quizData);
  if (quizState.submitted) return;

  quizState.selectedAnswers[questionIndex] = optionKey;
  renderEducationChatHistory({ preserveScroll: true });
}

function submitEducationQuiz(messageIndex) {
  const message = educationChatHistory[messageIndex];
  const quizData = parseEducationQuiz(message?.text || '');
  if (!quizData) return;

  const quizState = getEducationQuizState(messageIndex, quizData);
  const hasUnanswered = quizState.selectedAnswers.some(answer => !answer);
  if (hasUnanswered) {
    showToast(t('educationQuizIncomplete'));
    return;
  }

  quizState.submitted = true;
  renderEducationChatHistory({ preserveScroll: true });
}

function resetEducationQuiz(messageIndex) {
  const message = educationChatHistory[messageIndex];
  const quizData = parseEducationQuiz(message?.text || '');
  if (!quizData) return;

  educationQuizUiState[messageIndex] = {
    selectedAnswers: Array.from({ length: quizData.questions.length }, () => ''),
    submitted: false
  };
  renderEducationChatHistory({ preserveScroll: true });
}

function updateEducationDownloadButtonState() {
  if (!educationDownloadLatestBtn) return;
  if (selectedEducationAction === 'quiz') {
    educationDownloadLatestBtn.disabled = true;
    return;
  }
  educationDownloadLatestBtn.disabled = getLatestEducationMiloMessageIndex() === -1;
}

function downloadLatestEducationResponsePdf() {
  const latestMessageIndex = getLatestEducationMiloMessageIndex();
  if (latestMessageIndex === -1) return;
  downloadEducationMessagePdf(latestMessageIndex);
}

function renderEducationChatHistory(options = {}) {
  const { preserveScroll = false } = options;
  if (!educationChatHistoryEl) return;
  const previousScrollTop = educationChatHistoryEl.scrollTop;
  if (educationChatHistory.length === 0) {
    educationChatHistoryEl.innerHTML = `<div class="chat-empty">${t('educationChatEmpty')}</div>`;
    updateEducationDownloadButtonState();
    return;
  }

  educationChatHistoryEl.innerHTML = educationChatHistory.map((msg, index) => {
    if (msg.role === 'milo') {
      const quizData = parseEducationQuiz(msg.text);
      return `
        <div class="education-message-card milo">
          ${quizData
            ? renderEducationQuizMessage(quizData, index)
            : `<div class="chat-bubble milo education-rich-message">${formatEducationMessage(msg.text)}</div>`}
          ${quizData ? '' : `<button type="button" class="education-download-btn" data-download-education-message-index="${index}" title="${escapeHtml(t('educationDownloadPdf'))}" aria-label="${escapeHtml(t('educationDownloadPdf'))}">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 1.5v5.5"/>
              <path d="M3.8 5.2L6 7.5l2.2-2.3"/>
              <path d="M2 9.5h8"/>
            </svg>
            <span>${escapeHtml(t('educationDownloadPdf'))}</span>
          </button>`}
        </div>
      `;
    }

    return `<div class="education-message-card user"><div class="chat-bubble user">${escapeHtml(msg.text)}</div></div>`;
  }).join('');
  educationChatHistoryEl.scrollTop = preserveScroll ? previousScrollTop : educationChatHistoryEl.scrollHeight;
  updateEducationDownloadButtonState();
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
  if (educationGoBtn) educationGoBtn.disabled = pending;
  if (educationInstructionsInput) educationInstructionsInput.disabled = pending;
  if (educationSourceTextArea) educationSourceTextArea.disabled = pending;
  if (educationSheetLengthSelect) educationSheetLengthSelect.disabled = pending;
  if (educationQuizCountSelect) educationQuizCountSelect.disabled = pending;
  educationActionButtons.forEach((button) => {
    button.disabled = pending;
  });
}

function setEducationAction(action) {
  if (selectedEducationAction === 'quiz' && action !== 'quiz') {
    closeEducationQuizPage();
  }
  selectedEducationAction = action;
  renderEducationComposerState();
  persistEducationState();
}

function renderEducationComposerState() {
  educationActionButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.educationAction === selectedEducationAction);
  });

  if (educationSheetLengthWrap) {
    educationSheetLengthWrap.style.display = selectedEducationAction === 'sheet' ? 'flex' : 'none';
  }

  if (educationQuizCountWrap) {
    educationQuizCountWrap.style.display = selectedEducationAction === 'quiz' ? 'flex' : 'none';
  }

  if (educationSheetLengthSelect) {
    educationSheetLengthSelect.value = selectedEducationSheetLength;
  }

  if (educationQuizCountSelect) {
    educationQuizCountSelect.value = String(selectedEducationQuizQuestionCount);
  }

  if (educationDownloadLatestBtn) {
    educationDownloadLatestBtn.style.display = selectedEducationAction === 'quiz' ? 'none' : 'block';
  }

  renderEducationQuizHistory();
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

  try {
    const rawInstructions = window.localStorage.getItem('milo.educationInstructions') || '';
    if (educationInstructionsInput) educationInstructionsInput.value = rawInstructions;
  } catch {
    if (educationInstructionsInput) educationInstructionsInput.value = '';
  }

  try {
    const rawAction = window.localStorage.getItem('milo.educationAction');
    if (['explain', 'reformulate', 'sheet', 'quiz'].includes(rawAction)) {
      selectedEducationAction = rawAction;
    }
  } catch {}

  try {
    const rawLength = window.localStorage.getItem('milo.educationSheetLength');
    if (['short', 'medium', 'long'].includes(rawLength)) {
      selectedEducationSheetLength = rawLength;
    }
  } catch {}

  try {
    const rawQuizCount = Number(window.localStorage.getItem('milo.educationQuizQuestionCount'));
    if (Number.isFinite(rawQuizCount) && rawQuizCount >= 0 && rawQuizCount <= 10) {
      selectedEducationQuizQuestionCount = rawQuizCount;
    }
  } catch {}

  selectedEducationDocumentId = educationDocuments[0]?.id || null;
  setEducationUploadPanelOpen(educationDocuments.length > 0);
}

function persistEducationState() {
  window.localStorage.setItem(educationDocumentsStorageKey, JSON.stringify(educationDocuments));
  window.localStorage.setItem(educationSourceStorageKey, educationSourceTextArea?.value || '');
  window.localStorage.setItem('milo.educationInstructions', educationInstructionsInput?.value || '');
  window.localStorage.setItem('milo.educationAction', selectedEducationAction);
  window.localStorage.setItem('milo.educationSheetLength', selectedEducationSheetLength);
  window.localStorage.setItem('milo.educationQuizQuestionCount', String(selectedEducationQuizQuestionCount));
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

function getEducationTaskPrompt() {
  const extraInstructions = educationInstructionsInput?.value.trim() || '';
  let basePrompt = '';
  const quizQuestionCount = Math.max(1, Number(selectedEducationQuizQuestionCount || 5));
  const quizFormatInstruction = currentLanguage === 'en'
    ? ` Return only a multiple-choice quiz in this exact format, with no intro or outro: Q1: question on one line, then A) option, B) option, C) option, D) option, then ANSWER: letter, then EXPLANATION: short explanation. Repeat for ${quizQuestionCount} questions.`
    : currentLanguage === 'es'
      ? ` Devuelve solo un quiz de opcion multiple con este formato exacto, sin introduccion ni conclusion: Q1: pregunta en una linea, luego A) opcion, B) opcion, C) opcion, D) opcion, luego ANSWER: letra, luego EXPLANATION: explicacion breve. Repite para ${quizQuestionCount} preguntas.`
      : ` Renvoie uniquement un quiz a choix multiple avec ce format exact, sans introduction ni conclusion : Q1: question sur une ligne, puis A) option, B) option, C) option, D) option, puis ANSWER: lettre, puis EXPLANATION: explication courte. Repete pour ${quizQuestionCount} questions.`;

  if (currentLanguage === 'en') {
    if (selectedEducationAction === 'explain') {
      basePrompt = 'Explain this text or document clearly to make it easier to understand.';
    } else if (selectedEducationAction === 'reformulate') {
      basePrompt = 'Rewrite this text or document while preserving its format, meaning, and key content.';
    } else if (selectedEducationAction === 'sheet') {
      const lengthLabel = selectedEducationSheetLength === 'short' ? 'short' : selectedEducationSheetLength === 'long' ? 'long' : 'medium';
      basePrompt = `Create a ${lengthLabel} study sheet from this text or document.`;
    } else {
      basePrompt = `Create a quiz based on this text or document.${quizFormatInstruction}`;
    }
  } else if (currentLanguage === 'es') {
    if (selectedEducationAction === 'explain') {
      basePrompt = 'Explica este texto o documento de forma clara para facilitar la comprension.';
    } else if (selectedEducationAction === 'reformulate') {
      basePrompt = 'Reformula este texto o documento manteniendo su formato, su sentido y su contenido importante.';
    } else if (selectedEducationAction === 'sheet') {
      const lengthLabel = selectedEducationSheetLength === 'short' ? 'corta' : selectedEducationSheetLength === 'long' ? 'larga' : 'media';
      basePrompt = `Crea una ficha de revision ${lengthLabel} a partir de este texto o documento.`;
    } else {
      basePrompt = `Crea un quiz a partir de este texto o documento.${quizFormatInstruction}`;
    }
  } else {
    if (selectedEducationAction === 'explain') {
      basePrompt = 'Explique ce texte ou document de manière claire pour aider à la compréhension.';
    } else if (selectedEducationAction === 'reformulate') {
      basePrompt = 'Reformule ce texte ou document en gardant son format, son sens et son contenu important.';
    } else if (selectedEducationAction === 'sheet') {
      const lengthLabel = selectedEducationSheetLength === 'short' ? 'courte' : selectedEducationSheetLength === 'long' ? 'longue' : 'moyenne';
      basePrompt = `Crée une fiche de révision ${lengthLabel} à partir de ce texte ou document.`;
    } else {
      basePrompt = `Crée un quiz à partir de ce texte ou document.${quizFormatInstruction}`;
    }
  }

  if (!extraInstructions) return basePrompt;
  if (currentLanguage === 'en') return `${basePrompt} Additional instructions: ${extraInstructions}`;
  if (currentLanguage === 'es') return `${basePrompt} Indicaciones adicionales: ${extraInstructions}`;
  return `${basePrompt} Indications supplémentaires : ${extraInstructions}`;
}

function getEducationTaskSignature() {
  const studyContext = getEducationStudyContext();
  return JSON.stringify({
    action: selectedEducationAction,
    sheetLength: selectedEducationAction === 'sheet' ? selectedEducationSheetLength : '',
    instructions: educationInstructionsInput?.value.trim() || '',
    pastedText: studyContext.pastedText,
    selectedDocumentId: studyContext.selectedDocumentId || '',
    documents: studyContext.documents.map((document) => ({
      id: document.id,
      name: document.name,
      content: document.content
    }))
  });
}

function runEducationTask() {
  if (isEducationAgentRequestPending) {
    showToast(t('educationChatThinking'));
    return;
  }

  if (selectedEducationAction === 'quiz') {
    requestEducationQuiz();
    return;
  }

  const studyContext = getEducationStudyContext();
  if (!studyContext.pastedText && !studyContext.documents.length) {
    showToast(t('educationNoSource'));
    return;
  }

  const prompt = getEducationTaskPrompt();
  if (!prompt) return;

  const taskSignature = getEducationTaskSignature();
  if (taskSignature === lastEducationTaskSignature && getLatestEducationMiloMessageIndex() !== -1) {
    openPanelSection('education-chat');
    renderEducationChatHistory();
    return;
  }

  lastEducationTaskSignature = taskSignature;
  openPanelSection('education-chat');
  addMessageToEducationHistory('user', prompt);
  sendCommand(prompt, 'education-text');
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
if (chatThreadListEl) {
  chatThreadListEl.addEventListener('click', handleChatThreadListClick);
}
if (panelNewChatBtn) {
  panelNewChatBtn.addEventListener('click', () => {
    if (isAgentRequestPending) {
      showToast(t('chatThinking'));
      return;
    }

    startNewChatConversation({ shouldFocus: true });
  });
}
if (educationSendBtn) educationSendBtn.addEventListener('click', sendEducationFromInput);
if (educationTextInput) educationTextInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendEducationFromInput(); });
miloBtn.addEventListener('click', function() {
  if (isEducationPageVisible()) {
    runEducationTask();
    return;
  }

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
  return ensureActiveChatConversation().sessionId;
}

function getAgentRequestPayload(message) {
  return {
    message,
    history: chatHistory
      .filter(entry => !entry?.isGreeting)
      .map(({ role, text }) => ({ role, text })),
    language: currentLanguage,
    sessionId: getChatSessionId(),
    profile: getRuntimeProfileData({ includePhoto: false }),
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

function isPlanningEventCompleted(event) {
  return typeof event?.completedAt === 'number' && Number.isFinite(event.completedAt) && event.completedAt > 0;
}

function getActivePlanningEvents(events = planningState.events) {
  return events.filter((event) => !isPlanningEventCompleted(event));
}

function getCompletedPlanningEvents(events = planningState.events) {
  return events.filter((event) => isPlanningEventCompleted(event));
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

function getMonthlyPrimaryReminderCounts(events = planningState.events) {
  return getActivePlanningEvents(events).reduce((counts, event) => {
    const monthKey = getMonthKeyFromDateKey(event.date);
    const canonicalTitle = getCanonicalTaskTitle(event.title);
    if (!monthKey || !canonicalTitle) return counts;

    const identity = getMonthlyTaskIdentity(monthKey, canonicalTitle);
    counts.set(identity, (counts.get(identity) || 0) + 1);
    return counts;
  }, new Map());
}

function syncMonthlyPrimaryTaskReminderCounts() {
  if (!monthlyPrimaryTasks.length) return;

  const reminderCounts = getMonthlyPrimaryReminderCounts();
  let hasChanges = false;

  monthlyPrimaryTasks.forEach((task) => {
    const identity = getMonthlyTaskIdentity(task.monthKey, task.title);
    const nextReminderCount = reminderCounts.get(identity) || 0;
    if (task.reminderCount !== nextReminderCount) {
      task.reminderCount = nextReminderCount;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    persistMonthlyPrimaryTasks();
  }
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
    return `<button type="button" class="card" data-home-date-key="${escapeHtml(event.date)}" data-home-event-id="${event.id}" style="text-align:left;"><div class="card-dot" style="background:${getEventDotColor(event)}"></div><div class="card-body"><div class="card-title">${escapeHtml(event.title || t('untitledTask'))}</div><div class="card-sub">${escapeHtml(formatHomeEventSubtitle(event))}</div>${badgeMarkup}</div></button>`;
  }).join('');
}

function renderMonthlyPrimaryCards(tasks = []) {
  return tasks.map((task) => (`<button type="button" class="card home-monthly-card" data-home-month-key="${escapeHtml(task.monthKey)}" data-home-task-title="${escapeHtml(task.title)}" style="text-align:left;"><div class="card-dot" style="background:var(--accent)"></div><div class="card-body"><div class="card-title">${escapeHtml(task.title)}</div><div class="card-sub">${escapeHtml(formatMonthLabelFromKey(task.monthKey))}</div><div class="home-monthly-meta"><span class="badge badge-purple">${escapeHtml(t('homeMonthlyPrimaryBadge', { count: task.reminderCount }))}</span><span class="home-monthly-subtle">${escapeHtml(t('homeMonthBadge'))}</span></div></div></button>`)).join('');
}

function renderDailyNewsEmptyState() {
  return `<div class="card home-news-card"><div class="card-dot home-news-dot"></div><div class="card-body"><div class="card-title">${escapeHtml(t('homeDailyNewsEmptyTitle'))}</div><div class="card-sub">${escapeHtml(t('homeDailyNewsEmptySub'))}</div></div></div>`;
}

function renderDailyNewsLoadingState() {
  return `<div class="card home-news-card"><div class="card-dot home-news-dot"></div><div class="card-body"><div class="card-title">${escapeHtml(t('homeDailyNewsLoadingTitle'))}</div><div class="card-sub">${escapeHtml(t('homeDailyNewsLoadingSub'))}</div></div></div>`;
}

function renderDailyNewsCard() {
  const requestKey = getDailyNewsRequestKey(dailyNewsTheme, currentLanguage);
  const entry = dailyNewsState.cacheKey === requestKey && dailyNewsState.entry
    ? dailyNewsState.entry
    : getFallbackDailyNewsEntry(dailyNewsTheme, currentLanguage);

  if (normalizeDailyNewsTheme(dailyNewsTheme) !== 'none' && dailyNewsState.cacheKey === requestKey && dailyNewsState.status === 'loading' && !entry) {
    return renderDailyNewsLoadingState();
  }

  if (!entry) return renderDailyNewsEmptyState();

  const formattedDate = new Intl.DateTimeFormat(getCurrentLocale(), {
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  const isRemoteNews = dailyNewsState.cacheKey === requestKey && dailyNewsState.source === 'remote';
  const badgeLabel = isRemoteNews
    ? t('homeDailyNewsBadge')
    : t('homeDailyNewsFallbackBadge');
  const badgeClass = isRemoteNews ? 'badge-purple' : 'badge-amber';

  return `<div class="card home-news-card"><div class="card-dot home-news-dot"></div><div class="card-body"><div class="card-title">${escapeHtml(entry.title)}</div><div class="card-sub">${escapeHtml(entry.sub)}</div><div class="home-news-meta"><span class="badge ${badgeClass}">${escapeHtml(badgeLabel)}</span><span class="home-monthly-subtle">${escapeHtml(getNewsThemeLabel(dailyNewsTheme))} · ${escapeHtml(formattedDate)}</span></div></div></div>`;
}

function renderGuestHomeCard() {
  return `<div class="card home-news-card"><div class="card-dot home-news-dot"></div><div class="card-body"><div class="card-title">${escapeHtml(t('guestHomeTitle'))}</div><div class="card-sub">${escapeHtml(t('guestHomeSub'))}</div><div class="home-news-meta"><span class="badge badge-purple">${escapeHtml(t('guestHomeChatHint'))}</span><span class="home-monthly-subtle">${escapeHtml(t('guestHomeEducationHint'))}</span></div></div></div>`;
}

function renderHomePage() {
  syncMonthlyPrimaryTaskReminderCounts();

  const dailyNewsLabel = document.getElementById('home-daily-news-label');
  const todayLabel = document.getElementById('home-today-label');
  const tomorrowLabel = document.getElementById('home-tomorrow-label');
  const monthlyLabel = document.getElementById('home-monthly-primary-label');
  const dailyNewsList = document.getElementById('home-daily-news-list');
  const todayList = document.getElementById('home-today-list');
  const tomorrowList = document.getElementById('home-tomorrow-list');
  const monthlyList = document.getElementById('home-monthly-primary-list');
  if (!dailyNewsList || !todayList || !tomorrowList || !monthlyList) return;

  if (isGuestMode()) {
    if (dailyNewsLabel) dailyNewsLabel.textContent = t('guestHomeLabel');
    if (todayLabel) todayLabel.style.display = 'none';
    if (tomorrowLabel) tomorrowLabel.style.display = 'none';
    if (monthlyLabel) monthlyLabel.style.display = 'none';
    todayList.style.display = 'none';
    tomorrowList.style.display = 'none';
    monthlyList.style.display = 'none';
    dailyNewsList.style.display = 'flex';
    dailyNewsList.innerHTML = renderGuestHomeCard();
    return;
  }

  if (dailyNewsLabel) dailyNewsLabel.textContent = t('homeDailyNews');
  if (todayLabel) todayLabel.style.display = '';
  if (tomorrowLabel) tomorrowLabel.style.display = '';
  if (monthlyLabel) monthlyLabel.style.display = '';
  todayList.style.display = '';
  tomorrowList.style.display = '';
  monthlyList.style.display = '';
  dailyNewsList.style.display = '';

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(tomorrow);
  const currentMonthKey = getCurrentHomeMonthKey();

  const sortByTime = (left, right) => (left.time || '').localeCompare(right.time || '');
  const activeEvents = getActivePlanningEvents();
  const todayEvents = activeEvents.filter(event => event.date === todayKey).sort(sortByTime);
  const tomorrowEvents = activeEvents.filter(event => event.date === tomorrowKey).sort(sortByTime);
  const monthTasks = monthlyPrimaryTasks
    .filter(task => task.monthKey === currentMonthKey && task.reminderCount > 0)
    .sort((left, right) => (right.reminderCount - left.reminderCount) || left.title.localeCompare(right.title));

  dailyNewsList.innerHTML = renderDailyNewsCard();
  todayList.innerHTML = todayEvents.length ? renderHomeEventCards(todayEvents) : renderHomeEmptyState(t('homeEmptyToday'));
  tomorrowList.innerHTML = tomorrowEvents.length ? renderHomeEventCards(tomorrowEvents) : renderHomeEmptyState(t('homeEmptyTomorrow'));
  monthlyList.innerHTML = monthTasks.length ? renderMonthlyPrimaryCards(monthTasks) : renderHomeEmptyState(t('homeEmptyMonthlyPrimary'));
  maybeRefreshDailyNews();
}

function focusPlanningDayState(dateKey, selectedEventId = null) {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return false;

  planningState.currentDate = new Date(year, month - 1, day);
  planningState.view = 'day';
  const dayEvents = getActivePlanningEvents()
    .filter(event => event.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  planningState.selectedEventId = dayEvents.some((event) => event.id === selectedEventId)
    ? selectedEventId
    : dayEvents[0]?.id || null;

  return true;
}

function openPlanningMonth(monthKey, taskTitle = '') {
  const matchingEvent = findMonthlyTaskPlanningEvent(monthKey, taskTitle);
  if (matchingEvent) {
    focusPlanningDayState(matchingEvent.date, matchingEvent.id);
    openPanelSection('planning');
    return;
  }

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
    profile: getRuntimeProfileData({ includePhoto: false }),
    studyContext: getEducationStudyContext(message),
    agent: 'education'
  };
}

function getApiUrl(pathname) {
  const configuredApiBaseUrl = typeof window.MILO_API_BASE_URL === 'string'
    ? window.MILO_API_BASE_URL.trim().replace(/\/$/, '')
    : '';

  if (configuredApiBaseUrl) {
    return `${configuredApiBaseUrl}${pathname}`;
  }

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
        !isPlanningEventCompleted(event)
        && (
        event.date === action.event.date
        && event.time === action.event.time
        && event.title === action.event.title
        && event.description === (action.event.description || '')
      )));

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
    meta,
    completedAt: null
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

    if (!Number.isFinite(event.completedAt)) {
      event.completedAt = null;
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

function openPlanningEvent(eventId) {
  const existingEvent = getActivePlanningEvents().find((event) => event.id === eventId);
  if (!existingEvent) return false;

  focusPlanningDayState(existingEvent.date, existingEvent.id);
  return true;
}

function findMonthlyTaskPlanningEvent(monthKey, title) {
  const normalizedTitle = normalizeTaskIdentityTitle(title);
  if (!monthKey || !normalizedTitle) return null;

  const currentDateKey = formatDateKey(new Date());
  const matchingEvents = getActivePlanningEvents()
    .filter((event) => getMonthKeyFromDateKey(event.date) === monthKey && normalizeTaskIdentityTitle(event.title) === normalizedTitle)
    .sort((left, right) => {
      const leftStamp = `${left.date} ${left.time || '00:00'}`;
      const rightStamp = `${right.date} ${right.time || '00:00'}`;
      return leftStamp.localeCompare(rightStamp);
    });

  if (!matchingEvents.length) return null;

  return matchingEvents.find((event) => event.date >= currentDateKey) || matchingEvents[0];
}

function openPlanningDay(dateKey, selectedEventId = null) {
  if (!focusPlanningDayState(dateKey, selectedEventId)) return;
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
    return `<div class="agenda-event ${isActive} ${isSwiped}" data-event-id="${event.id}" style="top: ${top}px; height: ${DAY_EVENT_HEIGHT}px; --swipe-translate: ${swipeTranslate}; --actions-translate: ${actionsTranslate}; --actions-opacity: ${actionsOpacity};"><div class="agenda-event-track"><div class="agenda-event-actions"><button type="button" class="agenda-event-action edit" data-edit-event-id="${event.id}">✎</button><button type="button" class="agenda-event-action delete" data-delete-event-id="${event.id}">×</button></div><div class="agenda-event-content"><button type="button" class="agenda-event-main" data-open-event-id="${event.id}"><div class="agenda-event-time">${escapeHtml(event.time || '')}</div><div class="agenda-name">${escapeHtml(event.title || t('untitledTask'))}</div></button><button type="button" class="agenda-event-check" data-complete-event-id="${event.id}" aria-label="${escapeHtml(t('taskCompleteAria'))}"></button></div></div></div>`;
  }).join('');

  const emptyState = events.length
    ? ''
    : `<div class="agenda-empty">${t('noTasksToday')}</div>`;

  agenda.innerHTML = `<div class="day-agenda-scroll"><div class="day-agenda-grid">${hourRows}<div class="agenda-events-layer">${eventCards}</div>${emptyState}</div></div>`;

  scrollPlanningToSelectedEvent();

}

function scrollPlanningToSelectedEvent() {
  const agenda = document.getElementById('day-agenda-panel');
  if (!agenda || planningState.view !== 'day' || planningState.selectedEventId === null) return;

  const scrollToEvent = () => {
    const selectedEvent = agenda.querySelector('.agenda-event.active');
    const scrollContainer = agenda.querySelector('.day-agenda-scroll');
    if (!selectedEvent || !scrollContainer) return;

    const targetTop = Math.max(0, selectedEvent.offsetTop - 140);
    scrollContainer.scrollTop = targetTop;
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToEvent);
  });
}

function closeTaskModal() {
  taskModalState.open = false;
  taskModalState.mode = 'view';
  taskModalState.eventId = null;
  renderTaskModal();
}

function closeProgressTaskModal() {
  progressTaskModalState.open = false;
  progressTaskModalState.eventId = null;
  renderProgressTaskModal();
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

function formatTaskDateLabel(dateKey, time = '') {
  if (!dateKey) return '—';

  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;

  const taskDate = new Date(year, month - 1, day);
  const formattedDate = taskDate.toLocaleDateString(getCurrentLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return time ? `${formattedDate} · ${time}` : formattedDate;
}

function formatCompletionDateLabel(timestamp) {
  if (!Number.isFinite(timestamp)) return '—';
  return new Date(timestamp).toLocaleString(getCurrentLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderProgressTaskModal() {
  const backdrop = document.getElementById('progress-task-modal-backdrop');
  const modalTitle = document.getElementById('progress-task-modal-title');
  const titleValue = document.getElementById('progress-task-title-value');
  const descriptionValue = document.getElementById('progress-task-description-value');
  const scheduledValue = document.getElementById('progress-task-scheduled-value');
  const completedValue = document.getElementById('progress-task-completed-value');
  if (!backdrop || !modalTitle || !titleValue || !descriptionValue || !scheduledValue || !completedValue) return;

  const selectedEvent = planningState.events.find((event) => event.id === progressTaskModalState.eventId) || null;
  if (!progressTaskModalState.open || !selectedEvent || !isPlanningEventCompleted(selectedEvent)) {
    backdrop.classList.remove('open');
    titleValue.textContent = '';
    descriptionValue.textContent = '';
    scheduledValue.textContent = '';
    completedValue.textContent = '';
    return;
  }

  backdrop.classList.add('open');
  modalTitle.textContent = t('taskModalReadTitle');
  titleValue.textContent = selectedEvent.title || t('untitledTask');
  descriptionValue.textContent = selectedEvent.description || t('taskModalEmptyDescription');
  descriptionValue.classList.toggle('task-modal-empty', !selectedEvent.description);
  scheduledValue.textContent = formatTaskDateLabel(selectedEvent.date, selectedEvent.time);
  completedValue.textContent = formatCompletionDateLabel(selectedEvent.completedAt);
}

function openProgressTaskModal(eventId) {
  const event = planningState.events.find((entry) => entry.id === eventId);
  if (!event || !isPlanningEventCompleted(event)) return;

  progressTaskModalState.open = true;
  progressTaskModalState.eventId = event.id;
  renderProgressTaskModal();
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

function getNextActiveEventIdForDate(dateKey) {
  return getActivePlanningEvents()
    .filter((event) => event.date === dateKey)
    .sort((left, right) => left.time.localeCompare(right.time))[0]?.id || null;
}

function markPlanningEventCompleted(eventId) {
  const existingEvent = planningState.events.find((event) => event.id === eventId);
  if (!existingEvent || isPlanningEventCompleted(existingEvent)) return;

  existingEvent.completedAt = Date.now();
  taskModalState.swipedEventId = null;

  if (planningState.selectedEventId === eventId) {
    planningState.selectedEventId = getNextActiveEventIdForDate(existingEvent.date);
  }

  if (taskModalState.eventId === eventId) {
    closeTaskModal();
  }

  persistPlanningState();
  renderHomePage();
  renderProgressPage();

  if (currentPanelSection === 'planning') {
    renderPlanningPanel();
  }
}

function markPlanningEventActive(eventId) {
  const existingEvent = planningState.events.find((event) => event.id === eventId);
  if (!existingEvent || !isPlanningEventCompleted(existingEvent)) return;

  existingEvent.completedAt = null;
  planningState.selectedEventId = existingEvent.id;

  if (progressTaskModalState.eventId === eventId) {
    closeProgressTaskModal();
  }

  persistPlanningState();
  renderHomePage();
  renderProgressPage();

  if (currentPanelSection === 'planning') {
    renderPlanningPanel();
  }
}

function removePlanningEventById(eventId) {
  const existingEvent = planningState.events.find((event) => event.id === eventId);
  if (!existingEvent) return;

  planningState.events = planningState.events.filter((event) => event.id !== eventId);
  if (planningState.selectedEventId === eventId) {
    planningState.selectedEventId = getNextActiveEventIdForDate(existingEvent.date);
  }
  if (taskModalState.eventId === eventId) {
    closeTaskModal();
  }
  if (progressTaskModalState.eventId === eventId) {
    closeProgressTaskModal();
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
  const trigger = event.target.closest('.agenda-event-main');
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
    const completeButton = event.target.closest('[data-complete-event-id]');
    if (completeButton) {
      event.stopPropagation();
      markPlanningEventCompleted(Number(completeButton.dataset.completeEventId));
      return;
    }

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

function initializeProgressInteractions() {
  const progressList = document.getElementById('progress-completed-list');
  const progressModalBackdrop = document.getElementById('progress-task-modal-backdrop');
  const progressModalClose = document.getElementById('progress-task-modal-close');
  const progressModalCancel = document.getElementById('progress-task-modal-cancel');

  if (!progressList || progressList._initialized) return;
  progressList._initialized = true;

  progressList.addEventListener('click', (event) => {
    const restoreButton = event.target.closest('[data-restore-event-id]');
    if (restoreButton) {
      event.stopPropagation();
      markPlanningEventActive(Number(restoreButton.dataset.restoreEventId));
      return;
    }

    const completedCard = event.target.closest('[data-progress-open-id]');
    if (!completedCard) return;
    openProgressTaskModal(Number(completedCard.dataset.progressOpenId));
  });

  progressModalClose?.addEventListener('click', closeProgressTaskModal);
  progressModalCancel?.addEventListener('click', closeProgressTaskModal);
  progressModalBackdrop?.addEventListener('click', (event) => {
    if (event.target === progressModalBackdrop) {
      closeProgressTaskModal();
    }
  });
}

function renderProgressPage() {
  const progressList = document.getElementById('progress-completed-list');
  if (!progressList) return;

  initializeProgressInteractions();

  const completedEvents = getCompletedPlanningEvents()
    .sort((left, right) => right.completedAt - left.completedAt);

  if (!completedEvents.length) {
    progressList.innerHTML = `<div class="agenda-empty progress-empty">${escapeHtml(t('progressEmpty'))}</div>`;
    renderProgressTaskModal();
    return;
  }

  progressList.innerHTML = completedEvents.map((event) => (`<div class="progress-event-card"><button type="button" class="progress-event-open" data-progress-open-id="${event.id}"><div class="progress-event-main"><div class="agenda-event-time">${escapeHtml(formatTaskDateLabel(event.date, event.time))}</div><div class="agenda-name">${escapeHtml(event.title || t('untitledTask'))}</div></div></button><button type="button" class="agenda-event-check checked" data-restore-event-id="${event.id}" aria-label="${escapeHtml(t('taskUncompleteAria'))}"></button></div>`)).join('');
  renderProgressTaskModal();
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
  renderProgressPage();

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
    const events = getActivePlanningEvents().filter(e => e.date === key).sort((a, b) => a.time.localeCompare(b.time));
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
      const hasEvent = getActivePlanningEvents().some(e => e.date === key);
      const todayClass = sameDay(cell.date, today) ? 'today' : '';
      const outsideClass = cell.outside ? 'outside' : '';
      return `<button type="button" class="month-day ${outsideClass} ${todayClass}" data-date-key="${key}"><div class="month-day-number">${cell.date.getDate()}</div>${hasEvent ? '<div class="month-day-dot"></div>' : ''}</button>`;
    }).join('');

    
  }
}

document.addEventListener('click', (event) => {
  const homeDayCard = event.target.closest('[data-home-date-key]');
  if (homeDayCard) {
    const targetEventId = Number(homeDayCard.dataset.homeEventId);
    if (!openPlanningEvent(targetEventId)) {
      focusPlanningDayState(homeDayCard.dataset.homeDateKey);
    }
    openPanelSection('planning');
    return;
  }

  const homeMonthCard = event.target.closest('[data-home-month-key]');
  if (homeMonthCard) {
    openPlanningMonth(homeMonthCard.dataset.homeMonthKey, homeMonthCard.dataset.homeTaskTitle || '');
  }
});

