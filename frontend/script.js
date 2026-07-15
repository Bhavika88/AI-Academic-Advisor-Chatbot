
    async function downloadAudit() {
    showToast('📄 Generating academic audit report...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(5, 150, 105); // Emerald color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ACADEMIC AUDIT REPORT", 20, 25);
    
    // Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Student: Alex Johnson`, 20, 55);
    doc.text(`Student ID: 202488192`, 20, 63);
    doc.text(`Program: B.S. Computer Science`, 20, 71);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 79);
    
    // GPA Section
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 90, 170, 35, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("GPA SUMMARY", 25, 102);
    doc.setFont("helvetica", "normal");
    doc.text("Overall GPA: 3.85", 25, 115);
    doc.text("Major GPA: 3.92", 100, 115);
    doc.text("Credits Completed: 92 / 120", 25, 125);
    
    // Requirements Section
    doc.setFont("helvetica", "bold");
    doc.text("DEGREE REQUIREMENTS PROGRESS", 20, 150);
    doc.setFont("helvetica", "normal");
    
    let y = 160;
    const requirements = [
        { name: "Core Computer Science", completed: "100%", status: "Completed" },
        { name: "Mathematics Requirements", completed: "85%", status: "In Progress" },
        { name: "General Electives", completed: "40%", status: "In Progress" },
        { name: "Science Requirements", completed: "75%", status: "In Progress" },
        { name: "Humanities Electives", completed: "60%", status: "In Progress" }
    ];
    
    requirements.forEach(req => {
        doc.text(`• ${req.name}: ${req.completed} - ${req.status}`, 20, y);
        y += 8;
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("EduFlow AI - Official Academic Audit", 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 170, 285);
    }
    
    doc.save(`Academic_Audit_Alex_Johnson_${Date.now()}.pdf`);
    showToast('✅ Audit report downloaded successfully!', 'success');
}

        function requestReview() {
            showToast('📨 Review request submitted to your academic advisor', 'success');
            setTimeout(() => {
                showToast('💬 You will hear back within 48 hours', 'info');
            }, 2000);
        }
        // --- Initialization ---
        lucide.createIcons();

        // --- Navigation Logic ---
        function switchTab(tabId) {
            // Update Breadcrumb
            document.getElementById('breadcrumb-tab').innerText = tabId;

            // Update Views
            document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
            document.getElementById(`view-${tabId}`).classList.remove('hidden');

            // Update Sidebar UI
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.dataset.tab === tabId) {
                    item.classList.add('nav-item-active');
                    item.classList.remove('text-slate-600');
                } else {
                    item.classList.remove('nav-item-active');
                    item.classList.add('text-slate-600');
                }
            });

            // Close sidebar on mobile
            if (window.innerWidth < 1024) {
                document.getElementById('sidebar').classList.add('-translate-x-full');
            }
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('-translate-x-full');
        }

        // Default tab
        switchTab('dashboard');

        // --- Chat Logic ---
// --- Global State ---
let currentSessionId = null;

// --- Chat UI Helpers ---
function suggestText(text) {
    const chatInput = document.getElementById('chat-input'); // Ensure this ID matches your <input>
    if (!chatInput) {
        console.error("Could not find chat-input element!");
        return;
    }
    
    chatInput.value = text;
    
    // Jump to the chat tab immediately so the user sees the action
    switchTab('chat'); 
    
    // Manually trigger the submit logic
    handleChatSubmit();
}

