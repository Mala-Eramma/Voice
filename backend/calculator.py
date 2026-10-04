
import ast
import operator
import math

OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def calculate(expression):
    try:
        text = expression.lower().strip()

        replacements = [
            ("multiplied by", "*"),
            ("divided by", "/"),
            ("multiply", "*"),
            ("times", "*"),
            ("into", "*"),
            ("plus", "+"),
            ("minus", "-"),
            ("divide", "/"),
        ]

        for word, symbol in replacements:
            text = text.replace(word, symbol)

        # Convert x into multiplication
        import re
        text = re.sub(r"\s*x\s*", "*", text)
        text = re.sub(r"\s+", "", text)

        # Accept only basic arithmetic expressions
        if not text or not re.fullmatch(r"[0-9+\-*/%.()]+", text):
            return "Invalid calculation"

        tree = ast.parse(text, mode="eval")

        def evaluate(node):
            if isinstance(node, ast.Expression):
                return evaluate(node.body)

            if isinstance(node, ast.Constant) and type(node.value) in (int, float):
                return node.value

            if isinstance(node, ast.BinOp) and type(node.op) in OPERATORS:
                left = evaluate(node.left)
                right = evaluate(node.right)
                result = OPERATORS[type(node.op)](left, right)

                if not math.isfinite(result):
                    raise ValueError("Invalid result")

                return result

            if isinstance(node, ast.UnaryOp) and type(node.op) in OPERATORS:
                return OPERATORS[type(node.op)](evaluate(node.operand))

            raise ValueError("Invalid expression")

        return evaluate(tree)

    except Exception:
        return "Invalid calculation"