// =======================
// Global State
// =======================

let startTime = Date.now();
let timerInterval;

let preAnxiety = 5;
let postAnxiety = 5;
let currentMood = 'medium';

let userData = {
    studentName: 'CA Aspirant',
    attempts: 0,
    totalPoints: 0,
    badges: [],
    history: [],
    streak: 0,
    lastAttempt: null,
    level: 1
};

let breathingInterval = null;
const breathingPhases = ['Inhale', 'Hold', 'Exhale', 'Hold'];

let spacedTopics = [];

// =======================
// Local Storage Helpers
// =======================

function loadUserData() {
    const stored = localStorage.getItem('examReadinessData');
    if (stored) {
        try {
            userData = Object.assign(userData, JSON.parse(stored));
        } catch (e) {
            console.error('Failed to parse stored userData:', e);
        }
    }
    if (!userData.studentName) {
        userData.studentName = 'CA Aspirant';
    }
    syncCandidateName(userData.studentName, false);
    updateHeaderStats();
    updateLevelBadge();
}

function syncCandidateName(name, updateStorage = true) {
    const trimmed = (name && typeof name === 'string') ? name.trim() : '';
    const displayName = trimmed || 'CA Aspirant';

    // Synchronize across all 3 inputs without interrupting active focus
    const inputIds = ['aspirant-name-input', 'cert-name-edit-input', 'modal-cert-name-input'];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== document.activeElement) {
            el.value = trimmed;
        }
    });

    // Update certificate display element
    const certNameEl = document.getElementById('cert-name');
    if (certNameEl) {
        certNameEl.textContent = displayName;
    }

    if (updateStorage) {
        userData.studentName = displayName;
        saveUserData();
    }
}

