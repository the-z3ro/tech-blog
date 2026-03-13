/* ========================================================
   BLACK-OPS TERMINAL // CORE SYSTEM JS
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PERFORMANCE-OPTIMIZED PROGRESS BAR & HUD ---
    const initProgressTracking = () => {
        // Create Progress Line
        let progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);

        // Create Tactical HUD (Shows percentage)
        let progressHud = document.createElement('div');
        progressHud.className = 'progress-hud';
        document.body.appendChild(progressHud);

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    
                    // Calculate percentage
                    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
                    
                    // Update visual bar
                    progressBar.style.width = scrolled + '%';
                    
                    // Update HUD text with leading zero formatting
                    const pct = Math.round(scrolled);
                    const formattedPct = pct < 10 ? `0${pct}` : pct;
                    progressHud.innerText = `[ DATA_LINK: ${formattedPct}% ]`;
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    };

    // --- 2. CYBERPUNK TEXT DECRYPTION SCRAMBLER ---
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#01X';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue =[];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 20);
                const end = start + Math.floor(Math.random() * 20);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble-dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // Apply scrambler to article titles on hover
    const titles = document.querySelectorAll('.post-title, .entry-header h2, .logo a');
    titles.forEach(title => {
        const fx = new TextScramble(title);
        // Store original text
        title.setAttribute('data-text', title.innerText);
        
        title.addEventListener('mouseenter', () => {
            fx.setText(title.getAttribute('data-text'));
        });
    });

    // Initialize tools
    initProgressTracking();
});

// --- 3. TIMED CONSOLE BOOT SEQUENCE (EASTER EGG) ---
// High-end touch: stagger the console logs so it looks like a real machine booting up
const bootSequence =[
    { msg: "INITIATING KERNEL UPLINK...", delay: 0, color: "#5e6773" },
    { msg: "BYPASSING MAINFRAME SECURITY PROTOCOLS [OK]", delay: 600, color: "#00f0ff" },
    { msg: "DECRYPTING ASSETS...", delay: 1100, color: "#5e6773" },
    { msg: ">> ROOT ACCESS GRANTED <<", delay: 1800, color: "#00ff66" },
    { msg: "SYSTEM ONLINE. WELCOME, OPERATIVE.", delay: 2400, color: "#ffffff", size: "14px" }
];

bootSequence.forEach(step => {
    setTimeout(() => {
        console.log(
            `%c${step.msg}`, 
            `color: ${step.color}; font-family: 'JetBrains Mono', monospace; font-size: ${step.size || '11px'}; font-weight: bold;`
        );
    }, step.delay);
});
