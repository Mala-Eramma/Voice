const voiceButton = document.getElementById("voiceButton");
const expressionText = document.getElementById("expression");
const answerText = document.getElementById("answer");


function speakAnswer(answer) {

    if (!window.speechSynthesis) {
        return;
    }

    window.speechSynthesis.cancel();

    const message = new SpeechSynthesisUtterance(
        "The answer is " + answer
    );

    message.lang = "en-US";
    message.volume = 1;
    message.rate = 0.8;
    message.pitch = 1;

    window.speechSynthesis.speak(message);
}

function calculateExpression(expression) {

    let text = expression.toLowerCase().trim();

    // Convert spoken numbers to digits
    const numbers = {
        "zero": "0",
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",
        "ten": "10",
        "eleven": "11",
        "twelve": "12",
        "thirteen": "13",
        "fourteen": "14",
        "fifteen": "15",
        "sixteen": "16",
        "seventeen": "17",
        "eighteen": "18",
        "nineteen": "19",
        "twenty": "20",
        "thirty": "30",
        "forty": "40",
        "fifty": "50",
        "sixty": "60",
        "seventy": "70",
        "eighty": "80",
        "ninety": "90",
        "hundred": "100"
    };

    for (const word in numbers) {
        text = text.replace(
            new RegExp("\\b" + word + "\\b", "g"),
            numbers[word]
        );
    }

    // Convert spoken operators
    text = text.replace(/multiplied by/g, "*");
    text = text.replace(/divided by/g, "/");
    text = text.replace(/plus/g, "+");
    text = text.replace(/minus/g, "-");
    text = text.replace(/times/g, "*");
    text = text.replace(/into/g, "*");

    // Remove unwanted characters
    text = text.replace(/[^0-9+\-*/%.() ]/g, "");

    text = text.trim();

    if (text === "") {
        throw new Error("Invalid expression");
    }

    if (!/^[0-9+\-*/%.() ]+$/.test(text)) {
        throw new Error("Invalid expression");
    }

    const answer = Function(
        '"use strict"; return (' + text + ')'
    )();

    if (!Number.isFinite(answer)) {
        throw new Error("Invalid calculation");
    }

    return answer;
}



function saveHistory(expression, answer) {

    let history = JSON.parse(
        localStorage.getItem("calculatorHistory") || "[]"
    );

    history.unshift({
        expression: expression,
        answer: answer,
        created_at: new Date().toLocaleString()
    });

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );
}


voiceButton.addEventListener("click", () => {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert("Voice input is not supported in this browser.");

        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceButton.innerText = "Listening...";

    recognition.start();


    recognition.onresult = (event) => {

        const text = event.results[0][0].transcript;

        expressionText.innerText = text;

        try {

            const answer = calculateExpression(text);

            answerText.innerText = answer;

            saveHistory(text, answer);

            setTimeout(() => {
                speakAnswer(answer);
            }, 300);

        } catch (error) {

            console.error(error);

            answerText.innerText = "Error";

            speakAnswer(
                "Sorry, I could not calculate that."
            );
        }
    };


    recognition.onerror = (event) => {

        console.error(event.error);

        voiceButton.innerText = "Ask";

        alert("Could not understand your voice.");
    };


    recognition.onend = () => {

        voiceButton.innerText = "Ask";
    };

});