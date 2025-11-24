// Local Storage Manager
const Storage = {
    // Keys
    SETUP_KEY: 'wedding_setup',
    GUESTS_KEY: 'wedding_guests',
    RATINGS_KEY: 'wedding_ratings',
    STATE_KEY: 'wedding_state',

    // Save setup data
    saveSetup(data) {
        localStorage.setItem(this.SETUP_KEY, JSON.stringify(data));
    },

    // Get setup data
    getSetup() {
        const data = localStorage.getItem(this.SETUP_KEY);
        return data ? JSON.parse(data) : null;
    },

    // Save guest data
    saveGuests(guests) {
        localStorage.setItem(this.GUESTS_KEY, JSON.stringify(guests));
    },

    // Get guest data
    getGuests() {
        const data = localStorage.getItem(this.GUESTS_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Add a guest
    addGuest(guest) {
        const guests = this.getGuests();
        guest.id = Date.now() + Math.random();
        guests.push(guest);
        this.saveGuests(guests);
        return guest;
    },

    // Update a guest
    updateGuest(guestId, updates) {
        const guests = this.getGuests();
        const index = guests.findIndex(g => g.id === guestId);
        if (index !== -1) {
            guests[index] = { ...guests[index], ...updates };
            this.saveGuests(guests);
        }
    },

    // Delete a guest
    deleteGuest(guestId) {
        let guests = this.getGuests();
        guests = guests.filter(g => g.id !== guestId);
        this.saveGuests(guests);
    },

    // Save ratings
    saveRatings(ratings) {
        localStorage.setItem(this.RATINGS_KEY, JSON.stringify(ratings));
    },

    // Get ratings
    getRatings() {
        const data = localStorage.getItem(this.RATINGS_KEY);
        return data ? JSON.parse(data) : {};
    },

    // Add rating for a guest
    addRating(guestId, partner, ratingData) {
        const ratings = this.getRatings();
        if (!ratings[guestId]) {
            ratings[guestId] = {};
        }
        ratings[guestId][partner] = ratingData;
        this.saveRatings(ratings);
    },

    // Save app state
    saveState(state) {
        localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
    },

    // Get app state
    getState() {
        const data = localStorage.getItem(this.STATE_KEY);
        return data ? JSON.parse(data) : {
            currentScreen: 'setup',
            partner1Done: false,
            partner2Done: false,
            partner1RatingDone: false,
            partner2RatingDone: false,
            duplicatesResolved: false
        };
    },

    // Clear all data
    clearAll() {
        localStorage.removeItem(this.SETUP_KEY);
        localStorage.removeItem(this.GUESTS_KEY);
        localStorage.removeItem(this.RATINGS_KEY);
        localStorage.removeItem(this.STATE_KEY);
    }
};
