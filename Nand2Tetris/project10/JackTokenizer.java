import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class JackTokenizer {

    private Scanner scan;
    private String keyword;
    private String tokenType;
    private String symbol;
    private String identifier;
    private String stringVal;
    private int intVal;
    private ArrayList<String> tokensList;
    private int listPointer = 0;
    private static String symbols;
    private static String operations = "+-*/&|<>=";
    private static ArrayList<String> keyWords;
    static {
        symbols = "{}()[].,;+-*/&|<>=-~";
        keyWords = new ArrayList<String>();
        keyWords.add("class");
        keyWords.add("constructor");
        keyWords.add("function");
        keyWords.add("method");
        keyWords.add("field");
        keyWords.add("static");
        keyWords.add("var");
        keyWords.add("int");
        keyWords.add("char");
        keyWords.add("boolean");
        keyWords.add("void");
        keyWords.add("true");
        keyWords.add("false");
        keyWords.add("null");
        keyWords.add("this");
        keyWords.add("do");
        keyWords.add("if");
        keyWords.add("else");
        keyWords.add("while");
        keyWords.add("return");
        keyWords.add("let");
    }

    public JackTokenizer(File inputFile) {
        // Opens the input .jack file/stream and gets ready to tokenize it.
        try{
            tokensList = new ArrayList<String>();
            scan = new Scanner(inputFile);
            while(scan.hasNextLine()){
                String currentLine = scan.nextLine();
                currentLine = removeComments(currentLine);
                currentLine = currentLine.trim();
                if(!(currentLine == "")){ //do not handle lines that are empty or only a comment
                    while (currentLine.length() > 0) {
                        while (currentLine.charAt(0)==' ') { // skip spaces
                            currentLine = currentLine.substring(1);
                        }
                        for(int i = 0; i < keyWords.size()-1; i++){ // handling keywords
                            if(currentLine.startsWith(keyWords.get(i).toString())){
                                String keyword = keyWords.get(i).toString();
                                tokensList.add(keyword);
                                currentLine = currentLine.substring(keyword.length());
                            }
                        }
                        //handling symbols
                        if(symbols.contains(currentLine.substring(0,1))){
                            String symbol = currentLine.substring(0,1);
                            tokensList.add(symbol);
                            currentLine = currentLine.substring(1);
                        }
                        // string constants
                        else if(currentLine.startsWith("\"")){
                            String start = "\"";
                            currentLine = currentLine.substring(1);
                            int i = 0;
                            while(currentLine.charAt(i) !='\"'){
                                i++;
                            }// "string" string
                            tokensList.add(start + currentLine.substring(0, i+1));
                            currentLine = currentLine.substring(i+1);
                        }
                        //int constants
                        else if(Character.isDigit(currentLine.charAt(0))){
                            int j = 0;
                            while (Character.isDigit(currentLine.charAt(j))) {
                                j++;
                            }
                            String number = currentLine.substring(0, j);
                            tokensList.add(number);
                            currentLine = currentLine.substring(j);
                        }
                        else if(Character.isLetter(currentLine.charAt(0)) || currentLine.charAt(0) == '_'){
                            int j = 0;
                            while(Character.isLetter(currentLine.charAt(j)) || currentLine.charAt(j) == '_' || Character.isDigit(currentLine.charAt(j))){
                                j++;
                            }
                            tokensList.add(currentLine.substring(0, j));
                            currentLine = currentLine.substring(j);
                        }
                    }
                }
            }
        }
        catch (FileNotFoundException e){
            e.printStackTrace();
        }
    }

    public boolean hasMoreTokens() {
        if(listPointer >= (tokensList.size()-1)){
            return false;
        }
        return true;
    }

    public void advance() {
        // Gets the next token from the input and makes it the current token.
        // This method should be called only if hasMoreTokens() is true.
        if (hasMoreTokens()){
            listPointer ++;
        }
        String token = tokensList.get(listPointer);
        if(keyWords.contains(token)){
            tokenType = "KEYWORD";
            keyword = token;
        }
        else if(symbols.contains(token)){
            tokenType = "SYMBOL";
            symbol = token;
        }
        else if(isNumeric(token)){
            tokenType = "Integer_Constant";
            intVal = Integer.parseInt(token);
        }
        else if(token.substring(0, 1) .equals( "\"")){
            tokenType = "String_Constant";
            stringVal = token.substring(1,token.length()-1); //maybe it's -1 and not -2, check this.
        }
        else if(Character.isLetter(token.charAt(0)) || (token.charAt(0) == '_')){
            tokenType = "IDENTIFIER";
            identifier = token;
        }

    }

    public String tokenType() {
        return tokenType;
    }

    public String keyWord() {
        // Returns the keyword of the current token.
        // Should only be called if tokenType() is KEYWORD.
        return keyword;
    }

    public String symbol() {
        // Returns the character of the current token.
        // Should only be called if tokenType() is SYMBOL.
        return symbol;
    }

    public String identifier() {
        // Returns the string of the current token.
        // Should only be called if tokenType() is IDENTIFIER.
        return identifier;
    }

    public int intVal() {
        // Returns the integer value of the current token.
        // Should only be called if tokenType() is INT_CONST.
        return intVal;
    }

    public String stringVal() {
        // Returns the string value of the current token, without quotes.
        // Should only be called if tokenType() is STRING_CONST.
        return stringVal;
    }

    // helper method to check if comments exsist and remove them if necessary
    private String removeComments(String strLine) {
        String strNoComments = strLine;
        if (strLine.contains("//") || strLine.contains("/*") || strLine.startsWith(" *")) {
            int offSet;
            if (strLine.startsWith(" *")) {
                offSet = strLine.indexOf("*");
            } else if (strLine.contains("/*")) {
                offSet = strLine.indexOf("/*");
            } else {
                offSet = strLine.indexOf("//");
            }
            strNoComments = strLine.substring(0, offSet).trim();

        }
        return strNoComments;
    }

    public static boolean isNumeric(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        for (char c : str.toCharArray()) {
            if (!Character.isDigit(c)) {
                return false;
            }
        }
        return true;
    }
    public boolean isOperation() {
        if (operations.contains(symbol)) {
            return true;
        }
        return false;
    }
    public void printtokenizer(){
        int i = 0;
        while(hasMoreTokens()){
            System.out.println(tokensList.get(i));
            i++;

        }
    }
}