function saveUserData() {
    localStorage.setItem('examReadinessData', JSON.stringify(userData));
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const icon = document.getElementById('theme-icon');
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

function loadJournal() {
    const saved = localStorage.getItem('examReadinessJournal');
    const area = document.getElementById('journal-text');
    if (saved && area) area.value = saved;
}

function saveJournal() {
    const area = document.getElementById('journal-text');
    if (!area) return;
    localStorage.setItem('examReadinessJournal', area.value || '');
    const status = document.getElementById('journal-status');
    if (status) {
        status.textContent = 'Saved';
        setTimeout(() => status.textContent = '', 2000);
    }
}

function loadSpacedList() {
    spacedTopics = JSON.parse(localStorage.getItem('examReadinessSpaced') || '[]');
    renderSpacedList();
}

function saveSpacedList() {
    localStorage.setItem('examReadinessSpaced', JSON.stringify(spacedTopics));
}

function loadMicroGoals() {
    const saved = JSON.parse(localStorage.getItem('examReadinessGoals') || '{}');
    ['mock', 'revision', 'mindfulness'].forEach(key => {
        const el = document.getElementById(`goal-${key}`);
        if (el && saved[key]) el.checked = true;
    });
}

function saveMicroGoals(goals) {
    localStorage.setItem('examReadinessGoals', JSON.stringify(goals));
}

// =======================
// Header / Stats / Level
// =======================

function updateHeaderStats() {
    const streakEl = document.getElementById('streak-count');
    const attemptsEl = document.getElementById('total-attempts');
    const badgesEl = document.getElementById('badges-earned');
    const pointsEl = document.getElementById('total-points');

    if (streakEl) streakEl.textContent = userData.streak;
    if (attemptsEl) attemptsEl.textContent = userData.attempts;
    if (badgesEl) badgesEl.textContent = userData.badges.length;
    if (pointsEl) pointsEl.textContent = userData.totalPoints;
}

function updateLevelBadge() {
    const levels = [
        { min: 0, max: 100, name: 'Beginner Explorer', icon: 'fa-graduation-cap' },
        { min: 101, max: 300, name: 'Dedicated Learner', icon: 'fa-book-reader' },
        { min: 301, max: 600, name: 'Focused Achiever', icon: 'fa-trophy' },
        { min: 601, max: 1000, name: 'Master Strategist', icon: 'fa-crown' },
        { min: 1001, max: Infinity, name: 'Excellence Champion', icon: 'fa-star' }
    ];

    const current = levels.find(l => userData.totalPoints >= l.min && userData.totalPoints <= l.max);
    const badge = document.getElementById('level-badge');
    const text = document.getElementById('level-text');

    if (badge && text && current) {
        const icon = badge.querySelector('i');
        if (icon) icon.className = `fas ${current.icon}`;
        text.textContent = current.name;
        userData.level = levels.indexOf(current) + 1;
    }
}

function updateStreak() {
    const today = new Date().toDateString();
    const last = userData.lastAttempt ? new Date(userData.lastAttempt).toDateString() : null;

    if (!last) {
        userData.streak = 1;
    } else {
        const diff = Math.floor((new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            userData.streak++;
            showAchievement(`🔥 ${userData.streak} Day Streak! Keep it up!`);
        } else if (diff > 1) {
            userData.streak = 1;
        }
    }
    userData.lastAttempt = new Date().toISOString();
}

// =======================
// UI Helpers
// =======================

function showAchievement(text) {
    const toast = document.getElementById('achievement-toast');
    const label = document.getElementById('achievement-text');
    if (!toast || !label) return;
    label.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function startTimer() {
    startTime = Date.now();
    const timerValue = document.getElementById('timer-value');
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        if (timerValue) timerValue.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
}

function trackProgress() {
    const form = document.getElementById('exam-form');
    if (!form) return;
    const totalQuestions = 20;

    for (let i = 1; i <= totalQuestions; i++) {
        const radios = form.querySelectorAll(`input[name="q${i}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                const question = radio.closest('.question');
                if (question) question.classList.add('answered');

                const answeredCount = form.querySelectorAll('.question.answered').length;
                const progress = (answeredCount / totalQuestions) * 100;

                const container = document.getElementById('progress-container');
                const fill = document.getElementById('progress-fill');
                const percent = document.getElementById('progress-percent');
                if (container) container.style.display = 'block';
                if (fill) fill.style.width = `${progress}%`;
                if (percent) percent.textContent = `${Math.round(progress)}%`;
            });
        });
    }
}

// =======================
// Theme Toggle
// =======================

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    if (icon) icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    saveTheme(next);
}

// =======================
// Pre/Post Anxiety & Mood
// =======================

function updatePreAnxietyLabel(val) {
    preAnxiety = parseInt(val, 10);
    const label = document.getElementById('pre-anxiety-label');
    if (label) label.textContent = `${val} / 10`;
}

function updatePostAnxietyLabel(val) {
    postAnxiety = parseInt(val, 10);
    const label = document.getElementById('post-anxiety-label');
    if (label) label.textContent = `${val} / 10`;
}

function selectMood(mood) {
    currentMood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === mood);
    });
}

// =======================
// Guided Breathing
// =======================

function startBreathing() {
    const visual = document.getElementById('breathing-visual');
    const phaseLabel = document.getElementById('breathing-phase');
    const circle = document.getElementById('breathing-circle');
    if (!visual || !phaseLabel || !circle) return;

    visual.style.display = 'block';
    let index = 0;

    if (breathingInterval) clearInterval(breathingInterval);

    phaseLabel.textContent = 'Get ready...';
    setTimeout(() => {
        breathingInterval = setInterval(() => {
            const phase = breathingPhases[index % 4];
            phaseLabel.textContent = `${phase} (4 seconds)`;

            if (phase === 'Inhale') circle.style.transform = 'scale(1.4)';
            else if (phase === 'Exhale') circle.style.transform = 'scale(0.9)';
            else circle.style.transform = 'scale(1.1)';

            index++;
            if (index > 16) {
                clearInterval(breathingInterval);
                phaseLabel.textContent = 'Done. Notice any change in how you feel.';
            }
        }, 4000);
    }, 1000);
}

// =======================
// Badges
// =======================

const badgeDefinitions = [
    { id: 'first_attempt', name: 'First Step', desc: 'Completed first assessment', icon: 'fa-flag-checkered', condition: d => d.attempts === 1 },
    { id: 'perfect_score', name: 'Perfect Score', desc: '100% readiness achieved', icon: 'fa-star', condition: d => d.score === 100 },
    { id: 'consistent', name: 'Consistency King', desc: '5+ attempts completed', icon: 'fa-medal', condition: d => d.attempts >= 5 },
    { id: 'week_streak', name: 'Week Warrior', desc: '7-day streak maintained', icon: 'fa-fire', condition: d => d.streak >= 7 },
    { id: 'high_performer', name: 'High Performer', desc: '85%+ overall score', icon: 'fa-trophy', condition: d => d.score >= 85 },
    { id: 'balanced', name: 'Well-Balanced', desc: 'All dimensions above 75%', icon: 'fa-balance-scale', condition: d =>
        d.cognitive >= 75 && d.emotional >= 75 && d.behavioral >= 75 && d.physical >= 75
    },
    { id: 'improver', name: 'Growth Mindset', desc: 'Improved score by 20%', icon: 'fa-chart-line', condition: d => d.improved },
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Completed in under 3 minutes', icon: 'fa-bolt', condition: d => d.timeTaken < 180 }
];

function checkBadges(assessmentData) {
    const newBadges = [];
    badgeDefinitions.forEach(badge => {
        if (!userData.badges.includes(badge.id) && badge.condition(assessmentData)) {
            userData.badges.push(badge.id);
            newBadges.push(badge);
            userData.totalPoints += 50;
        }
    });
    return newBadges;
}

function displayBadges(badges) {
    if (!badges.length) return;
    const section = document.getElementById('badges-unlocked');
    if (!section) return;
    section.innerHTML = '<h3><i class="fas fa-award"></i> New Badges Unlocked!</h3>';

    badges.forEach((badge, index) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'badge-item';
            div.innerHTML = `
                <div class="badge-icon"><i class="fas ${badge.icon}"></i></div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.desc}</div>
            `;
            section.appendChild(div);
            showAchievement(`🏆 New Badge: ${badge.name}!`);
        }, index * 500);
    });
}

// =======================
// Spaced Repetition
// =======================

function addSpacedTopic() {
    const input = document.getElementById('spaced-topic');
    if (!input) return;
    const topic = input.value.trim();
    if (!topic) return;

    const today = new Date();
    const entry = {
        topic,
        added: today.toISOString(),
        review2: new Date(today.getTime() + 2 * 86400000).toISOString(),
        review5: new Date(today.getTime() + 5 * 86400000).toISOString(),
        review7: new Date(today.getTime() + 7 * 86400000).toISOString()
    };
    spacedTopics.push(entry);
    saveSpacedList();
    input.value = '';
    renderSpacedList();
}

function renderSpacedList() {
    const ul = document.getElementById('spaced-list');
    if (!ul) return;
    ul.innerHTML = '';
    spacedTopics.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.topic} → revise around `
            + `${new Date(entry.review2).toLocaleDateString()}, `
            + `${new Date(entry.review5).toLocaleDateString()}, `
            + `${new Date(entry.review7).toLocaleDateString()}`;
        ul.appendChild(li);
    });
}

// =======================
// Micro Goals
// =======================

function toggleMicroGoal(key) {
    const saved = JSON.parse(localStorage.getItem('examReadinessGoals') || '{}');
    const el = document.getElementById(`goal-${key}`);
    saved[key] = !!(el && el.checked);
    saveMicroGoals(saved);
}

// =======================
// Main Calculation
// =======================

function calculateResults(event) {
    event.preventDefault();
    clearInterval(timerInterval);

    const form = document.getElementById('exam-form');
    if (!form) return;
    const totalQuestions = 20;
    const responses = {};
    let score = 0;
    const maxScore = totalQuestions * 4;

    for (let i = 1; i <= totalQuestions; i++) {
        const selected = form.querySelector(`input[name="q${i}"]:checked`);
        if (!selected) {
            alert(`Please answer question ${i}`);
            return;
        }
        const val = parseInt(selected.value, 10);
        responses[`q${i}`] = val;
        score += val;
    }

    const dimensions = {
        cognitive: [1, 2, 3, 4, 5],
        emotional: [6, 7, 8, 9, 10],
        behavioral: [11, 12, 13, 14, 15],
        physical: [16, 17, 18, 19, 20]
    };

    const dimensionScores = {};
    Object.keys(dimensions).forEach(dim => {
        let dimScore = 0;
        dimensions[dim].forEach(q => {
            dimScore += responses[`q${q}`] || 0;
        });
        dimensionScores[dim] = (dimScore / (dimensions[dim].length * 4)) * 100;
    });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const overallReadiness = (score / maxScore) * 100;

    let pointsEarned = Math.round(overallReadiness);
    if (timeTaken < 180) pointsEarned += 20;
    if (overallReadiness >= 90) pointsEarned += 30;

    const lastScore = userData.history.length
        ? userData.history[userData.history.length - 1].overall
        : 0;
    const improved = overallReadiness > lastScore + 20;

    updateStreak();
    userData.attempts++;
    userData.totalPoints += pointsEarned;

    const assessment = {
        date: new Date().toISOString(),
        overall: overallReadiness,
        cognitive: dimensionScores.cognitive,
        emotional: dimensionScores.emotional,
        behavioral: dimensionScores.behavioral,
        physical: dimensionScores.physical,
        timeTaken,
        pointsEarned,
        preAnxiety,
        postAnxiety,
        mood: currentMood
    };
    userData.history.push(assessment);

    const badgeData = {
        attempts: userData.attempts,
        score: overallReadiness,
        cognitive: dimensionScores.cognitive,
        emotional: dimensionScores.emotional,
        behavioral: dimensionScores.behavioral,
        physical: dimensionScores.physical,
        timeTaken,
        improved
    };

    const newBadges = checkBadges(badgeData);

    saveUserData();
    updateHeaderStats();
    updateLevelBadge();

    displayResults(assessment, dimensionScores, responses, newBadges);
}

// =======================
// Results Display
// =======================

function displayResults(assessment, dimensionScores, responses, newBadges) {
    const form = document.getElementById('exam-form');
    const resultSection = document.getElementById('result-section');
    if (form) form.style.display = 'none';
    if (resultSection) resultSection.style.display = 'block';

    if (assessment.overall >= 75) createConfetti();

    animateScore(assessment.overall);
    setReadinessLevel(assessment.overall);

    const pointsValue = document.getElementById('points-value');
    if (pointsValue) pointsValue.textContent = assessment.pointsEarned;

    displayBadges(newBadges);
    displayDimensionScores(dimensionScores);
    displayAnalysis(dimensionScores, responses);
    buildActionPlan(dimensionScores);
    maybeShowAnxietyFlag(dimensionScores);

    if (userData.history.length > 1) displayHistory();
}

function animateScore(score) {
    const circle = document.getElementById('score-progress');
    const scoreValue = document.getElementById('overall-score');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (score / 100) * circumference;

    let current = 0;
    const increment = score / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
            current = score;
            clearInterval(timer);
        }
        if (scoreValue) scoreValue.textContent = Math.round(current) + '%';
    }, 30);

    setTimeout(() => {
        if (!circle) return;
        circle.style.strokeDashoffset = offset;
        if (score >= 85) circle.style.stroke = '#4CAF50';
        else if (score >= 70) circle.style.stroke = '#FF9800';
        else circle.style.stroke = '#F44336';
    }, 100);
}

