// Civic Education Nepal - Client-side Scripts

const ACCESSIBILITY_STORAGE_KEY = 'civicAccessibilityPrefs';

const I18N_TEXT = {
  en: {
    'nav.home': 'Home',
    'nav.accessibility': 'Accessibility',
    'nav.dashboard': 'Dashboard',
    'nav.levels': 'Levels',
    'nav.register': 'Register',
    'nav.login': 'Login',
    'footer.quickLinks': 'Quick Links',
    'accessibility.title': 'Accessibility Center',
    'accessibility.subtitle': 'Customize language, reading experience, and listening support.',
    'accessibility.languageLabel': 'Language',
    'accessibility.languageHelp': 'Applies to interface labels available in the app.',
    'accessibility.readingLevelLabel': 'Reading level mode (simpler wording)',
    'accessibility.dyslexiaLabel': 'Dyslexia-friendly layout',
    'accessibility.ttsLabel': 'Text-to-speech',
    'accessibility.readPageBtn': 'Read this page',
    'accessibility.stopBtn': 'Stop',
    'accessibility.ttsHelp': "Uses your browser's speech synthesis voice.",
    'accessibility.saveBtn': 'Save preferences',
    'accessibility.resetBtn': 'Reset',
  },
  ne: {
    'nav.home': 'होम',
    'nav.accessibility': 'पहुँच सुविधा',
    'nav.dashboard': 'ड्यासबोर्ड',
    'nav.levels': 'स्तरहरू',
    'nav.register': 'दर्ता',
    'nav.login': 'लगइन',
    'footer.quickLinks': 'छिटो लिङ्कहरू',
    'accessibility.title': 'पहुँच सुविधा केन्द्र',
    'accessibility.subtitle': 'भाषा, पढाइ अनुभव र सुन्ने सहायता अनुकूलन गर्नुहोस्।',
    'accessibility.languageLabel': 'भाषा',
    'accessibility.languageHelp': 'एपमा उपलब्ध इन्टरफेस लेबलहरूमा लागू हुन्छ।',
    'accessibility.readingLevelLabel': 'पढाइ स्तर मोड (सरल शब्दावली)',
    'accessibility.dyslexiaLabel': 'डिस्लेक्सिया-अनुकूल लेआउट',
    'accessibility.ttsLabel': 'टेक्स्ट-टु-स्पिच',
    'accessibility.readPageBtn': 'यो पृष्ठ पढ्नुहोस्',
    'accessibility.stopBtn': 'रोक्नुहोस्',
    'accessibility.ttsHelp': 'तपाईंको ब्राउजरको आवाज प्रयोग हुन्छ।',
    'accessibility.saveBtn': 'प्राथमिकता सुरक्षित गर्नुहोस्',
    'accessibility.resetBtn': 'रिसेट',
  },
};

const SIMPLE_WORDING_REPLACEMENTS = [
  [/constitutional/gi, 'basic law'],
  [/responsibilities/gi, 'duties'],
  [/participation/gi, 'taking part'],
  [/governance/gi, 'government system'],
  [/awareness/gi, 'understanding'],
  [/regulations/gi, 'rules'],
  [/conservation/gi, 'protection'],
  [/inclusion/gi, 'fair treatment'],
  [/citizenship/gi, 'citizen life'],
  [/information literacy/gi, 'understanding information'],
];

function getDefaultAccessibilityPrefs() {
  return {
    language: 'en',
    readingLevelMode: false,
    dyslexiaFriendlyMode: false,
  };
}

function getAccessibilityPrefs() {
  try {
    const rawValue = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!rawValue) return getDefaultAccessibilityPrefs();
    const parsed = JSON.parse(rawValue);
    return {
      ...getDefaultAccessibilityPrefs(),
      ...parsed,
    };
  } catch (error) {
    return getDefaultAccessibilityPrefs();
  }
}

function saveAccessibilityPrefs(nextPrefs) {
  localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(nextPrefs));
}

function translateUI(languageCode) {
  const dictionary = I18N_TEXT[languageCode] || I18N_TEXT.en;
  document.documentElement.setAttribute('lang', languageCode);

  const translatableNodes = document.querySelectorAll('[data-i18n]');
  translatableNodes.forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (!dictionary[key]) return;
    node.textContent = dictionary[key];
  });
}

function applySimpleReadingMode(isEnabled) {
  document.body.classList.toggle('reading-level-mode', isEnabled);

  const contentNodes = document.querySelectorAll('main p, main li, main h1, main h2, main h3, main h4');
  contentNodes.forEach((node) => {
    if (!node.dataset.originalText) {
      node.dataset.originalText = node.textContent;
    }

    if (!isEnabled) {
      node.textContent = node.dataset.originalText;
      return;
    }

    let nextText = node.dataset.originalText;
    SIMPLE_WORDING_REPLACEMENTS.forEach(([pattern, replacement]) => {
      nextText = nextText.replace(pattern, replacement);
    });
    node.textContent = nextText;
  });
}

function applyDyslexiaFriendlyMode(isEnabled) {
  document.body.classList.toggle('dyslexia-friendly-mode', isEnabled);
}

function applyAccessibilityPrefs(prefs) {
  translateUI(prefs.language);
  applySimpleReadingMode(Boolean(prefs.readingLevelMode));
  applyDyslexiaFriendlyMode(Boolean(prefs.dyslexiaFriendlyMode));
}