// Unified function to add messages to the UI
function addMessage(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = role === 'user' || role === 'student';
    
    const messageHtml = `
        <div class="flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="max-w-[80%] ${isUser ? 'flex flex-row-reverse' : 'flex'}">
                <div>
                    <div class="p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${isUser ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'}">
                        ${content}
                    </div>
                    <p class="text-[10px] font-bold text-slate-400 mt-2 ${isUser ? 'text-right mr-1' : 'ml-1'} uppercase tracking-tighter">${isUser ? 'You' : 'EduFlow AI'} • ${time}</p>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.insertAdjacentHTML('beforeend', messageHtml);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // REMOVE this line → if(window.lucide) lucide.createIcons();
    
    // Instead, only recreate icons for the new message if they contain lucide icons
    if(window.lucide) {
        const newMessage = chatMessages.lastElementChild;
        lucide.createIcons({ root: newMessage });
    }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorMsg = document.getElementById('login-error');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = await fetch('http://127.0.0.1:8000/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            document.getElementById('login-overlay').classList.add('hidden');
            loadSidebar();
        } else {
            const errorDetail = await response.json();
            console.error("Login Failed:", errorDetail);
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
});

// --- Core Chat Function ---
async function handleChatSubmit(e) {
    if (e) e.preventDefault();
    
    const chatInput = document.getElementById('chat-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const text = chatInput.value.trim();
    
    if (!text) return;

    // Force UI to stay on Chat Tab
    switchTab('chat'); 

    // CRITICAL FIX: Always use a CLEAN session ID (no "user_" prefix)
    if (!currentSessionId) {
        currentSessionId = "session_" + Date.now();
        sessionStorage.setItem('activeSession', currentSessionId);
    }
    
    // Make sure session ID doesn't have "user_" prefix
    if (currentSessionId.startsWith('user_')) {
        // This shouldn't happen, but if it does, fix it
        currentSessionId = "session_" + Date.now();
        sessionStorage.setItem('activeSession', currentSessionId);
    }
    
    console.log("📤 Sending with session_id:", currentSessionId);

    addMessage(text, 'user');
    chatInput.value = '';
    typingIndicator.classList.remove('hidden');

    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                message: text,
                session_id: currentSessionId
            })
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const data = await response.json();
        typingIndicator.classList.add('hidden');
        addMessage(data.response, 'assistant');
        
        // CRITICAL: Do NOT update currentSessionId from response
        // The backend might return something, but we ignore it
        // Keep using our original session ID
        
        await refreshSidebarQuiet();

    } catch (error) {
        console.error("Chat error:", error);
        typingIndicator.classList.add('hidden');
        addMessage("⚠️ Connection error. Please check if backend is running.", 'assistant');
    }
}

async function refreshSidebarQuiet() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('http://127.0.0.1:8000/sessions', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const sessionsData = await response.json();
        const list = document.getElementById('session-list');
        
        // Store current session ID before refresh
        const currentId = currentSessionId;
        
        list.innerHTML = sessionsData.map(s => {
            // Extract just the session part if it has user_ prefix
            let displayId = s.id;
            let cleanId = s.id;
            
            // The backend returns IDs like "user_1_session_123"
            // We need to extract "session_123" for comparison
            if (s.id.startsWith('user_')) {
                const parts = s.id.split('_');
                const sessionPart = parts.slice(2).join('_'); // Get "session_123"
                cleanId = sessionPart;
            }
            
            return `
                <li class="group p-3 mb-2 rounded-xl hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-sm ${currentId === cleanId ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'} flex items-center justify-between">
                    <div onclick="loadSession('${cleanId}')" class="flex items-center gap-2 flex-1">
                        <i data-lucide="message-square" class="w-4 h-4"></i> 
                        <span class="truncate w-32">${s.title}</span>
                    </div>
                    <button onclick="deleteSession(event, '${cleanId}')" class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-all">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </li>
            `;
        }).join('');
        
        if(window.lucide) lucide.createIcons();
        
    } catch (e) { 
        console.error("Sidebar refresh failed:", e); 
    }
}

function logout() {
    // Clear any stored user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    sessionStorage.clear();
    
    // Show login overlay
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) {
        loginOverlay.style.display = 'flex';
    }
    
    // Clear chat messages and session
    currentSessionId = null;
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="flex justify-start">
                <div class="max-w-[80%]">
                    <div class="bg-slate-50 text-slate-800 p-5 rounded-3xl rounded-tl-none border border-slate-100 text-sm leading-relaxed">
                        Please log in to continue your academic journey.
                    </div>
                </div>
            </div>
        `;
    }
    
    // Reset to dashboard view
    switchTab('dashboard');
    
    showToast('Logged out successfully', 'info');
}

// Handle Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorMsg = document.getElementById('login-error');
    
    // Simple frontend authentication (you can replace with real API later)
    if (username === 'student_01' && password === '123') {
        // Store login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // Hide login overlay
        document.getElementById('login-overlay').style.display = 'none';
        
        // Update profile info
        const profileName = document.querySelector('.flex-1 .text-xs.font-bold');
        const profileId = document.querySelector('.flex-1 .text-[10px]');
        if (profileName) profileName.textContent = username === 'student_01' ? 'Alex Johnson' : username;
        if (profileId) profileId.textContent = 'ID: 202488192';
        
        // Refresh chat history
        loadSidebar();
        
        // Show welcome back message
        addMessage(`Welcome back! How can I assist with your academic journey today?`, 'assistant');
        
        showToast(`✅ Welcome back, ${username === 'student_01' ? 'Alex' : username}!`, 'success');
    } else {
        errorMsg.classList.remove('hidden');
        showToast('Invalid credentials. Try student_01 / 123', 'error');
    }
});

