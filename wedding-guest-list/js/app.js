// Main Application Logic
const App = {
    // Current state
    setup: null,
    currentPartner: null,
    currentGuest: {},
    currentRatingIndex: 0,
    guestsToRate: [],
    duplicatePairs: [],
    setupData: {},

    // Initialize app
    init() {
        this.setup = Storage.getSetup();
        this.state = Storage.getState();

        // Setup event listeners
        this.setupEventListeners();

        // Navigate to appropriate screen
        if (!this.setup) {
            this.showScreen('setup');
            this.initSetupFlow();
        } else {
            this.restoreState();
        }
    },

    // Initialize setup flow
    initSetupFlow() {
        // Partner 1 name
        document.getElementById('setup-partner1-next').addEventListener('click', () => this.setupSavePartner1Name());
        document.getElementById('partner1-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setupSavePartner1Name();
        });

        // Partner 1 photo
        document.getElementById('partner1-photo-input').addEventListener('change', (e) => this.handlePhotoUpload(e, 'partner1'));
        document.getElementById('setup-partner1-photo-next').addEventListener('click', () => this.setupShowPartner2Choice());
        document.getElementById('setup-partner1-photo-skip').addEventListener('click', () => this.setupShowPartner2Choice());

        // Partner 2 choice
        document.getElementById('setup-partner2-here').addEventListener('click', () => this.setupPartner2Here());
        document.getElementById('setup-partner2-invite').addEventListener('click', () => this.setupShowInviteCode());

        // Partner 2 name
        document.getElementById('setup-partner2-next').addEventListener('click', () => this.setupSavePartner2Name());
        document.getElementById('partner2-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setupSavePartner2Name();
        });

        // Partner 2 photo
        document.getElementById('partner2-photo-input').addEventListener('change', (e) => this.handlePhotoUpload(e, 'partner2'));
        document.getElementById('setup-partner2-photo-next').addEventListener('click', () => this.setupShowCost());
        document.getElementById('setup-partner2-photo-skip').addEventListener('click', () => this.setupShowCost());

        // Invite code
        document.getElementById('setup-invite-continue').addEventListener('click', () => this.setupShowCost());

        // Cost per guest
        document.getElementById('setup-cost-next').addEventListener('click', () => this.setupSaveCost());
        document.getElementById('cost-per-guest').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setupSaveCost();
        });

        // Floor budget
        document.getElementById('setup-floor-next').addEventListener('click', () => this.setupSaveFloor());
        document.getElementById('floor-budget').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setupSaveFloor();
        });

        // Middle budget
        document.getElementById('setup-middle-next').addEventListener('click', () => this.setupSaveMiddle());
        document.getElementById('middle-budget').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setupSaveMiddle();
        });

        // Max budget
        document.getElementById('setup-max-next').addEventListener('click', () => this.setupSaveMax());
        document.getElementById('max-budget').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setupSaveMax();
        });
    },

    // Setup all event listeners
    setupEventListeners() {
        // Setup Phase handled in initSetupFlow()

        // Partner Selection
        document.getElementById('select-partner1').addEventListener('click', () => this.startBrainDump('partner1'));
        document.getElementById('select-partner2').addEventListener('click', () => this.startBrainDump('partner2'));
        document.getElementById('view-progress').addEventListener('click', () => this.showProgress());

        // Brain Dump
        document.getElementById('bulk-import-button').addEventListener('click', () => this.showBulkImport());
        document.getElementById('name-next').addEventListener('click', () => this.saveName());
        document.getElementById('guest-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveName();
        });

        // Choice buttons for relationship
        document.querySelectorAll('#step-relationship .choice-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.saveRelationship(e.target.dataset.value));
        });

        // Choice buttons for age
        document.querySelectorAll('#step-age .choice-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.saveAge(e.target.dataset.value));
        });

        // Note
        document.getElementById('note-next').addEventListener('click', () => this.saveNote());
        document.getElementById('note-skip').addEventListener('click', () => this.saveNote(''));

        // Add more
        document.getElementById('add-another').addEventListener('click', () => this.resetGuestForm());
        document.getElementById('done-adding').addEventListener('click', () => this.finishBrainDump());

        // Progress
        document.getElementById('back-to-partner-select').addEventListener('click', () => this.showScreen('partner-select'));
        document.getElementById('continue-to-duplicates').addEventListener('click', () => this.startDuplicateDetection());

        // Duplicates
        document.getElementById('finish-duplicates').addEventListener('click', () => this.finishDuplicates());

        // Rating Selection
        document.getElementById('rating-select-partner1').addEventListener('click', () => this.startRating('partner1'));
        document.getElementById('rating-select-partner2').addEventListener('click', () => this.startRating('partner2'));
        document.getElementById('rating-view-progress').addEventListener('click', () => this.showRatingProgress());

        // Rating
        document.querySelectorAll('#rating-step-invite .choice-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.saveRatingInvite(e.target.dataset.value));
        });
        document.querySelectorAll('#rating-step-attend .choice-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.saveRatingAttend(e.target.dataset.value));
        });
        document.querySelectorAll('#rating-step-champion .choice-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.saveRatingChampion(e.target.dataset.value));
        });
        document.querySelectorAll('#rating-step-priority .choice-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.saveRatingPriority(e.target.dataset.value));
        });

        // Rating Progress
        document.getElementById('back-to-rating-select').addEventListener('click', () => this.showScreen('rating-select'));
        document.getElementById('continue-to-reveal').addEventListener('click', () => this.showReveal());

        // Reveal
        document.getElementById('view-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('view-cut-list').addEventListener('click', () => this.showCutList());

        // Cut List
        document.getElementById('cutlist-to-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('cutlist-back').addEventListener('click', () => this.showReveal());

        // Dashboard
        document.getElementById('back-to-reveal').addEventListener('click', () => this.showReveal());
        document.getElementById('start-over').addEventListener('click', () => this.startOver());

        // Bulk Import
        document.getElementById('bulk-import-process').addEventListener('click', () => this.processBulkImport());
        document.getElementById('bulk-import-cancel').addEventListener('click', () => this.closeBulkImport());
    },

    // Show a specific screen
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenId}-screen`).classList.add('active');

        // Update state
        this.state.currentScreen = screenId;
        Storage.saveState(this.state);
    },

    // Restore previous state
    restoreState() {
        // Set partner names
        document.getElementById('select-partner1').textContent = this.setup.partner1;
        document.getElementById('select-partner2').textContent = this.setup.partner2;
        document.getElementById('rating-select-partner1').textContent = this.setup.partner1;
        document.getElementById('rating-select-partner2').textContent = this.setup.partner2;

        // Check if both partners finished brain dump
        if (this.state.partner1Done && this.state.partner2Done) {
            if (!this.state.duplicatesResolved) {
                this.showScreen('partner-select');
                this.showProgress();
            } else if (!this.state.partner1RatingDone || !this.state.partner2RatingDone) {
                this.showScreen('rating-select');
            } else {
                this.showReveal();
            }
        } else {
            this.showScreen('partner-select');
        }
    },

    // Setup flow functions
    setupShowStep(stepId) {
        const setupScreen = document.getElementById('setup-screen');
        setupScreen.querySelectorAll('.question-step').forEach(s => s.classList.remove('active'));
        document.getElementById(stepId).classList.add('active');
    },

    setupSavePartner1Name() {
        const name = document.getElementById('partner1-name').value.trim();
        if (!name) {
            alert('Please enter your name');
            return;
        }
        this.setupData.partner1 = name;
        document.getElementById('partner1-photo-question').textContent = `Upload your photo, ${name}`;
        this.setupShowStep('setup-step-partner1-photo');
    },

    setupShowPartner2Choice() {
        this.setupShowStep('setup-step-partner2-choice');
    },

    setupPartner2Here() {
        this.setupShowStep('setup-step-partner2');
    },

    setupShowInviteCode() {
        // Generate a simple invite code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.setupData.inviteCode = code;

        const url = `${window.location.origin}${window.location.pathname}?invite=${code}`;
        document.getElementById('invite-code-display').innerHTML = `
            <div style="margin-bottom: 10px;"><strong>Code:</strong> ${code}</div>
            <div style="font-size: 0.8em; word-break: break-all;">${url}</div>
        `;

        // For now, auto-fill partner 2 as "Partner"
        this.setupData.partner2 = 'Partner';

        this.setupShowStep('setup-step-invite');
    },

    setupSavePartner2Name() {
        const name = document.getElementById('partner2-name').value.trim();
        if (!name) {
            alert('Please enter their name');
            return;
        }
        this.setupData.partner2 = name;
        document.getElementById('partner2-photo-question').textContent = `Upload ${name}'s photo`;
        this.setupShowStep('setup-step-partner2-photo');
    },

    setupShowCost() {
        this.setupShowStep('setup-step-cost');
        document.getElementById('cost-per-guest').focus();
    },

    setupSaveCost() {
        const cost = parseInt(document.getElementById('cost-per-guest').value);
        if (!cost || cost < 1) {
            alert('Please enter a valid cost per guest');
            return;
        }
        this.setupData.costPerGuest = cost;
        this.setupShowStep('setup-step-floor');
        document.getElementById('floor-budget').focus();
    },

    setupSaveFloor() {
        const floor = parseInt(document.getElementById('floor-budget').value);
        if (!floor || floor < 1) {
            alert('Please enter a valid minimum number');
            return;
        }
        this.setupData.floor = floor;
        this.setupShowStep('setup-step-middle');
        document.getElementById('middle-budget').focus();
    },

    setupSaveMiddle() {
        const middle = parseInt(document.getElementById('middle-budget').value);
        if (!middle || middle < 1) {
            alert('Please enter a valid ideal number');
            return;
        }
        if (middle < this.setupData.floor) {
            alert('Ideal should be more than minimum!');
            return;
        }
        this.setupData.middle = middle;
        this.setupShowStep('setup-step-max');
        document.getElementById('max-budget').focus();
    },

    setupSaveMax() {
        const max = parseInt(document.getElementById('max-budget').value);
        if (!max || max < 1) {
            alert('Please enter a valid maximum number');
            return;
        }
        if (max < this.setupData.middle) {
            alert('Maximum should be more than ideal!');
            return;
        }
        this.setupData.max = max;
        this.completeSetup();
    },

    handlePhotoUpload(event, partner) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById(`${partner}-photo-preview`).src = e.target.result;
                this.setupData[`${partner}Photo`] = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    // Complete setup phase
    completeSetup() {
        this.setup = {
            partner1: this.setupData.partner1,
            partner2: this.setupData.partner2,
            partner1Photo: this.setupData.partner1Photo,
            partner2Photo: this.setupData.partner2Photo,
            costPerGuest: this.setupData.costPerGuest,
            floor: this.setupData.floor,
            middle: this.setupData.middle,
            max: this.setupData.max
        };
        Storage.saveSetup(this.setup);

        // Set partner names in buttons
        document.getElementById('select-partner1').textContent = this.setup.partner1;
        document.getElementById('select-partner2').textContent = this.setup.partner2;
        document.getElementById('rating-select-partner1').textContent = this.setup.partner1;
        document.getElementById('rating-select-partner2').textContent = this.setup.partner2;

        this.showScreen('partner-select');
    },

    // Start brain dump for a partner
    startBrainDump(partner) {
        this.currentPartner = partner;
        const partnerName = this.setup[partner];

        document.getElementById('current-partner').textContent = `Adding guests for ${partnerName}`;
        this.resetGuestForm();
        this.showScreen('braindump');
    },

    // Reset guest form
    resetGuestForm() {
        this.currentGuest = { addedBy: this.currentPartner };
        document.getElementById('guest-name').value = '';
        document.getElementById('guest-note').value = '';

        // Show first step
        document.querySelectorAll('.question-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-name').classList.add('active');
        document.getElementById('guest-name').focus();

        this.updateProgress(0);
    },

    // Update progress bar
    updateProgress(percent) {
        document.getElementById('progress-fill').style.width = `${percent}%`;
    },

    // Save name
    saveName() {
        const name = document.getElementById('guest-name').value.trim();
        if (!name) {
            alert('Please enter a name');
            return;
        }

        this.currentGuest.name = name;
        document.getElementById('relationship-question').textContent = `How do you know ${name}?`;

        document.querySelectorAll('.question-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-relationship').classList.add('active');
        this.updateProgress(25);
    },

    // Save relationship
    saveRelationship(value) {
        this.currentGuest.relationship = value;
        const name = this.currentGuest.name;
        document.getElementById('age-question').textContent = `What age range is ${name}?`;

        document.querySelectorAll('.question-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-age').classList.add('active');
        this.updateProgress(50);
    },

    // Save age
    saveAge(value) {
        this.currentGuest.age = value;
        const name = this.currentGuest.name;
        document.getElementById('note-question').textContent = `Any notes about ${name}?`;

        document.querySelectorAll('.question-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-note').classList.add('active');
        this.updateProgress(75);
    },

    // Create confetti effect
    createConfetti() {
        const colors = ['#ff9aa2', '#ffb7b2', '#ffc9de', '#ffd4e5', '#ffe0eb', '#b5ead7', '#c7ceea'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            confetti.style.animation = 'confetti-fall linear forwards';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
    },

    // Get celebratory message based on count
    getCelebrationMessage(count) {
        const messages = {
            1: { emoji: '🎉', title: 'First Guest!', message: 'Your guest list is growing!' },
            5: { emoji: '✨', title: 'Five Guests!', message: 'You\'re on a roll!' },
            10: { emoji: '🌟', title: 'Double Digits!', message: 'Ten awesome guests!' },
            15: { emoji: '💫', title: 'Fifteen!', message: 'This party is getting big!' },
            20: { emoji: '🎊', title: 'Twenty Guests!', message: 'Your wedding is going to be amazing!' },
            25: { emoji: '🥳', title: 'Quarter Century!', message: '25 guests! Keep going!' },
            30: { emoji: '🎈', title: 'Thirty!', message: 'That\'s a lot of love!' },
            40: { emoji: '💝', title: 'Forty Guests!', message: 'Wow, this is getting exciting!' },
            50: { emoji: '👏', title: 'Half Century!', message: '50 guests! Incredible!' },
            60: { emoji: '🎀', title: 'Sixty Guests!', message: 'Your celebration is going to be huge!' },
            70: { emoji: '💐', title: 'Seventy!', message: 'So many people to celebrate with!' },
            75: { emoji: '🎆', title: 'Seventy-Five!', message: 'This is going to be epic!' },
            80: { emoji: '🌺', title: 'Eighty Guests!', message: 'What an amazing turnout!' },
            90: { emoji: '🎪', title: 'Ninety!', message: 'Almost to 100! You\'re unstoppable!' },
            100: { emoji: '🎇', title: 'ONE HUNDRED!', message: 'Century club! What an achievement!' }
        };

        // If we have a custom message, use it
        if (messages[count]) {
            return messages[count];
        }

        // Every 10 guests gets a celebration!
        if (count % 10 === 0) {
            const emojis = ['🎊', '🎉', '✨', '🌟', '💫', '🎈', '🎀', '💐', '🌺'];
            const randomEmoji = emojis[Math.floor(count / 10) % emojis.length];
            return {
                emoji: randomEmoji,
                title: `${count} Guests!`,
                message: 'Amazing milestone! Keep it going!'
            };
        }

        return null;
    },

    // Show milestone celebration
    showMilestoneCelebration(count) {
        const milestone = this.getCelebrationMessage(count);
        if (!milestone) return;

        // Create celebration popup
        const popup = document.createElement('div');
        popup.className = 'celebration-popup';
        popup.innerHTML = `
            <div style="font-size: 4em; margin-bottom: 15px;">${milestone.emoji}</div>
            <h2>${milestone.title}</h2>
            <p>${milestone.message}</p>
        `;
        document.body.appendChild(popup);

        // Extra confetti for milestones!
        this.createConfetti();
        setTimeout(() => this.createConfetti(), 200);

        setTimeout(() => {
            popup.style.animation = 'popup 0.3s ease-out reverse';
            setTimeout(() => popup.remove(), 300);
        }, 2500);
    },

    // Update guest count display
    updateGuestCountDisplay() {
        const guests = Storage.getGuests();
        const myGuests = guests.filter(g => g.addedBy === this.currentPartner);
        const count = myGuests.length;

        const badge = document.getElementById('current-guest-count');
        if (count === 1) {
            badge.textContent = '1 guest added!';
        } else {
            badge.textContent = `${count} guests added!`;
        }

        // Trigger animation
        badge.style.animation = 'none';
        setTimeout(() => {
            badge.style.animation = 'bounce 0.5s ease';
        }, 10);

        return count;
    },

    // Save note
    saveNote(note) {
        if (note === undefined) {
            note = document.getElementById('guest-note').value.trim();
        }

        this.currentGuest.note = note;

        // Save to storage
        const savedGuest = Storage.addGuest(this.currentGuest);

        // Show celebration!
        this.createConfetti();

        // Update count and check for milestones
        const count = this.updateGuestCountDisplay();
        this.showMilestoneCelebration(count);

        // Show summary
        const summary = `
            <strong>${savedGuest.name}</strong><br>
            ${this.formatLabel(savedGuest.relationship)} • ${savedGuest.age}
            ${savedGuest.note ? '<br>' + savedGuest.note : ''}
        `;
        document.getElementById('guest-summary').innerHTML = summary;

        document.querySelectorAll('.question-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-addmore').classList.add('active');
        this.updateProgress(100);
    },

    // Format label for display
    formatLabel(value) {
        return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

    // Finish brain dump
    finishBrainDump() {
        this.state[`${this.currentPartner}Done`] = true;
        Storage.saveState(this.state);

        this.showScreen('partner-select');
        this.showProgress();
    },

    // Show bulk import modal
    showBulkImport() {
        document.getElementById('bulk-import-modal').classList.add('active');
        document.getElementById('bulk-import-text').value = '';
        document.getElementById('bulk-import-text').focus();
    },

    // Close bulk import modal
    closeBulkImport() {
        document.getElementById('bulk-import-modal').classList.remove('active');
    },

    // Parse bulk import text
    parseBulkImport(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const guests = [];

        const relationshipMap = {
            'friend': 'friend',
            'friends': 'friend',
            'family': 'family',
            'coworker': 'coworker',
            'colleague': 'coworker',
            'work': 'coworker',
            'extended family': 'extended-family',
            'extended': 'extended-family',
            'cousin': 'extended-family',
            'aunt': 'extended-family',
            'uncle': 'extended-family',
            'parent': 'parents-friend',
            'parents': 'parents-friend',
            "parent's friend": 'parents-friend',
            "parents friend": 'parents-friend'
        };

        lines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            const guest = {
                name: parts[0],
                relationship: 'friend',
                age: '30s-40s',
                note: '',
                addedBy: this.currentPartner
            };

            // Try to parse additional fields
            if (parts.length > 1) {
                // Check if part 2 is a relationship
                const rel = parts[1].toLowerCase();
                const matchedRel = relationshipMap[rel] || Object.keys(relationshipMap).find(key => rel.includes(key));
                if (matchedRel) {
                    guest.relationship = relationshipMap[matchedRel];
                }
            }

            if (parts.length > 2) {
                // Check if part 3 is an age range
                const age = parts[2].trim();
                if (age.match(/\d+s?-\d+s?/) || age === '50+' || age.includes('20s') || age.includes('30s') || age.includes('40s')) {
                    guest.age = age;
                } else {
                    // Otherwise it's a note
                    guest.note = parts.slice(2).join(', ');
                }
            }

            if (parts.length > 3) {
                // Part 4 and beyond are notes
                guest.note = parts.slice(3).join(', ');
            }

            guests.push(guest);
        });

        return guests;
    },

    // Process bulk import
    processBulkImport() {
        const text = document.getElementById('bulk-import-text').value;
        if (!text.trim()) {
            alert('Please paste your guest list first!');
            return;
        }

        const guests = this.parseBulkImport(text);

        if (guests.length === 0) {
            alert('No valid guests found. Please check your format.');
            return;
        }

        // Add all guests
        guests.forEach(guest => {
            Storage.addGuest(guest);
        });

        // Close modal
        this.closeBulkImport();

        // Show celebration!
        this.createConfetti();
        setTimeout(() => this.createConfetti(), 200);
        setTimeout(() => this.createConfetti(), 400);

        // Show success popup
        const popup = document.createElement('div');
        popup.className = 'celebration-popup';
        popup.innerHTML = `
            <div style="font-size: 4em; margin-bottom: 15px;">🎉</div>
            <h2>Imported ${guests.length} Guests!</h2>
            <p>Your list is growing fast!</p>
        `;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.animation = 'popup 0.3s ease-out reverse';
            setTimeout(() => popup.remove(), 300);
        }, 2500);

        // Reset to "I'm done" screen
        this.finishBrainDump();
    },

    // Show progress
    showProgress() {
        const guests = Storage.getGuests();
        const partner1Guests = guests.filter(g => g.addedBy === 'partner1').length;
        const partner2Guests = guests.filter(g => g.addedBy === 'partner2').length;

        document.getElementById('partner1-count').textContent = partner1Guests;
        document.getElementById('partner2-count').textContent = partner2Guests;
        document.getElementById('partner1-label').textContent = `${this.setup.partner1}'s guests`;
        document.getElementById('partner2-label').textContent = `${this.setup.partner2}'s guests`;

        const continueBtn = document.getElementById('continue-to-duplicates');
        if (this.state.partner1Done && this.state.partner2Done) {
            continueBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
        }

        this.showScreen('progress');
    },

    // Start duplicate detection
    startDuplicateDetection() {
        const guests = Storage.getGuests();
        this.duplicatePairs = FuzzyMatch.findDuplicates(guests);

        const container = document.getElementById('duplicate-container');
        container.innerHTML = '';

        if (this.duplicatePairs.length === 0) {
            document.getElementById('no-duplicates').style.display = 'block';
            document.getElementById('finish-duplicates').style.display = 'block';
            setTimeout(() => this.finishDuplicates(), 2000);
        } else {
            this.duplicatePairs.forEach((pair, index) => {
                const div = document.createElement('div');
                div.className = 'duplicate-item';
                div.innerHTML = `
                    <div class="duplicate-names">
                        <div class="duplicate-name">${pair.guest1.name}</div>
                        <div class="duplicate-vs">vs</div>
                        <div class="duplicate-name">${pair.guest2.name}</div>
                    </div>
                    <div class="duplicate-buttons">
                        <button class="big-button" onclick="App.mergeDuplicates(${index}, 'keep1')">
                            Keep "${pair.guest1.name}"
                        </button>
                        <button class="big-button" onclick="App.mergeDuplicates(${index}, 'keep2')">
                            Keep "${pair.guest2.name}"
                        </button>
                    </div>
                    <button class="secondary-button" onclick="App.mergeDuplicates(${index}, 'both')">
                        Keep Both (Different People)
                    </button>
                `;
                container.appendChild(div);
            });
        }

        this.showScreen('duplicate');
    },

    // Merge duplicates
    mergeDuplicates(index, action) {
        const pair = this.duplicatePairs[index];

        if (action === 'keep1') {
            // Merge guest2 data into guest1
            const mergedNote = [pair.guest1.note, pair.guest2.note].filter(n => n).join(' | ');
            Storage.updateGuest(pair.guest1.id, { note: mergedNote });
            Storage.deleteGuest(pair.guest2.id);
        } else if (action === 'keep2') {
            // Merge guest1 data into guest2
            const mergedNote = [pair.guest1.note, pair.guest2.note].filter(n => n).join(' | ');
            Storage.updateGuest(pair.guest2.id, { note: mergedNote });
            Storage.deleteGuest(pair.guest1.id);
        }
        // If 'both', do nothing

        // Remove this pair from display
        this.duplicatePairs.splice(index, 1);

        // Re-render
        if (this.duplicatePairs.length === 0) {
            document.getElementById('duplicate-container').innerHTML = '<p class="empty-bucket">All duplicates resolved!</p>';
            document.getElementById('finish-duplicates').style.display = 'block';
        } else {
            this.startDuplicateDetection();
        }
    },

    // Finish duplicates
    finishDuplicates() {
        this.state.duplicatesResolved = true;
        Storage.saveState(this.state);
        this.showScreen('rating-select');
    },

    // Start rating
    startRating(partner) {
        this.currentPartner = partner;
        const partnerName = this.setup[partner];

        document.getElementById('rating-partner').textContent = `Rating guests as ${partnerName}`;

        // Get all guests
        const allGuests = Storage.getGuests();
        this.guestsToRate = allGuests;

        // Check which guests this partner has already rated
        const ratings = Storage.getRatings();
        const unrated = allGuests.filter(g => !ratings[g.id] || !ratings[g.id][partner]);

        if (unrated.length === 0) {
            alert('You have already rated all guests!');
            this.showScreen('rating-select');
            return;
        }

        this.guestsToRate = unrated;
        this.currentRatingIndex = 0;
        this.currentGuestRating = {};

        this.showRatingGuest();
        this.showScreen('rating');
    },

    // Show current guest for rating
    showRatingGuest() {
        if (this.currentRatingIndex >= this.guestsToRate.length) {
            this.finishRating();
            return;
        }

        const guest = this.guestsToRate[this.currentRatingIndex];
        const progress = ((this.currentRatingIndex) / this.guestsToRate.length) * 100;
        document.getElementById('rating-progress-fill').style.width = `${progress}%`;

        document.getElementById('rating-counter').textContent =
            `Guest ${this.currentRatingIndex + 1} of ${this.guestsToRate.length}`;

        // Update guest names in all steps
        document.getElementById('rating-guest-name').textContent = guest.name;
        document.getElementById('rating-guest-name2').textContent = guest.name;
        document.getElementById('rating-guest-name3').textContent = guest.name;
        document.getElementById('rating-guest-name4').textContent = guest.name;

        document.getElementById('rating-guest-detail').textContent =
            `${this.formatLabel(guest.relationship)} • ${guest.age}`;

        // Show first rating step
        document.querySelectorAll('.rating-step').forEach(s => s.classList.remove('active'));
        document.getElementById('rating-step-invite').classList.add('active');
    },

    // Save rating: invite
    saveRatingInvite(value) {
        this.currentGuestRating.invite = value;
        document.querySelectorAll('.rating-step').forEach(s => s.classList.remove('active'));
        document.getElementById('rating-step-attend').classList.add('active');
    },

    // Save rating: attendance
    saveRatingAttend(value) {
        this.currentGuestRating.attend = value;
        document.querySelectorAll('.rating-step').forEach(s => s.classList.remove('active'));
        document.getElementById('rating-step-champion').classList.add('active');
    },

    // Save rating: champion
    saveRatingChampion(value) {
        this.currentGuestRating.champion = value;
        document.querySelectorAll('.rating-step').forEach(s => s.classList.remove('active'));
        document.getElementById('rating-step-priority').classList.add('active');
    },

    // Save rating: priority
    saveRatingPriority(value) {
        this.currentGuestRating.priority = value;

        // Save rating
        const guest = this.guestsToRate[this.currentRatingIndex];
        Storage.addRating(guest.id, this.currentPartner, this.currentGuestRating);

        // Move to next guest
        this.currentRatingIndex++;
        this.currentGuestRating = {};
        this.showRatingGuest();
    },

    // Finish rating
    finishRating() {
        this.state[`${this.currentPartner}RatingDone`] = true;
        Storage.saveState(this.state);

        this.showScreen('rating-select');
        this.showRatingProgress();
    },

    // Show rating progress
    showRatingProgress() {
        const guests = Storage.getGuests();
        const ratings = Storage.getRatings();

        const partner1Rated = guests.filter(g => ratings[g.id] && ratings[g.id].partner1).length;
        const partner2Rated = guests.filter(g => ratings[g.id] && ratings[g.id].partner2).length;

        document.getElementById('rating-partner1-count').textContent = `${partner1Rated}/${guests.length}`;
        document.getElementById('rating-partner2-count').textContent = `${partner2Rated}/${guests.length}`;
        document.getElementById('rating-partner1-label').textContent = `${this.setup.partner1} rated`;
        document.getElementById('rating-partner2-label').textContent = `${this.setup.partner2} rated`;

        const continueBtn = document.getElementById('continue-to-reveal');
        if (this.state.partner1RatingDone && this.state.partner2RatingDone) {
            continueBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
        }

        this.showScreen('rating-progress');
    },

    // Show reveal
    showReveal() {
        const guests = Storage.getGuests();
        const ratings = Storage.getRatings();

        const bucketYes = [];
        const bucketConflict = [];
        const bucketNo = [];

        guests.forEach(guest => {
            const rating = ratings[guest.id];
            if (!rating || !rating.partner1 || !rating.partner2) return;

            const p1 = rating.partner1.invite;
            const p2 = rating.partner2.invite;

            if (p1 === 'yes' && p2 === 'yes') {
                bucketYes.push({ guest, rating });
            } else if (p1 === 'no' && p2 === 'no') {
                bucketNo.push({ guest, rating });
            } else {
                bucketConflict.push({ guest, rating });
            }
        });

        // Render buckets
        this.renderBucket('bucket-yes', bucketYes);
        this.renderBucket('bucket-conflict', bucketConflict);
        this.renderBucket('bucket-no', bucketNo);

        // Show cut list button if over budget
        const cutListBtn = document.getElementById('view-cut-list');
        if (bucketYes.length > this.setup.max) {
            cutListBtn.style.display = 'block';
        } else {
            cutListBtn.style.display = 'none';
        }

        this.showScreen('reveal');
    },

    // Render a bucket
    renderBucket(bucketId, items) {
        const container = document.getElementById(bucketId);
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<div class="empty-bucket">No guests in this category</div>';
            return;
        }

        items.forEach(({ guest, rating }) => {
            const card = document.createElement('div');
            card.className = 'guest-card';

            const attendProb = this.getAttendanceProbability(rating.partner1.attend, rating.partner2.attend);

            card.innerHTML = `
                <div class="guest-card-name">${guest.name}</div>
                <div class="guest-card-detail">${this.formatLabel(guest.relationship)} • ${guest.age}</div>
                ${guest.note ? `<div class="guest-card-detail" style="font-style: italic;">${guest.note}</div>` : ''}
                <div class="guest-card-ratings">
                    <div class="rating-row">
                        <span>${this.setup.partner1}:</span>
                        <span>${this.formatLabel(rating.partner1.invite)}</span>
                    </div>
                    <div class="rating-row">
                        <span>${this.setup.partner2}:</span>
                        <span>${this.formatLabel(rating.partner2.invite)}</span>
                    </div>
                    <div class="rating-row">
                        <span>Attendance:</span>
                        <span>${attendProb}%</span>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    },

    // Get attendance probability
    getAttendanceProbability(attend1, attend2) {
        const probMap = {
            'definitely': 95,
            'probably': 75,
            'maybe': 50,
            'unlikely': 25
        };

        const avg = (probMap[attend1] + probMap[attend2]) / 2;
        return Math.round(avg);
    },

    // Show dashboard
    showDashboard() {
        const guests = Storage.getGuests();
        const ratings = Storage.getRatings();

        // Calculate metrics (exclude guests marked as excluded)
        const invitedGuests = guests.filter(g => {
            if (g.excluded) return false;
            const r = ratings[g.id];
            return r && r.partner1 && r.partner2 &&
                   (r.partner1.invite === 'yes' || r.partner2.invite === 'yes');
        });

        const expectedAttendance = invitedGuests.reduce((sum, guest) => {
            const r = ratings[guest.id];
            const prob = this.getAttendanceProbability(r.partner1.attend, r.partner2.attend);
            return sum + (prob / 100);
        }, 0);

        // Update budget display
        document.getElementById('current-guests').textContent = invitedGuests.length;
        document.getElementById('expected-attendance').textContent = Math.round(expectedAttendance);
        document.getElementById('floor-value').textContent = this.setup.floor;
        document.getElementById('middle-value').textContent = this.setup.middle;
        document.getElementById('max-value').textContent = this.setup.max;

        const estimatedCost = Math.round(expectedAttendance * this.setup.costPerGuest);
        document.getElementById('estimated-cost').textContent = `$${estimatedCost.toLocaleString()}`;

        // Create charts
        this.createRelationshipChart(invitedGuests);
        this.createAgeChart(invitedGuests);
        this.createChampionChart(invitedGuests, ratings);
        this.createAttendanceChart(invitedGuests, ratings);

        this.showScreen('dashboard');
    },

    // Create relationship chart
    createRelationshipChart(guests) {
        const data = {};
        guests.forEach(g => {
            data[g.relationship] = (data[g.relationship] || 0) + 1;
        });

        const ctx = document.getElementById('relationship-chart');
        if (ctx.chart) ctx.chart.destroy();

        ctx.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data).map(k => this.formatLabel(k)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    // Create age chart
    createAgeChart(guests) {
        const data = {};
        guests.forEach(g => {
            data[g.age] = (data[g.age] || 0) + 1;
        });

        const ctx = document.getElementById('age-chart');
        if (ctx.chart) ctx.chart.destroy();

        ctx.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Guests',
                    data: Object.values(data),
                    backgroundColor: '#e91e63'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    // Create champion chart
    createChampionChart(guests, ratings) {
        const data = {};
        guests.forEach(g => {
            const r = ratings[g.id];
            if (r && r.partner1 && r.partner2) {
                // Count from both partners' perspectives
                const champ1 = r.partner1.champion;
                const champ2 = r.partner2.champion;
                data[champ1] = (data[champ1] || 0) + 0.5;
                data[champ2] = (data[champ2] || 0) + 0.5;
            }
        });

        const ctx = document.getElementById('champion-chart');
        if (ctx.chart) ctx.chart.destroy();

        ctx.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data).map(k => this.formatLabel(k)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#e91e63']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    // Create attendance chart
    createAttendanceChart(guests, ratings) {
        const ranges = {
            'Very Likely (75%+)': 0,
            'Likely (50-75%)': 0,
            'Maybe (25-50%)': 0,
            'Unlikely (<25%)': 0
        };

        guests.forEach(g => {
            const r = ratings[g.id];
            if (r && r.partner1 && r.partner2) {
                const prob = this.getAttendanceProbability(r.partner1.attend, r.partner2.attend);
                if (prob >= 75) ranges['Very Likely (75%+)']++;
                else if (prob >= 50) ranges['Likely (50-75%)']++;
                else if (prob >= 25) ranges['Maybe (25-50%)']++;
                else ranges['Unlikely (<25%)']++;
            }
        });

        const ctx = document.getElementById('attendance-chart');
        if (ctx.chart) ctx.chart.destroy();

        ctx.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Guests',
                    data: Object.values(ranges),
                    backgroundColor: ['#4caf50', '#8bc34a', '#ff9800', '#f44336']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    // Show cut list
    showCutList() {
        const guests = Storage.getGuests();
        const ratings = Storage.getRatings();

        // Get all "yes" guests
        const yesGuests = guests.filter(g => {
            const r = ratings[g.id];
            return r && r.partner1 && r.partner2 &&
                   (r.partner1.invite === 'yes' || r.partner2.invite === 'yes');
        });

        // Calculate how many to cut
        const needToCut = yesGuests.length - this.setup.max;

        document.getElementById('cutlist-current').textContent = yesGuests.length;
        document.getElementById('cutlist-max').textContent = this.setup.max;
        document.getElementById('cutlist-need').textContent = needToCut;

        // Score and sort guests by priority
        const scoredGuests = yesGuests.map(guest => {
            const r = ratings[guest.id];
            let score = 0;
            let reasons = [];

            // Priority scoring (most important)
            const priorities = {
                'must-have': 100,
                'really-want': 75,
                'nice-to-have': 50,
                'flexible': 25
            };
            const avgPriority = (priorities[r.partner1.priority || 'nice-to-have'] +
                                priorities[r.partner2.priority || 'nice-to-have']) / 2;
            score += avgPriority;

            if (avgPriority < 50) {
                reasons.push('Low priority from both partners');
            }

            // Invite scoring
            if (r.partner1.invite === 'maybe' || r.partner2.invite === 'maybe') {
                score -= 20;
                reasons.push('One partner said "maybe"');
            }
            if (r.partner1.invite === 'no' || r.partner2.invite === 'no') {
                score -= 30;
                reasons.push('One partner said "no"');
            }

            // Attendance probability
            const attendProb = this.getAttendanceProbability(r.partner1.attend, r.partner2.attend);
            score += attendProb / 2;
            if (attendProb < 50) {
                reasons.push(`Low attendance probability (${attendProb}%)`);
            }

            // Champion scoring (parents' friends are easier to cut)
            if (r.partner1.champion === 'your-parents' || r.partner1.champion === 'partner-parents' ||
                r.partner2.champion === 'your-parents' || r.partner2.champion === 'partner-parents') {
                score -= 10;
                reasons.push("Parent's choice");
            }

            return {
                guest,
                rating: r,
                score,
                reasons,
                excluded: guest.excluded || false
            };
        });

        // Sort by score (lowest first = easiest to cut)
        scoredGuests.sort((a, b) => a.score - b.score);

        // Render suggestions
        const container = document.getElementById('cut-suggestions');
        container.innerHTML = '';

        scoredGuests.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cut-item' + (item.excluded ? ' excluded' : '');
            div.id = `cut-item-${item.guest.id}`;

            const priorityClass = `priority-${item.rating.partner1.priority || 'nice-to-have'}`;
            const priorityLabel = this.formatLabel(item.rating.partner1.priority || 'nice-to-have');

            div.innerHTML = `
                <div class="cut-item-info">
                    <div class="cut-item-name">
                        ${index < needToCut ? '✂️' : '💡'} ${item.guest.name}
                        <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
                    </div>
                    <div class="cut-item-details">
                        ${this.formatLabel(item.guest.relationship)} • ${item.guest.age}
                        ${item.guest.note ? ` • ${item.guest.note}` : ''}
                    </div>
                    <div class="cut-item-reason">
                        ${item.reasons.join(' • ')}
                    </div>
                </div>
                <div class="cut-item-actions">
                    ${item.excluded ?
                        `<button class="cut-button include" onclick="App.toggleGuestExclusion('${item.guest.id}', false)">Keep</button>` :
                        `<button class="cut-button exclude" onclick="App.toggleGuestExclusion('${item.guest.id}', true)">Cut</button>`
                    }
                </div>
            `;

            container.appendChild(div);
        });

        this.showScreen('cutlist');
    },

    // Toggle guest exclusion
    toggleGuestExclusion(guestId, exclude) {
        const guests = Storage.getGuests();
        const guest = guests.find(g => g.id == guestId);
        if (guest) {
            guest.excluded = exclude;
            Storage.saveGuests(guests);

            // Update the UI
            const item = document.getElementById(`cut-item-${guestId}`);
            if (exclude) {
                item.classList.add('excluded');
                item.querySelector('.cut-item-actions').innerHTML =
                    `<button class="cut-button include" onclick="App.toggleGuestExclusion('${guestId}', false)">Keep</button>`;
            } else {
                item.classList.remove('excluded');
                item.querySelector('.cut-item-actions').innerHTML =
                    `<button class="cut-button exclude" onclick="App.toggleGuestExclusion('${guestId}', true)">Cut</button>`;
            }
        }
    },

    // Start over
    startOver() {
        if (confirm('Are you sure you want to start over? All data will be lost.')) {
            Storage.clearAll();
            location.reload();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
