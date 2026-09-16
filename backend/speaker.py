import pyttsx3
import threading

lock = threading.Lock()


def speak(text):
    with lock:
        engine = pyttsx3.init()

        engine.setProperty("rate", 150)
        engine.setProperty("volume", 1.0)

        engine.say(str(text))
        engine.runAndWait()

        engine.stop()