// Duolingo Interactive Lesson Controller
$(document).ready(function() {

    // 1. Synchronize Current Session State
    let userHearts = parseInt(localStorage.getItem("userHearts") || "5");
    let sessionXP = 0;
    let sessionGems = 0;
    let errorsCount = 0;
    let progressPercent = 0;
    
    $("#heartsRemainingText").text(userHearts);

    // Audio chime engine using Web Audio API
    function playAudioFeedback(isCorrect) {
        try {
            let AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            let ctx = new AudioContext();
            let osc = ctx.createOscillator();
            let gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (isCorrect) {
                // Happy chord progression (C5 -> E5 -> G5)
                osc.type = "sine";
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.start();
                
                setTimeout(() => {
                    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
                }, 100);
                
                setTimeout(() => {
                    osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
                }, 200);
                
                setTimeout(() => {
                    osc.stop();
                    ctx.close();
                }, 400);
            } else {
                // Sad flat buzz
                osc.type = "sawtooth";
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                osc.frequency.setValueAtTime(160, ctx.currentTime); // Low frequency
                osc.start();
                
                setTimeout(() => {
                    osc.stop();
                    ctx.close();
                }, 450);
            }
        } catch(e) {
            console.log("Audio feedback error:", e);
        }
    }

    // Text to speech voice synthesis
    function textToSpeechSpanish(phrase) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop active voices
            let utterance = new SpeechSynthesisUtterance(phrase);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }

    // 2. Question Database
    const questions = [
        {
            type: "multiple-choice",
            title: "Select the correct translation of 'The boy'",
            options: [
                { text: "el niño", flag: "👦", correct: true },
                { text: "la niña", flag: "👧", correct: false },
                { text: "el pan", flag: "🍞", correct: false }
            ]
        },
        {
            type: "word-bank",
            title: "Translate the sentence: 'I drink water'",
            tokens: ["Yo", "bebo", "agua", "leche", "un", "niña"],
            correctAnswer: "Yo bebo agua"
        },
        {
            type: "listening",
            title: "Listen carefully and choose the correct English translation:",
            phrase: "Hola, mucho gusto",
            options: [
                { text: "Hello, nice to meet you", correct: true },
                { text: "Goodbye, thank you", correct: false },
                { text: "See you tomorrow", correct: false }
            ]
        },
        {
            type: "matching-pairs",
            title: "Tap matching word pairs:",
            pairs: {
                "bread": "pan",
                "milk": "leche",
                "cat": "gato",
                "water": "agua"
            }
        },
        {
            type: "conjugation",
            title: "Fill in the blank: 'Yo _____ un libro.'",
            options: [
                { text: "leo", correct: true },
                { text: "lees", correct: false },
                { text: "leen", correct: false }
            ]
        }
    ];

    let currentQuestionIndex = 0;
    let buttonState = "check"; // Modes: check | continue

    // Game Variables trackers
    let selectedOptionText = "";
    let selectedWordBankTokens = [];
    
    // Matching pairs temporary selections
    let activeMatchingLeft = null;
    let activeMatchingRight = null;
    let matchedPairsCount = 0;

    // Load first question
    renderQuestion(questions[currentQuestionIndex]);

    // 3. Question Renderers
    function renderQuestion(q) {
        $("#feedbackMsgBlock").hide();
        $("#feedbackPanel").removeClass("correct-state incorrect-state");
        $("#actionBtn").text("CHECK").removeClass("btn-duo-white").addClass("btn-duo-green").prop("disabled", true);
        buttonState = "check";
        
        let $workspace = $("#exerciseContainer");
        $workspace.html("");
        
        $workspace.append(`<h2 class="exercise-title">${q.title}</h2>`);

        if (q.type === "multiple-choice" || q.type === "conjugation") {
            let choiceContainer = $('<div class="choice-grid"></div>');
            
            q.options.forEach(opt => {
                let card = $(`
                    <div class="choice-card">
                        ${opt.flag ? `<span class="choice-card-flag">${opt.flag}</span>` : ''}
                        <span>${opt.text}</span>
                    </div>
                `);
                
                card.click(function() {
                    $(".choice-card").removeClass("selected");
                    $(this).addClass("selected");
                    selectedOptionText = opt.text;
                    $("#actionBtn").prop("disabled", false);
                });
                
                choiceContainer.append(card);
            });
            
            $workspace.append(choiceContainer);
        }
        else if (q.type === "word-bank") {
            selectedWordBankTokens = [];
            
            let slotBlock = $('<div class="word-slot-container" id="wordSlots"></div>');
            let bankBlock = $('<div class="word-bank-container" id="wordBank"></div>');
            
            q.tokens.forEach(tok => {
                let tokenBtn = $(`<button class="word-token">${tok}</button>`);
                tokenBtn.click(function() {
                    // Add word token to answer slot
                    let wordVal = $(this).text();
                    $(this).addClass("used");
                    
                    let activeToken = $(`<button class="word-token">${wordVal}</button>`);
                    activeToken.click(function() {
                        // Clicking word in slots moves it back
                        tokenBtn.removeClass("used");
                        $(this).remove();
                        
                        selectedWordBankTokens = selectedWordBankTokens.filter(w => w !== wordVal);
                        if (selectedWordBankTokens.length === 0) {
                            $("#actionBtn").prop("disabled", true);
                        }
                    });
                    
                    slotBlock.append(activeToken);
                    selectedWordBankTokens.push(wordVal);
                    $("#actionBtn").prop("disabled", false);
                });
                bankBlock.append(tokenBtn);
            });
            
            $workspace.append(slotBlock);
            $workspace.append(bankBlock);
        }
        else if (q.type === "listening") {
            let listenBtn = $('<button class="audio-drill-btn"><i class="bi bi-volume-up-fill"></i></button>');
            listenBtn.click(function() {
                textToSpeechSpanish(q.phrase);
            });
            
            $workspace.append(listenBtn);
            
            // Speak phrase automatically when question loads
            setTimeout(() => textToSpeechSpanish(q.phrase), 300);

            let choiceContainer = $('<div class="choice-grid mt-4"></div>');
            q.options.forEach(opt => {
                let card = $(`<div class="choice-card"><span>${opt.text}</span></div>`);
                card.click(function() {
                    $(".choice-card").removeClass("selected");
                    $(this).addClass("selected");
                    selectedOptionText = opt.text;
                    $("#actionBtn").prop("disabled", false);
                });
                choiceContainer.append(card);
            });
            
            $workspace.append(choiceContainer);
        }
        else if (q.type === "matching-pairs") {
            matchedPairsCount = 0;
            activeMatchingLeft = null;
            activeMatchingRight = null;
            
            let grid = $('<div class="matching-pairs-grid"></div>');
            
            // Shuffle left (English) and right (Spanish) lists separately
            let leftWords = Object.keys(q.pairs).sort(() => Math.random() - 0.5);
            let rightWords = Object.values(q.pairs).sort(() => Math.random() - 0.5);
            
            let elements = [];
            
            leftWords.forEach(w => {
                elements.push({ text: w, side: "left" });
            });
            rightWords.forEach(w => {
                elements.push({ text: w, side: "right" });
            });
            
            // Re-shuffle combined blocks
            elements.sort(() => Math.random() - 0.5);
            
            elements.forEach(el => {
                let card = $(`<div class="matching-card" data-word="${el.text}" data-side="${el.side}">${el.text}</div>`);
                card.click(function() {
                    if ($(this).hasClass("correct")) return;
                    
                    let word = $(this).data("word");
                    let side = $(this).data("side");
                    
                    if (side === "left") {
                        $(".matching-card[data-side='left']").removeClass("selected");
                        $(this).addClass("selected");
                        activeMatchingLeft = word;
                    } else {
                        $(".matching-card[data-side='right']").removeClass("selected");
                        $(this).addClass("selected");
                        activeMatchingRight = word;
                    }
                    
                    // Match Checker
                    if (activeMatchingLeft && activeMatchingRight) {
                        let expectedSpanish = q.pairs[activeMatchingLeft];
                        
                        if (expectedSpanish === activeMatchingRight) {
                            // Success match!
                            let leftEl = $(`.matching-card[data-side='left'][data-word='${activeMatchingLeft}']`);
                            let rightEl = $(`.matching-card[data-side='right'][data-word='${activeMatchingRight}']`);
                            
                            leftEl.removeClass("selected").addClass("correct");
                            rightEl.removeClass("selected").addClass("correct");
                            
                            matchedPairsCount++;
                            activeMatchingLeft = null;
                            activeMatchingRight = null;
                            
                            if (matchedPairsCount === Object.keys(q.pairs).length) {
                                $("#actionBtn").prop("disabled", false);
                            }
                        } else {
                            // Mismatched
                            let leftEl = $(`.matching-card[data-side='left'][data-word='${activeMatchingLeft}']`);
                            let rightEl = $(`.matching-card[data-side='right'][data-word='${activeMatchingRight}']`);
                            
                            leftEl.addClass("incorrect");
                            rightEl.addClass("incorrect");
                            
                            setTimeout(() => {
                                leftEl.removeClass("selected incorrect");
                                rightEl.removeClass("selected incorrect");
                            }, 500);
                            
                            activeMatchingLeft = null;
                            activeMatchingRight = null;
                        }
                    }
                });
                grid.append(card);
            });
            
            $workspace.append(grid);
        }
    }

    // 4. Click Actions
    $("#actionBtn").click(function() {
        if (buttonState === "check") {
            let activeQ = questions[currentQuestionIndex];
            let isCorrect = false;
            let correctMessage = "Correct!";
            let explanation = "";

            if (activeQ.type === "multiple-choice" || activeQ.type === "conjugation" || activeQ.type === "listening") {
                let correctOpt = activeQ.options.find(o => o.correct);
                isCorrect = (selectedOptionText === correctOpt.text);
                explanation = `Correct answer: <strong>${correctOpt.text}</strong>`;
            }
            else if (activeQ.type === "word-bank") {
                let answerText = selectedWordBankTokens.join(" ");
                isCorrect = (answerText === activeQ.correctAnswer);
                explanation = `Correct answer: <strong>${activeQ.correctAnswer}</strong>`;
            }
            else if (activeQ.type === "matching-pairs") {
                isCorrect = true; // Matching validation occurs inline
            }

            // Display slide-up panel based on validation results
            $("#feedbackMsgBlock").fadeIn(150);
            $("#actionBtn").text("CONTINUE");
            buttonState = "continue";
            
            if (isCorrect) {
                playAudioFeedback(true);
                $("#feedbackPanel").addClass("correct-state");
                $("#feedbackIconSymbol").attr("class", "bi bi-check-lg");
                $("#feedbackTitleText").text("Excellent!").css("color", "var(--color-green-dark)");
                $("#feedbackSubtitleText").html("Correct translation matched.");
            } else {
                playAudioFeedback(false);
                errorsCount++;
                $("#feedbackPanel").addClass("incorrect-state");
                $("#feedbackIconSymbol").attr("class", "bi bi-x-lg");
                $("#feedbackTitleText").text("Incorrect").css("color", "var(--color-red-dark)");
                $("#feedbackSubtitleText").html(explanation);
                
                // Lose life heart
                userHearts--;
                $("#heartsRemainingText").text(userHearts);
                localStorage.setItem("userHearts", userHearts);
                
                if (userHearts <= 0) {
                    setTimeout(() => {
                        showDuoModal({
                            title: "No Hearts Left!",
                            message: "You made too many errors and ran out of hearts. Get a heart refill from the shop or try practicing later!",
                            type: "error",
                            buttonText: "VISIT SHOP",
                            cancelText: "QUIT LESSON",
                            onConfirm: function() {
                                window.location.href = "shop.html";
                            },
                            onCancel: function() {
                                window.location.href = "learn.html";
                            }
                        });
                    }, 500);
                }
            }
        }
        else {
            // "CONTINUE" clicked -> advance
            currentQuestionIndex++;
            progressPercent = Math.round((currentQuestionIndex / questions.length) * 100);
            $("#lessonProgressBarFill").css("width", progressPercent + "%");
            
            if (currentQuestionIndex < questions.length && userHearts > 0) {
                renderQuestion(questions[currentQuestionIndex]);
            } else if (userHearts > 0) {
                // Lesson complete!
                let accuracy = Math.max(0, 100 - (errorsCount * 20));
                
                // Save records to LocalStorage
                let prevXP = parseInt(localStorage.getItem("userXP") || "0");
                let prevGems = parseInt(localStorage.getItem("userGems") || "100");
                let prevDailyXP = parseInt(localStorage.getItem("dailyXP") || "0");
                let prevStreak = parseInt(localStorage.getItem("userStreak") || "0");
                
                localStorage.setItem("userXP", prevXP + 20);
                localStorage.setItem("userGems", prevGems + 5);
                localStorage.setItem("dailyXP", prevDailyXP + 20);
                
                // If streak is 0, make it 1 on first lesson
                if (prevStreak === 0) {
                    localStorage.setItem("userStreak", "1");
                }
                
                // Render completion rewards splash
                $(".reward-val").eq(0).html(`<i class="bi bi-star-fill"></i> +20`);
                $(".reward-val").eq(1).html(`<i class="bi bi-gem"></i> +5`);
                $(".reward-val").eq(2).text(accuracy + "%");
                
                $("#completeSplash").fadeIn(300);
            }
        }
    });

    // Close session prompt
    $("#quitLessonBtn").click(function() {
        showDuoModal({
            title: "Are you sure?",
            message: "All progress from this practice lesson will be lost if you leave now.",
            type: "warning",
            buttonText: "QUIT",
            cancelText: "KEEP LEARNING",
            onConfirm: function() {
                window.location.href = "learn.html";
            }
        });
    });

    $("#completeSplashBtn").click(function() {
        window.location.href = "learn.html";
    });

});