function initTextToSpeechControl(prefs) {
  const readButton = document.getElementById('ttsReadPageBtn');
  const stopButton = document.getElementById('ttsStopBtn');
  if (!readButton || !stopButton) return;

  readButton.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      showToast('<strong>Text-to-speech is not available in this browser.</strong>', 'warning');
      return;
    }

    const textSource = document.querySelector('main');
    if (!textSource) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textSource.innerText);
    utterance.lang = prefs.language === 'ne' ? 'ne-NP' : 'en-US';
    utterance.rate = prefs.readingLevelMode ? 0.92 : 1;
    window.speechSynthesis.speak(utterance);
  });

  stopButton.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  });
}

function initAccessibilityCenterForm() {
  const form = document.getElementById('accessibilityForm');
  if (!form) return;

  const languageSelect = document.getElementById('languageSelect');
  const readingLevelToggle = document.getElementById('readingLevelToggle');
  const dyslexiaToggle = document.getElementById('dyslexiaToggle');
  const resetButton = document.getElementById('accessibilityResetBtn');

  const syncFormWithPrefs = (prefs) => {
    if (languageSelect) languageSelect.value = prefs.language;
    if (readingLevelToggle) readingLevelToggle.checked = Boolean(prefs.readingLevelMode);
    if (dyslexiaToggle) dyslexiaToggle.checked = Boolean(prefs.dyslexiaFriendlyMode);
  };

  const initialPrefs = getAccessibilityPrefs();
  syncFormWithPrefs(initialPrefs);
  initTextToSpeechControl(initialPrefs);

  if (languageSelect) {
    languageSelect.addEventListener('change', () => {
      const nextPrefs = {
        ...getAccessibilityPrefs(),
        language: languageSelect.value,
      };
      saveAccessibilityPrefs(nextPrefs);
      applyAccessibilityPrefs(nextPrefs);
      showToast('<strong>Language updated.</strong>', 'info');
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextPrefs = {
      language: languageSelect ? languageSelect.value : 'en',
      readingLevelMode: Boolean(readingLevelToggle?.checked),
      dyslexiaFriendlyMode: Boolean(dyslexiaToggle?.checked),
    };
    saveAccessibilityPrefs(nextPrefs);
    applyAccessibilityPrefs(nextPrefs);
    showToast('<strong>Accessibility preferences saved.</strong>', 'success');
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      const defaults = getDefaultAccessibilityPrefs();
      saveAccessibilityPrefs(defaults);
      syncFormWithPrefs(defaults);
      applyAccessibilityPrefs(defaults);
      showToast('<strong>Accessibility preferences reset.</strong>', 'secondary');
    });
  }
}

// Form validation
document.addEventListener('DOMContentLoaded', () => {
  const accessibilityPrefs = getAccessibilityPrefs();
  applyAccessibilityPrefs(accessibilityPrefs);

  initPasswordToggles();
  initLessonSidebarControls();
  initAccessibilityCenterForm();

  // Add smooth scrolling for lesson links
  const lessonLinks = document.querySelectorAll('.lesson-item');
  lessonLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        lessonLinks.forEach((l) => l.classList.remove('active-lesson'));
        link.classList.add('active-lesson');
      }
    });
  });

  // Quiz validation
  const quizForm = document.getElementById('quizForm');
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      const questions = quizForm.querySelectorAll('.quiz-question');
      let allAnswered = true;

      questions.forEach((q) => {
        const checked = q.querySelector('input[type="radio"]:checked');
        if (!checked) {
          allAnswered = false;
          q.style.borderLeft = '4px solid var(--danger)';
        } else {
          q.style.borderLeft = 'none';
        }
      });

      if (!allAnswered) {
        e.preventDefault();
        showToast('<strong>Please answer all questions</strong> before submitting.', 'warning');
      }
    });
  }

  // Password strength indicator for registration only
  const registerForm = document.querySelector('form[action="/auth/register"]');
  const passwordInput = registerForm
    ? registerForm.querySelector('input[name="password"]')
    : null;
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      const strength = getPasswordStrength(e.target.value);
      updatePasswordStrengthUI(strength);
    });
  }
});

// Password strength check
function getPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  return Math.min(strength, 5);
}

function updatePasswordStrengthUI(strength) {
  const input = document.getElementById('password');
  const parent = input.closest('.password-field-wrapper') || input.parentElement;

  // Remove existing strength indicator
  const existingIndicator = parent.querySelector('.password-strength');
  if (existingIndicator) existingIndicator.remove();

  // Add new indicator
  const indicator = document.createElement('div');
  indicator.className = 'password-strength mt-2';

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['danger', 'warning', 'info', 'primary', 'success', 'success'];

  if (input.value) {
    indicator.innerHTML = `<small class="text-${colors[strength - 1]}"><strong>Strength: ${labels[strength - 1]}</strong></small>`;
    parent.appendChild(indicator);
  }
}

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const inputId = button.getAttribute('data-toggle-password');
      const input = document.getElementById(inputId);

      if (!input) return;

      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';

      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-eye', showing);
        icon.classList.toggle('bi-eye-slash', !showing);
      }

      button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      button.setAttribute('aria-pressed', (!showing).toString());
    });
  });
}

function initLessonSidebarControls() {
  const lessonList = document.querySelector('.lesson-list');
  if (!lessonList) return;

  const jumpSelect = document.getElementById('lessonJump');
  if (jumpSelect) {
    jumpSelect.addEventListener('change', (e) => {
      const targetId = e.target.value;
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const scrollButtons = document.querySelectorAll('.lesson-scroll-btn');
  scrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.getAttribute('data-scroll-direction');
      const amount = direction === 'up' ? -220 : 220;
      lessonList.scrollBy({ top: amount, behavior: 'smooth' });
    });
  });
}

// Show loading state during form submission
document.addEventListener('submit', (e) => {
  const button = e.target.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
  }
});

// Toast notifications (optional)
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} shadow position-fixed bottom-0 end-0 m-3`;
  toast.style.zIndex = 1080;
  toast.innerHTML = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
