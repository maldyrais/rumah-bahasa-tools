const seatLayout = [
    // Bottom group left (1, 2)
    { id: 1, row: 9, col: 1 },
    { id: 2, row: 8, col: 1 },
    // Middle group left (3, 4, 9)
    { id: 3, row: 7, col: 1 },
    { id: 4, row: 6, col: 1 },
    { id: 9, row: 5, col: 2 },
    // Bottom group right (5, 6)
    { id: 5, row: 9, col: 4 },
    { id: 6, row: 8, col: 4 },
    // Middle group right (7, 8, 10)
    { id: 7, row: 7, col: 4 },
    { id: 8, row: 6, col: 4 },
    { id: 10, row: 5, col: 3 },
    // Far right group (11, 12, 13, 14)
    { id: 11, row: 9, col: 7 },
    { id: 12, row: 8, col: 7 },
    { id: 13, row: 7, col: 7 },
    { id: 14, row: 6, col: 7 },
    // Upper group (15, 16, 17, 18)
    { id: 15, row: 3, col: 1 },
    { id: 16, row: 3, col: 2 },
    { id: 17, row: 3, col: 3 },
    { id: 18, row: 3, col: 4 },
    // Top group (19, 20)
    { id: 19, row: 1, col: 2 },
    { id: 20, row: 1, col: 3 },
];

const tableLayout = [
    { row: '8 / 10', col: '2 / 3' }, // T1 (1,2)
    { row: '8 / 10', col: '3 / 4' }, // T2 (5,6)
    { row: '6 / 8', col: '2 / 3' },  // T3 (3,4,9)
    { row: '6 / 8', col: '3 / 4' },  // T4 (7,8,10)
    { row: '4 / 5', col: '1 / 3' },  // T5 (15,16)
    { row: '4 / 5', col: '3 / 5' },  // T6 (17,18)
    { row: '2 / 3', col: '2 / 4' },  // T7 (19,20)
    { row: '8 / 10', col: '6 / 7' }, // T8 (11,12)
    { row: '6 / 8', col: '6 / 7' }   // T9 (13,14)
];

let isPicking = false;

// Extra Seats Data
let extraSeatsData = JSON.parse(localStorage.getItem('extraSeats')) || [];

function initExtraSeats() {
    extraSeatsData.forEach(data => {
        createExtraSeatElement(data);
    });
}

function saveExtraSeats() {
    if (extraSeatsData.length === 0) {
        localStorage.removeItem('extraSeats');
    } else {
        localStorage.setItem('extraSeats', JSON.stringify(extraSeatsData));
    }
}

function createExtraSeatElement(seatData) {
    const div = document.createElement('div');
    div.className = `seat extra-seat ${seatData.active ? 'active' : ''}`;
    div.textContent = seatData.id;
    div.dataset.id = seatData.id;
    
    // Position handling
    if (seatData.x !== null && seatData.y !== null) {
        div.style.position = 'absolute';
        div.style.left = seatData.x + 'px';
        div.style.top = seatData.y + 'px';
        document.querySelector('#app-seat-picker .left-panel').appendChild(div);
    } else {
        document.getElementById('extra-seats-container').appendChild(div);
    }

    makeDraggable(div, seatData);
}

