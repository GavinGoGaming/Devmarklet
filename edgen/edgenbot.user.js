// ==UserScript==
// @name         EDGEN
// @namespace    edgenbot
// @description  Auto watch & fill via Edgenuity platform.
// @author       GavinGoGaming
// @version      1.5
// @match        https://r15.core.learn.edgenuity.com/ContentViewers/FrameChain/Activity*
// @match        https://r15.core.learn.edgenuity.com/ContentViewers/AssesmentViewer/*
// @match        https://r15.core.learn.edgenuity.com/player/LTILaunch/
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
    // MIXTRAL KEY IS OPTIONAL BUT RECOMMENDED
    const MIXTRAL_KEY = "";


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
    function arrangeCategories(container, data, trueFill) {
        if (!trueFill) {
            const lines = [];

            for (const [category, items] of Object.entries(data)) {
                lines.push(`${category}:`);
                for (const item of items) {
                    lines.push(`  • ${item}`);
                }
                lines.push("");
            }

            console.log(lines.join("\n"));
            return;
        }
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
    function fillPractice(container, id, trueFill) {
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

            if (!trueFill) {
                const answers = ids.map(value => {
                    let input = container.querySelector(
                        `input.answer-choice-button[value="${CSS.escape(value)}"]`
                    );

                    if (!input) {
                        const label = [...container.querySelectorAll("label.answer-choice-label")]
                        .find(label => label.htmlFor.split("_").pop() === value);

                        input = label
                            ? container.querySelector(`#${CSS.escape(label.htmlFor)}`)
                        : null;
                    }

                    if (!input) return value;

                    const label = container.querySelector(
                        `label[for="${CSS.escape(input.id)}"]`
                    );

                    return label?.textContent.trim() ?? value;
                });

                console.log(
                    `Correct answer${answers.length > 1 ? "s" : ""}:\n\n• ${answers.join("\n• ")}`
                );
                return;
            }
            if (!input || input.checked) continue;

            const choice = input.closest(".answer-choice");
            console.log(choice);
            (choice || input).click();
            input.checked = true;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }
    function getPractice(containers, qfrDoc) {
        const primary = [...containers].map(container => {
            const result = [];

            const parts = [...container.children].filter(
                el => el.classList.contains("Practice_Question_Body")
            );
            const sections = parts.length ? parts : [container];

            let currentChoices = null;

            for (const section of sections) {
                // All immediate paragraphs
                const paragraphs = [...section.querySelectorAll(":scope > p")];
                if (paragraphs.length) {
                    if (currentChoices) {
                        result.push(currentChoices);
                        currentChoices = null;
                    }

                    for (const p of paragraphs) {
                        result.push({
                            text: p.textContent.trim()
                        });
                    }
                }

                // All immediate answer choices
                const choices = [...section.querySelectorAll(":scope > .answer-choice")];
                if (choices.length) {
                    if (!currentChoices)
                        currentChoices = [];

                    for (const choice of choices) {
                        const input = choice.querySelector("input.answer-choice-button");
                        const label = choice.querySelector("label.answer-choice-label");

                        currentChoices.push({
                            id: (input?.type === "checkbox" ? false : input?.value)
                            || label.htmlFor.split("_").pop(),
                            text: label?.textContent.trim() ?? ""
                        });
                    }
                }
            }

            if (currentChoices)
                result.push(currentChoices);

            return result;
        });

        const secondary = [...qfrDoc.querySelectorAll('.ui-tabs-panel')].map(el => {
            return [...([...el.querySelectorAll('p')].map(p => p.textContent)), ...([...el.querySelectorAll('img')].map(p => p.alt))];
        });

        return [...primary, ...secondary];
    }
    const GEMINI_MODEL = "gemini-2.5-flash";
    const MIXTRAL_MODEL = "mistral-small-2506";

    async function askGemini(messages) {
        const contents = messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        let res = await fetch(
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

        // Fallback to Mixtral
        if (!res.ok) {
            console.warn("Gemini failed, swapping to Mixtral...");

            res = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${MIXTRAL_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: MIXTRAL_MODEL,
                    temperature: 0,
                    messages
                })
            });

            if (!res.ok) {
                console.warn("Mixtral also failed.");
                return [];
            }

            const json = await res.json();
            const text = json.choices?.[0]?.message?.content ?? "";

            console.log(text);

            try {
                return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
            } catch {
                return null;
            }
        }

        // Gemini succeeded
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

    async function notifyQuestion(fill) {
        console.log("Question notify");
        var qfrDoc = document.getElementById('iFramePreview')?.contentDocument;
        if(location.pathname.includes("AssessmentViewer")) qfrDoc = document;
        if(!qfrDoc) return console.error("No question doc");

        let type, element;
        if(qfrDoc.querySelector('#matchingActivity')) { type = 'matching'; element = qfrDoc.querySelector('#matchingActivity'); }
        if(qfrDoc.querySelector('.sorter')) { type = 'timeline'; element = qfrDoc.querySelector('.sorter'); }
        if(qfrDoc.querySelector('.sbgColumn')) { type = 'columnmatch'; element = qfrDoc.querySelector('.containerDiv'); }
        if(qfrDoc.querySelector('.Practice_Question_Body')) { type = 'practice';
                                                            element = qfrDoc.querySelector('.Practice_Question_Body').parentElement;
                                                             if(location.pathname.includes("AssessmentViewer")) {
                                                                 element = [...document.querySelectorAll('.Assessment_Main_Body_Content_Question')].filter(b=>b.id&&b.style.display!=='none')[0].querySelector('.Question_Contents>div')
                                                             }
        }
        console.log('Question type: ' + type);
        if(!type) return console.error("Undefined question type");

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
                if(!colmatchAnswers || colmatchAnswers==[]) break;
                solved = true;
                arrangeCategories(element, colmatchAnswers, fill);
                break;
            case 'matching':
                console.log("Matching assignment DIY");
                clickDone();
                solved = true;
                break;
            case 'practice':
                console.log(element);
                var questions = getPractice(element.children, qfrDoc);
                console.log(questions);
                if(!questions) break;
                var pracAnswers = await generatePractice(questions);
                console.log(pracAnswers);
                if(!pracAnswers || pracAnswers==[]) break;
                var answerContainer = element.querySelector('.Practice_Question_Body:has(.answer-choice)');
                solved = true;
                fillPractice(answerContainer, pracAnswers, fill);
                break;
            default:
                console.log('Unsupported question type');
        }

        if(solved) {
            clickDone(500);
            questionNotified = true;
            setTimeout(clickNext, 900);
        }
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
        if(location.pathname.includes("AssessmentViewer")) {
            console.log("Trying (assesment)");
            notifyQuestion(false);
            return;
        }
        console.log("Trying...");
        if(isActivityCompleted()) {
            console.log("Activity complete");
            clickNextActivity();
        }
        if (isQuestionSlideActive()) {
            triggered = false;
            if (!questionNotified) {
                notifyQuestion(true);
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
