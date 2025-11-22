// Global Variables
let startTime = Date.now();
let timerInterval;
let userData = {
    attempts: 0,
    totalPoints: 0,
    badges: [],
    history: [],
    streak: 0,
    lastAttempt: null,
    level: 1
};

// Load user data from localStorage
function loadUserData() {
    const stored = localStorage.getItem('examReadinessData');
    if (stored) {
        userData = JSON.parse(stored);
        updateHeaderStats();
        updateLevelBadge();
    } else {
        saveUserData();
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('examReadinessData', JSON.stringify(userData));
}

// Update header statistics
function updateHeaderStats() {
    document.getElementById('streak-count').textContent = userData.streak;
    document.getElementById('total-attempts').textContent = userData.attempts;
    document.getElementById('badges-earned').textContent = userData.badges.length;
    document.getElementById('total-points').textContent = userData.totalPoints;
}

// Update level badge
function updateLevelBadge() {
    const levels = [
        { min: 0, max: 100, name: 'Beginner Explorer', icon: 'fa-graduation-cap' },
        { min: 101, max: 300, name: 'Dedicated Learner', icon: 'fa-book-reader' },
        { min: 301, max: 600, name: 'Focused Achiever', icon: 'fa-trophy' },
        { min: 601, max: 1000, name: 'Master Strategist', icon: 'fa-crown' },
        { min: 1001, max: Infinity, name: 'Excellence Champion', icon: 'fa-star' }
    ];

    const currentLevel = levels.find(l => userData.totalPoints >= l.min && userData.totalPoints <= l.max);
    const levelBadge = document.getElementById('level-badge');
    const levelText = document.getElementById('level-text');
    
    if (currentLevel) {
        levelBadge.querySelector('i').className = `fas ${currentLevel.icon}`;
        levelText.textContent = currentLevel.name;
        userData.level = levels.indexOf(currentLevel) + 1;
    }
}

// Update streak
function updateStreak() {
    const today = new Date().toDateString();
    const lastAttempt = userData.lastAttempt ? new Date(userData.lastAttempt).toDateString() : null;
    
    if (lastAttempt === today) {
        // Same day, don't update streak
        return;
    } else if (lastAttempt) {
        const daysDiff = Math.floor((new Date(today) - new Date(lastAttempt)) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
            userData.streak++;
            showAchievement(`🔥 ${userData.streak} Day Streak! Keep it up!`);
        } else if (daysDiff > 1) {
            userData.streak = 1;
        }
    } else {
        userData.streak = 1;
    }
    
    userData.lastAttempt = new Date().toISOString();
}

// Show achievement toast
function showAchievement(text) {
    const toast = document.getElementById('achievement-toast');
    const achievementText = document.getElementById('achievement-text');
    
    achievementText.textContent = text;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Timer function
function startTimer() {
    startTime = Date.now();
    const timerValue = document.getElementById('timer-value');
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Track progress
function trackProgress() {
    const totalQuestions = 20;
    const form = document.getElementById('exam-form');
    let answered = 0;
    
    for (let i = 1; i <= totalQuestions; i++) {
        const radios = form.querySelectorAll(`input[name="q${i}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                const question = radio.closest('.question');
                question.classList.add('answered');
                
                answered = form.querySelectorAll('.question.answered').length;
                const progress = (answered / totalQuestions) * 100;
                
                document.getElementById('progress-container').style.display = 'block';
                document.getElementById('progress-fill').style.width = `${progress}%`;
                document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;
            });
        });
    }
}

// Badge definitions
const badgeDefinitions = [
    { id: 'first_attempt', name: 'First Step', desc: 'Completed first assessment', icon: 'fa-flag-checkered', condition: (data) => data.attempts === 1 },
    { id: 'perfect_score', name: 'Perfect Score', desc: '100% readiness achieved', icon: 'fa-star', condition: (data) => data.score === 100 },
    { id: 'consistent', name: 'Consistency King', desc: '5+ attempts completed', icon: 'fa-medal', condition: (data) => data.attempts >= 5 },
    { id: 'week_streak', name: 'Week Warrior', desc: '7-day streak maintained', icon: 'fa-fire', condition: (data) => data.streak >= 7 },
    { id: 'high_performer', name: 'High Performer', desc: '85%+ overall score', icon: 'fa-trophy', condition: (data) => data.score >= 85 },
    { id: 'balanced', name: 'Well-Balanced', desc: 'All dimensions above 75%', icon: 'fa-balance-scale', condition: (data) => {
        return data.cognitive >= 75 && data.emotional >= 75 && data.behavioral >= 75 && data.physical >= 75;
    }},
    { id: 'improver', name: 'Growth Mindset', desc: 'Improved score by 20%', icon: 'fa-chart-line', condition: (data) => data.improved },
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Completed in under 3 minutes', icon: 'fa-bolt', condition: (data) => data.timeTaken < 180 }
];

// Check and award badges
function checkBadges(assessmentData) {
    const newBadges = [];
    
    badgeDefinitions.forEach(badge => {
        if (!userData.badges.includes(badge.id) && badge.condition(assessmentData)) {
            userData.badges.push(badge.id);
            newBadges.push(badge);
            userData.totalPoints += 50; // 50 points per badge
        }
    });
    
    return newBadges;
}

// Display badges
function displayBadges(badges) {
    if (badges.length === 0) return;
    
    const badgesSection = document.getElementById('badges-unlocked');
    badgesSection.innerHTML = '<h3><i class="fas fa-award"></i> New Badges Unlocked!</h3>';
    
    badges.forEach((badge, index) => {
        setTimeout(() => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge-item';
            badgeEl.innerHTML = `
                <div class="badge-icon"><i class="fas ${badge.icon}"></i></div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.desc}</div>
            `;
            badgesSection.appendChild(badgeEl);
            showAchievement(`🏆 New Badge: ${badge.name}!`);
        }, index * 500);
    });
}

// Calculate results
function calculateResults(event) {
    event.preventDefault();
    clearInterval(timerInterval);
    
    const form = document.getElementById('exam-form');
    const totalQuestions = 20;
    let responses = {};
    let score = 0;
    let maxScore = totalQuestions * 4;
    
    // Collect responses
    for (let i = 1; i <= totalQuestions; i++) {
        const selected = form.querySelector(`input[name="q${i}"]:checked`);
        if (selected) {
            responses[`q${i}`] = parseInt(selected.value);
            score += parseInt(selected.value);
        } else {
            alert(`Please answer question ${i}`);
            return;
        }
    }
    
    // Calculate dimensional scores
    const dimensions = {
        cognitive: [1, 2, 3, 4, 5],
        emotional: [6, 7, 8, 9, 10],
        behavioral: [11, 12, 13, 14, 15],
        physical: [16, 17, 18, 19, 20]
    };
    
    let dimensionScores = {};
    for (let dim in dimensions) {
        let dimScore = 0;
        dimensions[dim].forEach(q => {
            dimScore += responses[`q${q}`] || 0;
        });
        dimensionScores[dim] = (dimScore / (dimensions[dim].length * 4)) * 100;
    }
    
    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    // Calculate overall readiness percentage
    const overallReadiness = (score / maxScore) * 100;
    
    // Calculate points earned (base + bonuses)
    let pointsEarned = Math.round(overallReadiness);
    if (timeTaken < 180) pointsEarned += 20; // Speed bonus
    if (overallReadiness >= 90) pointsEarned += 30; // Excellence bonus
    
    // Update user data
    updateStreak();
    userData.attempts++;
    userData.totalPoints += pointsEarned;
    
    // Check for improvement
    const lastScore = userData.history.length > 0 ? userData.history[userData.history.length - 1].overall : 0;
    const improved = overallReadiness > lastScore + 20;
    
    // Save assessment to history
    const assessment = {
        date: new Date().toISOString(),
        overall: overallReadiness,
        cognitive: dimensionScores.cognitive,
        emotional: dimensionScores.emotional,
        behavioral: dimensionScores.behavioral,
        physical: dimensionScores.physical,
        timeTaken: timeTaken,
        pointsEarned: pointsEarned
    };
    userData.history.push(assessment);
    
    // Prepare data for badge checking
    const badgeData = {
        attempts: userData.attempts,
        score: overallReadiness,
        cognitive: dimensionScores.cognitive,
        emotional: dimensionScores.emotional,
        behavioral: dimensionScores.behavioral,
        physical: dimensionScores.physical,
        timeTaken: timeTaken,
        improved: improved
    };
    
    // Check and award badges
    const newBadges = checkBadges(badgeData);
    
    // Save user data
    saveUserData();
    updateHeaderStats();
    updateLevelBadge();
    
    // Display results
    displayResults(assessment, dimensionScores, responses, newBadges);
}

// Display results
function displayResults(assessment, dimensionScores, responses, newBadges) {
    // Hide form, show results
    document.getElementById('exam-form').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
    
    // Scroll to results
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
    
    // Show confetti for high scores
    if (assessment.overall >= 75) {
        createConfetti();
    }
    
    // Animate overall score
    animateScore(assessment.overall);
    
    // Set readiness level
    setReadinessLevel(assessment.overall);
    
    // Display points earned
    document.getElementById('points-value').textContent = assessment.pointsEarned;
    
    // Display new badges
    displayBadges(newBadges);
    
    // Display dimension scores
    displayDimensionScores(dimensionScores);
    
    // Display analysis
    displayAnalysis(dimensionScores, responses);
    
    // Display history if available
    if (userData.history.length > 1) {
        displayHistory();
    }
}

// Animate score circle
function animateScore(score) {
    const circle = document.getElementById('score-progress');
    const scoreValue = document.getElementById('overall-score');
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (score / 100) * circumference;
    
    // Animate number
    let current = 0;
    const increment = score / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
            current = score;
            clearInterval(timer);
        }
        scoreValue.textContent = Math.round(current) + '%';
    }, 30);
    
    // Animate circle
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
        
        // Change color based on score
        if (score >= 85) circle.style.stroke = '#4CAF50';
        else if (score >= 70) circle.style.stroke = '#FF9800';
        else circle.style.stroke = '#F44336';
    }, 100);
}

// Set readiness level
function setReadinessLevel(score) {
    const title = document.getElementById('readiness-title');
    const message = document.getElementById('readiness-message');
    
    if (score >= 90) {
        title.textContent = '🌟 Outstanding Readiness!';
        message.textContent = 'You are exceptionally well-prepared! Your psychological readiness across all dimensions is excellent. Maintain this momentum and you\'re on track for success.';
    } else if (score >= 75) {
        title.textContent = '✅ Strong Readiness';
        message.textContent = 'You have solid preparation and good psychological balance. Focus on the improvement areas highlighted below to reach peak performance.';
    } else if (score >= 60) {
        title.textContent = '⚠️ Moderate Readiness';
        message.textContent = 'You have a foundation, but there are significant areas needing attention. Review the recommendations carefully and work on strengthening weak dimensions.';
    } else {
        title.textContent = '🚨 Needs Improvement';
        message.textContent = 'Your current readiness indicates major gaps in preparation. Consider seeking guidance, revising your study strategy, and addressing the critical areas identified below.';
    }
}

// Display dimension scores
function displayDimensionScores(scores) {
    for (let dim in scores) {
        const scoreEl = document.getElementById(`${dim}-score`);
        const fillEl = document.getElementById(`${dim}-fill`);
        
        setTimeout(() => {
            scoreEl.textContent = Math.round(scores[dim]) + '%';
            fillEl.style.width = scores[dim] + '%';
            
            // Color coding
            if (scores[dim] >= 75) fillEl.style.background = 'linear-gradient(90deg, #4CAF50, #66BB6A)';
            else if (scores[dim] >= 60) fillEl.style.background = 'linear-gradient(90deg, #FF9800, #FFB74D)';
            else fillEl.style.background = 'linear-gradient(90deg, #F44336, #E57373)';
        }, 500);
    }
}

// Display detailed analysis
function displayAnalysis(dimensionScores, responses) {
    const questionLabels = [
        'Self-confidence',
        'Concentration ability',
        'Concept recall',
        'Topic prioritization',
        'Adaptability',
        'Anxiety management',
        'Stress coping',
        'Motivation levels',
        'Mindfulness practice',
        'Resilience',
        'Study plan effectiveness',
        'Mock test practice',
        'Timeline adherence',
        'Error analysis',
        'Procrastination control',
        'Sleep quality',
        'Health status',
        'Physical exercise',
        'Diet balance',
        'Work-life balance'
    ];
    
    let strengths = [];
    let improvements = [];
    
    for (let i = 1; i <= 20; i++) {
        const score = responses[`q${i}`];
        if (score >= 4) strengths.push(questionLabels[i-1]);
        else if (score <= 2) improvements.push(questionLabels[i-1]);
    }
    
    // Display strengths
    const strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = strengths.length > 0 
        ? strengths.map(s => `<li>${s}</li>`).join('')
        : '<li>Focus on building more strong areas</li>';
    
    // Display improvements
    const improvementsList = document.getElementById('improvement-list');
    improvementsList.innerHTML = improvements.length > 0
        ? improvements.map(i => `<li>${i}</li>`).join('')
        : '<li>Great! No critical weaknesses identified</li>';
    
    // Generate recommendations
    const recommendations = generateRecommendations(dimensionScores, improvements);
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = recommendations.map(r => `<li>${r}</li>`).join('');
}

// Generate personalized recommendations
function generateRecommendations(dimensionScores, improvements) {
    const recs = [];
    
    // Cognitive recommendations
    if (dimensionScores.cognitive < 70) {
        recs.push('Implement active recall techniques and spaced repetition for better retention');
        recs.push('Create mind maps and flowcharts to improve conceptual understanding');
        recs.push('Practice time-management strategies during mock tests');
    }
    
    // Emotional recommendations
    if (dimensionScores.emotional < 70) {
        recs.push('Practice daily meditation or deep breathing exercises (10-15 minutes)');
        recs.push('Maintain a positive affirmation journal to boost confidence');
        recs.push('Join peer study groups for emotional support and motivation');
    }
    
    // Behavioral recommendations
    if (dimensionScores.behavioral < 70) {
        recs.push('Create a structured study timetable with specific goals');
        recs.push('Increase mock test frequency to 2-3 per week');
        recs.push('Use the Pomodoro Technique (25-min focused study + 5-min break)');
    }
    
    // Physical recommendations
    if (dimensionScores.physical < 70) {
        recs.push('Prioritize 7-8 hours of sleep; avoid late-night cramming');
        recs.push('Incorporate 30 minutes of daily exercise or yoga');
        recs.push('Maintain a balanced diet with brain-boosting foods (nuts, fruits, fish)');
    }
    
    // General recommendations
    if (improvements.includes('Anxiety management')) {
        recs.push('Consider professional counseling if anxiety is severe');
    }
    
    if (improvements.includes('Mock test practice')) {
        recs.push('Schedule at least 3 full-length mocks before the exam');
    }
    
    if (improvements.includes('Error analysis')) {
        recs.push('Maintain an error log and review mistakes weekly');
    }
    
    // Ensure at least 3 recommendations
    if (recs.length === 0) {
        recs.push('Continue your current preparation strategy - it\'s working well!');
        recs.push('Challenge yourself with advanced problems to push boundaries');
        recs.push('Help peers with their doubts to reinforce your own understanding');
    }
    
    return recs.slice(0, 6); // Max 6 recommendations
}

// Display history
function displayHistory() {
    const historySection = document.getElementById('history-section');
    const historyChart = document.getElementById('history-chart');
    const historyTbody = document.getElementById('history-tbody');
    
    historySection.style.display = 'block';
    
    // Create simple bar chart
    historyChart.innerHTML = '';
    const recentHistory = userData.history.slice(-10); // Last 10 attempts
    
    recentHistory.forEach((record, index) => {
        const bar = document.createElement('div');
        bar.className = 'history-bar';
        bar.style.height = `${record.overall * 2}px`; // Scale for visibility
        bar.innerHTML = `<div class="history-bar-value">${Math.round(record.overall)}%</div>`;
        bar.title = `Attempt ${index + 1}: ${Math.round(record.overall)}%`;
        historyChart.appendChild(bar);
    });
    
    // Populate table
    historyTbody.innerHTML = '';
    recentHistory.reverse().forEach(record => {
        const date = new Date(record.date).toLocaleDateString();
        const row = `
            <tr>
                <td>${date}</td>
                <td>${Math.round(record.overall)}%</td>
                <td>${Math.round(record.cognitive)}%</td>
                <td>${Math.round(record.emotional)}%</td>
                <td>${Math.round(record.behavioral)}%</td>
                <td>${Math.round(record.physical)}%</td>
            </tr>
        `;
        historyTbody.innerHTML += row;
    });
}

// Create confetti effect
function createConfetti() {
    const confetti = document.getElementById('confetti');
    const colors = ['#FFD700', '#FF6347', '#4CAF50', '#2196F3', '#9C27B0'];
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'absolute';
        piece.style.width = '10px';
        piece.style.height = '10px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.opacity = Math.random();
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.appendChild(piece);
        
        // Animate
        let pos = -10;
        const fall = setInterval(() => {
            pos += 5;
            piece.style.top = pos + 'px';
            if (pos > window.innerHeight) {
                clearInterval(fall);
                piece.remove();
            }
        }, 50);
    }
}

// Generate certificate
function generateCertificate() {
    const modal = document.getElementById('certificate-modal');
    const lastAssessment = userData.history[userData.history.length - 1];
    
    document.getElementById('cert-score').textContent = Math.round(lastAssessment.overall) + '%';
    
    let level = '';
    if (lastAssessment.overall >= 90) level = 'Outstanding';
    else if (lastAssessment.overall >= 75) level = 'Strong';
    else if (lastAssessment.overall >= 60) level = 'Moderate';
    else level = 'Developing';
    
    document.getElementById('cert-level').textContent = `${level} Readiness Level`;
    document.getElementById('cert-date').textContent = new Date(lastAssessment.date).toLocaleDateString();
    
    modal.style.display = 'block';
}

// Close certificate
function closeCertificate() {
    document.getElementById('certificate-modal').style.display = 'none';
}

// Download certificate
function downloadCertificate() {
    // Simple implementation - in production, use html2canvas or similar
    alert('Certificate download feature: In a production version, this would generate a PDF using libraries like jsPDF or html2canvas.');
    
    // Placeholder for actual implementation
    /* 
    html2canvas(document.getElementById('certificate-content')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'exam-readiness-certificate.png';
        link.href = canvas.toDataURL();
        link.click();
    });
    */
}

// Export results to Excel
function exportResults() {
    const lastAssessment = userData.history[userData.history.length - 1];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Exam Psychological Readiness Report\n\n";
    csvContent += "Date," + new Date(lastAssessment.date).toLocaleDateString() + "\n";
    csvContent += "Overall Readiness," + Math.round(lastAssessment.overall) + "%\n";
    csvContent += "Cognitive Score," + Math.round(lastAssessment.cognitive) + "%\n";
    csvContent += "Emotional Score," + Math.round(lastAssessment.emotional) + "%\n";
    csvContent += "Behavioral Score," + Math.round(lastAssessment.behavioral) + "%\n";
    csvContent += "Physical Score," + Math.round(lastAssessment.physical) + "%\n";
    csvContent += "Time Taken," + lastAssessment.timeTaken + " seconds\n";
    csvContent += "Points Earned," + lastAssessment.pointsEarned + "\n\n";
    csvContent += "Total Attempts," + userData.attempts + "\n";
    csvContent += "Total Points," + userData.totalPoints + "\n";
    csvContent += "Current Streak," + userData.streak + " days\n";
    csvContent += "Badges Earned," + userData.badges.length + "\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exam_readiness_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Share results
function shareResults() {
    const lastAssessment = userData.history[userData.history.length - 1];
    const text = `I just completed my Exam Psychological Readiness Assessment and scored ${Math.round(lastAssessment.overall)}%! 🎓✨ Check your readiness too!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Exam Readiness Assessment',
            text: text,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(text + '\n' + window.location.href).then(() => {
            alert('Results copied to clipboard! Share it on your social media.');
        });
    }
}

// Retake assessment
function retakeAssessment() {
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('exam-form').style.display = 'block';
    document.getElementById('exam-form').reset();
    
    // Clear answered classes
    document.querySelectorAll('.question.answered').forEach(q => {
        q.classList.remove('answered');
    });
    
    // Reset progress
    document.getElementById('progress-container').style.display = 'none';
    document.getElementById('progress-fill').style.width = '0%';
    
    // Restart timer
    startTimer();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle theme
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const icon = document.getElementById('theme-icon');
    
    html.setAttribute('data-theme', newTheme);
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    localStorage.setItem('theme', newTheme);
}

// Load theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const icon = document.getElementById('theme-icon');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadUserData();
    startTimer();
    trackProgress();
    
    // Form submission
    document.getElementById('exam-form').addEventListener('submit', calculateResults);
    
    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('certificate-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});
