// 1. 字句解析器 (Lexer)
function lexer(code) {
    const tokens = [];
    const regex = /\s*(=>|{|}|var|:|int|float|[-+/*=]|\w+|\d+\.\d+|\d+|\S)\s*/g;
    let match;

    while ((match = regex.exec(code)) !== null) {
        tokens.push(match[1]);
    }

    return tokens;
}

// 2. 構文解析器 (Parser)
function parser(tokens) {
    let current = 0;
    function walk() {
        if (current >= tokens.length) {
            return null;
        }

        function parseExpression() {
            let token = tokens[current];

            // NumberLiteral
            if (token.match(/^\d+$/)) {
                current++;
                return {
                    type: 'NumberLiteral',
                    value: parseInt(token),
                };
            }

            // FloatLiteral
            if (token.match(/^\d+\.\d+$/)) {
                current++;
                return {
                    type: 'FloatLiteral',
                    value: parseFloat(token),
                };
            }

            // VariableDeclaration
            if (token === 'var') {
                current++;
                const name = tokens[current++].trim();
                if (tokens[current] !== ':') {
                    throw new SyntaxError(`Expected ':' but got '${tokens[current]}'`);
                }
                current++; // Consume the colon
                const typeName = tokens[current++];
                return {
                    type: 'VariableDeclaration',
                    name,
                    dataType: typeName,
                };
            }

            // Variable
            if (token.match(/^[a-zA-Z]\w*$/)) {
                current++;
                const variableNode = {
                    type: 'Variable',
                    name: token.trim(),
                };

                // Check if the current token is an operator
                if (tokens[current] && /^[-+/*=]$/.test(tokens[current])) {
                    return parseBinaryExpression(variableNode);
                }

                return variableNode;
            }

            // Semicolon
            if (token === ';') {
                current++;
                return null;
            }

            throw new SyntaxError(`Unexpected token '${token}'`);
        }

        function parseBinaryExpression(left) {
            const node = {
                type: 'BinaryExpression',
                left,
                operator: tokens[current].trim(),
                right: null,
            };

            current++; // Consume the operator

            // Parse the right-hand side of the binary expression
            node.right = parseExpression();

            // Consume the semicolon
            if (tokens[current] === ';') {
                current++;
            }

            return node;
        }

        return parseExpression();
    }



    const ast = {
        type: 'Program',
        body: [],
    };

    while (current < tokens.length) {
        const node = walk();
        if (node) {
            ast.body.push(node);
        }
    }

    return ast;
}

function interpreter(ast) {
    const env = {}; // 初期環境の作成
    evaluate(ast, env);
    return env; // 環境オブジェクトを返す
  }
  
  
  function evaluate(node, env) {
    console.log('Current node:', JSON.stringify(node, null, 2));
    console.log('Current environment:', JSON.stringify(env, null, 2));
  
    switch (node.type) {
      case 'Program':
        return node.body.map((childNode) => evaluate(childNode, env));
  
      case 'VariableDeclaration':
        env[node.name] = 0;
        return env;
  
      case 'BinaryExpression':
        const left = env[node.left.name] || evaluate(node.left, env);
        const right = env[node.right.name] || evaluate(node.right, env);
        const operator = node.operator;
  
        switch (operator) {
          case '=':
            env[node.left.name] = right;
            return env;
  
          case '+':
            return left + right;
  
          case '-':
            return left - right;
  
          case '*':
            return left * right;
  
          case '/':
            return left / right;
  
          default:
            throw new Error(`Unknown operator: ${operator}`);
        }
  
      case 'NumberLiteral':
        return node.value;
  
      case 'Variable':
        return env[node.name];
  
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
  



// サンプルコード
const code = `
var a: int;
var b: int;
var sum: int;
var difference: int;
var product: int;
var quotient: float;

a = 10;
b = 5;

sum = a + b;
difference = a - b;
product = a * b;
quotient = a / b;
`;

// 実行
const tokens = lexer(code);
console.log("Tokens:", tokens);

const ast = parser(tokens);
console.log("AST:", JSON.stringify(ast, null, 2));

const env = interpreter(ast); // 環境オブジェクトを取得
const result = { // 結果を抽出
  sum: env.sum,
  difference: env.difference,
  product: env.product,
  quotient: env.quotient,
};
console.log("Result:", result); // 結果を表示