function setReadinessLevel(score) {
    const title = document.getElementById('readiness-title');
    const msg = document.getElementById('readiness-message');
    if (!title || !msg) return;

    if (score >= 90) {
        title.textContent = '🌟 Outstanding Readiness!';
        msg.textContent = 'You are exceptionally well-prepared across most psychological dimensions. Keep maintaining your routines and refine with mocks.';
    } else if (score >= 75) {
        title.textContent = '✅ Strong Readiness';
        msg.textContent = 'You show good balance in preparation. Focus on the listed weak areas to move into the outstanding zone.';
    } else if (score >= 60) {
        title.textContent = '⚠️ Moderate Readiness';
        msg.textContent = 'Your foundation is there, but key areas need attention. Use the 7‑day plan and recommendations as a roadmap.';
    } else {
        title.textContent = '🚨 Needs Improvement';
        msg.textContent = 'Your current readiness suggests significant gaps. Consider structured changes and seeking support where needed.';
    }
}

function displayDimensionScores(scores) {
    Object.keys(scores).forEach(dim => {
        const scoreEl = document.getElementById(`${dim}-score`);
        const fillEl = document.getElementById(`${dim}-fill`);
        if (!scoreEl || !fillEl) return;

        setTimeout(() => {
            scoreEl.textContent = Math.round(scores[dim]) + '%';
            fillEl.style.width = scores[dim] + '%';

            if (scores[dim] >= 75) fillEl.style.background = 'linear-gradient(90deg, #4CAF50, #66BB6A)';
            else if (scores[dim] >= 60) fillEl.style.background = 'linear-gradient(90deg, #FF9800, #FFB74D)';
            else fillEl.style.background = 'linear-gradient(90deg, #F44336, #E57373)';
        }, 500);
    });
}

