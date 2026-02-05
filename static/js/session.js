let questions = [];
let currentIndex = 0;

// Remove the generic DOMContentLoaded loader
// We only load when the user clicks "Start"

async function startSession() {
    // 1. Get Values from Modal
    const subject = document.getElementById('setup-subject').value;
    const is_exam = document.getElementById('exam_checkmark').checked;
    const difficulty = document.getElementById('setup-difficulty').value;
    const limit = document.getElementById('setup-limit').value;
    const button = document.querySelector('button[onclick="startSession()"]');

    // 2. Show Loading State on Button
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Loading...`;

    // 3. Build URL
    let url = `/api/questions?subject=${subject}&limit=${limit}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    if (is_exam) {
        url += `&is_exam=true`;
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            alert("Could not load questions (maybe subject file doesn't exist?)");
            button.disabled = false;
            button.innerHTML = originalText;
            return;
        }

        questions = await response.json();

        if (questions.length === 0) {
            alert("No questions found with these filters.");
            button.disabled = false;
            button.innerHTML = originalText;
            return;
        }

        // 4. Update UI to Game Mode
        document.getElementById('setup-modal').classList.add('hidden');
        document.getElementById('game-interface').classList.remove('hidden');
        document.getElementById('game-interface').classList.add('flex'); // Add flex back
        
        // Update Header
        document.getElementById('header-subject').textContent = subject;

        // 5. Start Game
        currentIndex = 0;
        renderQuestion();

    } catch (error) {
        console.error(error);
        alert("Error connecting to server.");
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

function renderQuestion() {
    if (currentIndex >= questions.length) {
        alert("Session Complete! Returning to menu.");
        window.location.reload(); 
        return;
    }

    const q = questions[currentIndex];

    // Reset UI
    document.getElementById('answer-section').classList.add('hidden');
    
    // Set Text
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('answer-text').textContent = q.answer;

    // Set Progress
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${questions.length}`;

    // FIX 1: Change 'const' to 'let' so we can append to it
    // FIX 2: Check the question object 'q.is_exam' instead of a global variable
    let tagHtml = `
        <span class="px-2 py-1 rounded-md text-xs bg-slate-100 dark:bg-[#282f39] text-slate-700 dark:text-slate-300">${q.topic}</span>
        <span class="px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">${q.difficulty}</span>
    `;

    if (q.is_exam) {
        tagHtml += `<span class="px-2 py-1 rounded-md text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30">Exam / Quiz</span>`;
    }

    document.getElementById('tags-container').innerHTML = tagHtml;
}

// Event Listeners for Game
document.getElementById('reveal-btn').addEventListener('click', () => {
    document.getElementById('answer-section').classList.remove('hidden');
    document.getElementById('answer-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentIndex++;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});