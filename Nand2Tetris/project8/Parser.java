import java.io.File;
import java.io.FileNotFoundException;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;


public class Parser {
    //    private static final HashMap<Integer,String> arithmetic_logical_commands = new HashMap<Integer,String>();
    private Scanner scan;
    private String currentLine;
    //indexes for commands type
    public static final int C_ARITHMETIC = 0;
    public static final int C_PUSH = 1;
    public static final int C_POP = 2;
    public static final int C_LABEL = 3;
    public static final int C_GOTO = 4;
    public static final int C_IF = 5;
    public static final int C_FUNCTION = 6;
    public static final int C_RETURN = 7;
    public static final int C_CALL = 8;

    private String arg1;
    private int arg2;
    private int type;

    //adding the types of the arithmetic operations to array
    private static List<String> arithmetic = Arrays.asList("add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not");

    public Parser(File file) {
        try {
            this.scan = new Scanner(file);
            String line, tempLine = "";
            while(scan.hasNext()) {
                String temp = scan.nextLine();
                line = temp.split("//")[0].trim();
                if(!line.isEmpty()) {
                    tempLine += line +"\n";
                }
            }
            this.scan = new Scanner(tempLine.trim());
        }
        catch(FileNotFoundException e) {
            System.out.println("The file is not found");
        }
    }

    public boolean hasMoreLines() {
        return scan.hasNextLine();
    }

    public void advance() {
        this.currentLine = scan.nextLine();
        this.arg1 = "";
        this.arg2 = -1;
        String[] segment = currentLine.split(" ");
        if(segment.length > 3){
            throw new IllegalArgumentException("Too many inserted arguments");
        }
        if(arithmetic.contains(segment[0])) {
            type = C_ARITHMETIC;
            arg1 = segment[0];
        }
        else {
            if (segment[0].equals("return")) {
                type = C_RETURN;
            } else {
                arg1 = segment[1];
                if (segment[0].equals("push")) {
                    type = C_PUSH;
                } else if (segment[0].equals("pop")) {
                    type = C_POP;
                } else if (segment[0].equals("label")) {
                    type = C_LABEL;
                } else if (segment[0].equals("goto")) {
                    type = C_GOTO;
                } else if (segment[0].equals("if-goto")) {
                    type = C_IF;
                } else if (segment[0].equals("function")) {
                    type = C_FUNCTION;
                } else if (segment[0].equals("call")) {
                    type = C_CALL;
                } else {
                    throw new IllegalArgumentException("Unknown command type");
                }
            }
        }

        if (type == C_PUSH || type == C_POP || type == C_FUNCTION || type == C_CALL) {
            try {
                arg2 = Integer.parseInt(segment[2]);
            }
            catch (Exception e) {
                throw new IllegalArgumentException("Incorrect syntax");
            }
        }
    }

    public int commandType() {
        if(type != -1) {
            return type;
        }
        else {
            throw new IllegalStateException("No commands are given");
        }
    }

    public String arg1() {
        if(type != C_RETURN){
            return arg1;
        }
        throw new IllegalStateException("No argument for return command.");

    }

    public int arg2() {
        if(commandType() == C_PUSH || commandType() == C_POP|| commandType() == C_FUNCTION || commandType() == C_CALL) {
            return arg2;
        }
        else {
            throw new IllegalStateException("Cannot get arg2");
        }
    }
}