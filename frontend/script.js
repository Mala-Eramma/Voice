
const voiceButton = document.getElementById("voiceButton");
const expressionText = document.getElementById("expression");
const answerText = document.getElementById("answer");

function speakAnswer(answer) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        "The answer is " + answer
    );

    speech.lang = "en-US";
    speech.rate = 0.8;
    window.speechSynthesis.speak(speech);
}

function convertExpression(expression) {
    let text = expression.toLowerCase().trim();

    const words = {
        zero: "0", one: "1", two: "2", three: "3",
        four: "4", five: "5", six: "6", seven: "7",
        eight: "8", nine: "9", ten: "10",
        eleven: "11", twelve: "12", thirteen: "13",
        fourteen: "14", fifteen: "15", sixteen: "16",
        seventeen: "17", eighteen: "18", nineteen: "19",
        twenty: "20", thirty: "30", forty: "40",
        fifty: "50", sixty: "60", seventy: "70",
        eighty: "80", ninety: "90", hundred: "100"
    };

    for (const word in words) {
        text = text.replace(
            new RegExp("\\b" + word + "\\b", "g"),
            words[word]
        );
    }

    text = text.replace(/multiplied by/g, "*");
    text = text.replace(/divided by/g, "/");
    text = text.replace(/multiply/g, "*");
    text = text.replace(/divide/g, "/");
    text = text.replace(/plus/g, "+");
    text = text.replace(/minus/g, "-");
    text = text.replace(/times/g, "*");
    text = text.replace(/into/g, "*");
    text = text.replace(/\s*x\s*/g, "*");
    text = text.replace(/\s+/g, "");

    if (!text || !/^[0-9+\-*/%.()]+$/.test(text)) {
        throw new Error("Invalid expression");
    }

    return text;
}

function calculateExpression(expression) {
    const converted = convertExpression(expression);

    const answer = Function(
        '"use strict"; return (' + converted + ')'
    )();

    if (typeof answer !== "number" || !Number.isFinite(answer)) {
        throw new Error("Invalid calculation");
    }

    return answer;
}

function saveHistory(expression, answer) {
    const history = JSON.parse(
        localStorage.getItem("voiceHistory") || "[]"
    );

    history.unshift({
        expression: expression,
        answer: answer,
        created_at: new Date().toLocaleString()
    });

    localStorage.setItem("voiceHistory", JSON.stringify(history));
}

if (voiceButton) {
    voiceButton.addEventListener("click", () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            answerText.textContent =
                "Voice input is not supported in this browser.";
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        voiceButton.textContent = "Listening...";
        voiceButton.disabled = true;

        recognition.onresult = (event) => {
            const spokenText = event.results[0][0].transcript;

            expressionText.textContent = spokenText;
            answerText.textContent = "Calculating...";

            try {
                const answer = calculateExpression(spokenText);

                answerText.textContent = answer;
                saveHistory(spokenText, answer);
                speakAnswer(answer);
            } catch (error) {
                console.error("Calculation error:", error);
                answerText.textContent = "Error: " + error.message;
            }
        };

        recognition.onerror = (event) => {
            answerText.textContent =
                "Voice recognition error: " + event.error;
        };

        recognition.onend = () => {
            voiceButton.textContent = "Ask";
            voiceButton.disabled = false;
        };

        try {
            recognition.start();
        } catch (error) {
            answerText.textContent = "Error: " + error.message;
            voiceButton.textContent = "Ask";
            voiceButton.disabled = false;
        }
    });
}