function displayAnalysis(dimensionScores, responses) {
    const labels = [
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

    const strengths = [];
    const weaknesses = [];

    for (let i = 1; i <= 20; i++) {
        const s = responses[`q${i}`];
        if (s >= 4) strengths.push(labels[i - 1]);
        else if (s <= 2) weaknesses.push(labels[i - 1]);
    }

    const strengthsList = document.getElementById('strengths-list');
    const improvementList = document.getElementById('improvement-list');
    if (strengthsList) {
        strengthsList.innerHTML = strengths.length
            ? strengths.map(x => `<li>${x}</li>`).join('')
            : '<li>Focus on building clear strengths through deliberate practice.</li>';
    }
    if (improvementList) {
        improvementList.innerHTML = weaknesses.length
            ? weaknesses.map(x => `<li>${x}</li>`).join('')
            : '<li>No major weak spots detected on this attempt.</li>';
    }

    const recs = generateRecommendations(dimensionScores, weaknesses);
    const recList = document.getElementById('recommendations-list');
    if (recList) recList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
}

function generateRecommendations(dimensionScores, weakAreas) {
    const recs = [];

    if (dimensionScores.cognitive < 70) {
        recs.push('Use active recall and spaced repetition instead of rereading; quiz yourself after each study block.');
        recs.push('Create short formula/concept sheets and test yourself from them every 2–3 days.');
    }
    if (dimensionScores.emotional < 70) {
        recs.push('Add a 10‑minute breathing or mindfulness routine on most days to lower baseline exam anxiety.');
        recs.push('Write down top exam worries and reframe them into specific, controllable action steps.');
    }
    if (dimensionScores.behavioral < 70) {
        recs.push('Fix a weekly timetable with specific slots for mocks, revision and rest; review it every Sunday.');
        recs.push('Start with smaller, timed blocks (25–30 minutes) if you struggle with procrastination.');
    }
    if (dimensionScores.physical < 70) {
        recs.push('Aim for 7–8 hours of regular sleep and avoid heavy screens in the last hour before bed.');
        recs.push('Include at least 20–30 minutes of light exercise or a brisk walk on 4–5 days per week.');
    }

    if (weakAreas.includes('Anxiety management')) {
        recs.push('Practise short breathing sets before mocks; this can reduce test anxiety and improve focus.');
    }
    if (weakAreas.includes('Mock test practice')) {
        recs.push('Schedule at least 3 full-length mocks before the exam and analyse each attempt calmly.');
    }
    if (weakAreas.includes('Error analysis')) {
        recs.push('Maintain an error log and review it weekly so that mistakes convert into patterns and rules.');
    }

    if (!recs.length) {
        recs.push('Continue your current preparation pattern and keep tracking mocks, sleep and anxiety weekly.');
        recs.push('Challenge yourself with slightly tougher questions to stretch your comfort zone safely.');
    }

    return recs.slice(0, 6);
}

// =======================
// 7-Day Action Plan & Anxiety Flag
// =======================

function buildActionPlan(dimensionScores) {
    const list = document.getElementById('action-plan-list');
    if (!list) return;
    const items = [];

    if (dimensionScores.cognitive < 75) {
        items.push('Daily: 25 minutes focused study with active recall on one challenging topic.');
        items.push('Twice this week: simulate a timed section test and review mistakes the same day.');
    }
    if (dimensionScores.emotional < 75) {
        items.push('Daily: 10 minutes of slow breathing or mindfulness before/after study.');
        items.push('Once this week: write out top 3 exam worries and list what is in your control for each.');
    }
    if (dimensionScores.behavioral < 75) {
        items.push('Plan your next 7 days with fixed slots for mocks, revision and breaks.');
        items.push('Use today’s micro‑goals and aim to tick at least two on 5 different days.');
    }
    if (dimensionScores.physical < 75) {
        items.push('Keep a fixed sleep window (same sleep/wake time) for at least 5 days.');
        items.push('Add one 20–30 minute walk, stretch or light workout on at least 4 days.');
    }

    if (!items.length) {
        items.push('Maintain your current routines and repeat this assessment after 7–10 days to track stability.');
    }

    list.innerHTML = items.map(x => `<li>${x}</li>`).join('');
}

function maybeShowAnxietyFlag(dimensionScores) {
    const flag = document.getElementById('anxiety-flag');
    if (!flag) return;
    if (dimensionScores.emotional < 55 && dimensionScores.physical < 55) {
        flag.style.display = 'block';
    } else {
        flag.style.display = 'none';
    }
}

// =======================
// History & Confetti
// =======================

function displayHistory() {
    const section = document.getElementById('history-section');
    const chart = document.getElementById('history-chart');
    const tbody = document.getElementById('history-tbody');
    if (!section || !chart || !tbody) return;

    section.style.display = 'block';

    const recent = userData.history.slice(-10);
    chart.innerHTML = '';
    recent.forEach((rec, idx) => {
        const bar = document.createElement('div');
        bar.className = 'history-bar';
        bar.style.height = `${rec.overall * 2}px`;
        bar.innerHTML = `<div class="history-bar-value">${Math.round(rec.overall)}%</div>`;
        bar.title = `Attempt ${idx + 1}: ${Math.round(rec.overall)}%`;
        chart.appendChild(bar);
    });

    tbody.innerHTML = '';
    recent.slice().reverse().forEach(rec => {
        const d = new Date(rec.date).toLocaleDateString();
        tbody.innerHTML += `
            <tr>
                <td>${d}</td>
                <td>${Math.round(rec.overall)}%</td>
                <td>${Math.round(rec.cognitive)}%</td>
                <td>${Math.round(rec.emotional)}%</td>
                <td>${Math.round(rec.behavioral)}%</td>
                <td>${Math.round(rec.physical)}%</td>
            </tr>
        `;
    });

    renderHistoryCalendar();
}

function renderHistoryCalendar() {
    const cal = document.getElementById('history-calendar');
    if (!cal) return;
    cal.innerHTML = '';
    const recent = userData.history.slice(-14);
    recent.forEach(rec => {
        const dot = document.createElement('div');
        dot.className = 'history-dot';
        if (rec.overall >= 75) dot.classList.add('good');
        else if (rec.overall >= 55) dot.classList.add('medium');
        else dot.classList.add('low');
        cal.appendChild(dot);
    });
}

function createConfetti() {
    const confetti = document.getElementById('confetti');
    if (!confetti) return;
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

// =======================
// Certificate / Export / Share / Retake
// =======================

function generateCertificate() {
    const modal = document.getElementById('certificate-modal');
    if (!modal) return;

    if (!userData.history || !userData.history.length) {
        alert('Please complete and submit the readiness assessment first to generate your verified certificate.');
        return;
    }

    const last = userData.history[userData.history.length - 1];

    const scoreEl = document.getElementById('cert-score');
    const levelEl = document.getElementById('cert-level');
    const dateEl = document.getElementById('cert-date');
    const idEl = document.getElementById('cert-id');
    const cogEl = document.getElementById('cert-cog-score');
    const emoEl = document.getElementById('cert-emo-score');
    const behEl = document.getElementById('cert-beh-score');
    const phyEl = document.getElementById('cert-phy-score');

    const scoreVal = Math.round(last.overall);
    if (scoreEl) scoreEl.textContent = scoreVal + '%';

    let level = 'Developing';
    if (scoreVal >= 90) level = 'Outstanding';
    else if (scoreVal >= 75) level = 'Strong';
    else if (scoreVal >= 60) level = 'Moderate';

    if (levelEl) levelEl.textContent = `${level} Readiness Level`;

    const assessmentDate = last.date ? new Date(last.date) : new Date();
    if (dateEl) {
        dateEl.textContent = assessmentDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    if (idEl) {
        const idHash = Math.abs((last.timeTaken || 120) * 31 + Math.round(last.overall * 100));
        idEl.textContent = `CA-PR-${idHash}-${assessmentDate.getFullYear()}`;
    }

    if (cogEl) cogEl.textContent = `Cognitive: ${Math.round(last.cognitive || 0)}%`;
    if (emoEl) emoEl.textContent = `Emotional: ${Math.round(last.emotional || 0)}%`;
    if (behEl) behEl.textContent = `Behavioral: ${Math.round(last.behavioral || 0)}%`;
    if (phyEl) phyEl.textContent = `Physical: ${Math.round(last.physical || 0)}%`;

    syncCandidateName(userData.studentName || 'CA Aspirant', false);
    clearDownloadStatus();

    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    modal.scrollTop = 0;
}

function closeCertificate() {
    const modal = document.getElementById('certificate-modal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    clearDownloadStatus();
}

function setDownloadStatus(message, type = 'info', isSpinning = false) {
    const statusEl = document.getElementById('cert-download-status');
    if (!statusEl) return;
    statusEl.className = `cert-status-alert ${type}`;
    const icon = isSpinning
        ? '<i class="fas fa-spinner fa-spin"></i>'
        : (type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-info-circle"></i>');
    statusEl.innerHTML = `${icon} <span>${message}</span>`;
    statusEl.style.display = 'flex';
}

function clearDownloadStatus() {
    const statusEl = document.getElementById('cert-download-status');
    if (statusEl) statusEl.style.display = 'none';
}

function getSanitizedCandidateName() {
    const raw = (userData.studentName && userData.studentName !== 'CA Aspirant')
        ? userData.studentName
        : 'CA_Aspirant';
    return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function triggerFileDownload(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download Certificate as PNG Image Button Action
async function downloadCertificateAsImage() {
    const btn = document.getElementById('btn-download-image');
    if (btn) btn.disabled = true;
    setDownloadStatus('Generating crisp high-resolution certificate image...', 'info', true);

    try {
        const certEl = document.getElementById('certificate-content');
        const filename = `Exam_Readiness_Certificate_${getSanitizedCandidateName()}.png`;

        if (window.html2canvas) {
            const canvas = await window.html2canvas(certEl, {
                scale: 2.2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
            const imgUrl = canvas.toDataURL('image/png');
            triggerFileDownload(imgUrl, filename);
            setDownloadStatus('High-resolution PNG image downloaded successfully! Check your downloads folder.', 'success');
        } else {
            // High-resolution canvas fallback
            const canvas = generateFallbackCanvas();
            const imgUrl = canvas.toDataURL('image/png');
            triggerFileDownload(imgUrl, filename);
            setDownloadStatus('PNG certificate generated and downloaded successfully!', 'success');
        }
    } catch (err) {
        console.warn('html2canvas error, using high-res canvas fallback:', err);
        try {
            const canvas = generateFallbackCanvas();
            const imgUrl = canvas.toDataURL('image/png');
            triggerFileDownload(imgUrl, `Exam_Readiness_Certificate_${getSanitizedCandidateName()}.png`);
            setDownloadStatus('Certificate image generated & downloaded successfully!', 'success');
        } catch (fallbackErr) {
            setDownloadStatus('Failed to generate image: ' + fallbackErr.message, 'error');
        }
    } finally {
        if (btn) btn.disabled = false;
    }
}

// Download Certificate as PDF Document Button Action
async function downloadCertificateAsPDF() {
    const btn = document.getElementById('btn-download-pdf');
    if (btn) btn.disabled = true;
    setDownloadStatus('Generating landscape A4 PDF certificate...', 'info', true);

    try {
        const certEl = document.getElementById('certificate-content');
        const filename = `Exam_Readiness_Certificate_${getSanitizedCandidateName()}.pdf`;

        let canvas;
        if (window.html2canvas) {
            canvas = await window.html2canvas(certEl, {
                scale: 2.2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
        } else {
            canvas = generateFallbackCanvas();
        }

        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdfWidth = 297;  // A4 Landscape width mm
            const pdfHeight = 210; // A4 Landscape height mm

            const imgAspect = canvas.width / canvas.height;
            let targetW = pdfWidth - 16;
            let targetH = targetW / imgAspect;

            if (targetH > pdfHeight - 16) {
                targetH = pdfHeight - 16;
                targetW = targetH * imgAspect;
            }

            const posX = (pdfWidth - targetW) / 2;
            const posY = (pdfHeight - targetH) / 2;

            pdf.addImage(imgData, 'PNG', posX, posY, targetW, targetH, undefined, 'FAST');
            pdf.save(filename);
            setDownloadStatus('PDF certificate downloaded successfully!', 'success');
        } else {
            printCertificate();
            setDownloadStatus('Print preview opened. Select "Save as PDF" to save your certificate.', 'success');
        }
    } catch (err) {
        console.error('PDF generation error:', err);
        setDownloadStatus('PDF export error. Opening direct printable view...', 'error');
        printCertificate();
    } finally {
        if (btn) btn.disabled = false;
    }
}

// Direct Print Certificate
function printCertificate() {
    const certEl = document.getElementById('certificate-content');
    if (!certEl) return;

    const printWin = window.open('', '_blank', 'width=1000,height=750');
    if (!printWin) {
        alert('Please allow popups to print your certificate.');
        return;
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Print Certificate - ${userData.studentName || 'CA Aspirant'}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        @page { size: landscape; margin: 8mm; }
        body { background: #ffffff; margin: 0; padding: 20px; display: flex; justify-content: center; }
        #certificate-content { width: 100% !important; max-width: 900px; box-shadow: none !important; }
    </style>
</head>
<body>
    ${certEl.outerHTML}
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    <\/script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
}

// Pure HTML5 Canvas Drawing Fallback (Zero external dependency)
function generateFallbackCanvas() {
    const last = (userData.history && userData.history.length)
        ? userData.history[userData.history.length - 1]
        : { overall: 75, cognitive: 70, emotional: 75, behavioral: 80, physical: 75, date: new Date().toISOString() };

    const canvas = document.createElement('canvas');
    canvas.width = 1720;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1720, 1200);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.5, '#fcfdfd');
    bgGrad.addColorStop(1, '#f3f6fb');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1720, 1200);

    // Outer Royal Navy Border
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#14326e';
    ctx.strokeRect(30, 30, 1660, 1140);

    // Inner Gold Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d4af37';
    ctx.strokeRect(55, 55, 1610, 1090);

    // Thin accent inner border
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e0cf9b';
    ctx.strokeRect(65, 65, 1590, 1070);

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#14326e';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 860, 180);

    // Subtitle
    ctx.fillStyle = '#556677';
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText('Exam Psychological & Behavioral Readiness Assessment', 860, 230);

    // Gold Ribbon / Stars
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('★ ★ ★   OFFICIAL READINESS CREDENTIAL   ★ ★ ★', 860, 275);

    // Salutation
    ctx.fillStyle = '#666666';
    ctx.font = '24px sans-serif';
    ctx.fillText('THIS CREDENTIAL IS PROUDLY PRESENTED TO', 860, 350);

    // Candidate Name
    const nameText = userData.studentName || 'CA Aspirant';
    ctx.fillStyle = '#14326e';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(nameText, 860, 435);

    // Name underline
    const nameWidth = ctx.measureText(nameText).width;
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(860 - (nameWidth / 2) - 30, 455);
    ctx.lineTo(860 + (nameWidth / 2) + 30, 455);
    ctx.stroke();

    // Description text
    ctx.fillStyle = '#444444';
    ctx.font = '22px sans-serif';
    ctx.fillText('for successfully undergoing the comprehensive psychological and behavioral readiness assessment', 860, 520);
    ctx.fillText('designed for CA exam aspirants, demonstrating overall psychological readiness of:', 860, 555);

    // Score Circle Badge
    const scoreVal = Math.round(last.overall) + '%';
    ctx.fillStyle = '#14326e';
    ctx.beginPath();
    ctx.arc(860, 680, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d4af37';
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(scoreVal, 860, 690);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText('OVERALL SCORE', 860, 725);

    // Level Pill
    let level = 'Developing';
    if (last.overall >= 90) level = 'Outstanding';
    else if (last.overall >= 75) level = 'Strong';
    else if (last.overall >= 60) level = 'Moderate';

    ctx.fillStyle = '#1b5e20';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${level} Readiness Level`, 860, 810);

    // Dimensions Breakdown Row
    ctx.fillStyle = '#555555';
    ctx.font = '20px sans-serif';
    const breakdownText = `Cognitive: ${Math.round(last.cognitive || 0)}%   •   Emotional: ${Math.round(last.emotional || 0)}%   •   Behavioral: ${Math.round(last.behavioral || 0)}%   •   Physical: ${Math.round(last.physical || 0)}%`;
    ctx.fillText(breakdownText, 860, 860);

    // Footer Divider
    ctx.strokeStyle = '#d0d8e4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, 930);
    ctx.lineTo(1620, 930);
    ctx.stroke();

    // Footer Left: Date & ID
    const dateStr = new Date(last.date || Date.now()).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Issued Date: ${dateStr}`, 120, 985);
    ctx.fillStyle = '#666666';
    ctx.font = '17px sans-serif';
    ctx.fillText('Assessment ID: CA-PR-' + Math.abs(Math.round(last.overall * 100)) + '-VERIFIED', 120, 1020);

    // Footer Center: Verified Gold Stamp
    ctx.save();
    ctx.translate(860, 1010);
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#14326e';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('VERIFIED', 0, -4);
    ctx.fillText('ASSESSMENT', 0, 16);
    ctx.restore();

    // Footer Right: Signature & Developer
    ctx.textAlign = 'right';
    ctx.fillStyle = '#14326e';
    ctx.font = 'italic 34px Georgia, cursive';
    ctx.fillText('CA Tanmay Rajendra Bhavar', 1600, 985);
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('CA Tanmay Rajendra Bhavar', 1600, 1020);
    ctx.fillStyle = '#666666';
    ctx.font = '16px sans-serif';
    ctx.fillText('Developer & Assessment Designer (Nashik)', 1600, 1048);

    return canvas;
}

function exportResults() {
    if (!userData.history.length) return;
    const last = userData.history[userData.history.length - 1];

    let csv = "data:text/csv;charset=utf-8,";
    csv += "Exam Psychological Readiness Report\n\n";
    csv += "Date," + new Date(last.date).toLocaleDateString() + "\n";
    csv += "Overall Readiness," + Math.round(last.overall) + "%\n";
    csv += "Cognitive Score," + Math.round(last.cognitive) + "%\n";
    csv += "Emotional Score," + Math.round(last.emotional) + "%\n";
    csv += "Behavioral Score," + Math.round(last.behavioral) + "%\n";
    csv += "Physical Score," + Math.round(last.physical) + "%\n";
    csv += "Time Taken," + last.timeTaken + " seconds\n";
    csv += "Points Earned," + last.pointsEarned + "\n";
    csv += "Pre-Anxiety," + (last.preAnxiety ?? '') + "\n";
    csv += "Post-Anxiety," + (last.postAnxiety ?? '') + "\n";
    csv += "\nTotal Attempts," + userData.attempts + "\n";
    csv += "Total Points," + userData.totalPoints + "\n";
    csv += "Current Streak," + userData.streak + " days\n";
    csv += "Badges Earned," + userData.badges.length + "\n";

    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'exam_readiness_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareResults() {
    if (!userData.history.length) return;
    const last = userData.history[userData.history.length - 1];
    const text = `I just completed my Exam Psychological Readiness Assessment and scored ${Math.round(last.overall)}%! 🎓 Check your readiness too:`;

    if (navigator.share) {
        navigator.share({
            title: 'Exam Readiness Assessment',
            text,
            url: window.location.href
        }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text + '\n' + window.location.href).then(() => {
            alert('Results copied to clipboard. You can paste and share on your social media.');
        });
    }
}

function retakeAssessment() {
    const resultSection = document.getElementById('result-section');
    const form = document.getElementById('exam-form');
    if (resultSection) resultSection.style.display = 'none';
    if (!form) return;
    form.style.display = 'block';
    form.reset();

    document.querySelectorAll('.question.answered').forEach(q => q.classList.remove('answered'));

    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const percent = document.getElementById('progress-percent');
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
    if (percent) percent.textContent = '0%';

    startTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =======================
// DOM Ready
// =======================

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadUserData();
    loadJournal();
    loadSpacedList();
    loadMicroGoals();
    startTimer();
    trackProgress();

    const form = document.getElementById('exam-form');
    if (form) form.addEventListener('submit', calculateResults);

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('certificate-modal');
        if (modal && event.target === modal) closeCertificate();
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeCertificate();
    });
});
