/**
 * Quiz System - Complete Quiz Management for Grade 12 Reviewer
 * Handles multi-subject quizzes with theme system, MathJax integration, and progress tracking
 */

class QuizSystem {
    constructor() {
        // Core quiz state
        this.currentSubject = this.detectCurrentSubject();
        this.questions = this.loadQuestionsForSubject(this.currentSubject);

        // Defensive checks: ensure questions is a valid non-empty array
        if (!Array.isArray(this.questions) || this.questions.length === 0) {
            console.error(`QuizSystem: No questions found for subject '${this.currentSubject}'.`, this.questions);
            // Attempt to fallback to workImmersionQuestions if available
            if (typeof workImmersionQuestions !== 'undefined' && Array.isArray(workImmersionQuestions)) {
                console.warn('QuizSystem: Falling back to workImmersionQuestions to avoid blank UI.');
                this.questions = workImmersionQuestions;
                this.currentSubject = 'work-immersion';
            } else {
                // As a last resort, set an empty array and error out later
                this.questions = [];
            }
        }
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.revealedAnswers = new Array(this.questions.length).fill(false);
        this.bookmarkedQuestions = new Array(this.questions.length).fill(false);
        
        // Selection and submission state
        this.selectedOption = null;
        this.justSubmitted = false;
        this.explanationAnimating = false;
        
        // Quiz timing and completion
        this.startTime = new Date();
        this.endTime = null;
        this.isCompleted = false;
        
        // Shuffle answer choices for randomization
        this.shuffledQuestions = this.shuffleAllAnswerChoices();
        
        // Initialize the quiz
        this.initializeQuiz();
        this.loadTheme();
    }

    /**
     * Detect which subject quiz is currently running based on the page URL
     */
    detectCurrentSubject() {
        const currentPage = window.location.pathname.split('/').pop();
        const subjectMap = {
            'Work-Immersion.html': 'work-immersion',
            'General-Chemistry.html': 'general-chemistry',
            'Contemporary-Arts.html': 'contemporary-arts',
            'Empowerment-Technologies.html': 'empowerment-technologies',
            'General-Mathematics.html': 'general-mathematics',
            'Physical-Education.html': 'physical-education',
            'General-Physics.html': 'general-physics',
            'Philosophy.html': 'philosophy',
            'Basic-Calculus.html': 'basic-calculus',
            'Filipino.html': 'filipino',
            'General-Biology.html': 'general-biology'
        };
        return subjectMap[currentPage] || 'work-immersion';
    }

    /**
     * Load questions for the detected subject
     */
    loadQuestionsForSubject(subject) {
        const questionMap = {
            'work-immersion': workImmersionQuestions,
            'general-chemistry': generalChemistryQuestions,
            'contemporary-arts': contemporaryArtsQuestions,
            'empowerment-technologies': empowermentTechnologiesQuestions,
            'general-mathematics': generalMathematicsQuestions,
            'physical-education': physicalEducationQuestions,
            'general-physics': generalPhysicsQuestions,
            'philosophy': philosophyQuestions,
            'basic-calculus': basicCalculusQuestions,
            'filipino': filipinoQuestions,
            'general-biology': generalBiologyQuestions
        };
        return questionMap[subject] || workImmersionQuestions;
    }

    /**
     * Shuffle answer choices for all questions to prevent memorization
     */
    shuffleAllAnswerChoices() {
        return this.questions.map(question => {
            // Create array of options with their original indices
            const optionsWithIndices = question.options.map((option, index) => ({
                text: option,
                originalIndex: index
            }));
            
            // Shuffle the options
            const shuffledOptions = this.shuffleArray([...optionsWithIndices]);
            
            // Find new position of correct answer
            const newCorrectIndex = shuffledOptions.findIndex(
                option => option.originalIndex === question.correct
            );
            
            return {
                ...question,
                options: shuffledOptions.map(option => option.text),
                correct: newCorrectIndex,
                originalCorrect: question.correct,
                optionMapping: shuffledOptions.map(option => option.originalIndex)
            };
        });
    }

    /**
     * Fisher-Yates shuffle algorithm
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Initialize quiz UI and state
     */
    initializeQuiz() {
        this.updateTotalQuestions();
        if (!this.shuffledQuestions || this.shuffledQuestions.length === 0) {
            console.error('QuizSystem: No questions available to initialize the quiz UI.');
            const questionTextEl = document.getElementById('question-text');
            if (questionTextEl) {
                questionTextEl.innerHTML = 'No questions available for this subject.';
            }
            const optionsContainer = document.getElementById('options-container');
            if (optionsContainer) optionsContainer.innerHTML = '';
            return;
        }
        // Render the question selector (jump-to) UI
        try {
            this.renderQuestionSelector();
        } catch (err) {
            console.warn('Failed to render question selector:', err);
        }
        this.renderCurrentQuestion();
        this.updateProgress();
        this.updateSubmitButton();
    }

    /**
     * Theme System - Load and apply themes with auto-detection
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'auto';
        if (!['auto', 'light', 'dark'].includes(savedTheme)) {
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

    /**
     * Toggle between theme modes: auto -> light -> dark -> auto
     */
    toggleTheme() {
        const currentThemePreference = localStorage.getItem('theme') || 'auto';
        let newThemePreference;
        
        if (currentThemePreference === 'auto') {
            newThemePreference = 'light';
        } else if (currentThemePreference === 'light') {
            newThemePreference = 'dark';
        } else {
            newThemePreference = 'auto';
        }
        
        localStorage.setItem('theme', newThemePreference);
        this.applyTheme();
    }

