import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Scanner;

public class Parser {
    public int lineCounter;
    public HashMap<Integer,String> commands; // holds the instructions according to line numbers.

     // Enum for instruction types
    enum InstructionType {
        A_INSTRUCTION,
        C_INSTRUCTION,
        L_INSTRUCTION
    }

    // Constructor
    // Opens the input file or stream and gets ready to parse it.
    public Parser(String inputFile) {
        this.commands = new HashMap<>();
        int counter = 0;
        try {
            File file = new File(inputFile);
            Scanner s = new Scanner(file);
            while (s.hasNextLine()) {
                String line = s.nextLine();
                if(!line.equals("") && !line.startsWith("//")){ // make sure that the line is not empty or a note
                    String validLine = line.replaceAll("\\s+", ""); // erase all spaces tabs and newline symbols 
                    int index = validLine.indexOf("//"); // if there is a note in the end of a valid line, erase the note.
                    if (index != -1) {
                        validLine = validLine.substring(0, index);
                    }
                    if (!validLine.equals("")) {
                        commands.put(counter, validLine);
                        counter++;
                    }
                }
            }
            s.close();
        }
        catch(FileNotFoundException  e){
            System.out.println("could not find the file"); 
        }     
    }
    // D=D+1     // this is to do 
    // Checks if there are more lines in the input
    public boolean hasMoreLines() {
        return lineCounter < commands.size();
    }

    // Reads the next instruction from the input and makes it the current instruction
    // Skips over whitespace and comments if necessary
// Reads the next instruction from the input and makes it the current instruction
    // Skips over whitespace and comments if necessary
    public void advance() {
        if(hasMoreLines()){
            lineCounter ++;
            if (lineCounter + 1 < commands.size() && (commands.get(lineCounter+1).equals("") || commands.get(lineCounter+1).startsWith("//"))){
                this.advance();
            }
        }
        else
            throw new Error("The file has no more lines.");

    }


    // Returns the type of the current instruction
    public InstructionType instructionType() {
        String line = commands.get(lineCounter);
        if(line.startsWith("@")){
            return InstructionType.A_INSTRUCTION;
        }
        if (line.startsWith("(")) {
            return InstructionType.L_INSTRUCTION;
        }
        else
            return InstructionType.C_INSTRUCTION;
    }


    // Returns the symbol of the current instruction (if applicable)
    public String symbol() {
        InstructionType instruction = instructionType();
        if(instruction == InstructionType.C_INSTRUCTION)
            throw new Error("C instruction cann't give symbol");
        String command = commands.get(lineCounter);
        if(instruction == InstructionType.L_INSTRUCTION)
            return command.replace("(", "").replace(")", "");
            
        return command.replace("@", ""); // reaches here if it is an A instruction.
    }

    // Returns the symbolic dest part of the current C-instruction
    public String dest() {
        String[] s = commands.get(lineCounter).split("=");
        if( s.length <= 1){
            return "";
        }
        else
            return s[0];
    }

    //Returns the symbolic comp part of the current C-instruction
    public String comp() {
        String[] s1 = commands.get(lineCounter).split("=");
        if (s1.length==2) { // in case the syntax is "dest = comp;jump" or "dest = comp"
            String[] s2 = s1[1].split(";");
            return s2[0];
        }
        else{ //in case syntax is "comp;jump"
            String[] s3  =commands.get(lineCounter).split(";");
            return s3[0];
        }
    }

    // Returns the symbolic jump part of the current C-instruction
    public String jump() {
        String[] s1 = commands.get(lineCounter).split(";");
        if (s1.length == 1)
            return "";
        return s1[1];
    }

}