// --- Sidebar & History Logic ---
async function loadSidebar() {
    // Save current active tab before refreshing sidebar
    const currentActiveTab = document.querySelector('.nav-item-active')?.dataset?.tab || 'chat';
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('http://127.0.0.1:8000/sessions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // THE KEY
            }
        });
        if (response.status === 401) return logout();
        const sessionsData = await response.json();
        const list = document.getElementById('session-list');
        
        
        list.innerHTML = sessionsData.map(s => `
            <li class="group p-3 mb-2 rounded-xl hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-sm text-slate-600 flex items-center justify-between">
                <div onclick="loadSession('${s.id}')" class="flex items-center gap-2 flex-1">
                    <i data-lucide="message-square" class="w-4 h-4"></i> 
                    <span class="truncate w-32">${s.title}</span>
                </div>
                <button onclick="deleteSession(event, '${s.id}')" class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </li>
        `).join('');
        
        if(window.lucide) lucide.createIcons();
        
        // Restore the active tab after sidebar refresh
        if (currentActiveTab) {
            switchTab(currentActiveTab);
        }
    } catch (e) { 
        console.error("Sidebar refresh failed:", e); 
    }
}

async function deleteSession(event, id) {
    event.stopPropagation();
    const token = localStorage.getItem('token');

    if (!confirm("Are you sure you want to delete this chat?")) return;

    console.log("🗑️ Deleting session with ID:", id);

    try {
        const response = await fetch(`http://127.0.0.1:8000/sessions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("Delete response:", data);

        if (response.ok) {
            // If the deleted chat was the one currently open, clear the screen
            if (currentSessionId === id) {
                // Clear current session
                currentSessionId = null;
                sessionStorage.removeItem('activeSession');
                
                // Clear chat messages UI
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    chatMessages.innerHTML = `
                        <div class="flex justify-start">
                            <div class="max-w-[80%]">
                                <div class="bg-slate-50 text-slate-800 p-5 rounded-3xl rounded-tl-none border border-slate-100 text-sm leading-relaxed">
                                    Chat deleted. Start a new conversation below.
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
            
            // Refresh sidebar to show updated list
            await loadSidebar();
            
            showToast('🗑️ Chat deleted successfully', 'success');
        } else {
            showToast(data.message || 'Failed to delete chat', 'error');
        }
    } catch (error) {
        console.error("Delete failed:", error);
        showToast('Error deleting chat', 'error');
    }
}

