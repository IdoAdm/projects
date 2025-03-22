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
    public static int C_ARITHMETIC = 0;
    public static int C_PUSH = 1;
    public static int C_POP = 2;

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
            arg1 = segment[1];
            if(segment[0].equals("push")) {
                type = C_PUSH;
            }

            else if(segment[0].equals("pop")) {
                type = C_POP;
            }
            else {
                throw new IllegalArgumentException("Unknown command type");
            }
        }
        
        if (type == C_PUSH || type == C_POP) {
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
        return arg1;
    }

    public int arg2() {
        if(commandType() == C_PUSH || commandType() == C_POP) {
            return arg2;
        }
        else {
            throw new IllegalStateException("Can not get arg2");
        }
    }
}