function makeDraggable(element, seatData) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let moved = false;

    element.addEventListener('mousedown', dragMouseDown);
    element.addEventListener('touchstart', dragTouchStart, {passive: false});

    function dragMouseDown(e) {
        if (isPicking) return;
        if (e.target !== element) return;
        e.preventDefault();
        moved = false;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
        prepareDrag();
    }

    function dragTouchStart(e) {
        if (isPicking) return;
        if (e.target !== element) return;
        moved = false;
        const touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.addEventListener('touchend', closeDragElement);
        document.addEventListener('touchmove', elementTouchDrag, {passive: false});
        prepareDrag();
    }

    function prepareDrag() {
        if (element.parentElement.id === 'extra-seats-container') {
            const rect = element.getBoundingClientRect();
            const leftPanel = document.querySelector('#app-seat-picker .left-panel');
            const parentRect = leftPanel.getBoundingClientRect();
            element.style.position = 'absolute';
            element.style.left = (rect.left - parentRect.left + leftPanel.scrollLeft) + 'px';
            element.style.top = (rect.top - parentRect.top + leftPanel.scrollTop) + 'px';
            leftPanel.appendChild(element);
        }
        element.style.zIndex = 1000;
    }

    function elementDrag(e) {
        e.preventDefault();
        moved = true;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        moveElement();
    }

    function elementTouchDrag(e) {
        moved = true;
        const touch = e.touches[0];
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        moveElement();
    }

    function moveElement() {
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.classList.add('dragging');
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchend', closeDragElement);
        document.removeEventListener('touchmove', elementTouchDrag);
        
        element.style.zIndex = 100;
        element.classList.remove('dragging');
        
        if (!moved) {
            seatData.active = !seatData.active;
            if (seatData.active) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
            saveExtraSeats();
            updateCount();
        } else {
            seatData.x = element.offsetLeft;
            seatData.y = element.offsetTop;
            saveExtraSeats();
        }
    }
}

// Audio Context setup
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTick() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playDing() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 1.0);
    
    gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.0);
}