    /**
     * Apply the selected theme to the document
     */
    applyTheme() {
        const themePreference = localStorage.getItem('theme') || 'auto';
        let actualTheme;
        
        if (themePreference === 'auto') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            actualTheme = themePreference;
        }
        
        document.documentElement.setAttribute('data-theme', actualTheme);
        this.updateThemeIcon(themePreference, actualTheme);
    }

    /**
     * Update theme toggle button icons and tooltips
     */
    updateThemeIcon(themePreference, actualTheme) {
        const themeToggles = document.querySelectorAll('.theme-toggle, .theme-toggle-nav');
        
        themeToggles.forEach(themeToggle => {
            const moonIcon = themeToggle.querySelector('.fa-moon');
            const sunIcon = themeToggle.querySelector('.fa-sun');
            
            if (!themeToggle || !moonIcon || !sunIcon) return;
            
            try {
                // Update button title
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
                
                // Show appropriate icon
                if (actualTheme === 'dark') {
                    moonIcon.style.display = 'none';
                    sunIcon.style.display = 'inline-block';
                } else {
                    moonIcon.style.display = 'inline-block';
                    sunIcon.style.display = 'none';
                }
                
                // Visual indicator for auto mode
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

    /**
     * Update total question count in UI
     */
    updateTotalQuestions() {
        const totalElements = document.querySelectorAll('#total-questions, #total-count');
        totalElements.forEach(element => {
            element.textContent = this.shuffledQuestions.length;
        });
    }

    /**
     * Render the current question and its options
     */
    renderCurrentQuestion() {
        // Safety checks
        if (!this.shuffledQuestions || this.currentQuestionIndex >= this.shuffledQuestions.length) {
            console.error('Invalid question state');
            return;
        }
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        if (!question || !question.question) {
            console.error('Invalid question object:', question);
            return;
        }
        
        // Clear previous explanation
        this.clearExplanation();
        
        // Update question display
        document.getElementById('question-num').textContent = `Question ${this.currentQuestionIndex + 1}`;
        document.getElementById('question-text').innerHTML = question.question;
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;

        // Remove any previous question images
        const previousImages = document.querySelectorAll('.question-image');
        previousImages.forEach(imgEl => {
            if (imgEl && imgEl.parentNode) imgEl.parentNode.removeChild(imgEl);
        });

        // If the question includes an image, render it above the options
        // Supported properties on question object: `image` (string URL/path),
        // `imageAlt` (optional alt text), `imageCaption` (optional caption text)
        if (question.image) {
            try {
                const questionCard = document.querySelector('.question-card') || document.getElementById('question-container') || document.body;

                const figure = document.createElement('figure');
                figure.className = 'question-image';

                const img = document.createElement('img');
                img.src = question.image;
                img.alt = question.imageAlt || `Question ${this.currentQuestionIndex + 1} image`;
                img.loading = 'lazy';
                img.className = 'question-image-img';

                figure.appendChild(img);

                if (question.imageCaption) {
                    const figcap = document.createElement('figcaption');
                    figcap.className = 'question-image-caption';
                    figcap.textContent = question.imageCaption;
                    figure.appendChild(figcap);
                }

                // Insert the image figure after the question text if possible
                const questionTextEl = document.getElementById('question-text');
                if (questionTextEl && questionTextEl.parentNode) {
                    questionTextEl.parentNode.insertBefore(figure, questionTextEl.nextSibling);
                } else {
                    questionCard.insertBefore(figure, questionCard.firstChild);
                }
            } catch (err) {
                console.error('Error rendering question image:', err);
            }
        }
        
        // Add or update bookmark button
        this.renderBookmarkButton();
        
        // Render answer options
        this.renderOptions(question);
        
        // Setup question state based on previous answers
        this.setupQuestionState();
        
        // Render mathematical expressions with a slight delay to ensure DOM is ready
        setTimeout(() => {
            this.renderMathJax();
        }, 50);
    }

    /**
     * Setup question state based on whether it was previously answered
     */
    setupQuestionState() {
        const isAnswered = this.userAnswers[this.currentQuestionIndex] !== null;
        const isRevealed = this.revealedAnswers[this.currentQuestionIndex];
        
        if (isAnswered && isRevealed) {
            // Question completed - show results
            this.selectedOption = null;
            this.showAnswerResults();
            this.displayCompletedExplanation();
        } else if (isAnswered && !isRevealed) {
            // Question answered but not revealed (edge case)
            this.selectedOption = this.userAnswers[this.currentQuestionIndex];
            this.updateVisualSelection();
        } else {
            // Fresh question
            this.selectedOption = null;
            this.explanationAnimating = false;
        }
        
        this.updateSubmitButton();
    }

    /**
     * Update visual selection of answer options
     */
    updateVisualSelection() {
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach((button, index) => {
            if (index === this.selectedOption) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    /**
     * Display explanation for already completed questions
     */
    displayCompletedExplanation() {
        const currentQuestion = this.shuffledQuestions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers[this.currentQuestionIndex];
        const correctAnswer = currentQuestion.correct;
        const isCorrect = userAnswer === correctAnswer;
        
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'question-explanation';
        
        const questionCard = document.querySelector('.question-card');
        if (!questionCard) return;
        
        const resultIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
        const resultClass = isCorrect ? 'correct' : 'incorrect';
        const resultText = isCorrect ? 'Correct!' : 'Incorrect';
        
        explanationDiv.innerHTML = `
            <div class="answer-result ${resultClass}">
                <i class="fas ${resultIcon}"></i>
                <span>${resultText}</span>
            </div>
            <div class="explanation-content">
                <h4><i class="fas fa-lightbulb"></i> Explanation:</h4>
                <p>${currentQuestion.explanation}</p>
            </div>
        `;
        
        questionCard.appendChild(explanationDiv);
        this.renderMathJax();
    }

    /**
     * Render mathematical expressions using MathJax
     */
    renderMathJax(retryCount = 0) {
        const maxRetries = 10;
        
        console.log('Attempting to render MathJax, retry count:', retryCount);
        
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            console.log('MathJax v3 detected, processing elements...');
            
            // Use a timeout to ensure DOM is fully updated
            setTimeout(() => {
                const elementsToRender = [];
                
                const questionElement = document.getElementById('question-text');
                const optionsElement = document.getElementById('options-container');
                const explanationElement = document.querySelector('.explanation-content');
                
                if (questionElement) elementsToRender.push(questionElement);
                if (optionsElement) elementsToRender.push(optionsElement);
                if (explanationElement) elementsToRender.push(explanationElement);
                
                console.log('Elements to render:', elementsToRender.length);
                
                if (elementsToRender.length > 0) {
                    MathJax.typesetPromise(elementsToRender).then(() => {
                        console.log('MathJax rendering completed successfully');
                    }).catch((err) => {
                        console.error('MathJax v3 rendering error:', err);
                        if (retryCount < maxRetries) {
                            setTimeout(() => this.renderMathJax(retryCount + 1), 200);
                        }
                    });
                } else {
                    console.log('No elements found to render');
                    if (retryCount < maxRetries) {
                        setTimeout(() => this.renderMathJax(retryCount + 1), 100);
                    }
                }
            }, 50);
            
        } else if (typeof MathJax !== 'undefined' && MathJax.Hub) {
            console.log('MathJax v2 detected, using Hub...');
            // MathJax v2 fallback
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('question-text')]);
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('options-container')]);
            
            const explanationDiv = document.querySelector('.explanation-content');
            if (explanationDiv) {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, explanationDiv]);
            }
        } else {
            console.log('MathJax not ready, retrying...', retryCount);
            if (retryCount < maxRetries) {
                setTimeout(() => this.renderMathJax(retryCount + 1), 200);
            } else {
                console.error('MathJax failed to load after maximum retries');
            }
        }
    }

    /**
     * Render bookmark button for current question
     */
    renderBookmarkButton() {
        // Check if bookmark button already exists
        let bookmarkBtn = document.getElementById('bookmark-btn');
        
        if (!bookmarkBtn) {
            // Create bookmark button if it doesn't exist
            bookmarkBtn = document.createElement('button');
            bookmarkBtn.id = 'bookmark-btn';
            bookmarkBtn.className = 'bookmark-btn';
            bookmarkBtn.setAttribute('aria-label', 'Bookmark this question');
            
            // Find the question number element and add bookmark button after it
            const questionNum = document.getElementById('question-num');
            if (questionNum && questionNum.parentNode) {
                questionNum.parentNode.insertBefore(bookmarkBtn, questionNum.nextSibling);
            }
        }
        
        // Always attach/reattach the click event (for both new and existing buttons)
        bookmarkBtn.onclick = () => this.toggleBookmark();
        
        // Update bookmark button state
        const isBookmarked = this.bookmarkedQuestions[this.currentQuestionIndex];
        bookmarkBtn.innerHTML = `
            <i class="fa${isBookmarked ? 's' : 'r'} fa-bookmark"></i>
        `;
        bookmarkBtn.setAttribute('title', isBookmarked ? 'Remove bookmark' : 'Bookmark this question');
        
        // Update CSS classes
        if (isBookmarked) {
            bookmarkBtn.classList.add('bookmarked');
        } else {
            bookmarkBtn.classList.remove('bookmarked');
        }
    }

    /**
     * Toggle bookmark status for current question
     */
    toggleBookmark() {
        const currentIndex = this.currentQuestionIndex;
        this.bookmarkedQuestions[currentIndex] = !this.bookmarkedQuestions[currentIndex];
        
        // Update bookmark button visual state
        this.renderBookmarkButton();
        
        // Save progress with updated bookmarks
        this.saveProgress();
        
        // Show feedback
        const isBookmarked = this.bookmarkedQuestions[currentIndex];
        this.showBookmarkFeedback(isBookmarked);
    }

    /**
     * Show visual feedback when bookmark is toggled
     */
    showBookmarkFeedback(isBookmarked) {
        // Create feedback element if it doesn't exist
        let feedback = document.getElementById('bookmark-feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'bookmark-feedback';
            feedback.className = 'bookmark-feedback';
            document.body.appendChild(feedback);
        }
        
        // Update feedback content and show
        feedback.innerHTML = `
            <i class="fa${isBookmarked ? 's' : 'r'} fa-bookmark"></i>
            <span>Question ${isBookmarked ? 'bookmarked' : 'bookmark removed'}</span>
        `;
        
        feedback.className = `bookmark-feedback ${isBookmarked ? 'bookmark-added' : 'bookmark-removed'} show`;
        
        // Hide feedback after animation
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    }

    /**
     * Render answer option buttons
     */
    renderOptions(question) {
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-button';
            optionButton.onclick = () => this.selectOption(index);
            
            optionButton.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
            
            container.appendChild(optionButton);
        });
        
        // Trigger MathJax rendering specifically for options
        setTimeout(() => {
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise([container]).catch(err => {
                    console.error('MathJax options rendering error:', err);
                });
            }
        }, 10);
    }

    /**
     * Handle user selection of an answer option
     */
    selectOption(optionIndex) {
        console.log('selectOption called with index:', optionIndex);
        console.log('Current question index:', this.currentQuestionIndex);
        console.log('Question ID:', this.shuffledQuestions[this.currentQuestionIndex]?.id);
        
        // Prevent selection if question already answered and revealed
        if (this.userAnswers[this.currentQuestionIndex] !== null && 
            this.revealedAnswers[this.currentQuestionIndex]) {
            console.log('Selection prevented - question already answered and revealed');
            return;
        }
        
        // Store selection
        this.selectedOption = optionIndex;
        console.log('Selected option set to:', this.selectedOption);
        
        // Update visual selection
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach((button, index) => {
            if (index === optionIndex) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
        
        // Update submit button
        this.updateSubmitButton();
    }

    /**
     * Update submit/next button state and text
     */
    updateSubmitButton() {
        const nextBtn = document.getElementById('next-btn');
        const isAnswered = this.userAnswers[this.currentQuestionIndex] !== null;
        const isRevealed = this.revealedAnswers[this.currentQuestionIndex];
        const hasSelection = this.selectedOption !== null && this.selectedOption !== undefined;
        
        console.log('updateSubmitButton - Question:', this.currentQuestionIndex + 1);
        console.log('isAnswered:', isAnswered, 'isRevealed:', isRevealed, 'hasSelection:', hasSelection);
        console.log('selectedOption:', this.selectedOption);
        console.log('userAnswers[' + this.currentQuestionIndex + ']:', this.userAnswers[this.currentQuestionIndex]);
        console.log('revealedAnswers[' + this.currentQuestionIndex + ']:', this.revealedAnswers[this.currentQuestionIndex]);
        
        if (isAnswered && isRevealed) {
            // Question completed
            if (this.explanationAnimating) {
                nextBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> Reading Explanation...';
                nextBtn.disabled = true;
                nextBtn.onclick = null;
            } else {
                if (this.currentQuestionIndex === this.shuffledQuestions.length - 1) {
                    nextBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> Finish Quiz';
                    nextBtn.disabled = false;
                    nextBtn.onclick = () => this.finishQuiz();
                } else {
                    nextBtn.innerHTML = 'Next Question <i class="fas fa-chevron-right"></i>';
                    nextBtn.disabled = false;
                    nextBtn.onclick = () => this.moveToNextQuestion();
                }
            }
        } else if (hasSelection && !isAnswered) {
            // Ready to submit
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer';
            nextBtn.disabled = false;
            nextBtn.onclick = () => this.handleSubmitAnswer();
        } else {
            // No selection
            nextBtn.innerHTML = 'Select an Answer';
            nextBtn.disabled = true;
            nextBtn.onclick = null;
        }
    }

    /**
     * Handle answer submission
     */
    handleSubmitAnswer() {
        // Validate selection
        if (this.selectedOption === null || this.selectedOption === undefined) {
            return;
        }
        
        // Prevent double submission
        if (this.userAnswers[this.currentQuestionIndex] !== null) {
            return;
        }
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = this.selectedOption;
        this.revealedAnswers[this.currentQuestionIndex] = true;
        
        // Start explanation animation
        this.explanationAnimating = true;
        
        // Update button to processing state
        const nextBtn = document.getElementById('next-btn');
        nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        nextBtn.disabled = true;
        nextBtn.onclick = null;
        
        // Show results and explanation
        this.showAnswerResults();
        
        setTimeout(() => {
            this.displayExplanation();
        }, 1000);
    }

    /**
     * Show correct/incorrect answer results
     */
    showAnswerResults() {
        const currentQuestion = this.shuffledQuestions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers[this.currentQuestionIndex];
        const correctAnswer = currentQuestion.correct;
        
        const optionButtons = document.querySelectorAll('.option-button');
        
        optionButtons.forEach((button, index) => {
            // Disable all buttons
            button.disabled = true;
            button.style.cursor = 'not-allowed';
            
            // Remove previous states
            button.classList.remove('selected', 'correct-answer', 'incorrect-answer', 'user-correct');
            
            if (index === correctAnswer) {
                button.classList.add('correct-answer');
                if (index === userAnswer) {
                    button.classList.add('user-correct');
                }
            } else if (index === userAnswer) {
                button.classList.add('incorrect-answer');
            }
        });
    }

    /**
     * Display explanation with animation
     */
    displayExplanation() {
        const currentQuestion = this.shuffledQuestions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers[this.currentQuestionIndex];
        const correctAnswer = currentQuestion.correct;
        const isCorrect = userAnswer === correctAnswer;
        
        // Clear existing explanation
        this.clearExplanation();
        
        // Create explanation element
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'question-explanation';
        
        const questionCard = document.querySelector('.question-card');
        if (!questionCard) return;
        
        const resultIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
        const resultClass = isCorrect ? 'correct' : 'incorrect';
        const resultText = isCorrect ? 'Correct!' : 'Incorrect';
        
        explanationDiv.innerHTML = `
            <div class="answer-result ${resultClass}">
                <i class="fas ${resultIcon}"></i>
                <span>${resultText}</span>
            </div>
            <div class="explanation-content">
                <h4><i class="fas fa-lightbulb"></i> Explanation:</h4>
                <p>${currentQuestion.explanation}</p>
            </div>
        `;
        
        // Add with animation
        questionCard.appendChild(explanationDiv);
        
        explanationDiv.style.opacity = '0';
        explanationDiv.style.transform = 'translateY(20px)';
        explanationDiv.style.display = 'block';
        
        setTimeout(() => {
            explanationDiv.style.transition = 'all 0.5s ease';
            explanationDiv.style.opacity = '1';
            explanationDiv.style.transform = 'translateY(0)';
            
            // Render MathJax for explanation
            this.renderMathJax();
            
            // Enable next button after animation
            setTimeout(() => {
                this.explanationAnimating = false;
                this.updateSubmitButton();
                this.updateProgress();
            }, 600);
        }, 100);
    }

    /**
     * Move to the next question
     */
    moveToNextQuestion() {
        if (this.currentQuestionIndex < this.shuffledQuestions.length - 1) {
            // Clear current state
            this.selectedOption = null;
            this.explanationAnimating = false;
            this.clearExplanation();
            
            // Move to next question
            this.currentQuestionIndex++;
            
            // Render new question
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateSubmitButton();
        }
    }

    /**
     * Move to the previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            // Reset flags
            this.justSubmitted = false;
            this.explanationAnimating = false;
            
            this.currentQuestionIndex--;
            
            // Reset selection for unanswered questions
            if (this.userAnswers[this.currentQuestionIndex] === null) {
                this.selectedOption = null;
            }
            
            this.clearExplanation();
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateSubmitButton();
        }
    }

    /**
     * Clear explanation elements from the DOM
     */
    clearExplanation() {
        const explanationElements = document.querySelectorAll('.question-explanation');
        explanationElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        const answerResults = document.querySelectorAll('.answer-result');
        answerResults.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        const explanationContents = document.querySelectorAll('.explanation-content');
        explanationContents.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }

    /**
     * Update progress indicators
     */
    updateProgress() {
        const answered = this.userAnswers.filter(answer => answer !== null).length;
        const percentage = Math.round((this.currentQuestionIndex + 1) / this.shuffledQuestions.length * 100);
        
        // Update current question number
        const currentQuestionEl = document.getElementById('current-question');
        if (currentQuestionEl) {
            currentQuestionEl.textContent = this.currentQuestionIndex + 1;
        }
        
        // Update total questions
        const totalQuestionsEl = document.getElementById('total-questions');
        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = this.shuffledQuestions.length;
        }
        
        // Update percentage display
        const percentageTextEl = document.getElementById('progress-percent') || document.getElementById('progress-percentage');
        if (percentageTextEl) {
            percentageTextEl.textContent = `${percentage}%`;
        }
        
        // Update progress bar
        const progressFillEl = document.getElementById('progress-fill') || document.getElementById('progress-bar');
        if (progressFillEl) {
            progressFillEl.style.width = `${percentage}%`;
        }
        
        // Update progress glow
        const progressGlowEl = document.getElementById('progress-glow');
        if (progressGlowEl) {
            progressGlowEl.style.width = `${percentage}%`;
        }
        
        // Update circular progress ring
        const progressRingEl = document.getElementById('progress-ring');
        if (progressRingEl) {
            const circumference = 2 * Math.PI * 16;
            const offset = circumference - (percentage / 100) * circumference;
            progressRingEl.style.strokeDasharray = `${circumference} ${circumference}`;
            progressRingEl.style.strokeDashoffset = offset;
        }
        
        // Update answered count
        const answeredCountEl = document.getElementById('answered-count');
        if (answeredCountEl) {
            answeredCountEl.textContent = answered;
        }
        
        // Update previous button state
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }

        // Update question selector UI state if present
        try {
            this.updateQuestionSelectorState();
        } catch (err) {
            // ignore if selector not initialized yet
        }
    }

    /**
     * Render a question selector (grid of numbered buttons) to jump to any question
     */
    renderQuestionSelector() {
        const container = document.querySelector('.quiz-content');
        if (!container) return;

        const existingWrapper = document.getElementById('question-selector-wrapper');
        if (existingWrapper && existingWrapper.parentNode) existingWrapper.parentNode.removeChild(existingWrapper);

        // Wrapper contains the full selector and the compact toggle control
        const wrapper = document.createElement('div');
        wrapper.id = 'question-selector-wrapper';
        wrapper.className = 'question-selector-wrapper';

        // Full selector grid
        const selector = document.createElement('div');
        selector.id = 'question-selector';
        selector.className = 'question-selector';

        // Create buttons for each question
        this.shuffledQuestions.forEach((q, idx) => {
            const btn = document.createElement('button');
            btn.className = 'qsel-btn';
            btn.type = 'button';
            btn.setAttribute('data-index', idx);
            btn.setAttribute('aria-label', `Go to question ${idx + 1}`);
            btn.textContent = idx + 1;
            // Mark unanswered state initially
            if (this.userAnswers && this.userAnswers[idx] === null) {
                btn.classList.add('unanswered');
            }

            btn.addEventListener('click', (e) => {
                const i = parseInt(e.currentTarget.getAttribute('data-index'));
                if (!isNaN(i)) {
                    this.currentQuestionIndex = i;
                    this.selectedOption = this.userAnswers[i] !== null ? this.userAnswers[i] : null;
                    this.clearExplanation();
                    this.renderCurrentQuestion();
                    this.updateProgress();
                    this.updateSubmitButton();
                    // close popup after selection
                    if (this._qsel && this._qsel.popup) {
                        this._qsel.popup.classList.remove('open');
                        this._qsel.popup.style.display = 'none';
                    }
                }
            });

            selector.appendChild(btn);
        });

        // Compact floating toggle control
        const compact = document.createElement('button');
        compact.id = 'qsel-compact';
        compact.className = 'qsel-compact';
        compact.type = 'button';
        compact.setAttribute('aria-expanded', 'false');
        compact.addEventListener('click', () => {
            const isOpen = wrapper.classList.toggle('open');
            compact.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            // when opening, focus the first button for keyboard users
            if (isOpen) {
                const first = selector.querySelector('.qsel-btn');
                if (first) first.focus();
            }
        });

        // Text and caret inside compact control
        const compactText = document.createElement('span');
        compactText.className = 'qsel-compact-text';
        // Initialize with current question number to avoid a flash/missing text
        compactText.textContent = `Question ${this.currentQuestionIndex + 1}`;
        compact.appendChild(compactText);

        const compactCaret = document.createElement('span');
        compactCaret.className = 'qsel-compact-caret';
        compact.appendChild(compactCaret);

        // Accessibility / tooltip
        compact.title = `Jump to questions (current: ${this.currentQuestionIndex + 1})`;

        // Add header that displays the current question preview when opened (kept hidden)
        const header = document.createElement('div');
        header.className = 'qsel-header';
        header.setAttribute('aria-hidden', 'true');
        header.textContent = '';

        // Assemble wrapper: header and compact control only (the selector grid will be a floating popup)
        wrapper.appendChild(header);
        wrapper.appendChild(compact);

        // Create floating popup (appended to body) to host the selector grid
        const popup = document.createElement('div');
        popup.id = 'question-selector-popup';
        popup.className = 'question-selector-popup';
        popup.appendChild(selector);
        document.body.appendChild(popup);

        // Insert compact wrapper into the controls area so it visually sits on the divider
        try {
            const controlsEl = document.querySelector('.quiz-controls');
            if (controlsEl) {
                controlsEl.insertBefore(wrapper, controlsEl.firstChild);
            } else {
                const questionCardEl = document.querySelector('.question-card') || container;
                if (questionCardEl && questionCardEl.parentNode) {
                    questionCardEl.parentNode.insertBefore(wrapper, questionCardEl.nextSibling);
                } else {
                    document.body.appendChild(wrapper);
                }
            }
        } catch (err) {
            document.body.appendChild(wrapper);
        }

        // Save references for updates (include header and popup)
        this._qsel = { wrapper, selector, compact, compactText, compactCaret, header, popup };

        // Helper to position the popup centered above the compact button
        const positionPopup = () => {
            try {
                const popupEl = this._qsel && this._qsel.popup;
                if (!popupEl) return;
                const btnRect = this._qsel.compact.getBoundingClientRect();
                // Make popup temporarily visible to measure
                popupEl.style.display = 'block';
                popupEl.style.visibility = 'hidden';
                const popupRect = popupEl.getBoundingClientRect();
                const top = window.scrollY + btnRect.top - popupRect.height - 12;
                const left = btnRect.left + (btnRect.width / 2);
                popupEl.style.position = 'absolute';
                popupEl.style.top = `${Math.max(8, top)}px`;
                popupEl.style.left = `${left}px`;
                popupEl.style.transform = 'translateX(-50%)';
                popupEl.style.visibility = 'visible';
                if (!popupEl.classList.contains('open')) popupEl.style.display = 'none';
            } catch (err) { /* ignore */ }
        };

        // Compact click opens the floating popup and positions it
        compact.addEventListener('click', () => {
            const popupEl = this._qsel && this._qsel.popup;
            if (!popupEl) return;
            const isOpen = popupEl.classList.toggle('open');
            compact.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) {
                popupEl.style.display = 'block';
                setTimeout(positionPopup, 10);
                setTimeout(() => {
                    const first = popupEl.querySelector('.qsel-btn');
                    if (first) first.focus();
                }, 60);
            } else {
                popupEl.classList.remove('open');
                popupEl.style.display = 'none';
            }
        });

        // Reposition popup on resize/scroll if open
        window.addEventListener('resize', () => { if (this._qsel && this._qsel.popup && this._qsel.popup.classList.contains('open')) positionPopup(); });
        window.addEventListener('scroll', () => { if (this._qsel && this._qsel.popup && this._qsel.popup.classList.contains('open')) positionPopup(); });

        // Initial state update
        this.updateQuestionSelectorState();
    }

    /**
     * Update visual state for question selector buttons
     */
    updateQuestionSelectorState() {
        const selector = document.getElementById('question-selector');
        if (!selector) return;

        const buttons = selector.querySelectorAll('.qsel-btn');
        buttons.forEach(btn => {
            const idx = parseInt(btn.getAttribute('data-index'));
            btn.classList.remove('current', 'answered', 'bookmarked');

            if (idx === this.currentQuestionIndex) btn.classList.add('current');
            if (this.userAnswers && this.userAnswers[idx] !== null) btn.classList.add('answered');
            if (this.bookmarkedQuestions && this.bookmarkedQuestions[idx]) btn.classList.add('bookmarked');
            // add unanswered class when there's no answer
            if (this.userAnswers && this.userAnswers[idx] === null) {
                btn.classList.add('unanswered');
            } else {
                btn.classList.remove('unanswered');
            }
        });

        // Update compact text and caret if compact control exists
        if (this._qsel && this._qsel.compactText) {
            // Display simplified compact label: "Question (n)"
            this._qsel.compactText.textContent = `Question (${this.currentQuestionIndex + 1})`;
        }
        if (this._qsel && this._qsel.compactCaret) {
            const isOpen = this._qsel.popup && this._qsel.popup.classList.contains('open');
            this._qsel.compactCaret.innerHTML = isOpen ? '\u25B2' : '\u25BC';
            if (this._qsel.compact) this._qsel.compact.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }

        // Hide the floating header card
        if (this._qsel && this._qsel.header) {
            try { this._qsel.header.style.display = 'none'; } catch (e) { /* ignore */ }
        }

        // Remove any leftover inline label if present (we now show the number on the compact dropdown)
        const existingInline = document.getElementById('qsel-inline');
        if (existingInline && existingInline.parentNode) {
            existingInline.parentNode.removeChild(existingInline);
        }

        // Ensure compact button text shows "Question N" (matches mock)
        if (this._qsel && this._qsel.compactText) {
            this._qsel.compactText.textContent = `Question ${this.currentQuestionIndex + 1}`;
        }
    }

    /**
     * Finish the quiz and show results
     */
    finishQuiz() {
        this.endTime = new Date();
        this.isCompleted = true;
        
        // Calculate results
        const results = this.calculateResults();
        
        // Show summary modal
        this.showSummaryModal(results);
        
        // Save results for results page
        localStorage.setItem('quizResults', JSON.stringify({
            results: results,
            userAnswers: this.userAnswers,
            questions: this.shuffledQuestions,
            originalQuestions: this.questions,
            bookmarkedQuestions: this.bookmarkedQuestions,
            startTime: this.startTime,
            endTime: this.endTime,
            subject: this.currentSubject
        }));
    }

    /**
     * Calculate quiz results
     */
    calculateResults() {
        let correct = 0;
        let incorrect = 0;
        
        this.userAnswers.forEach((answer, index) => {
            if (answer === this.shuffledQuestions[index].correct) {
                correct++;
            } else {
                incorrect++;
            }
        });
        
        const percentage = Math.round((correct / this.shuffledQuestions.length) * 100);
        
        return {
            correct,
            incorrect,
            total: this.shuffledQuestions.length,
            percentage,
            timeTaken: this.endTime - this.startTime
        };
    }

    /**
     * Show quiz summary modal
     */
    showSummaryModal(results) {
        const modal = document.getElementById('summary-modal');
        
        // Update statistics
        document.getElementById('correct-answers').textContent = results.correct;
        document.getElementById('incorrect-answers').textContent = results.incorrect;
        document.getElementById('final-score').textContent = `${results.percentage}%`;
        
        // Update score message
        const scoreMessage = this.getScoreMessage(results.percentage);
        document.getElementById('score-message').textContent = scoreMessage;
        
        // Show modal
        modal.classList.add('show');
    }

    /**
     * Get score message based on percentage
     */
    getScoreMessage(percentage) {
        if (percentage >= 90) {
            return "Excellent! You have mastered this subject!";
        } else if (percentage >= 80) {
            return "Great job! You have a solid understanding.";
        } else if (percentage >= 70) {
            return "Good work! You understand most concepts.";
        } else if (percentage >= 60) {
            return "Fair performance. Consider reviewing the materials.";
        } else {
            return "You may need to study this subject more thoroughly.";
        }
    }

    /**
     * Navigate to results page
     */
    showResults() {
        window.location.href = 'quiz-results.html';
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowLeft':
                if (!document.getElementById('prev-btn').disabled) {
                    this.previousQuestion();
                }
                break;
            case 'ArrowRight':
                if (!document.getElementById('next-btn').disabled) {
                    this.moveToNextQuestion();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const optionIndex = parseInt(event.key) - 1;
                if (optionIndex < this.shuffledQuestions[this.currentQuestionIndex].options.length) {
                    this.selectOption(optionIndex);
                }
                break;
            case 'a':
            case 'A':
                this.selectOption(0);
                break;
            case 'b':
            case 'B':
                this.selectOption(1);
                break;
            case 'c':
            case 'C':
                this.selectOption(2);
                break;
            case 'd':
            case 'D':
                this.selectOption(3);
                break;
        }
    }

    /**
     * Save quiz progress to localStorage
     */
    saveProgress() {
        const progressData = {
            currentQuestionIndex: this.currentQuestionIndex,
            userAnswers: this.userAnswers,
            selectedOption: this.selectedOption,
            revealedAnswers: this.revealedAnswers,
            bookmarkedQuestions: this.bookmarkedQuestions,
            startTime: this.startTime,
            subject: this.currentSubject
        };
        localStorage.setItem(`quizProgress_${this.currentSubject}`, JSON.stringify(progressData));
    }

    /**
     * Load saved quiz progress
     */
    loadProgress() {
        const saved = localStorage.getItem(`quizProgress_${this.currentSubject}`);
        if (saved) {
            try {
                const progressData = JSON.parse(saved);
                
                const continueQuiz = confirm('You have an incomplete quiz. Would you like to continue from where you left off?');
                
                if (continueQuiz) {
                    this.currentQuestionIndex = progressData.currentQuestionIndex || 0;
                    
                    // Validate array lengths match current question count
                    const expectedLength = this.shuffledQuestions.length;
                    const userAnswersValid = progressData.userAnswers && progressData.userAnswers.length === expectedLength;
                    const revealedAnswersValid = progressData.revealedAnswers && progressData.revealedAnswers.length === expectedLength;
                    const bookmarksValid = progressData.bookmarkedQuestions && progressData.bookmarkedQuestions.length === expectedLength;
                    
                    if (userAnswersValid && revealedAnswersValid) {
                        this.userAnswers = progressData.userAnswers;
                        this.revealedAnswers = progressData.revealedAnswers;
                        
                        // Load bookmarks if valid
                        if (bookmarksValid) {
                            this.bookmarkedQuestions = progressData.bookmarkedQuestions;
                        } else {
                            this.bookmarkedQuestions = new Array(expectedLength).fill(false);
                        }
                    } else {
                        console.warn('Progress data array length mismatch, initializing fresh arrays');
                        this.userAnswers = new Array(expectedLength).fill(null);
                        this.revealedAnswers = new Array(expectedLength).fill(false);
                        this.bookmarkedQuestions = new Array(expectedLength).fill(false);
                    }
                    
                    this.selectedOption = progressData.selectedOption || null;
                    this.startTime = new Date(progressData.startTime) || new Date();
                    
                    if (this.shuffledQuestions && this.currentQuestionIndex < this.shuffledQuestions.length) {
                        this.renderCurrentQuestion();
                        this.updateProgress();
                        this.updateSubmitButton();
                    } else {
                        console.warn('Invalid progress data, starting fresh');
                        this.clearProgress();
                        this.initializeQuiz();
                    }
                } else {
                    this.clearProgress();
                }
            } catch (error) {
                console.error('Error loading progress:', error);
                this.clearProgress();
            }
        }
    }

    /**
     * Clear saved progress
     */
    clearProgress() {
        localStorage.removeItem(`quizProgress_${this.currentSubject}`);
        this.currentQuestionIndex = 0;
        this.selectedOption = null;
        this.userAnswers = new Array(this.shuffledQuestions.length).fill(null);
        this.revealedAnswers = new Array(this.shuffledQuestions.length).fill(false);
        this.startTime = new Date();
    }

    /**
     * Enable page protection to prevent accidental navigation
     */
    enablePageProtection() {
        window.addEventListener('beforeunload', (event) => {
            if (!this.isCompleted) {
                event.preventDefault();
                event.returnValue = 'You have an incomplete quiz. Are you sure you want to leave?';
                this.saveProgress();
            }
        });
    }
}


