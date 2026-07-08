// ==UserScript==
// @name         EDGEN
// @namespace    edgenbot
// @description  Auto watch & fill via Edgenuity platform.
// @author       GavinGoGaming
// @version      1.1
// @match        https://r15.core.learn.edgenuity.com/ContentViewers/FrameChain/Activity*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    // HEY USER
    // YOU NEED ONE OF THESE
    // GOOGLE AI STUDIO -> DASHBOARD -> API KEYS
    // (https://aistudio.google.com/api-keys)
    // MAKE ONE AND PUT THE API KEY HERE
    const GEMINI_API_KEY = "";


  
    const THRESHOLD = 5;
    let triggered = false;
    let questionNotified = false;

    /* solvers */
    function rearrangeSort(sorter) {
        [...sorter.children]
            .sort((a, b) => {
            const aNum = parseInt(a.id.replace("sItem", ""), 10);
            const bNum = parseInt(b.id.replace("sItem", ""), 10);
            return aNum - bNum;
        })
            .forEach(child => sorter.appendChild(child));
    }
    function arrangeCategories(container, data) {
        // Map category name -> drop container
        const dropMap = {};
        container.querySelectorAll(".catColumn").forEach(col => {
            const label = col.querySelector(".catLabel")?.textContent.trim();
            const drop = col.querySelector(".dropContainer");
            if (label && drop) {
                dropMap[label] = drop;
            }
        });

        // Map tile text -> tile element (case-insensitive)
        const tileMap = {};
        container.querySelectorAll(".leftColumn .sbgTile").forEach(tile => {
            tileMap[tile.textContent.trim().toLowerCase()] = tile;
        });

        // Also include tiles that may already be in categories
        container.querySelectorAll(".dropContainer .sbgTile").forEach(tile => {
            tileMap[tile.textContent.trim().toLowerCase()] = tile;
        });

        // Move tiles
        for (const [category, items] of Object.entries(data)) {
            const drop = dropMap[category];
            if (!drop) continue;

            for (const item of items) {
                const tile = tileMap[item.toLowerCase()];
                tile.classList.add('dropped');
                if (tile) {
                    drop.appendChild(tile);
                }
            }
        }
    }
    function getCategoryArranges(container) {
        const result = {};

        container.querySelectorAll(".catColumn").forEach(col => {
            const category = col.querySelector(".catLabel")?.textContent.trim();
            const drop = col.querySelector(".dropContainer");

            if (!category || !drop) return;

            result[category] = [];

            // Tiles already in this category
            drop.querySelectorAll(".sbgTile").forEach(tile => {
                result[category].push(tile.textContent.trim());
            });
        });

        // If nothing has been sorted yet, include the unsorted tiles as an array
        const remaining = [
            ...container.querySelectorAll(".leftColumn .sbgTile")
        ].map(tile => tile.textContent.trim());

        if (remaining.length) {
            result._unsorted = remaining;
        }

        return result;
    }

    // Practices
    function fillPractice(container, id) {
        const ids = Array.isArray(id) ? id.map(String) : [String(id)];

        for (const value of ids) {
            // Radios use the value attribute
            let input = container.querySelector(
                `input.answer-choice-button[value="${CSS.escape(value)}"]`
            );


            // Checkboxes use the label's htmlFor suffix
            if (!input) {
                const label = [...container.querySelectorAll("label.answer-choice-label")]
                .find(label => label.htmlFor.split("_").pop() === value);

                input = label
                    ? container.querySelector(`#${CSS.escape(label.htmlFor)}`)
                : null;
            }
            console.log(input);

            if (!input || input.checked) continue;

            const choice = input.closest(".answer-choice");
            console.log(choice);
            (choice || input).click();
            input.checked = true;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }
    function getPractice(containers) {
        return [...containers].map(container => {
            const result = [];

            // If there are nested Practice_Question_Body elements, use those.
            // Otherwise use the container itself.
            const parts = [...container.children].filter(
                el => el.classList.contains("Practice_Question_Body")
            );
            const sections = parts.length ? parts : [container];

            let currentChoices = null;

            for (const section of sections) {
                // Text
                const p = section.querySelector(":scope > p");
                if (p) {
                    if (currentChoices) {
                        result.push(currentChoices);
                        currentChoices = null;
                    }

                    result.push({
                        text: p.textContent.trim()
                    });
                    continue;
                }

                // Choice
                const choice = section.querySelector(":scope > .answer-choice");
                if (choice) {
                    if (!currentChoices)
                        currentChoices = [];

                    const input = choice.querySelector("input.answer-choice-button");
                    const label = choice.querySelector("label.answer-choice-label");

                    currentChoices.push({
                        id: (input?.type==='checkbox'?false:input?.value) || label.htmlFor.split('_').pop(),
                        text: label?.textContent.trim() ?? ""
                    });
                    continue;
                }

                // Ignore empty sections
            }

            if (currentChoices)
                result.push(currentChoices);

            return result;
        });
    }
    
    const GEMINI_MODEL = "gemini-2.5-flash";

    async function askGemini(messages) {
        // Convert OpenAI-style messages to Gemini format
        const contents = messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: 0
                    }
                })
            }
        );

        if (!res.ok)
            throw new Error(await res.text());

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        console.log(text);

        try {
            return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
        } catch {
            return null;
        }
    }

    async function generatePractice(data) {
        return askGemini([
            {
                role: "system",
                content: "Using the IDs, reply the correct answer's id as a single number or multiple answers as an array of numbers. Do not include any other content in your reply."
            },
            {
                role: "user",
                content: `Using the below object, return the correct answer id as a single number or multiple answers as an array of numbers. Do not include any other content in your reply.\n\n${JSON.stringify(data, null, 2)}`
            }
        ]);
    }

    async function getColmatchAnswers(data) {
        return askGemini([
            {
                role: "system",
                content: "You are classifying items into categories. Reply with ONLY a valid JSON object. Use exactly the category names provided in the input. Every item must appear in exactly one category. Do not create, rename, or omit categories. Do not add extra keys such as '_unsorted', 'other', or notes."
            },
            {
                role: "user",
                content: `Classify each item into one of the provided categories. Return only a JSON object.\n\n${JSON.stringify(data, null, 2)}`
            }
        ]);
    }

    function clickDone(timeout) {
        if(timeout) {
            setTimeout(() => {
                const nextBtn = document.querySelector('#btnCheck');
                if (nextBtn) nextBtn.click();
            }, timeout);
        } else {
            const nextBtn = document.querySelector('#btnCheck');
            if (nextBtn) nextBtn.click();
        }
    }

    function clickNext() {
            const nextBtn = document.querySelector('li.FrameRight[onclick*="nextFrame"]');
            if (nextBtn) nextBtn.click();
    }
    function clickNextActivity() {
        const nextBtn = window.parent.document.querySelector('.goRight');
        if(nextBtn) nextBtn.click();
    }

    async function notifyQuestion() {
        console.log("Question notify");
        const qfrDoc = document.getElementById('iFramePreview')?.contentDocument;
        if(!qfrDoc) return console.error("No question doc");

        let type, element;
        if(qfrDoc.querySelector('#matchingActivity')) { type = 'matching'; element = qfrDoc.querySelector('#matchingActivity'); }
        if(qfrDoc.querySelector('.sorter')) { type = 'timeline'; element = qfrDoc.querySelector('.sorter'); }
        if(qfrDoc.querySelector('.sbgColumn')) { type = 'columnmatch'; element = qfrDoc.querySelector('.containerDiv'); }
        if(qfrDoc.querySelector('.Practice_Question_Body')) { type = 'practice'; element = qfrDoc.querySelector('.Practice_Question_Body').parentElement; }
        console.log('Question type: ' + type);
        if(!type) return console.error("Undefined question type");
        questionNotified = true;

        // broken solvers dont set this
        let solved = false;

        switch(type) {
            case 'timeline':
                rearrangeSort(element);
                solved = true;
                break;
            case 'columnmatch':
                // get answers:
                var colmatchQuestions = getCategoryArranges(element);
                console.log(colmatchQuestions);
                if(!colmatchQuestions) break;
                var colmatchAnswers = await getColmatchAnswers(colmatchQuestions);
                console.log(colmatchAnswers);
                if(!colmatchAnswers) break;
                arrangeCategories(element, colmatchAnswers);
                break;
            case 'matching':
                console.log("Matching assignment DIY");
                break;
            case 'practice':
                console.log(element);
                var questions = getPractice(element.children);
                console.log(questions);
                if(!questions) break;
                var pracAnswers = await generatePractice(questions);
                console.log(pracAnswers);
                if(!pracAnswers) break;
                var answerContainer = element.querySelector('.Practice_Question_Body:has(.answer-choice)');
                fillPractice(answerContainer, pracAnswers);
                break;
            default:
                console.log('Unsupported question type');
        }

        if(solved) clickDone(500);
    }

    function isQuestionSlideActive() {
        const preview = document.getElementById('iFramePreview');
        if (!preview) return false;
        const style = window.getComputedStyle(preview);
        return style.display !== 'none';
    }
    function isActivityCompleted() {
        try {
            const gradeEl = window.parent.document.querySelector('.gradebar-wrap');
            if (!gradeEl) return false;
            return gradeEl.style.display !== 'none';
        } catch (e) {
            console.warn('isActivityCompleted failed:', e);
            return false;
        }
    }

    function tryAdvance() {
        console.log("Trying...");
        if(isActivityCompleted()) {
            console.log("Activity complete");
            clickNextActivity();
        }
        if (isQuestionSlideActive()) {
            triggered = false;
            if (!questionNotified) {
                notifyQuestion();
            }
            return;
        }
        questionNotified = false;

        const video = document.getElementById('home_video_js');
        if (!video) return clickNext();
        if (isNaN(video.duration) || video.duration === 0) return;
        const remaining = video.duration - video.currentTime;
        if (remaining <= THRESHOLD && !triggered) {
            triggered = true;
            console.log("Next");
            clickNext();
        }
        if (video.currentTime < 1) {
            console.log("Reset trigger due to current time");
            triggered = false;
        }
    }
    setInterval(tryAdvance, 500);
})();
