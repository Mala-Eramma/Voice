const voiceButton = document.getElementById("voiceButton");
const expressionText = document.getElementById("expression");
const answerText = document.getElementById("answer");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


function speakAnswer(answer) {

    if (!window.speechSynthesis) {
        alert("Your browser does not support voice output.");
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


voiceButton.addEventListener("click", () => {

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


    recognition.onresult = async (event) => {

        const text = event.results[0][0].transcript;

        expressionText.innerText = text;

        try {

            const response = await fetch(
                `/calculate?expression=${encodeURIComponent(text)}`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            answerText.innerText = data.answer;

            setTimeout(() => {
                speakAnswer(data.answer);
            }, 300);

        } catch (error) {

            console.error(error);

            answerText.innerText = "Error";

            speakAnswer("Sorry, I could not calculate that.");
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