/**
 * Global theme toggle function for quiz pages
 */
function toggleTheme() {
    if (typeof quizSystem !== 'undefined' && quizSystem) {
        quizSystem.toggleTheme();
    } else {
        // Fallback theme toggle
        console.warn('QuizSystem not initialized yet, using fallback theme toggle');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
}

/**
 * Initialize quiz system when page loads
 */
let quizSystem;

document.addEventListener('DOMContentLoaded', () => {
    // Function to initialize the quiz system
    const initializeQuizSystem = () => {
        console.log('Initializing QuizSystem...');
        quizSystem = new QuizSystem();
        
        // Add event listeners for navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (!prevBtn.disabled) {
                    quizSystem.previousQuestion();
                }
            });
        }
        
        // Load any saved progress
        quizSystem.loadProgress();
        
        // Enable keyboard navigation
        document.addEventListener('keydown', (event) => {
            quizSystem.handleKeyPress(event);
        });
        
        // Enable page protection
        quizSystem.enablePageProtection();

        // Close question selector popup when clicking outside it
        document.addEventListener('click', (ev) => {
            try {
                const qsel = quizSystem && quizSystem._qsel;
                if (!qsel) return;
                const popup = qsel.popup;
                const compactBtn = qsel.compact;
                if (!popup) return;
                if (!popup.classList.contains('open')) return;
                const clickedInside = popup.contains(ev.target) || (ev.target.closest && ev.target.closest('#qsel-compact')) || (compactBtn && compactBtn.contains && compactBtn.contains(ev.target));
                if (!clickedInside) {
                    popup.classList.remove('open');
                    popup.style.display = 'none';
                    if (quizSystem.updateQuestionSelectorState) quizSystem.updateQuestionSelectorState();
                }
            } catch (err) {
                // ignore
            }
        });
        
        // Auto-save progress every 30 seconds
        setInterval(() => {
            if (!quizSystem.isCompleted) {
                quizSystem.saveProgress();
            }
        }, 30000);
        
        // Initial MathJax render
        setTimeout(() => {
            if (quizSystem.renderMathJax) {
                quizSystem.renderMathJax();
            }
        }, 100);
    };
    
    // Initialize the quiz system immediately (MathJax is optional)
    console.log('Initializing quiz system (MathJax optional)...');
    initializeQuizSystem();

    // If MathJax is not ready yet, poll for it and render math when available
    const pollMathJax = () => {
        if (typeof MathJax !== 'undefined' && MathJax.startup && MathJax.startup.document) {
            console.log('MathJax ready — performing MathJax typeset.');
            if (quizSystem && quizSystem.renderMathJax) quizSystem.renderMathJax();
        } else {
            setTimeout(pollMathJax, 300);
        }
    };
    pollMathJax();
});

/**
 * Close modal when clicking backdrop
 */
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-backdrop')) {
        const modal = event.target.closest('.quiz-summary-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
});
