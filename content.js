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
      // If chat container is not found, retry after a short delay
      setTimeout(waitForChat, 1000);
    }
    return;
  }
  
  // Reset attempts counter on successful initialization
  initializationAttempts = 0;
  
  // Initialize everything once chat is ready
  initializeNavigator();
}

function initializeNavigator() {
  const navigator = createNavigatorUI();
  updateQuestionsList();

  // Observe for changes in the chat
  const observer = new MutationObserver(() => {
    updateQuestionsList();
  });

  // Observe the main chat container instead of body
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
  
  // Create and append toggle button to body
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'question-navigator-toggle-container';
  
  const toggle = document.createElement('button');
  toggle.className = 'question-navigator-toggle';
  toggle.textContent = 'BMQ';
  
  toggleContainer.appendChild(toggle);
  document.body.appendChild(toggleContainer);

  const toggleNavigator = () => {
    isNavigatorVisible = !isNavigatorVisible;
    navigator.style.transform = isNavigatorVisible ? 'translateX(0)' : 'translateX(calc(100% + 20px))';
  };

  // Add keyboard shortcut listener
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault(); // Prevent default browser behavior
      toggleNavigator();
    }
  });

  toggle.onclick = toggleNavigator;

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
  // Update selector to match ChatGPT's current structure
  const humanMessages = document.querySelectorAll('[data-message-author-role="user"]');
  const questionsList = document.getElementById('questionsList');
  
  if (!questionsList) return;
  questions = [];
  questionsList.innerHTML = '';

  humanMessages.forEach((message, index) => {
    const text = message.textContent.trim();
    if (!text) return; // Skip empty messages
    
    questions.push({
      text,
      element: message
    });

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.textContent = text;
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

// Initialize theme handling
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

// Watch for theme changes
const themeObserver = new MutationObserver(updateTheme);
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

// Initial theme setup
updateTheme();

// Function to handle URL changes
function handleUrlChange() {
  // Reset and reinitialize when URL changes
  const existingNavigator = document.querySelector('.question-navigator-card');
  const existingToggle = document.querySelector('.question-navigator-toggle');
  
  if (existingNavigator) {
    existingNavigator.remove();
  }
  if (existingToggle) {
    existingToggle.parentElement?.remove();
  }
  
  // Reset attempts counter
  initializationAttempts = 0;
  
  // Start fresh initialization
  waitForChat();
}

// Watch for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    handleUrlChange();
  }
}).observe(document, { subtree: true, childList: true });

// Start the initialization process
waitForChat();

// Re-run initialization when the document body changes significantly
const bodyObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.removedNodes.length > 0) {
      // Check if our navigator was removed
      const navigatorExists = document.querySelector('.question-navigator-card');
      const toggleExists = document.querySelector('.question-navigator-toggle');
      
      if (!navigatorExists || !toggleExists) {
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