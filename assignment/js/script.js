$(document).ready(function() {
    let currentPerson = '';
    let currentQuestion = 0;
    let answers = {};
    let guestList = [];

    // Load existing guest list from localStorage
    if (localStorage.getItem('weddingGuestList')) {
        guestList = JSON.parse(localStorage.getItem('weddingGuestList'));
    }

    // Start button
    $('#start').click(function() {
        $('#intro').fadeOut(300, function() {
            $('#questionnaire').fadeIn(300);
        });
    });

    // Bulk add button (from intro)
    $('#bulk-add-btn').click(function() {
        $('#intro').fadeOut(300, function() {
            $('#bulk-add-section').fadeIn(300);
        });
    });

    // Bulk add button (from guest list)
    $('#bulk-add-from-list').click(function() {
        $('#guest-list').fadeOut(300, function() {
            $('#bulk-add-section').fadeIn(300);
        });
    });

    // Bulk add submit
    $('#bulk-add-submit').click(function() {
        const bulkInput = $('#bulk-names-input').val().trim();
        if (bulkInput === '') {
            alert('Please enter at least one name');
            return;
        }

        // Split by newlines and filter out empty lines
        const names = bulkInput.split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');

        if (names.length === 0) {
            alert('Please enter at least one name');
            return;
        }

        // Add each name to the guest list
        let addedCount = 0;
        names.forEach(function(name) {
            // Check if name already exists
            const exists = guestList.find(g => g.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                guestList.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: name,
                    timestamp: new Date().toISOString(),
                    recommendation: 'not-evaluated',
                    needsEvaluation: true
                });
                addedCount++;
            }
        });

        localStorage.setItem('weddingGuestList', JSON.stringify(guestList));

        // Clear the textarea
        $('#bulk-names-input').val('');

        // Show success message and go to guest list
        alert(addedCount + ' guest' + (addedCount !== 1 ? 's' : '') + ' added to your list!');

        displayGuestList();
        $('#bulk-add-section').fadeOut(300, function() {
            $('#guest-list').fadeIn(300);
        });
    });

    // Bulk add cancel
    $('#bulk-add-cancel').click(function() {
        $('#bulk-names-input').val('');
        $('#bulk-add-section').fadeOut(300, function() {
            $('#intro').fadeIn(300);
        });
    });

    // Handle person name input
    $('#person-name').on('input', function() {
        const name = $(this).val().trim();
        if (name !== '') {
            $('#input-person-name').text(name);
            $('#plusone-question').slideDown(300);
            $('#begin-questions').hide();
        } else {
            $('#plusone-question').slideUp(300);
            $('#plusone-details').hide();
            $('#begin-questions').show();
        }
    });

    // Handle plus-one answer
    $(document).on('click', '.plusone-answer', function() {
        const answer = $(this).data('answer');

        if (answer === 'yes') {
            populateExistingGuests();
            $('#plusone-details').slideDown(300);
        } else {
            $('#plusone-details').slideUp(300);
            $('#begin-questions').fadeIn(300);
        }
    });

    // Begin questions button
    $('#begin-questions').click(function() {
        const name = $('#person-name').val().trim();
        if (name === '') {
            alert('Please enter a name');
            return;
        }

        currentPerson = name;
        answers = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: currentPerson,
            timestamp: new Date().toISOString()
        };

        // Check if this person is being evaluated as a plus-one
        if (window.evaluatingPlusOneFor) {
            const partner = guestList.find(g => g.name === window.evaluatingPlusOneFor);
            if (partner) {
                answers.linkedTo = partner.name;
                answers.plusOneId = partner.id;
                // Mark that we'll link them after saving
                answers.autoLinkTo = partner;
            }
            window.evaluatingPlusOneFor = null;
        }

        // Process plus-one data from input section
        if (window.tempPlusOneLink) {
            if (window.tempPlusOneLink.type === 'existing') {
                // Find the selected guest
                const selectedGuest = guestList.find(function(guest) {
                    return (guest.id || guestList.indexOf(guest)).toString() === window.tempPlusOneLink.guestId;
                });

                if (selectedGuest) {
                    answers.plusOne = selectedGuest.name;
                    answers.plusOneId = selectedGuest.id || guestList.indexOf(selectedGuest);
                    answers.linkedTo = selectedGuest.name;
                    // Mark for linking after save
                    answers.linkToExisting = selectedGuest;
                }
            } else if (window.tempPlusOneLink.type === 'new') {
                answers.plusOne = window.tempPlusOneLink.name;
                answers.plusOneNeedsEvaluation = true;
            }

            // Clear temp data
            window.tempPlusOneLink = null;
        }

        currentQuestion = 1;

        // Update all person name placeholders
        $('.person-name-placeholder').text(currentPerson);
        $('#current-person-name').text(currentPerson);

        $('#person-input-section').fadeOut(300, function() {
            $('#questions-section').fadeIn(300);
            showQuestion(currentQuestion);
        });
    });

    // Answer button clicks (for relationship questions only)
    $(document).on('click', '.answer-button:not(.plusone-answer)', function() {
        const answer = $(this).data('answer');
        const questionId = $(this).closest('.question-container').attr('id');

        // Store the answer
        answers[questionId] = answer;

        // Determine next question
        let nextQuestion = currentQuestion + 1;

        // Skip the "why obligated" question if they said no to feeling obligated
        if (questionId === 'q4' && (answer === 'no')) {
            nextQuestion = 6; // Skip q5
        }

        // Hide current question
        $('#' + questionId).fadeOut(300, function() {
            if (nextQuestion <= 7) {
                currentQuestion = nextQuestion;
                showQuestion(currentQuestion);
            } else {
                // Show results
                showResults();
            }
        });
    });

    function showQuestion(questionNum) {
        $('#q' + questionNum).fadeIn(300);
    }

    function showResults() {
        $('#questions-section').fadeOut(300, function() {
            generateReflection();
            $('#results-section').fadeIn(300);
        });
    }

    function generateReflection() {
        $('#results-person-name').text(currentPerson);

        let reflectionHTML = '<div class="reflection-points">';
        let score = 0;
        let maxScore = 0;

        // Analyze congratulations
        if (answers.q1) {
            reflectionHTML += '<div class="reflection-point">';
            if (answers.q1 === 'yes') {
                reflectionHTML += '<strong>✓</strong> ' + currentPerson + ' congratulated you on your engagement, showing they care about this milestone in your life.';
                score += 2;
            } else if (answers.q1 === 'no') {
                reflectionHTML += '<strong>○</strong> ' + currentPerson + ' did not congratulate you on your engagement. Consider whether this reflects the current state of your relationship.';
            } else {
                reflectionHTML += '<strong>?</strong> You\'re unsure if ' + currentPerson + ' congratulated you. This might indicate how prominent they are in your life right now.';
                score += 0.5;
            }
            reflectionHTML += '</div>';
            maxScore += 2;
        }

        // Analyze last contact
        if (answers.q2) {
            reflectionHTML += '<div class="reflection-point">';
            if (answers.q2 === 'this-month') {
                reflectionHTML += '<strong>✓</strong> You spoke recently (within the last month), indicating an active relationship.';
                score += 2;
            } else if (answers.q2 === 'this-year') {
                reflectionHTML += '<strong>○</strong> You spoke within the last year. Consider whether this frequency feels right for someone at your wedding.';
                score += 1;
            } else if (answers.q2 === '1-3-years') {
                reflectionHTML += '<strong>○</strong> It\'s been 1-3 years since you last spoke. Reflect on why the relationship has become less active.';
                score += 0.5;
            } else if (answers.q2 === '3plus-years') {
                reflectionHTML += '<strong>○</strong> It\'s been over 3 years since you spoke. Consider whether this person should be part of your intimate celebration.';
            } else {
                reflectionHTML += '<strong>?</strong> You can\'t remember when you last spoke, which may say something about the current closeness of your relationship.';
            }
            reflectionHTML += '</div>';
            maxScore += 2;
        }

        // Analyze relationship quality
        if (answers.q3) {
            reflectionHTML += '<div class="reflection-point">';
            if (answers.q3 === 'close') {
                reflectionHTML += '<strong>✓</strong> You describe your relationship as very close. This is exactly the kind of person your wedding is for.';
                score += 3;
            } else if (answers.q3 === 'friendly') {
                reflectionHTML += '<strong>○</strong> You\'re friendly but not close. Think about whether your wedding should be reserved for closer relationships.';
                score += 1;
            } else if (answers.q3 === 'acquaintance') {
                reflectionHTML += '<strong>○</strong> You consider them an acquaintance. Your wedding is an intimate event - should acquaintances be there?';
                score += 0.5;
            } else {
                reflectionHTML += '<strong>!</strong> You describe the relationship as distant or strained. Question whether you want this energy at your celebration.';
            }
            reflectionHTML += '</div>';
            maxScore += 3;
        }

        // Analyze obligation
        if (answers.q4) {
            reflectionHTML += '<div class="reflection-point obligation-point">';
            if (answers.q4 === 'yes' || answers.q4 === 'somewhat') {
                reflectionHTML += '<strong>!</strong> You feel ' + (answers.q4 === 'yes' ? 'obligated' : 'somewhat obligated') + ' to invite them. ';

                if (answers.q5) {
                    if (answers.q5 === 'family-pressure') {
                        reflectionHTML += 'You mentioned family pressure. Remember: this is YOUR day. Family obligations can be discussed, but your comfort matters most.';
                    } else if (answers.q5 === 'reciprocity') {
                        reflectionHTML += 'You feel obligated because they invited you to their wedding. But reciprocity doesn\'t mean you share the same level of closeness now.';
                    } else if (answers.q5 === 'social-pressure') {
                        reflectionHTML += 'You mentioned social or work dynamics. Consider whether maintaining professional relationships is worth compromising your intimate celebration.';
                    } else if (answers.q5 === 'guilt') {
                        reflectionHTML += 'You mentioned guilt or fear of hurting feelings. Your wedding isn\'t about managing others\' emotions - it\'s about celebrating with people you love.';
                    } else if (answers.q5 === 'genuine') {
                        reflectionHTML += 'Actually, you genuinely want them there. That\'s wonderful - obligation mixed with genuine desire is normal!';
                        score += 2;
                    }
                } else {
                    reflectionHTML += '<strong>Important:</strong> Ask yourself why you feel obligated. Is it worth compromising your vision of your day?';
                }
            } else {
                reflectionHTML += '<strong>✓</strong> You don\'t feel obligated to invite them. This clarity is valuable.';
                score += 1;
            }
            reflectionHTML += '</div>';
            maxScore += 2;
        }

        // Analyze imagination of wedding day
        if (answers.q6) {
            reflectionHTML += '<div class="reflection-point">';
            if (answers.q6 === 'no') {
                reflectionHTML += '<strong>✓</strong> You can\'t imagine your wedding without them. This is a powerful indicator they should be there.';
                score += 3;
            } else if (answers.q6 === 'yes') {
                reflectionHTML += '<strong>○</strong> You can easily imagine your wedding without them. This suggests they may not be essential to your celebration.';
            } else {
                reflectionHTML += '<strong>?</strong> You\'re unsure if you can imagine your wedding without them. This uncertainty might reflect ambivalence about their presence.';
                score += 1;
            }
            reflectionHTML += '</div>';
            maxScore += 3;
        }

        // Analyze whether they'd celebrate
        if (answers.q7) {
            reflectionHTML += '<div class="reflection-point">';
            if (answers.q7 === 'definitely') {
                reflectionHTML += '<strong>✓</strong> You\'re confident they would celebrate your joy. Your wedding should be filled with people who are genuinely happy for you.';
                score += 2;
            } else if (answers.q7 === 'probably') {
                reflectionHTML += '<strong>○</strong> You think they\'d probably celebrate with you. Consider whether "probably" is enough for your intimate circle.';
                score += 1;
            } else if (answers.q7 === 'unsure') {
                reflectionHTML += '<strong>?</strong> You\'re unsure if they\'d celebrate your joy. This uncertainty might indicate distance in your relationship.';
                score += 0.5;
            } else {
                reflectionHTML += '<strong>!</strong> You don\'t think they\'d celebrate your joy. Why would you want someone at your wedding who wouldn\'t be happy for you?';
            }
            reflectionHTML += '</div>';
            maxScore += 2;
        }

        reflectionHTML += '</div>';

        $('#reflection-text').html(reflectionHTML);

        // Generate recommendation
        let recommendationHTML = '<div class="recommendation-box">';
        const percentage = (score / maxScore) * 100;

        if (percentage >= 75) {
            recommendationHTML += '<h3 class="recommendation strong-yes">Strong Invitation Candidate</h3>';
            recommendationHTML += '<p>Based on your answers, ' + currentPerson + ' appears to be someone who should be at your wedding. Your relationship is active, meaningful, and they would genuinely celebrate with you.</p>';
            answers.recommendation = 'strong-yes';
        } else if (percentage >= 50) {
            recommendationHTML += '<h3 class="recommendation maybe">Consider Carefully</h3>';
            recommendationHTML += '<p>Your relationship with ' + currentPerson + ' has some positive indicators, but also some concerns. Take time to reflect on whether they belong in your intimate celebration.</p>';
            answers.recommendation = 'maybe';
        } else if (percentage >= 25) {
            recommendationHTML += '<h3 class="recommendation probably-not">Likely Not Essential</h3>';
            recommendationHTML += '<p>Based on your answers, ' + currentPerson + ' may not be essential to your wedding celebration. Your relationship doesn\'t show strong indicators of closeness or recent connection.</p>';
            answers.recommendation = 'probably-not';
        } else {
            recommendationHTML += '<h3 class="recommendation strong-no">Not Recommended</h3>';
            recommendationHTML += '<p>Your answers suggest that ' + currentPerson + ' shouldn\'t be on your guest list. There\'s little indication of an active, meaningful relationship, and you may feel more obligation than genuine desire.</p>';
            answers.recommendation = 'strong-no';
        }

        recommendationHTML += '<p class="final-note"><em>Remember: This is guidance based on your answers. Ultimately, you know your relationships best. Trust your instincts.</em></p>';
        recommendationHTML += '</div>';

        $('#recommendation').html(recommendationHTML);

        // Save to guest list
        guestList.push(answers);

        // Handle auto-linking if this person was evaluated as a plus-one
        if (answers.autoLinkTo) {
            const partner = guestList.find(g => g.id === answers.autoLinkTo.id);
            if (partner) {
                partner.linkedTo = currentPerson;
                partner.plusOneId = answers.id;
                delete partner.plusOneNeedsEvaluation;
                delete partner.plusOne; // Remove the string reference
            }
            delete answers.autoLinkTo; // Clean up temporary property
        }

        // Handle linking to existing guest from input section
        if (answers.linkToExisting) {
            const partner = guestList.find(g => g.id === answers.linkToExisting.id);
            if (partner) {
                partner.linkedTo = currentPerson;
                partner.plusOneId = answers.id;
            }
            delete answers.linkToExisting; // Clean up temporary property
        }

        localStorage.setItem('weddingGuestList', JSON.stringify(guestList));
    }

    // Evaluate another person
    $('#evaluate-another').click(function() {
        resetQuestionnaire();
        $('#results-section').fadeOut(300, function() {
            $('#person-input-section').fadeIn(300);
        });
    });

    // View list
    $('#view-list').click(function() {
        displayGuestList();
        $('#questionnaire').fadeOut(300, function() {
            $('#guest-list').fadeIn(300);
        });
    });

    // Add more from list view
    $('#add-more').click(function() {
        resetQuestionnaire();
        $('#guest-list').fadeOut(300, function() {
            $('#questionnaire').fadeIn(300);
            $('#person-input-section').fadeIn(300);
        });
    });

    // Plus-one handling
    function populateExistingGuests() {
        const select = $('#existing-guest-select');
        select.find('option:not(:first)').remove(); // Clear existing options except the first

        // Get all guests without a linked partner and not the current person
        const availableGuests = guestList.filter(function(guest) {
            return !guest.linkedTo && !guest.plusOneId && guest.name !== currentPerson;
        });

        availableGuests.forEach(function(guest, index) {
            select.append($('<option>', {
                value: guest.id || index,
                text: guest.name
            }));
        });
    }

    $('#link-existing').click(function() {
        const selectedGuestId = $('#existing-guest-select').val();
        if (!selectedGuestId) {
            alert('Please select a guest to link');
            return;
        }

        // Store for later when we create the answers object
        window.tempPlusOneLink = {
            type: 'existing',
            guestId: selectedGuestId
        };

        $('#plusone-details').slideUp(300);
        $('#begin-questions').fadeIn(300);
    });

    $('#add-new-plusone').click(function() {
        const plusOneName = $('#plusone-name').val().trim();
        if (plusOneName === '') {
            alert('Please enter a name');
            return;
        }

        // Store for later when we create the answers object
        window.tempPlusOneLink = {
            type: 'new',
            name: plusOneName
        };

        $('#plusone-details').slideUp(300);
        $('#begin-questions').fadeIn(300);
    });

    $('#skip-plusone').click(function() {
        // Clear any temp data
        window.tempPlusOneLink = null;

        $('#plusone-details').slideUp(300);
        $('#begin-questions').fadeIn(300);
    });

    function resetQuestionnaire() {
        $('#person-name').val('');
        $('#plusone-name').val('');
        $('#existing-guest-select').val('');
        $('#plusone-question').hide();
        $('#plusone-details').hide();
        $('#begin-questions').show();
        window.tempPlusOneLink = null;
        currentQuestion = 0;
        answers = {};
        $('.question-container').hide();
        $('#questions-section').hide();
        $('#results-section').hide();
    }

    function displayGuestList() {
        let listHTML = '';

        if (guestList.length === 0) {
            listHTML = '<p class="empty-list">You haven\'t evaluated anyone yet.</p>';
        } else {
            listHTML += '<div class="guest-cards">';

            // Track which guests we've already displayed (to avoid showing couples twice)
            const displayedGuests = new Set();

            guestList.forEach(function(person, index) {
                // Skip if already displayed as part of a couple
                if (displayedGuests.has(person.id)) {
                    return;
                }

                let badgeClass = '';
                let badgeText = '';

                switch(person.recommendation) {
                    case 'strong-yes':
                        badgeClass = 'badge-strong-yes';
                        badgeText = 'Strong Yes';
                        break;
                    case 'maybe':
                        badgeClass = 'badge-maybe';
                        badgeText = 'Maybe';
                        break;
                    case 'probably-not':
                        badgeClass = 'badge-probably-not';
                        badgeText = 'Probably Not';
                        break;
                    case 'strong-no':
                        badgeClass = 'badge-strong-no';
                        badgeText = 'No';
                        break;
                    case 'not-evaluated':
                        badgeClass = 'badge-not-evaluated';
                        badgeText = 'Not Evaluated';
                        break;
                }

                listHTML += '<div class="guest-card">';
                listHTML += '<div class="guest-card-header">';

                // Check if this person has a linked partner
                if (person.linkedTo) {
                    const partner = guestList.find(g => g.name === person.linkedTo);
                    if (partner) {
                        listHTML += '<h3>' + person.name + ' & ' + partner.name + '</h3>';
                        listHTML += '<span class="couple-badge">Couple</span>';
                        displayedGuests.add(person.id);
                        displayedGuests.add(partner.id);
                    } else {
                        listHTML += '<h3>' + person.name + '</h3>';
                    }
                } else if (person.plusOne) {
                    // Has a plus-one but not yet evaluated
                    listHTML += '<h3>' + person.name;
                    if (person.plusOneNeedsEvaluation) {
                        listHTML += ' <span style="font-size: 0.8em; color: #999;">(+ ' + person.plusOne + ')</span>';
                    }
                    listHTML += '</h3>';
                } else {
                    listHTML += '<h3>' + person.name + '</h3>';
                }

                listHTML += '<span class="badge ' + badgeClass + '">' + badgeText + '</span>';
                listHTML += '</div>';

                // Show plus-one info if needed
                if (person.plusOneNeedsEvaluation) {
                    listHTML += '<div class="plusone-note">';
                    listHTML += '<span style="color: #f39c12;">⚠</span> Plus-one (' + person.plusOne + ') needs evaluation';
                    listHTML += ' <button class="evaluate-plusone-btn" data-name="' + person.plusOne + '" data-partner="' + person.name + '">Evaluate Now</button>';
                    listHTML += '</div>';
                }

                listHTML += '<div class="guest-card-actions">';
                if (person.needsEvaluation) {
                    listHTML += '<button class="evaluate-btn" data-name="' + person.name + '">Evaluate</button>';
                }
                listHTML += '<button class="delete-btn" data-index="' + index + '">Remove</button>';
                listHTML += '</div>';
                listHTML += '</div>';
            });

            listHTML += '</div>';
        }

        $('#list-container').html(listHTML);
    }

    // Delete guest from list
    $(document).on('click', '.delete-btn', function() {
        const index = $(this).data('index');
        if (confirm('Remove this person from your evaluations?')) {
            const personToRemove = guestList[index];

            // If they have a linked partner, unlink them
            if (personToRemove.linkedTo) {
                const partner = guestList.find(g => g.name === personToRemove.linkedTo);
                if (partner) {
                    delete partner.linkedTo;
                    delete partner.plusOneId;
                }
            }

            guestList.splice(index, 1);
            localStorage.setItem('weddingGuestList', JSON.stringify(guestList));
            displayGuestList();
        }
    });

    // Evaluate plus-one button
    $(document).on('click', '.evaluate-plusone-btn', function() {
        const plusOneName = $(this).data('name');
        const partnerName = $(this).data('partner');

        // Pre-fill the name and note that this is a plus-one
        resetQuestionnaire();
        $('#guest-list').fadeOut(300, function() {
            $('#questionnaire').fadeIn(300);
            $('#person-input-section').fadeIn(300);
            $('#person-name').val(plusOneName);

            // Store reference to the partner
            window.evaluatingPlusOneFor = partnerName;
        });
    });

    // Evaluate button (for bulk-added guests)
    $(document).on('click', '.evaluate-btn', function() {
        const guestName = $(this).data('name');

        // Find the guest and remove the bulk-added entry
        const guestIndex = guestList.findIndex(g => g.name === guestName);
        if (guestIndex !== -1) {
            // Remove the unevaluated entry - will be re-added after evaluation
            guestList.splice(guestIndex, 1);
            localStorage.setItem('weddingGuestList', JSON.stringify(guestList));
        }

        // Start evaluation for this person
        resetQuestionnaire();
        $('#guest-list').fadeOut(300, function() {
            $('#questionnaire').fadeIn(300);
            $('#person-input-section').fadeIn(300);
            $('#person-name').val(guestName);
            // Trigger the input event to show plus-one question
            $('#person-name').trigger('input');
        });
    });
});
