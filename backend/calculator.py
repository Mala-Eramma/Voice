import re

def calculate(expression):
    try:
        original_expression = expression.lower().strip()

        expression = original_expression

        expression = expression.replace("multiplied by", "*")
        expression = expression.replace("multiply", "*")
        expression = expression.replace("times", "*")
        expression = expression.replace("into", "*")
        expression = expression.replace(" x ", "*")
        expression = expression.replace(" x", "*")
        expression = expression.replace("x ", "*")
        expression = expression.replace("plus", "+")
        expression = expression.replace("minus", "-")
        expression = expression.replace("divided by", "/")
        expression = expression.replace("divide", "/")

        expression = re.sub(r"\s+", "", expression)

        if not re.fullmatch(r"[0-9+\-*/().]+", expression):
            return "Invalid calculation"

        answer = eval(
            expression,
            {"__builtins__": {}},
            {}
        )

        return answer

    except Exception:
        return "Invalid calculation"