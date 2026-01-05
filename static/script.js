async function loadQuestions() {
    const statusElement = document.getElementById('status');
    statusElement.textContent = "Loading...";
    
    // 1. Get values from HTML inputs
    const subject = document.getElementById('subject-select').value;
    const difficulty = document.getElementById('difficulty-select').value;
    const isExam = document.getElementById('exam-toggle').checked;

    console.log(`Loading questions for subject: ${subject}, difficulty: ${difficulty}, isExam: ${isExam}`);

    // 2. Build the URL dynamically
    // We use URLSearchParams to handle the ? and & logic cleanly
    const params = new URLSearchParams();
    params.append('subject', subject);
    
    if (difficulty) {
        params.append('difficulty', difficulty);
    }
    if (isExam) {
        params.append('is_exam', 'true');
    }

    // The URL will look like: /api/questions?subject=Hydrology&difficulty=HARD
    const url = `/api/questions?${params.toString()}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            // Handle 404 if file doesn't exist
            if (response.status === 404) throw new Error("Subject file not found");
            throw new Error("Server Error");
        }

        const questions = await response.json();
        
        statusElement.textContent = `Found ${questions.length} questions`;
        renderCards(questions);

    } catch (error) {
        console.error(error);
        statusElement.textContent = error.message;
        document.getElementById('app').innerHTML = `<p style="color:red; text-align:center">${error.message}</p>`;
    }
}

function renderCards(data) {
    const container = document.getElementById('app');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #666;">No questions match your filters.</p>';
        return;
    }

    data.forEach(q => {
        const card = document.createElement('div');
        // Add 'exam-card' class if it's an exam question for special styling
        const examClass = q.is_exam ? 'exam-card' : '';
        card.className = `card ${q.difficulty.toLowerCase()} ${examClass}`;

        card.innerHTML = `
            <div class="card-header">
                <span class="badge">${q.difficulty}</span>
                <span class="type">${q.entry_type}</span>
                ${q.is_exam ? '<span class="badge" style="background:#ffcccc; color:red">EXAM</span>' : ''}
            </div>
            <div class="card-body">
                <h3>${q.question}</h3>
                <details>
                    <summary>Show Answer</summary>
                    <p>${q.answer}</p>
                </details>
            </div>
            <div class="card-footer">
                <small>${q.topic}</small>
                <div class="tags">
                    ${q.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadQuestions);