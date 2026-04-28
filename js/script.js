// Grade 12 Quiz App - Main JavaScript File

class QuizApp {
    constructor() {
        this.currentSubject = null;
        this.userProgress = this.loadProgress();
        this.init();
    }

    init() {
        this.loadTheme(); // Load theme first
        this.setupEventListeners();
        this.addAnimations();
    }

    setupEventListeners() {
        // Subject card click handlers
        const subjectCards = document.querySelectorAll('.subject-card');
        subjectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger navigation if clicking video button
                if (e.target.closest('.video-btn')) {
                    return;
                }
                
                const subject = card.dataset.subject;
                this.selectSubject(subject);
            });

            // Add hover sound effect (optional)
            card.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });

        // Video button click handlers
        const videoButtons = document.querySelectorAll('.video-btn');
        videoButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
            });
        });

        // Consolidated keyboard event handler
        document.addEventListener('keydown', (e) => {
            // Close video modal with Escape key
            if (e.key === 'Escape') {
                const modal = document.getElementById('videoModal');
                if (modal && modal.classList.contains('active')) {
                    this.closeVideo();
                    return;
                }
            }
            
            // Handle other keyboard navigation
            this.handleKeyboardNavigation(e);
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    selectSubject(subject) {
        this.currentSubject = subject;
        
        // Add selection animation
        const selectedCard = document.querySelector(`[data-subject="${subject}"]`);
        this.animateCardSelection(selectedCard);
        
        // Navigate to subject page
        setTimeout(() => {
            // Convert subject data-attribute to proper filename
            const subjectPageMap = {
                'work-immersion': 'Work-Immersion.html',
                'general-chemistry': 'General-Chemistry.html',
                'contemporary-arts': 'Contemporary-Arts.html',
                'empowerment-technologies': 'Empowerment-Technologies.html',
                'general-mathematics': 'General-Mathematics.html',
                'physical-education': 'Physical-Education.html',
                'e-tech': 'E-Tech.html',
                'general-math': 'General-Math.html',
                'pe-health': 'PE-Health.html',
                'general-physics': 'General-Physics.html',
                'philosophy': 'Philosophy.html',
                'basic-calculus': 'Basic-Calculus.html',
                'filipino': 'Filipino.html',
                'general-biology': 'General-Biology.html'
            };
            
            const pageUrl = subjectPageMap[subject];
            if (pageUrl) {
                window.location.href = pageUrl;
            } else {
                this.showComingSoonModal(subject);
            }
        }, 300);
    }

    showComingSoonModal(subject) {
        const subjectNames = {
            'work-immersion': 'Work Immersion',
            'general-chemistry': 'General Chemistry 1',
            'contemporary-arts': 'Contemporary Arts',
            'empowerment-technologies': 'Empowerment Technologies',
            'general-mathematics': 'General Mathematics',
            'physical-education': 'Physical Education',
            'e-tech': 'E-Tech',
            'general-math': 'General Math',
            'pe-health': 'PE & Health 3',
            'general-physics': 'General Physics 1',
            'philosophy': 'Philosophy',
            'basic-calculus': 'Basic Calculus',
            'filipino': 'Filipino',
            'general-biology': 'General Biology'
        };

        const modal = this.createComingSoonModal(subjectNames[subject] || subject);
        document.body.appendChild(modal);
        
        // Animate modal appearance
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    createComingSoonModal(subjectName) {
        const modal = document.createElement('div');
        modal.className = 'quiz-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-clock"></i> ${subjectName}</h3>
                    <button class="close-btn" onclick="this.closest('.quiz-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="coming-soon-content">
                        <i class="fas fa-hourglass-half"></i>
                        <h4>Coming Soon!</h4>
                        <p>This quiz will be available soon. Please check back later!</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.quiz-modal').remove()">
                        <i class="fas fa-check"></i> Got it!
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    showLoadingScreen() {
        const loading = document.createElement('div');
        loading.className = 'loading-screen';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Preparing your quiz...</h3>
                <p>Loading questions and setting up the environment</p>
            </div>
        `;
        document.body.appendChild(loading);
    }

    hideLoadingScreen() {
        const loading = document.querySelector('.loading-screen');
        if (loading) {
            loading.classList.add('fade-out');
            setTimeout(() => loading.remove(), 300);
        }
    }

    animateCardSelection(card) {
        card.style.transform = 'scale(0.95)';
        card.style.transition = 'all 0.15s ease';
        
        setTimeout(() => {
            card.style.transform = 'scale(1.02)';
        }, 150);
        
        setTimeout(() => {
            card.style.transform = '';
        }, 300);
    }

    addAnimations() {
        // Add fade-in animation to elements on load
        const animateElements = document.querySelectorAll('.subject-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, {
            threshold: 0.1
        });

        animateElements.forEach(el => observer.observe(el));
    }

    handleKeyboardNavigation(e) {
        const subjectCards = document.querySelectorAll('.subject-card');
        let currentIndex = Array.from(subjectCards).findIndex(card => 
            card.classList.contains('keyboard-focus')
        );

        switch(e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % subjectCards.length;
                this.updateKeyboardFocus(subjectCards, currentIndex);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? subjectCards.length - 1 : currentIndex - 1;
                this.updateKeyboardFocus(subjectCards, currentIndex);
                break;
            case 'Enter':
                e.preventDefault();
                const focusedCard = document.querySelector('.subject-card.keyboard-focus');
                if (focusedCard) {
                    focusedCard.click();
                }
                break;
        }
    }

    updateKeyboardFocus(cards, index) {
        cards.forEach(card => card.classList.remove('keyboard-focus'));
        cards[index].classList.add('keyboard-focus');
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    handleResize() {
        // Responsive adjustments
        const isMobile = window.innerWidth <= 768;
        const subjectsGrid = document.querySelector('.subjects-grid');
        
        if (isMobile) {
            if (window.innerWidth <= 480) {
                subjectsGrid.style.gridTemplateColumns = '1fr';
            } else {
                subjectsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            }
        } else {
            subjectsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }

    playHoverSound() {
        // Optional: Add subtle hover sound
        // This would require audio files
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEeBDOH0fPTgjMGHm7A7+OZSI0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwOUarm7rdkGgU2kNjzzn4wBSF1xe/eizEIHm3A7eSaRY0PVqzl8LNfGgc9ltvyxXkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0OVqzl8LRfGgc9lNnxxHkpBSh+zPDaizsIGGS56+mjUwwOUarm7rVmGgU2kNjyynwvBSJ0xe7fiTUIH23A7eSaSo0O');
        } catch (e) {
            // Silently ignore if audio is not supported
        }
    }

    loadProgress() {
        const saved = localStorage.getItem('quizAppProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            quizzesCompleted: 0,
            totalScore: 0,
            studyStreak: 0,
            completedSubjects: [],
            lastActivity: null
        };
    }

    saveProgress() {
        this.userProgress.lastActivity = new Date().toISOString();
        localStorage.setItem('quizAppProgress', JSON.stringify(this.userProgress));
    }

    // Theme management
    toggleTheme() {
        const currentThemePreference = localStorage.getItem('theme') || 'auto';
        let newThemePreference;
        
        // Cycle through: auto -> light -> dark -> auto
        if (currentThemePreference === 'auto') {
            newThemePreference = 'light';
        } else if (currentThemePreference === 'light') {
            newThemePreference = 'dark';
        } else {
            newThemePreference = 'auto';
        }
        
        localStorage.setItem('theme', newThemePreference);
        this.applyTheme();
        
        // Add a subtle animation when toggling
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    }

    loadTheme() {
        // Set default to auto if no preference is saved
        const savedTheme = localStorage.getItem('theme') || 'auto';
        if (savedTheme !== 'auto' && savedTheme !== 'light' && savedTheme !== 'dark') {
            localStorage.setItem('theme', 'auto');
        }
        
        this.applyTheme();
        
        // Listen for system theme changes
        this.systemThemeListener = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemThemeListener.addEventListener('change', () => {
            if (localStorage.getItem('theme') === 'auto') {
                this.applyTheme();
            }
        });
    }

    applyTheme() {
        const themePreference = localStorage.getItem('theme') || 'auto';
        let actualTheme;
        
        if (themePreference === 'auto') {
            // Follow system preference
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            // Use manual preference
            actualTheme = themePreference;
        }
        
        document.documentElement.setAttribute('data-theme', actualTheme);
        this.updateThemeIcon(themePreference, actualTheme);
    }

    updateThemeIcon(themePreference, actualTheme) {
        // Update both fixed and navbar theme toggles
        const themeToggles = document.querySelectorAll('.theme-toggle, .theme-toggle-nav');
        
        themeToggles.forEach(themeToggle => {
            const moonIcon = themeToggle.querySelector('.fa-moon');
            const sunIcon = themeToggle.querySelector('.fa-sun');
            
            if (!themeToggle || !moonIcon || !sunIcon) {
                return; // Skip this button if elements are missing
            }
            
            try {
                // Update button title to show current mode
                let title;
                if (themePreference === 'auto') {
                    title = `Auto (${actualTheme === 'dark' ? 'Dark' : 'Light'}) - Click for Light mode`;
                } else if (themePreference === 'light') {
                    title = 'Light mode - Click for Dark mode';
                } else {
                    title = 'Dark mode - Click for Auto mode';
                }
                themeToggle.setAttribute('aria-label', title);
                themeToggle.title = title;
                
                // Show appropriate icon based on actual theme
                if (actualTheme === 'dark') {
                    moonIcon.style.display = 'none';
                    sunIcon.style.display = 'inline-block';
                } else {
                    moonIcon.style.display = 'inline-block';
                    sunIcon.style.display = 'none';
                }
                
                // Add visual indicator for auto mode
                if (themePreference === 'auto') {
                    themeToggle.classList.add('auto-mode');
                } else {
                    themeToggle.classList.remove('auto-mode');
                }
            } catch (error) {
                console.error('Error updating theme icon:', error);
            }
        });
    }

    // Study reminder
    checkStudyReminder() {
        const lastActivity = new Date(this.userProgress.lastActivity);
        const now = new Date();
        const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastActivity >= 3) {
            this.showStudyReminder();
        }
    }

    showStudyReminder() {
        const reminder = document.createElement('div');
        reminder.className = 'study-reminder';
        reminder.innerHTML = `
            <div class="reminder-content">
                <i class="fas fa-bell"></i>
                <h4>Time to Study!</h4>
                <p>You haven't practiced in a while. Keep your streak going!</p>
                <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;
        document.body.appendChild(reminder);
    }

    // Video functionality
    playVideo(videoPath, title) {
        const modal = document.getElementById('videoModal');
        const video = document.getElementById('modalVideo');
        const videoSource = document.getElementById('videoSource');
        const videoTitle = document.getElementById('videoTitle');
        
        // Set video source and title
        videoSource.src = videoPath;
        video.load(); // Reload the video element
        videoTitle.textContent = title;
        
        // Show modal
        modal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Auto play video (if allowed by browser)
        video.play().catch(e => {
            console.log('Auto-play prevented:', e);
        });

        // Handle video load error
        video.addEventListener('error', () => {
            this.showVideoError(title);
        });
    }

    closeVideo() {
        const modal = document.getElementById('videoModal');
        const video = document.getElementById('modalVideo');
        
        // Hide modal
        modal.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Pause and reset video
        video.pause();
        video.currentTime = 0;
    }

    showVideoError(title) {
        const modal = document.getElementById('videoModal');
        const videoContainer = modal.querySelector('.video-container');
        
        videoContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #f59e0b;"></i>
                <h3 style="margin: 0 0 0.5rem 0;">Video Not Found</h3>
                <p style="text-align: center; margin: 0;">The video for ${title} is not available.<br>Please check if the video file exists.</p>
            </div>
        `;
    }
}

// Add additional CSS for new elements
const additionalCSS = `
.quiz-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.quiz-modal.show {
    opacity: 1;
    visibility: visible;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #374151;
}

.modal-body {
    padding: 1.5rem;
}

.quiz-info {
    margin-bottom: 1.5rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    color: #6b7280;
}

.info-item i {
    color: #667eea;
    width: 1rem;
}

.difficulty-selection h4 {
    margin-bottom: 1rem;
    color: #374151;
}

.difficulty-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.difficulty-btn {
    flex: 1;
    min-width: 80px;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
}

.difficulty-btn.easy {
    color: #059669;
}

.difficulty-btn.medium {
    color: #d97706;
}

.difficulty-btn.hard {
    color: #dc2626;
}

.difficulty-btn.selected {
    border-color: currentColor;
    background: currentColor;
    color: white;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-secondary, .btn-primary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.loading-content {
    text-align: center;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-screen.fade-out {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.keyboard-focus {
    outline: 2px solid #667eea !important;
    outline-offset: 2px;
}

.study-reminder {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
    max-width: 300px;
    border-left: 4px solid #667eea;
}

.reminder-content {
    text-align: center;
}

.reminder-content i {
    color: #667eea;
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.reminder-content h4 {
    margin: 0 0 0.5rem 0;
    color: #374151;
}

.reminder-content p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
}

.reminder-content button {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.reminder-content button:hover {
    background: #5a67d8;
}
`;

// Add the additional CSS to the page
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Global theme toggle function
function toggleTheme() {
    if (typeof quizApp !== 'undefined' && quizApp) {
        quizApp.toggleTheme();
    } else {
        // Fallback if quizApp is not ready
        console.warn('QuizApp not initialized yet, using fallback theme toggle');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
}

// Initialize the app when DOM is ready
let quizApp;

document.addEventListener('DOMContentLoaded', () => {
    quizApp = new QuizApp();
    
    // Add welcome animation for the grid layout
    setTimeout(() => {
        document.querySelectorAll('.subject-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px) scale(0.9)';
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, 100);
            }, index * 100);
        });
    }, 300);
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
