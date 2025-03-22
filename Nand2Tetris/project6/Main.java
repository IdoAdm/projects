import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;

public class Main {

    public static void main(String[] args){
        // Ensure at least one argument is provided
        if (args.length == 0) {
            System.out.println("Error: No input file provided. Please specify a file path as a command-line argument.");
            return;
        }
        
    
        SymbolTable table = new SymbolTable(); // construct the basic symbol table according to the example table in class.
        for(int i = 0; i <= 15; i++){
            table.addEntry("R"+i, i);
        }
        table.addEntry("SCREEN", 16384);
        table.addEntry("KBD", 24576);
        table.addEntry("SP", 0);
        table.addEntry("LCL", 1);
        table.addEntry("ARG", 2);
        table.addEntry("THIS", 3);
        table.addEntry("THAT", 4);
        
        Parser parser = new Parser(args[0]);
        int i = 16;
        int number = 0;

        while (parser.hasMoreLines()) {
            if(parser.instructionType() == Parser.InstructionType.L_INSTRUCTION){ // read this line as a L instrunction.
                String currentLine = parser.symbol();
                if(!table.contains(currentLine)){
                    table.addEntry(currentLine, (parser.lineCounter-number));
                    number++;
                }
            }
            parser.advance(); // Read the next instruction
        }

        parser.lineCounter = 0; // restate the line counter to 0 so we can go over the hashmap again.
        //file to write the output
        File file = new File (args[0].trim());
        String path = file.getAbsolutePath();
        String filename = file.getName();
        String [] tempName = filename.split("\\.");
        String nameOfFile = tempName[0];
        nameOfFile = nameOfFile + ".hack";
        File outputFile = new File(nameOfFile);


        try (PrintWriter pw = new PrintWriter(outputFile)){
            while (parser.hasMoreLines()) {

                if (parser.instructionType() == Parser.InstructionType.A_INSTRUCTION) {
                    String currentLine = parser.symbol();
                    if (isNumeric(currentLine)) {
                        int num = Integer.parseInt(currentLine);
                        String binaryString = toBinaryWithLength(num, 15);

                        if (parser.lineCounter + 1 == parser.commands.size()) { // Check if it's the last line
                            pw.print("0" + binaryString); // Use print (no newline)
                        } else {
                            pw.println("0" + binaryString); // Add newline
                        }
                    } else if (!table.contains(currentLine)) {
                        table.addEntry(currentLine, i++);
                        if (parser.lineCounter + 1 == parser.commands.size()) { // Check if it's the last line
                            pw.print(toBinaryWithLength(table.getAddress(currentLine), 16)); // Use print (no newline)
                        } else {
                            pw.println(toBinaryWithLength(table.getAddress(currentLine), 16)); // Add newline
                        }
                    }
                    else {
                        if (parser.lineCounter + 1 == parser.commands.size()) { // Check if it's the last line
                            pw.print(toBinaryWithLength(table.getAddress(currentLine), 16)); // Use print (no newline)
                        } else {
                            pw.println(toBinaryWithLength(table.getAddress(currentLine), 16)); // Add newline
                        }
                    }
                }

                if (parser.instructionType() == Parser.InstructionType.C_INSTRUCTION) {
                    Code c = new Code();
                    String dest = c.dest(parser.dest());
                    String comp = c.comp(parser.comp());
                    String jump = c.jump(parser.jump());
                    if ((parser.lineCounter+1) == parser.commands.size()){
                        pw.print("111" + comp + dest + jump); // Write to file
                    }
                    else {
                        pw.println("111" + comp + dest + jump); // Write to file
                    }
                }
                parser.advance(); // Read the next instruction
            }

        } catch (FileNotFoundException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }
    }



    //HELPERS:

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


    public static String toBinaryWithLength(int number, int length) {
        String binary = Integer.toBinaryString(number);
        while (binary.length() < length) {
            binary = "0" + binary; // Add leading zeros until desired length
        }
        return binary;
    }

}
    