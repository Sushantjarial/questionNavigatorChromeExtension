let questions = [];
let isNavigatorVisible = true;
let initializationAttempts = 0;
const MAX_ATTEMPTS = 10;

// Wait for the chat interface to be ready
function waitForChat() {
  const chatContainer = document.querySelector('main');
  const chatHeader = document.querySelector('main > div > div');
  
  if (!chatContainer || !chatHeader) {
    initializationAttempts++;
    if (initializationAttempts < MAX_ATTEMPTS) {
      setTimeout(waitForChat, 1000);
    }
    return;
  }
  
  initializationAttempts = 0;
  initializeNavigator();
}

function initializeNavigator() {
  const navigator = createNavigatorUI();
  updateQuestionsList();

  const observer = new MutationObserver(() => {
    updateQuestionsList();
  });

  const chatContainer = document.querySelector('main');
  if (chatContainer) {
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
  }
}

function createNavigatorUI() {
  const navigator = document.createElement('div');
  navigator.className = 'question-navigator-card';
  navigator.style.top = '100px';
  
  const toggleNavigator = () => {
    isNavigatorVisible = !isNavigatorVisible;
    navigator.style.transform = isNavigatorVisible ? 'translateX(0)' : 'translateX(calc(100% + 20px))';
  };

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleNavigator();
    }
  });

  navigator.innerHTML = `
    <div class="question-navigator-header">
      <h3 class="question-navigator-title">Questions Asked</h3>
    </div>
    <div class="question-navigator-content" id="questionsList"></div>
  `;

  document.body.appendChild(navigator);
  return navigator;
}

function updateQuestionsList() {
  const humanMessages = document.querySelectorAll('[data-message-author-role="user"]');
  const questionsList = document.getElementById('questionsList');
  
  if (!questionsList) return;
  questions = [];
  questionsList.innerHTML = '';

  humanMessages.forEach((message, index) => {
    const text = message.textContent.trim();
    if (!text) return;
    
    questions.push({
      text,
      element: message
    });

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.textContent = text;
    questionDiv.style.marginBottom = '10px';
    questionDiv.style.paddingBottom = '10px';
    questionDiv.style.borderBottom = '1px solid #ccc';
    questionDiv.onclick = () => {
      document.querySelectorAll('.question-item').forEach(q => q.classList.remove('active'));
      questionDiv.classList.add('active');
      
      message.scrollIntoView({ behavior: 'smooth', block: 'center' });
      message.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
      setTimeout(() => {
        message.style.backgroundColor = '';
      }, 2000);
    };

    questionsList.appendChild(questionDiv);
  });
}

function updateTheme() {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const root = document.documentElement;
  
  if (isDarkMode) {
    root.style.setProperty('--surface-primary', '#202123');
    root.style.setProperty('--surface-secondary', '#343541');
    root.style.setProperty('--surface-tertiary', '#40414F');
    root.style.setProperty('--text-primary', '#FFFFFF');
  } else {
    root.style.setProperty('--surface-primary', '#FFFFFF');
    root.style.setProperty('--surface-secondary', '#F7F7F8');
    root.style.setProperty('--surface-tertiary', '#F0F0F1');
    root.style.setProperty('--text-primary', '#2D2D2D');
  }
}

const themeObserver = new MutationObserver(updateTheme);
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

updateTheme();

function handleUrlChange() {
  const existingNavigator = document.querySelector('.question-navigator-card');
  if (existingNavigator) {
    existingNavigator.remove();
  }
  
  initializationAttempts = 0;
  waitForChat();
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    handleUrlChange();
  }
}).observe(document, { subtree: true, childList: true });

waitForChat();

const bodyObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.removedNodes.length > 0) {
      const navigatorExists = document.querySelector('.question-navigator-card');
      if (!navigatorExists) {
        handleUrlChange();
        break;
      }
    }
  }
});

bodyObserver.observe(document.body, {
  childList: true,
  subtree: true
});
