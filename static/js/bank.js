document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadBankQuestions();

    // Listen for changes
    document.getElementById('subject-select').addEventListener('change', loadBankQuestions);
});

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

async function loadBankQuestions() {

    const subject = document.getElementById('subject-select').value;
    const response = await fetch(`/api/questions?subject=${subject}`); 
    const questions = await response.json();
    
    const tableBody = document.getElementById('questions-body');
    tableBody.innerHTML = ''; // Clear loading state

    questions.forEach(q => {
        // 2. Determine colors based on difficulty
        let diffColor = "bg-gray-500/10 text-gray-600"; // default
        if (q.difficulty.toUpperCase() === 'EASY') diffColor = "bg-green-500/10 text-green-500 border-green-500/20";
        if (q.difficulty.toUpperCase() === 'MEDIUM') diffColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        if (q.difficulty.toUpperCase() === 'HARD') diffColor = "bg-red-500/10 text-red-500 border-red-500/20";

        // 3. Create HTML Row
        const row = document.createElement('tr');
        row.className = "group hover:bg-background-light dark:hover:bg-[#1c242e] transition-colors";
        
        row.innerHTML = `
            <td class="p-4 pl-6">
                <div class="flex flex-col gap-1">
                    <p class="text-sm font-medium text-[#111418] dark:text-white line-clamp-2">${q.question}</p>
                    <div class="flex gap-2 mt-1">
                        ${q.tags.map(tag => `<span class="px-2 py-0.5 rounded text-[10px] bg-[#e5e7eb] dark:bg-[#283039] text-[#637588] dark:text-[#9da8b9]">#${tag}</span>`).join('')}
                    </div>
                </div>
            </td>
            <td class="p-4 align-top pt-5">
                <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold text-[#111418] dark:text-white">${q.subject}</span>
                    <a href="${"/theory"}" class="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                        ${q.topic}
                        <span class="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                </div>
            </td>
            <td class="p-4 align-top pt-5">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${diffColor}">
                    ${q.difficulty}
                </span>
            </td>
            <td class="p-4 align-top pt-5">
                 <span class="text-xs font-bold text-primary uppercase">${q.entry_type}</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}