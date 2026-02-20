// Civic Education Nepal - Client-side Scripts

// Form validation
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLessonSidebarControls();

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

  // Password strength indicator for registration
  const passwordInput = document.getElementById('password');
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
