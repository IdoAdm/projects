import java.io.IOException;
import java.io.File;
import java.io.FileWriter;

public class CompilationEngine {

    private FileWriter fileWriter; //outputWriter
    private JackTokenizer jackTokenizer;

    public CompilationEngine(File sourceFile, File outputFile) {
        // Creates a new compilation engine with the given input and output.
        try {
            fileWriter = new FileWriter(outputFile);

            jackTokenizer = new JackTokenizer(sourceFile);

            //jackTokenizer.printtokenizer();
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileClass() {
        // Compiles a complete class.
        try {
            // the format in the beginning

            fileWriter.write("<class>\n");
            fileWriter.write("<keyword> class </keyword>\n");
            jackTokenizer.advance();
            fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
            jackTokenizer.advance();
            fileWriter.write("<symbol> { </symbol>\n");
            jackTokenizer.advance();
            compileClassVarDec();
            compileSubroutine();
            // the format at the end of the class
            fileWriter.write("<symbol> } </symbol>\n");



            fileWriter.write("</class>\n");
            fileWriter.close(); // close the file after writing
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileClassVarDec() {
        // Compiles a static variable declaration or a field declaration.
        try {
            // Loop while the token is "static" or "field"
            while (jackTokenizer.tokenType().equals("KEYWORD") &&
                    (jackTokenizer.keyWord().equals("static") || jackTokenizer.keyWord().equals("field"))) {
                fileWriter.write("<classVarDec>\n");
                fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
                jackTokenizer.advance();

                // Handle the type - keyword or identifier - (int, boolean, or class name)
                if (jackTokenizer.tokenType().equals("KEYWORD")) {
                    fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
                } else { // When the type is the class name, e.g., static Square square
                    fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                }
                jackTokenizer.advance();

                // Write the variable name
                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                jackTokenizer.advance();

                // Handle multiple variable declarations, e.g., field int x, y, z;
                while (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(",")) {
                    fileWriter.write("<symbol> , </symbol>\n");
                    jackTokenizer.advance();
                    fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                    jackTokenizer.advance();
                }

                // Write semicolon
                fileWriter.write("<symbol> ; </symbol>\n");
                jackTokenizer.advance();
                //field int x;
                //static int y;
                // End of classVarDec
                fileWriter.write("</classVarDec>\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void compileSubroutine() {
        try {
            // Check if we reached the end of the class body
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("}")) {
                return;
            }

            // Start <subroutineDec>
            fileWriter.write("<subroutineDec>\n");

            // Write the subroutine type (constructor, function, or method)
            fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
            jackTokenizer.advance(); // this was noted out, a mistkae?

            // Write the return type (int, boolean, void, or class name)
            if (jackTokenizer.tokenType().equals("KEYWORD")) {
                fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
            } else if (jackTokenizer.tokenType().equals("IDENTIFIER")) {
                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
            }
            jackTokenizer.advance();

            // Write the subroutine name
            fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
            jackTokenizer.advance();

            // Handle parameter list
            fileWriter.write("<symbol> ( </symbol>\n");
            jackTokenizer.advance();
            compileParameterList();
            fileWriter.write("<symbol> ) </symbol>\n");
            jackTokenizer.advance();

            // Start <subroutineBody>
            compileSubroutineBody();

            // End <subroutineDec>
            fileWriter.write("</subroutineDec>\n");

            // Recursively handle additional subroutines
            compileSubroutine();

        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }


    public void compileParameterList() {
        // Compiles a (possibly empty) parameter list.
        // Does not handle the enclosing parentheses tokens '(' and ')'.
        // (int x, boolean y) -> (keyword identifier, ......)
        //(square x) ->(identifier identifeir, ....)
        try {
            fileWriter.write("<parameterList>\n");
            if (jackTokenizer.tokenType().equals("KEYWORD")) { //of the form (int x)
                fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
                jackTokenizer.advance();

                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                jackTokenizer.advance();
            }
            else if(jackTokenizer.tokenType().equals("IDENTIFIER")){//the form is (class x,...)
                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                jackTokenizer.advance();

                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                jackTokenizer.advance();
            }
            while (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(",")) {
                // after handling the first parameter, continue as long as they are seperated by ","
                fileWriter.write("<symbol> , </symbol>\n");
                jackTokenizer.advance();
                if (jackTokenizer.tokenType().equals("KEYWORD")) { //of the form (int x)
                    fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
                    jackTokenizer.advance();
                    fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                    jackTokenizer.advance();
                }
                else if(jackTokenizer.tokenType().equals("IDENTIFIER")){//the form is (class x,...)
                    fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                    jackTokenizer.advance();

                    fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                    jackTokenizer.advance();
                }

            }
            fileWriter.write("</parameterList>\n");
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileSubroutineBody() {
        // check: with <> and </>
        // Compiles a subroutine's body.
        try {
            fileWriter.write("<subroutineBody>\n");
            fileWriter.write("<symbol> { </symbol>\n");
            jackTokenizer.advance();
            while (jackTokenizer.tokenType().equals("KEYWORD")
                    && jackTokenizer.keyWord().equals("var")) {
                fileWriter.write("<varDec>\n");
                compileVarDec();
                fileWriter.write("</varDec>\n");
            }
            //method boo(int x){
            // var int x;
            //var boolean y;
            //} let, do, if etc.
            //<subroutineBody>
            //var int x;
            //let x =6;
            fileWriter.write("<statements>\n");
            compileStatements();
            fileWriter.write("</statements>\n");
            fileWriter.write("<symbol> } </symbol>\n");
            jackTokenizer.advance();
            fileWriter.write("</subroutineBody>\n");
            //method do (){
            //do somthing
            //}.

        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }
    //
    public void compileVarDec() {
        // Compiles a variable declaration.
        // 2 options: var int/Classidentifer x ,could have more, cannot have an assigmnent
        try {

            if (jackTokenizer.keyWord().equals("var") && (jackTokenizer.tokenType().equals("KEYWORD"))) {
                fileWriter.write("<keyword> var </keyword>\n");
                jackTokenizer.advance();
            }
            if (jackTokenizer.tokenType().equals("IDENTIFIER")) { // this is some class identifier
                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                jackTokenizer.advance();
            } else if (jackTokenizer.tokenType().equals("KEYWORD")) { // not a saved class, but a known variable like int boolean
                fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
                jackTokenizer.advance();
            }
            if (jackTokenizer.tokenType().equals("IDENTIFIER")) {
                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                jackTokenizer.advance();
            }
            while (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(",")) {
                fileWriter.write("<symbol> , </symbol>\n");
                jackTokenizer.advance();
                if (jackTokenizer.tokenType().equals("IDENTIFIER")) {
                    fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                    jackTokenizer.advance();
                }
            }
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(";")) {
                fileWriter.write("<symbol> ; </symbol>\n");
                jackTokenizer.advance();
            }
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileStatements() {
        // Compiles a sequence of statements.
        // Does not handle the enclosing curly bracket tokens '{' and '}'.
        // does not write <statement> and </statements>, every time we call this method outside, it is needed to add this
        try {
            //let ...
            //do ...
            //while...
            //if
            //return

            //handle the statements: let, if/else, while, do and return. we stop the recursion when we reach '}'
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("}")) {// this stops the recursion
                return;
            } else {
                //let statement
                if (jackTokenizer.keyWord().equals("let") && jackTokenizer.tokenType().equals("KEYWORD")) {
                    fileWriter.write("<letStatement>\n");
                    compileLet();
                    fileWriter.write("</letStatement>\n");
                }
                //if statement
                else if (jackTokenizer.keyWord().equals("if") && jackTokenizer.tokenType().equals("KEYWORD")) {
                    fileWriter.write("<ifStatement>\n");
                    compileIf();
                    fileWriter.write("</ifStatement>\n");
                }
                //do statement
                else if (jackTokenizer.keyWord().equals("do") && jackTokenizer.tokenType().equals("KEYWORD")) {
                    fileWriter.write("<doStatement>\n");
                    compileDo();
                    fileWriter.write("</doStatement>\n");
                }
                //while statement
                else if (jackTokenizer.keyWord().equals("while") && jackTokenizer.tokenType().equals("KEYWORD")) {
                    fileWriter.write("<whileStatement>\n");
                    compileWhile();
                    fileWriter.write("</whileStatement>\n");
                }
                //return statement
                else if (jackTokenizer.keyWord().equals("return") && jackTokenizer.tokenType().equals("KEYWORD")) {
                    fileWriter.write("<returnStatement>\n");
                    compileReturn();
                    fileWriter.write("</returnStatement>\n");
                }
                compileStatements();
            }
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileLet() {
        // Compiles a let statement.

        // let x = y;
        // let x[y] = z;
        //let x[z] = method(y);

        // variable
        //[ possible, thus only if exsits then compile this symbol
        //if [ existed, compile what's inside
        //] again, not always.
        // = ->symbol
        //some expression
        //; -> the end of the let statement
        try {
            fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n"); //"let"
            jackTokenizer.advance();
            fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n"); //let x
            jackTokenizer.advance();
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("[")) {
                fileWriter.write("<symbol> [ </symbol>\n"); //let x[
                jackTokenizer.advance();
                compileExpression(); //let x[expression
                fileWriter.write("<symbol> ] </symbol>\n");
                jackTokenizer.advance(); // let x[expression]
            }
            fileWriter.write("<symbol> = </symbol>\n");
            jackTokenizer.advance(); //let x[expression] =
            compileExpression(); // let x[expression] = expression
            fileWriter.write("<symbol> ; </symbol>\n"); // after the expression we have ;
            jackTokenizer.advance();
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileIf() {
        // Compiles an if statement, possibly with a trailing else clause.
        // if (expression){statements}
        //else {statements} -> this is optional
        try {
            fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n"); //this is the "if"
            jackTokenizer.advance();

            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("(")) {
                fileWriter.write("<symbol> ( </symbol>\n");
                jackTokenizer.advance();
            }
            compileExpression();
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(")")) {
                fileWriter.write("<symbol> ) </symbol>\n");
                jackTokenizer.advance();
            } //if(expression)
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("{")) {
                fileWriter.write("<symbol> { </symbol>\n");
                jackTokenizer.advance();
            }
            fileWriter.write("<statements>\n");
            compileStatements();
            fileWriter.write("</statements>\n"); //if(expression){statements}
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("}")) {
                fileWriter.write("<symbol> } </symbol>\n");
                jackTokenizer.advance();
            }
            if (jackTokenizer.keyWord().equals("else") && jackTokenizer.tokenType().equals("KEYWORD")) { // else{statements}
                fileWriter.write("<keyword> else </keyword>\n");
                jackTokenizer.advance();
                fileWriter.write("<symbol> { </symbol>\n");
                jackTokenizer.advance();
                //else{

                //let
                //do
                //statement

                fileWriter.write("<statements>\n");
                compileStatements();
                fileWriter.write("</statements>\n");
                fileWriter.write("<symbol> } </symbol>\n");
                jackTokenizer.advance();
            }

        } catch (IOException exception) {
            exception.printStackTrace();
        }

    }

    public void compileWhile() {
        // Compiles a while statement.
        //while(expression){statements}
        try {
            fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n"); //"while"
            jackTokenizer.advance();

            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("(")) {
                fileWriter.write("<symbol> ( </symbol>\n");
                jackTokenizer.advance();
            }
            compileExpression();
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(")")) {
                fileWriter.write("<symbol> ) </symbol>\n");
                jackTokenizer.advance();
            }
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("{")) {
                fileWriter.write("<symbol> { </symbol>\n");
                jackTokenizer.advance();
            }
            fileWriter.write("<statements>\n");
            compileStatements();
            fileWriter.write("</statements>\n");
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("}")) {
                fileWriter.write("<symbol> } </symbol>\n");
                jackTokenizer.advance();
            }
        } catch (IOException exception) {
            exception.printStackTrace();
        }

    }

    public void compileDo() {
        // Compiles a do statement.
        // do Class.method(expressionList); or do method(expressionList);
        try {
            fileWriter.write("<keyword> do </keyword>\n");
            jackTokenizer.advance();
            fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
            jackTokenizer.advance();
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(".")) { //if first option, add ".method" the rest is the same
                fileWriter.write("<symbol> . </symbol>\n");
                jackTokenizer.advance();
                fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                jackTokenizer.advance();

            }
            //this part is the same for the 2 options
            fileWriter.write("<symbol> ( </symbol>\n");
            jackTokenizer.advance();
            fileWriter.write("<expressionList>\n");
            compileExpressionList();
            fileWriter.write("</expressionList>\n");
            fileWriter.write("<symbol> ) </symbol>\n");
            jackTokenizer.advance();
            fileWriter.write("<symbol> ; </symbol>\n");
            jackTokenizer.advance();
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileReturn() {
        // Compiles a return statement.
        // can be return; OR return a value
        try {
            fileWriter.write("<keyword> return </keyword>\n");
            jackTokenizer.advance(); //move to the next token after the return
            //now we check if there is a return value to "return"
            if (!jackTokenizer.tokenType().equals("SYMBOL") || !jackTokenizer.symbol().equals(";")) {
                compileExpression(); //call the compile expression to generate the "inner" code
            }
            //writes the ; like: return x; -> the right most symbol, "end of statement"
            if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(";")) {
                fileWriter.write("<symbol> ; </symbol>\n");
                jackTokenizer.advance();
            }
        } catch (IOException exception) {
            exception.printStackTrace();
        }
    }

    public void compileExpression() {
        // Compiles an expression.
        //processes expressions which consist of one or more terms connected by operators
        // e.g: x + y * z
        try {
            fileWriter.write("<expression>\n");
            compileTerm(); // compile the first term

            while (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.isOperation()) {
                String symbol = jackTokenizer.symbol(); //retrieve the current symbol token e.g., an operator like +, -, <, or =) from the tokenizer
                // handles symbols with "important" meaning
                if (symbol.equals("<")) {
                    fileWriter.write("<symbol> &lt; </symbol>\n");
                } else if (symbol.equals(">")) {
                    fileWriter.write("<symbol> &gt; </symbol>\n");
                } else if (symbol.equals("&")) {
                    fileWriter.write("<symbol> &amp; </symbol>\n");
                } else {
                    fileWriter.write("<symbol> " + symbol + " </symbol>\n");
                }
                // advance to the next term and compile it
                jackTokenizer.advance();
                compileTerm();
            }
            fileWriter.write("</expression>\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void compileTerm() {
        // Compiles a term.
        // If the current token is an identifier, resolves it into a variable,
        // an array entry, or a subroutine call based on lookahead tokens
        try {
            fileWriter.write("<term>\n"); // start the term block in th XML
            // check the current token type to know how to handle
            if (jackTokenizer.tokenType().equals("IDENTIFIER")) {
                String prevIdentifier = jackTokenizer.identifier(); // stores its value for LATER use
                jackTokenizer.advance();

                if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("[")) {
                    fileWriter.write("<identifier> " + prevIdentifier + " </identifier>\n"); // writes the identifier name as the array name
                    //does not advance because we already advanced.
                    fileWriter.write("<symbol> [ </symbol>\n"); // writes the opening square bracket '['
                    jackTokenizer.advance(); // go inside - after the [ and compile what's inside
                    compileExpression();
                    fileWriter.write("<symbol> ] </symbol>\n"); // // after expression, write the closing square bracket ']'
                    jackTokenizer.advance();
                    //Check if the identifier is part of a subroutine call
                    // e.g. -> obj.method() or method()

                } else if (jackTokenizer.tokenType().equals("SYMBOL") &&
                        (jackTokenizer.symbol().equals("(") || jackTokenizer.symbol().equals("."))) {
                    fileWriter.write("<identifier> " + prevIdentifier + " </identifier>\n"); // write the identifier (object/class/subroutine name)
                    // handles the case of a method or function call
                    //does not advance because we already advanced.
                    if (jackTokenizer.symbol().equals(".")) {
                        fileWriter.write("<symbol> . </symbol>\n"); //write the dot '.' separating object/class from method name
                        jackTokenizer.advance();
                        fileWriter.write("<identifier> " + jackTokenizer.identifier() + " </identifier>\n");
                        jackTokenizer.advance(); // to get to the opening '('
                    }
                    fileWriter.write("<symbol> ( </symbol>\n");
                    // advance to the parameter list and compile it
                    jackTokenizer.advance();
                    fileWriter.write("<expressionList>\n");
                    compileExpressionList(); // handles any arguments passed to the subroutine
                    fileWriter.write("</expressionList>\n");
                    fileWriter.write("<symbol> ) </symbol>\n"); //write the closing parenthesis ')'
                    jackTokenizer.advance();

                } else {
                    // if it's just a "plain" identifier, write it to the XML
                    fileWriter.write("<identifier> " + prevIdentifier + " </identifier>\n"); //does not advance because we already advanced.
                }

            } else if (jackTokenizer.tokenType().equals("Integer_Constant")) {
                // in case the  token is an integer constant
                fileWriter.write("<integerConstant> " + jackTokenizer.intVal() + " </integerConstant>\n");
                jackTokenizer.advance();
            } else if (jackTokenizer.tokenType().equals("String_Constant")) {
                // in case the  token is a string constant
                fileWriter.write("<stringConstant> " + jackTokenizer.stringVal() + " </stringConstant>\n");
                jackTokenizer.advance();

            } else if (jackTokenizer.tokenType().equals("KEYWORD") &&
                    (jackTokenizer.keyWord().equals("true") || jackTokenizer.keyWord().equals("false") ||
                            jackTokenizer.keyWord().equals("null") || jackTokenizer.keyWord().equals("this"))) {
                // if the token is a keyword constant -> true false null this
                fileWriter.write("<keyword> " + jackTokenizer.keyWord() + " </keyword>\n");
                jackTokenizer.advance();
            } else if (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals("(")) {
                fileWriter.write("<symbol> ( </symbol>\n"); // // If the token is a  ( -> handle it as a parenthesized expression
                jackTokenizer.advance();
                compileExpression();

                fileWriter.write("<symbol> ) </symbol>\n"); // write the closing parenthesis )
                jackTokenizer.advance();

            } else if (jackTokenizer.tokenType().equals("SYMBOL") &&
                    (jackTokenizer.symbol().equals("-") || jackTokenizer.symbol().equals("~"))) {
                // in case the token is a unary operator - or ~
                fileWriter.write("<symbol> " + jackTokenizer.symbol() + " </symbol>\n");
                jackTokenizer.advance();

                // Recursively compile the term following the unary operator
                compileTerm();
            }

            // write the end "tag" of the term block
            fileWriter.write("</term>\n");
        } catch (IOException e) {
            // Catch and handle any IO errors during file writing
            e.printStackTrace();
        }
    }

    public int compileExpressionList() {
        int expressionCount = 0; // initialize counter for the number of expressions -> we need to return this num (counter)

        try {
            // check if the expression list is empty
            if (!(jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(")"))) {
                compileExpression(); // if it's not empty -> compile the first expression and increment the counter
                expressionCount++;

                // loop to handle comma separated expressions
                while (jackTokenizer.tokenType().equals("SYMBOL") && jackTokenizer.symbol().equals(",")) {
                    fileWriter.write("<symbol> , </symbol>\n");
                    jackTokenizer.advance();
                    compileExpression();
                    expressionCount++; // increment the counter for each additional expression
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return expressionCount; // return the total number of expressions - our counter
    }
}