async function loadSession(id) {
    // CRITICAL: Use the session ID as-is from the sidebar
    // The backend expects the raw session_id (without "user_" prefix)
    currentSessionId = id;
    sessionStorage.setItem('activeSession', currentSessionId);
    
    const token = localStorage.getItem('token');
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // Switch to chat tab
    switchTab('chat'); 

    console.log("📥 Loading session with ID:", id);

    const response = await fetch(`http://127.0.0.1:8000/chat-history/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    
    if (data.history && data.history.length > 0) {
        data.history.forEach(msg => {
            addMessage(msg.content, msg.role === 'student' ? 'user' : 'assistant');
        });
    } else {
        // Empty chat - show welcome message
        addMessage("Welcome back! How can I assist with your academic journey today?", 'assistant');
    }
}

async function loginUser() {
    const formData = new FormData();
    formData.append('username', 'student_01');
    formData.append('password', 'student123');

    const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    localStorage.setItem('token', data.access_token); // Save the key
    console.log("✅ Logged in! Token saved.");
}

function startNewChat() {
    currentSessionId = null; // Clear the session variable
    document.getElementById('chat-messages').innerHTML = ''; // Clear the UI
    
    // Switch view and show welcome message
    switchTab('chat'); 
    addMessage("New session started. How can I assist with your academic queries today?", 'assistant');

    loadSidebar();
}

// --- Event Listeners ---
window.onload = loadSidebar;

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Optional: different colors for different types
    if (type === 'success') {
        toast.style.background = '#059669';
    } else if (type === 'error') {
        toast.style.background = '#dc2626';
    } else {
        toast.style.background = '#1e293b';
    }
    
    toast.innerHTML = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function downloadTranscript() {
    showToast('📄 Generating official transcript...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header with seal effect
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL TRANSCRIPT", 20, 28);
    
    // University info
    doc.setFontSize(10);
    doc.text("EduFlow University", 20, 38);
    doc.text("Office of the Registrar", 20, 44);
    
    // Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT INFORMATION", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: Alex Johnson`, 20, 75);
    doc.text(`Student ID: 202488192`, 20, 83);
    doc.text(`Program: Bachelor of Science in Computer Science`, 20, 91);
    doc.text(`Advisor: Dr. Sarah Miller`, 20, 99);
    doc.text(`Expected Graduation: May 2025`, 20, 107);
    
    // GPA Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 118, 170, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("ACADEMIC STANDING", 25, 130);
    doc.setFont("helvetica", "normal");
    doc.text(`Cumulative GPA: 3.85`, 25, 142);
    doc.text(`Honors Status: Dean's List`, 110, 142);
    
    // Course History Table Header
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 230);
    doc.rect(20, 160, 170, 10, 'F');
    doc.text("COURSE", 25, 168);
    doc.text("CREDITS", 110, 168);
    doc.text("GRADE", 140, 168);
    doc.text("TERM", 165, 168);
    
    // Course Data
    doc.setFont("helvetica", "normal");
    const courses = [
        { name: "CS101 - Intro to Programming", credits: 3, grade: "A", term: "Fall 2023" },
        { name: "CS201 - Data Structures", credits: 3, grade: "A-", term: "Spring 2024" },
        { name: "MATH201 - Calculus II", credits: 4, grade: "B+", term: "Spring 2024" },
        { name: "CS301 - Algorithms", credits: 3, grade: "A", term: "Fall 2024" },
        { name: "CS401 - Machine Learning", credits: 3, grade: "A", term: "Spring 2025" },
        { name: "CS405 - Distributed Systems", credits: 3, grade: "A-", term: "Spring 2025" },
        { name: "PHYS101 - Physics I", credits: 4, grade: "B+", term: "Fall 2023" },
        { name: "ENGL201 - Academic Writing", credits: 3, grade: "A-", term: "Fall 2023" }
    ];
    
    let yPos = 178;
    courses.forEach(course => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(course.name.substring(0, 35), 25, yPos);
        doc.text(course.credits.toString(), 115, yPos);
        doc.text(course.grade, 140, yPos);
        doc.text(course.term, 165, yPos);
        yPos += 8;
    });
    
    // Summary
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 20, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Total Credits Attempted: 92`, 20, yPos);
    yPos += 6;
    doc.text(`Total Credits Earned: 92`, 20, yPos);
    yPos += 6;
    doc.text(`Grade Point Average: 3.85`, 20, yPos);
    
    // Footer with authentication
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This is an official transcript issued by EduFlow University", 20, 285);
        doc.text(`Document ID: TRANS-${Date.now()}`, 20, 292);
        doc.text(`Page ${i} of ${pageCount}`, 170, 292);
    }
    
    doc.save(`Official_Transcript_Alex_Johnson_${Date.now()}.pdf`);
    showToast('✅ Transcript downloaded successfully!', 'success');
}

function applyForScholarships() {
    showToast('📝 Scholarship application portal opening...', 'info');
    setTimeout(() => {
        showToast('✅ Application submitted! Check your email for confirmation.', 'success');
    }, 2000);
}

function applyForScholarship(scholarshipName) {
    showToast(`📝 Applying for ${scholarshipName}...`, 'info');
    setTimeout(() => {
        showToast(`✅ Application for ${scholarshipName} submitted successfully!`, 'success');
    }, 1500);
}

// Draft Modal Functions
function openDraftModal() {
    const modal = document.getElementById('draft-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Clear previous values
    document.getElementById('draft-semester').value = 'Spring 2025';
    document.getElementById('course1').value = '';
    document.getElementById('course2').value = '';
    document.getElementById('course3').value = '';
    document.getElementById('course4').value = '';
}

function closeDraftModal() {
    const modal = document.getElementById('draft-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveDraft() {
    const semester = document.getElementById('draft-semester').value;
    const courses = [];
    
    if (document.getElementById('course1').value) courses.push(document.getElementById('course1').value);
    if (document.getElementById('course2').value) courses.push(document.getElementById('course2').value);
    if (document.getElementById('course3').value) courses.push(document.getElementById('course3').value);
    if (document.getElementById('course4').value) courses.push(document.getElementById('course4').value);
    
    if (courses.length === 0) {
        showToast('⚠️ Please add at least one course', 'error');
        return;
    }
    
    // Create the new draft HTML
    const coursesHtml = courses.map(course => `
        <div class="flex items-center p-3 border border-slate-100 rounded-xl">
            <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs mr-4">📘</div>
            <div class="flex-1">
                <p class="text-sm font-bold">${course}</p>
                <p class="text-[10px] text-slate-500">Draft • Pending Approval</p>
            </div>
            <button onclick="removeDraftCourse(this)" class="text-red-400 hover:text-red-600">
                <i data-lucide="x" size="16"></i>
            </button>
        </div>
    `).join('');
  
    const plannerRightColumn = document.querySelector('#view-planner .grid.grid-cols-1.md\\:grid-cols-2.gap-8');
    if (plannerRightColumn) {
        const newDraftHtml = `
            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm border-emerald-200 border-2">
                <div class="p-6 bg-emerald-600 text-white">
                    <h3 class="font-bold text-lg">${semester}</h3>
                    <p class="text-emerald-100 text-xs">Your Draft • ${courses.length} Units</p>
                </div>
                <div class="p-6 space-y-4" id="draft-courses-container">
                    ${coursesHtml}
                </div>
                <div class="p-4 bg-slate-50 flex gap-3">
                    <button onclick="submitDraft()" class="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">Submit for Review</button>
                    <button onclick="openDraftModal()" class="flex-1 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300">Edit Draft</button>
                </div>
            </div>
        `;
        
        // Replace the second column (the AI-Proposed Draft)
        const secondColumn = plannerRightColumn.children[1];
        if (secondColumn) {
            secondColumn.outerHTML = newDraftHtml;
        }
    }
    
    closeDraftModal();
    showToast(`✅ Draft saved for ${semester} with ${courses.length} course(s)`, 'success');
    lucide.createIcons();
}

function removeDraftCourse(button) {
    const courseDiv = button.closest('.flex.items-center');
    courseDiv.remove();
    showToast('Course removed from draft', 'info');
}

function submitDraft() {
    showToast('📤 Your draft has been submitted to your academic advisor for review', 'success');
    setTimeout(() => {
        showToast('💬 You will receive feedback within 3 business days', 'info');
    }, 2000);
}

function acceptProposal() {
    showToast('Proposal accepted! Your academic plan has been updated.', 'success');
    setTimeout(() => {
        showToast('📅 Your advisor will confirm the schedule within 24 hours.', 'info');
    }, 2000);
}

// Check if user is logged in on page load
function checkLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginOverlay = document.getElementById('login-overlay');
    
    if (!isLoggedIn && loginOverlay) {
        loginOverlay.style.display = 'flex';
    } else if (loginOverlay) {
        loginOverlay.style.display = 'none';
        loadSidebar();
    }
}

// Call this when page loads
checkLoginState();

// Notification Data
let notifications = [
    {
        id: 1,
        title: "Grade Posted",
        message: "CS401: Machine Learning - Grade A has been posted",
        time: "2 hours ago",
        read: false,
        icon: "award",
        color: "emerald"
    },
    {
        id: 2,
        title: "Registration Reminder",
        message: "Spring 2025 registration opens in 3 days",
        time: "1 day ago",
        read: false,
        icon: "calendar",
        color: "blue"
    },
    {
        id: 3,
        title: "Advisor Message",
        message: "Dr. Sarah has scheduled a meeting for Friday",
        time: "2 days ago",
        read: true,
        icon: "message-square",
        color: "purple"
    },
    {
        id: 4,
        title: "Scholarship Deadline",
        message: "Dean's Excellence Scholarship closes in 1 week",
        time: "3 days ago",
        read: true,
        icon: "dollar-sign",
        color: "amber"
    }
];

// Toggle notifications dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown.classList.contains('hidden')) {
        renderNotifications();
        dropdown.classList.remove('hidden');
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeNotificationsOnClickOutside);
        }, 100);
    } else {
        dropdown.classList.add('hidden');
        document.removeEventListener('click', closeNotificationsOnClickOutside);
    }
}

function closeNotificationsOnClickOutside(event) {
    const dropdown = document.getElementById('notifications-dropdown');
    const bellButton = event.target.closest('button');
    const isBellButton = bellButton && bellButton.querySelector('[data-lucide="bell"]');
    
    if (!dropdown.contains(event.target) && !isBellButton) {
        dropdown.classList.add('hidden');
        document.removeEventListener('click', closeNotificationsOnClickOutside);
    }
}

// Render notifications list
function renderNotifications() {
    const list = document.getElementById('notifications-list');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update badge
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (unreadCount > 0) {
            badge.classList.remove('hidden');
            // Optionally show count
            badge.style.width = '16px';
            badge.style.height = '16px';
            badge.style.backgroundColor = '#ef4444';
            badge.style.borderRadius = '50%';
            badge.style.display = 'flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.fontSize = '10px';
            badge.style.color = 'white';
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }
    
    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="p-8 text-center">
                <i data-lucide="bell-off" class="w-10 h-10 text-slate-300 mx-auto mb-3"></i>
                <p class="text-sm text-slate-500">No notifications</p>
                <p class="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
        `;
    } else {
        list.innerHTML = notifications.map(notification => `
            <div onclick="markAsRead(${notification.id})" class="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all ${!notification.read ? 'bg-emerald-50/30' : ''}">
                <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-${notification.color}-100 flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${notification.icon}" class="w-4 h-4 text-${notification.color}-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <p class="text-sm font-semibold text-slate-800">${notification.title}</p>
                            <p class="text-[10px] text-slate-400">${notification.time}</p>
                        </div>
                        <p class="text-xs text-slate-600">${notification.message}</p>
                        ${!notification.read ? '<span class="inline-block mt-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    if (window.lucide) lucide.createIcons();
}

// Mark single notification as read
function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        renderNotifications();
        showToast(`📬 Marked "${notification.title}" as read`, 'info');
    }
}

// Mark all as read
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
    showToast('✅ All notifications marked as read', 'success');
}

// Clear all notifications
function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        notifications = [];
        renderNotifications();
        showToast('🗑️ All notifications cleared', 'info');
    }
}

function addNotification(title, message, icon = 'bell', color = 'emerald') {
    const newNotification = {
        id: Date.now(),
        title: title,
        message: message,
        time: 'Just now',
        read: false,
        icon: icon,
        color: color
    };
    notifications.unshift(newNotification);
    renderNotifications();
    
    // Show toast for new notification
    showToast(`🔔 ${title}`, 'info');
}

// Chat Menu Functions
function toggleChatMenu() {
    const menu = document.getElementById('chat-menu-dropdown');
    if (menu.classList.contains('hidden')) {
        // Close any other open menus
        closeAllMenus();
        menu.classList.remove('hidden');
        // Close when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeChatMenuOnClickOutside);
        }, 100);
    } else {
        menu.classList.add('hidden');
        document.removeEventListener('click', closeChatMenuOnClickOutside);
    }
}

function closeChatMenuOnClickOutside(event) {
    const menu = document.getElementById('chat-menu-dropdown');
    const menuBtn = document.getElementById('chat-menu-btn');
    
    if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
        menu.classList.add('hidden');
        document.removeEventListener('click', closeChatMenuOnClickOutside);
    }
}

function closeAllMenus() {
    const menus = document.querySelectorAll('#chat-menu-dropdown, #notifications-dropdown');
    menus.forEach(menu => menu.classList.add('hidden'));
}

function clearChatHistory() {
    if (confirm('Are you sure you want to clear all chat messages? This cannot be undone.')) {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = `
            <div class="flex justify-start">
                <div class="max-w-[80%]">
                    <div class="bg-slate-50 text-slate-800 p-5 rounded-3xl rounded-tl-none border border-slate-100 text-sm leading-relaxed">
                        Chat history cleared. How can I help you today?
                    </div>
                </div>
            </div>
        `;
        // Reset session
        currentSessionId = null;
        showToast('🗑️ Chat history cleared', 'success');
        // Close menu
        document.getElementById('chat-menu-dropdown').classList.add('hidden');
    }
}

function exportChat() {
    const messages = document.querySelectorAll('#chat-messages .flex');
    if (messages.length === 0) {
        showToast('No messages to export', 'error');
        return;
    }
    
    let exportText = 'EduFlow AI - Academic Advisor Conversation\n';
    exportText += `Exported on: ${new Date().toLocaleString()}\n`;
    exportText += '='.repeat(50) + '\n\n';
    
    messages.forEach(msg => {
        const text = msg.querySelector('.p-5')?.innerText || '';
        const isUser = msg.classList.contains('justify-end');
        const role = isUser ? 'Student' : 'AI Advisor';
        exportText += `[${role}]: ${text}\n\n`;
    });
    
    // Create download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 Chat exported successfully', 'success');
    document.getElementById('chat-menu-dropdown').classList.add('hidden');
}

function showChatInfo() {
    const infoHtml = `
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div class="p-6 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <i data-lucide="bot" class="text-emerald-600" size="24"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-slate-800">EduFlow AI Advisor</h3>
                            <p class="text-xs text-slate-500">Version 2.0.0</p>
                        </div>
                    </div>
                </div>
                <div class="p-6 space-y-4">
                    <p class="text-sm text-slate-600">Your intelligent academic companion powered by advanced AI. I can help with:</p>
                    <ul class="space-y-2 text-sm text-slate-600">
                        <li class="flex items-center gap-2">✓ Course recommendations</li>
                        <li class="flex items-center gap-2">✓ Graduation requirements</li>
                        <li class="flex items-center gap-2">✓ GPA calculations</li>
                        <li class="flex items-center gap-2">✓ Scholarship opportunities</li>
                        <li class="flex items-center gap-2">✓ Academic planning</li>
                    </ul>
                    <div class="bg-slate-50 p-3 rounded-xl mt-4">
                        <p class="text-xs text-slate-500">💡 Tip: Use natural language. Just ask me anything about your academic journey!</p>
                    </div>
                </div>
                <div class="p-6 border-t border-slate-100">
                    <button onclick="closeInfoModal()" class="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    `;
  
    const existingModal = document.getElementById('info-modal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    const modalDiv = document.createElement('div');
    modalDiv.id = 'info-modal';
    modalDiv.innerHTML = infoHtml;
    document.body.appendChild(modalDiv);
    lucide.createIcons();
    
    document.getElementById('chat-menu-dropdown').classList.add('hidden');
}

function closeInfoModal() {
    const modal = document.getElementById('info-modal');
    if (modal) modal.remove();
}

// Course Database for Search
const courseDatabase = [
    { code: "CS101", name: "Intro to Programming", credits: 3, department: "CS", instructor: "Prof. Smith", semester: "Fall 2024" },
    { code: "CS201", name: "Data Structures", credits: 3, department: "CS", instructor: "Dr. Johnson", semester: "Spring 2024" },
    { code: "CS301", name: "Algorithms", credits: 3, department: "CS", instructor: "Prof. Williams", semester: "Fall 2024" },
    { code: "CS401", name: "Machine Learning", credits: 3, department: "CS", instructor: "Dr. Miller", semester: "Spring 2025" },
    { code: "CS405", name: "Distributed Systems", credits: 3, department: "CS", instructor: "Prof. Wang", semester: "Spring 2025" },
    { code: "CS499", name: "Senior Capstone", credits: 4, department: "CS", instructor: "Dr. Brown", semester: "Fall 2025" },
    { code: "MATH201", name: "Calculus II", credits: 4, department: "MATH", instructor: "Prof. Davis", semester: "Spring 2024" },
    { code: "MATH302", name: "Linear Algebra", credits: 3, department: "MATH", instructor: "Dr. Wilson", semester: "Fall 2025" },
    { code: "PHYS101", name: "Physics I", credits: 4, department: "PHYS", instructor: "Prof. Martinez", semester: "Fall 2023" },
    { code: "ENGL201", name: "Academic Writing", credits: 3, department: "ENGL", instructor: "Dr. Taylor", semester: "Fall 2023" },
    { code: "DS201", name: "Database Systems", credits: 3, department: "CS", instructor: "Prof. Anderson", semester: "Spring 2025" },
    { code: "AI301", name: "Artificial Intelligence", credits: 3, department: "CS", instructor: "Dr. Lee", semester: "Fall 2025" }
];

let searchTimeout;
let currentSearchResults = [];

function searchCourses() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    
    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Debounce search for better performance
    searchTimeout = setTimeout(() => {
        if (searchTerm.length === 0) {
            clearSearchResults();
            return;
        }
        
        // Search in course code and name
        const results = courseDatabase.filter(course => 
            course.code.toLowerCase().includes(searchTerm) || 
            course.name.toLowerCase().includes(searchTerm)
        );
        
        currentSearchResults = results;
        displaySearchResults(results, searchTerm);
    }, 300);
}

function displaySearchResults(results, searchTerm) {
    // Remove existing results container if any
    const existingResults = document.getElementById('search-results-dropdown');
    if (existingResults) existingResults.remove();
    
    if (results.length === 0) {
        showNoResults(searchTerm);
        return;
    }
    
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.id = 'search-results-dropdown';
    dropdown.className = 'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-y-auto';
    
    // Header
    dropdown.innerHTML = `
        <div class="p-3 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100">
            <p class="text-xs font-semibold text-slate-500">📚 Found ${results.length} course(s) matching "${searchTerm}"</p>
        </div>
        <div id="search-results-list"></div>
        <div class="p-2 border-t border-slate-100 text-center">
            <button onclick="clearSearchResults()" class="text-xs text-slate-400 hover:text-slate-600">Close</button>
        </div>
    `;
    
    // Position relative to search container
    const searchContainer = document.querySelector('.hidden.md\\:flex.items-center');
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(dropdown);
    }
    
    // Populate results
    const resultsList = document.getElementById('search-results-list');
    results.forEach(course => {
        const resultItem = document.createElement('div');
        resultItem.className = 'p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-all';
        resultItem.onclick = () => selectCourse(course);
        
        // Highlight matching text
        const highlightedName = highlightText(course.name, searchTerm);
        const highlightedCode = highlightText(course.code, searchTerm);
        
        resultItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-bold text-slate-800 text-sm">${highlightedCode} - ${highlightedName}</p>
                    <p class="text-xs text-slate-500 mt-1">${course.credits} credits • ${course.department} • ${course.instructor}</p>
                </div>
                <span class="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">${course.semester}</span>
            </div>
        `;
        resultsList.appendChild(resultItem);
    });
}

function highlightText(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="bg-yellow-200 text-slate-900 font-bold">$1</span>');
}

function selectCourse(course) {
    // Fill search input with selected course
    const searchInput = document.getElementById('search-input');
    searchInput.value = `${course.code} - ${course.name}`;
    
    // Clear results dropdown
    clearSearchResults();
    
    // Show toast with course info
    showToast(`📖 Selected: ${course.code} - ${course.name} (${course.credits} credits)`, 'success');
    
    // Optional: Scroll to course in planner or highlight it
    highlightCourseInPlanner(course.code);
}

function showNoResults(searchTerm) {
    const existingResults = document.getElementById('search-results-dropdown');
    if (existingResults) existingResults.remove();
    
    const dropdown = document.createElement('div');
    dropdown.id = 'search-results-dropdown';
    dropdown.className = 'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50';
    dropdown.innerHTML = `
        <div class="p-6 text-center">
            <i data-lucide="book-x" class="w-10 h-10 text-slate-300 mx-auto mb-2"></i>
            <p class="text-sm text-slate-500">No courses found for "${searchTerm}"</p>
            <p class="text-xs text-slate-400 mt-1">Try searching by course code or name</p>
        </div>
        <div class="p-2 border-t border-slate-100 text-center">
            <button onclick="clearSearchResults()" class="text-xs text-slate-400 hover:text-slate-600">Close</button>
        </div>
    `;
    
    const searchContainer = document.querySelector('.hidden.md\\:flex.items-center');
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(dropdown);
    }
    lucide.createIcons();
}

function clearSearchResults() {
    const dropdown = document.getElementById('search-results-dropdown');
    if (dropdown) dropdown.remove();

}

function highlightCourseInPlanner(courseCode) {
    switchTab('planner');

    setTimeout(() => {
        const plannerCourses = document.querySelectorAll('#view-planner .flex.items-center');
        let found = false;
        
        plannerCourses.forEach(courseDiv => {
            const courseText = courseDiv.querySelector('.text-sm.font-bold')?.innerText || '';
            if (courseText.includes(courseCode)) {
                courseDiv.style.transition = 'all 0.3s ease';
                courseDiv.style.backgroundColor = '#fef3c7'; // Yellow highlight
                courseDiv.style.border = '2px solid #f59e0b';
                
                // Scroll to it
                courseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    courseDiv.style.backgroundColor = '';
                    courseDiv.style.border = '';
                }, 3000);
                
                found = true;
                showToast(`✨ Found ${courseCode} in your planner`, 'success');
            }
        });
        
        if (!found) {
            showToast(`ℹ️ ${courseCode} not found in current planner. Try adding it with "New Draft"`, 'info');
        }
    }, 200);
}

// Close search results when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.hidden.md\\:flex.items-center');
    const dropdown = document.getElementById('search-results-dropdown');
    
    if (dropdown && searchContainer && !searchContainer.contains(event.target)) {
        clearSearchResults();
    }
});

