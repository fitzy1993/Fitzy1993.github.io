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

    // Begin questions button
    $('#begin-questions').click(function() {
        const name = $('#person-name').val().trim();
        if (name === '') {
            alert('Please enter a name');
            return;
        }

        currentPerson = name;
        answers = {
            name: currentPerson,
            timestamp: new Date().toISOString()
        };
        currentQuestion = 1;

        // Update all person name placeholders
        $('.person-name-placeholder').text(currentPerson);
        $('#current-person-name').text(currentPerson);

        $('#person-input-section').fadeOut(300, function() {
            $('#questions-section').fadeIn(300);
            showQuestion(currentQuestion);
        });
    });

    // Answer button clicks
    $(document).on('click', '.answer-button', function() {
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

    function resetQuestionnaire() {
        $('#person-name').val('');
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

            guestList.forEach(function(person, index) {
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
                }

                listHTML += '<div class="guest-card">';
                listHTML += '<div class="guest-card-header">';
                listHTML += '<h3>' + person.name + '</h3>';
                listHTML += '<span class="badge ' + badgeClass + '">' + badgeText + '</span>';
                listHTML += '</div>';
                listHTML += '<div class="guest-card-actions">';
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
            guestList.splice(index, 1);
            localStorage.setItem('weddingGuestList', JSON.stringify(guestList));
            displayGuestList();
        }
    });
});