document.addEventListener('DOMContentLoaded', () => {
    // Render seats
    const grid = document.getElementById('classroom-grid');

    // Render tables first so they are behind seats if they ever overlap
    tableLayout.forEach(table => {
        const div = document.createElement('div');
        div.className = 'meja';
        div.textContent = 'Meja';
        div.style.gridRow = table.row;
        div.style.gridColumn = table.col;
        grid.appendChild(div);
    });

    seatLayout.forEach(seat => {
        const div = document.createElement('div');
        div.className = 'seat active';
        div.textContent = seat.id;
        div.style.gridRow = seat.row;
        div.style.gridColumn = seat.col;
        div.dataset.id = seat.id;
        
        div.addEventListener('click', () => {
            if (isPicking) return;
            div.classList.toggle('active');
            updateCount();
        });
        
        grid.appendChild(div);
    });
    
    // Init Extra Seats
    initExtraSeats();
    
    updateCount();

    document.getElementById('btn-add-seat').addEventListener('click', () => {
        let nextId = 21;
        if (extraSeatsData.length > 0) {
            const ids = extraSeatsData.map(s => s.id);
            nextId = Math.max(...ids) + 1;
        }
        if (nextId > 35) {
            alert("Maksimal 35 bangku!");
            return;
        }
        const newSeat = { id: nextId, x: null, y: null, active: true };
        extraSeatsData.push(newSeat);
        saveExtraSeats();
        createExtraSeatElement(newSeat);
        updateCount();
    });

    document.getElementById('btn-reset-extra').addEventListener('click', () => {
        if (confirm("Hapus semua bangku tambahan?")) {
            extraSeatsData = [];
            localStorage.removeItem('extraSeats');
            saveExtraSeats();
            document.querySelectorAll('.extra-seat').forEach(el => el.remove());
            updateCount();
        }
    });

    // App Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const appViews = document.querySelectorAll('.app-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isPicking) return;
            navItems.forEach(nav => nav.classList.remove('active'));
            appViews.forEach(view => view.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(item.dataset.target).classList.add('active');
        });
    });
    
    // Tab Switching (Inside Seat Picker)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isPicking) return;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
    
    // Controls
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (isPicking) return;
        document.querySelectorAll('.seat').forEach(seat => seat.classList.add('active'));
        extraSeatsData.forEach(seat => seat.active = true);
        saveExtraSeats();
        updateCount();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (isPicking) return;
        document.querySelectorAll('.seat').forEach(seat => seat.classList.remove('active'));
        extraSeatsData.forEach(seat => seat.active = false);
        saveExtraSeats();
        updateCount();
    });
    
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`Fullscreen error: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const btn = document.getElementById('btn-fullscreen');
        if (document.fullscreenElement) {
            btn.textContent = 'Keluar Layar Penuh';
        } else {
            btn.textContent = 'Layar Penuh';
        }
    });
    
    // Random Pick Logic
    const btnPick = document.getElementById('btn-pick');
    btnPick.addEventListener('click', () => {
        initAudio();
        pickRandom();
    });
    
    // Generate Order Logic
    const btnGenerateOrder = document.getElementById('btn-generate-order');
    btnGenerateOrder.addEventListener('click', () => {
        generateOrder();
    });

    // ==========================================
    // TIMER LOGIC
    // ==========================================
    let timerInterval;
    let timeRemaining = 0; // in seconds
    let isTimerRunning = false;
    let initialTime = 0;

    const timerDisplay = document.getElementById('timer-display');
    const timerPresets = document.querySelectorAll('.btn-preset:not(.team-btn)');
    const timerInputMin = document.getElementById('timer-input-min');
    const timerInputSec = document.getElementById('timer-input-sec');

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        if (timeRemaining <= 0 && initialTime > 0) {
            timerDisplay.textContent = "TIME UP!";
            timerDisplay.classList.add('time-up');
        } else {
            timerDisplay.textContent = formatTime(timeRemaining);
            timerDisplay.classList.remove('time-up');
        }
    }

    function setTimer(seconds) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeRemaining = seconds;
        initialTime = seconds;
        updateTimerDisplay();
    }

    timerPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            timerPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            setTimer(parseInt(preset.dataset.time));
        });
    });

    document.getElementById('btn-timer-set').addEventListener('click', () => {
        timerPresets.forEach(p => p.classList.remove('active'));
        const m = parseInt(timerInputMin.value) || 0;
        const s = parseInt(timerInputSec.value) || 0;
        if (m > 0 || s > 0) {
            setTimer(m * 60 + s);
        }
    });

    document.getElementById('btn-timer-start').addEventListener('click', () => {
        if (isTimerRunning || timeRemaining <= 0) return;
        isTimerRunning = true;
        initAudio();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                playDing();
                setTimeout(playDing, 500);
            }
        }, 1000);
    });

    document.getElementById('btn-timer-pause').addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
    });

    document.getElementById('btn-timer-reset').addEventListener('click', () => {
        setTimer(initialTime);
    });


    // ==========================================
    // TEAM GENERATOR LOGIC
    // ==========================================
    const teamPresets = document.querySelectorAll('.team-btn');
    let selectedGroups = 2;

    teamPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            teamPresets.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            selectedGroups = parseInt(btn.dataset.groups);
        });
    });
    // Set default
    document.querySelector('.team-btn[data-groups="2"]').classList.add('active');

    document.getElementById('btn-generate-teams').addEventListener('click', () => {
        const activeSeats = Array.from(document.querySelectorAll('.seat.active'));
        if (activeSeats.length < selectedGroups) {
            alert("Jumlah siswa aktif kurang dari jumlah kelompok!");
            return;
        }
        
        // Shuffle
        const shuffled = [...activeSeats];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Create teams
        const teams = Array.from({length: selectedGroups}, () => []);
        shuffled.forEach((seat, index) => {
            teams[index % selectedGroups].push(seat.dataset.id);
        });
        
        // Render
        const container = document.getElementById('teams-result');
        container.innerHTML = '';
        
        const teamNames = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        teams.forEach((team, index) => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            let html = `<div class="team-card-header">Kelompok ${teamNames[index]}</div>`;
            html += `<div class="team-members">`;
            team.forEach(member => {
                html += `<div class="team-member">${member}</div>`;
            });
            html += `</div>`;
            
            card.innerHTML = html;
            container.appendChild(card);
        });
    });


    // ==========================================
    // SCOREBOARD LOGIC
    // ==========================================
    const scoreTeamCount = document.getElementById('score-team-count');
    const scoreboardContainer = document.getElementById('scoreboard-container');

    function initScoreboards(count) {
        scoreboardContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const card = document.createElement('div');
            card.className = 'score-card';
            
            const h3 = document.createElement('h3');
            h3.textContent = `Tim ${i}`;
            
            const display = document.createElement('div');
            display.className = 'score-display';
            display.textContent = '0';
            
            const controls = document.createElement('div');
            controls.className = 'score-controls';
            
            const btnMinus = document.createElement('button');
            btnMinus.className = 'btn-score minus';
            btnMinus.textContent = '-1';
            btnMinus.onclick = () => {
                display.textContent = Math.max(0, parseInt(display.textContent) - 1);
            };
            
            const btnPlus = document.createElement('button');
            btnPlus.className = 'btn-score plus';
            btnPlus.textContent = '+1';
            btnPlus.onclick = () => {
                display.textContent = parseInt(display.textContent) + 1;
            };
            
            const btnReset = document.createElement('button');
            btnReset.className = 'btn-score reset';
            btnReset.textContent = 'Reset';
            btnReset.onclick = () => {
                display.textContent = '0';
            };
            
            controls.appendChild(btnMinus);
            controls.appendChild(btnReset);
            controls.appendChild(btnPlus);
            
            card.appendChild(h3);
            card.appendChild(display);
            card.appendChild(controls);
            
            scoreboardContainer.appendChild(card);
        }
    }

    scoreTeamCount.addEventListener('change', (e) => {
        initScoreboards(parseInt(e.target.value));
    });

    // Initialize default (2 teams)
    initScoreboards(2);

});

function updateCount() {
    const count = document.querySelectorAll('.seat.active').length;
    document.getElementById('active-count').textContent = count;
    const teamActiveCount = document.getElementById('team-active-count');
    if(teamActiveCount) {
        teamActiveCount.textContent = count;
    }
}

function pickRandom() {
    if (isPicking) return;
    const activeSeats = Array.from(document.querySelectorAll('.seat.active'));
    if (activeSeats.length === 0) {
        alert("Tidak ada bangku aktif!");
        return;
    }
    
    isPicking = true;
    const btnPick = document.getElementById('btn-pick');
    btnPick.disabled = true;
    
    let delay = 30;
    let totalTime = 0;
    const maxTime = 3000;
    let lastSeat = null;
    
    const step = () => {
        if (lastSeat) lastSeat.classList.remove('highlight');
        
        let randomSeat;
        if (activeSeats.length === 1) {
            randomSeat = activeSeats[0];
        } else {
            do {
                randomSeat = activeSeats[Math.floor(Math.random() * activeSeats.length)];
            } while (randomSeat === lastSeat);
        }
        
        randomSeat.classList.add('highlight');
        lastSeat = randomSeat;
        playTick();
        
        totalTime += delay;
        delay *= 1.1; 
        
        if (totalTime < maxTime && delay < 400) {
            setTimeout(step, delay);
        } else {
            setTimeout(() => finishPick(randomSeat), delay);
        }
    };
    
    step();
}

function finishPick(seat) {
    playDing();
    seat.classList.remove('highlight');
    seat.classList.add('winner');
    
    const overlay = document.getElementById('result-overlay');
    const resultText = document.getElementById('result-text');
    resultText.textContent = `Bangku ${seat.dataset.id}`;
    overlay.classList.add('show');
    
    setTimeout(() => {
        overlay.classList.remove('show');
        seat.classList.remove('winner');
        seat.classList.remove('active');
        
        if (seat.classList.contains('extra-seat')) {
            const extraData = extraSeatsData.find(s => s.id == seat.dataset.id);
            if (extraData) {
                extraData.active = false;
                saveExtraSeats();
            }
        }
        
        updateCount();
        isPicking = false;
        document.getElementById('btn-pick').disabled = false;
    }, 3000);
}

function generateOrder() {
    const activeSeats = Array.from(document.querySelectorAll('.seat.active'));
    if (activeSeats.length === 0) {
        alert("Tidak ada bangku aktif!");
        return;
    }
    
    // Fisher-Yates shuffle
    for (let i = activeSeats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeSeats[i], activeSeats[j]] = [activeSeats[j], activeSeats[i]];
    }
    
    const resultContainer = document.getElementById('order-result');
    resultContainer.innerHTML = '';
    
    activeSeats.forEach((seat, index) => {
        const p = document.createElement('div');
        p.className = 'order-item';
        p.style.animationDelay = `${index * 0.05}s`;
        p.innerHTML = `<span>Soal ${index + 1}</span> <span>Bangku ${seat.dataset.id}</span>`;
        resultContainer.appendChild(p);
    });
}
