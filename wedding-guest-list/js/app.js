// Main Application Logic
const App = {
    // Current state
    setup: null,
    currentPartner: null,
    currentGuest: {},
    currentRatingIndex: 0,
    guestsToRate: [],
    duplicatePairs: [],

    // Initialize app
    init() {
        this.setup = Storage.getSetup();
        this.state = Storage.getState();

        // Setup event listeners
        this.setupEventListeners();

        // Navigate to appropriate screen
        if (!this.setup) {
            this.showScreen('setup');
        } else {
            this.restoreState();
        }
    },

    // Setup all event listeners
    setupEventListeners() {
        // Setup Phase
        document.getElementById('start-button').addEventListener('click', () => this.completeSetup());

        // Partner Selection
        document.getElementById('select-partner1').addEventListener('click', () => this.startBrainDump('partner1'));
        document.getElementById('select-partner2').addEventListener('click', () => this.startBrainDump('partner2'));
        document.getElementById('view-progress').addEventListener('click', () => this.showProgress());

        // Brain Dump
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

        // Rating Progress
        document.getElementById('back-to-rating-select').addEventListener('click', () => this.showScreen('rating-select'));
        document.getElementById('continue-to-reveal').addEventListener('click', () => this.showReveal());

        // Reveal
        document.getElementById('view-dashboard').addEventListener('click', () => this.showDashboard());

        // Dashboard
        document.getElementById('back-to-reveal').addEventListener('click', () => this.showReveal());
        document.getElementById('start-over').addEventListener('click', () => this.startOver());
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

    // Complete setup phase
    completeSetup() {
        const partner1 = document.getElementById('partner1-name').value.trim();
        const partner2 = document.getElementById('partner2-name').value.trim();
        const costPerGuest = parseInt(document.getElementById('cost-per-guest').value);
        const floor = parseInt(document.getElementById('floor-budget').value);
        const middle = parseInt(document.getElementById('middle-budget').value);
        const max = parseInt(document.getElementById('max-budget').value);

        if (!partner1 || !partner2 || !costPerGuest || !floor || !middle || !max) {
            alert('Please fill in all fields');
            return;
        }

        if (floor > middle || middle > max) {
            alert('Budget targets should be: Floor < Middle < Max');
            return;
        }

        this.setup = { partner1, partner2, costPerGuest, floor, middle, max };
        Storage.saveSetup(this.setup);

        // Set partner names in buttons
        document.getElementById('select-partner1').textContent = partner1;
        document.getElementById('select-partner2').textContent = partner2;
        document.getElementById('rating-select-partner1').textContent = partner1;
        document.getElementById('rating-select-partner2').textContent = partner2;

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

    // Save note
    saveNote(note) {
        if (note === undefined) {
            note = document.getElementById('guest-note').value.trim();
        }

        this.currentGuest.note = note;

        // Save to storage
        const savedGuest = Storage.addGuest(this.currentGuest);

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

        // Calculate metrics
        const invitedGuests = guests.filter(g => {
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
