// Fuzzy matching for duplicate detection
const FuzzyMatch = {
    // Calculate Levenshtein distance between two strings
    levenshteinDistance(str1, str2) {
        str1 = str1.toLowerCase().trim();
        str2 = str2.toLowerCase().trim();

        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    },

    // Calculate similarity ratio (0 to 1)
    similarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 1.0;
        }

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    },

    // Normalize name for comparison
    normalizeName(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' '); // Normalize spaces
    },

    // Check if two names are likely duplicates
    areDuplicates(name1, name2, threshold = 0.8) {
        const norm1 = this.normalizeName(name1);
        const norm2 = this.normalizeName(name2);

        // Exact match after normalization
        if (norm1 === norm2) {
            return true;
        }

        // Check similarity
        const sim = this.similarity(norm1, norm2);
        if (sim >= threshold) {
            return true;
        }

        // Check if one name contains the other (for nicknames)
        const words1 = norm1.split(' ');
        const words2 = norm2.split(' ');

        for (const word1 of words1) {
            for (const word2 of words2) {
                if (word1.length > 2 && word2.length > 2) {
                    if (word1.includes(word2) || word2.includes(word1)) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    // Find all potential duplicates in a list of guests
    findDuplicates(guests) {
        const duplicates = [];
        const processed = new Set();

        for (let i = 0; i < guests.length; i++) {
            for (let j = i + 1; j < guests.length; j++) {
                const guest1 = guests[i];
                const guest2 = guests[j];

                // Skip if already processed
                const pairKey = `${Math.min(guest1.id, guest2.id)}-${Math.max(guest1.id, guest2.id)}`;
                if (processed.has(pairKey)) {
                    continue;
                }

                // Skip if added by same partner
                if (guest1.addedBy === guest2.addedBy) {
                    continue;
                }

                // Check for duplicates
                if (this.areDuplicates(guest1.name, guest2.name)) {
                    duplicates.push({
                        guest1,
                        guest2,
                        pairKey
                    });
                    processed.add(pairKey);
                }
            }
        }

        return duplicates;
    }
};
