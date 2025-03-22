import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;

public class CodeWriter {

    private PrintWriter outFile;
    private String name;
    private int mark = 0;
    private int markLabel = 0;

    // Constructor: Opens the output file/stream and prepares to write to it
    public CodeWriter(File inputFile) {
        try {
            this.outFile = new PrintWriter(inputFile);
            setFileName(inputFile);
        }
        catch(FileNotFoundException e) {
            e.printStackTrace();
        }
    }

    public void setFileName(File file) {
        this.name = file.getName().replaceFirst("[.][^.]+$", "");
    }

    // Writes the assembly code for the given arithmetic command
    public void writeArithmetic(String command) {
        String template1 = "@SP\n"+"M=M-1\n"+"A=M\n"+"D=M\n"+"A=A-1\n";
        switch (command) {
            case "add":
                outFile.print(template1+"M=D+M\n");
                break;
            case "sub":
                outFile.print(template1+"M=M-D\n");
                break;
            case "neg":
                outFile.print("@SP\n"+"A=M-1\n"+"M=-M\n");
                break;
            case "eq": //if 2 items are equal -> pushes -1 (tue) and if not eqaul pushes 0 (false)
                outFile.print(template1 +"D=D-M\n" + "@EQUAL"+mark+"\n" + "D;JEQ\n" + "@SP\n" + "A=M-1\n"
                        +"M=0\n"+"@END"+mark+"\n"+"0;JMP\n"+"(EQUAL" + mark +")\n" +"@SP\n"+"A=M-1\n"+"M=-1\n"+"(END"+mark+")\n");
                mark ++;
                break;
            case "gt":
                outFile.print(template1+"D=M-D\n" + "@GREATER" + mark + "\n" + "D;JGT\n" + "@SP\n" + "A=M-1\n"
                        +"M=0\n"+"@END"+mark + "\n" +"0;JMP\n"+"(GREATER"+ mark+")\n" +"@SP\n"+"A=M-1\n"+"M=-1\n"+"(END" + mark +")\n");
                mark++;
                break;
            case "lt":
                outFile.print(template1+"D=M-D\n" + "@LESS" + mark +"\n" + "D;JLT\n" + "@SP\n" + "A=M-1\n"
                        +"M=0\n"+"@END"+mark+"\n"+"0;JMP\n"+"(LESS"+mark+")\n" +"@SP\n"+"A=M-1\n"+"M=-1\n"+"(END" + mark +")\n");
                mark++;
                break;
            case "and":
                outFile.print(template1+"M=D&M\n");
                break;

            case "or":
                outFile.print(template1+"M=D|M\n");
                break;

            default:
            case "not":
                outFile.print("@SP\n"+"A=M-1\n"+"M=!M\n");
                break;
        }
    }

    // Writes the assembly code for push or pop commands
    public void writePushPop(int type, String segment, int index) {
        if (type == Parser.C_PUSH) { // PUSH commands
            if (segment.equals("constant")) {
                outFile.print("@"+ index +"\n" + "D=A\n" +"@SP\n"+"A=M\n"+"M=D\n"+"@SP\n"+"M=M+1\n");
            }
            else if (segment.equals("local")) {
                outFile.print("@"+ index +"\n" + "D=A\n" +"@LCL\n"+"A=M\n"+"A=D+A\n"+"D=M\n"+"@SP\n" +"A=M\n" + "M=D\n" + "@SP\n"+"M=M+1\n");
            }
            else if (segment.equals("argument")) {
                outFile.print("@"+ index +"\n" + "D=A\n" +"@ARG\n"+"A=M\n"+"A=D+A\n"+"D=M\n"+"@SP\n" +"A=M\n" + "M=D\n" + "@SP\n"+"M=M+1\n");
            }
            else if (segment.equals("this")) {
                outFile.print("@"+ index +"\n" + "D=A\n" +"@THIS\n"+"A=M\n"+"A=D+A\n"+"D=M\n"+"@SP\n" +"A=M\n" + "M=D\n" + "@SP\n"+"M=M+1\n");
            }
            else if (segment.equals("that")) {
                outFile.print("@"+ index +"\n" + "D=A\n" +"@THAT\n"+"A=M\n"+"A=D+A\n"+"D=M\n"+"@SP\n" +"A=M\n" + "M=D\n" + "@SP\n"+"M=M+1\n");
            }
            else if (segment.equals("static")) {
                outFile.print("@" + name +"." + index +"\n" + "D=M\n"+"@SP\n"+"A=M\n"+"M=D\n"+"@SP\n"+"M=M+1\n");
            }
            else if (segment.equals("temp")) {
                index +=5;
                outFile.print("@" + index +"\n"+"D=M\n"+"@SP\n"+"A=M\n"+"M=D\n"+"@SP\n"+"M=M+1\n");
            }
            else if (segment.equals("pointer")) { //only 0 and 1 can be considered here
                if (index == 0){
                    outFile.print("@THIS\n" +"D=M\n"+"@SP\n"+"A=M\n"+"M=D\n"+"@SP\n"+"M=M+1\n");
                }
                else  { //if index == 1
                    outFile.print("@THAT\n" +"D=M\n"+"@SP\n"+"A=M\n"+"M=D\n"+"@SP\n"+"M=M+1\n");

                }

            }

        } // POP commands
        else if (type == Parser.C_POP) {
            if (segment.equals("local")) {
                outFile.print("@LCL\n" + "D=M\n" +"@"+ index +"\n" +"D=D+A\n"+"@R13\n"+"M=D\n"+"@SP\n"+"M=M-1\n"
                        +"A=M\n"+"D=M\n"+"@R13\n"+"A=M\n"+"M=D\n");
            }
            else if (segment.equals("argument")) {
                outFile.print("@ARG\n" + "D=M\n" +"@"+ index +"\n" +"D=D+A\n"+"@R13\n"+"M=D\n"+"@SP\n"+"M=M-1\n"
                        +"A=M\n"+"D=M\n"+"@R13\n"+"A=M\n"+"M=D\n");
            }
            else if (segment.equals("this")) {
                outFile.print("@THIS\n" + "D=M\n" +"@"+ index +"\n" +"D=D+A\n"+"@R13\n"+"M=D\n"+"@SP\n"+"M=M-1\n"
                        +"A=M\n"+"D=M\n"+"@R13\n"+"A=M\n"+"M=D\n");
            }
            else if (segment.equals("that")) {
                outFile.print("@THAT\n" + "D=M\n" +"@"+ index +"\n" +"D=D+A\n"+"@R13\n"+"M=D\n"+"@SP\n"+"M=M-1\n"
                        +"A=M\n"+"D=M\n"+"@R13\n"+"A=M\n"+"M=D\n");
            }
            else if (segment.equals("static")) {
                outFile.print("@SP\n" + "M=M-1\n"+ "A=M\n"+ "D=M\n"+"@" + name +"." + index +"\n" +"M=D\n");
            }
            else if (segment.equals("temp")) {
                index +=5; //starting from the 5th block
                outFile.print("@SP\n" +"M=M-1\n"+ "A=M\n"+ "D=M\n"+"@"+index + "\n" + "M=D\n");
            }
            else if (segment.equals("pointer")) {
                if (index == 0) {
                    outFile.print("@SP\n"+"M=M-1\n"+"A=M\n"+"D=M\n"+"@THIS\n"+"M=D\n");
                }
                else{ //in case index == 1
                    outFile.print("@SP\n"+"M=M-1\n"+"A=M\n"+"D=M\n"+"@THAT\n"+"M=D\n");
                }
            }
        }
        else {
            throw new IllegalArgumentException("Not a push or pop command");
        }
    }

    //label commands
    public void writeLabel (String label){
        outFile.print("(" + label + ")\n");
    }

    public void writeGoTo (String label){
        outFile.print("@" + label + "\n" + "0;JMP\n");
    }

    public void writeIf (String label){
        outFile.print("@SP\n" + "M=M-1\n" + "A=M\n" + "D=M\n" + "@" + label + "\n"+ "D;JNE\n");
    }



    public void writeFunction (String functionName, int nVars){
        writeLabel(functionName);
        // push 0 to the local varaibles according to nVars.
        for(int i = 0; i<nVars; i++){
            outFile.print("@0\n" + "D=A\n" + "@SP\n" + "A=M\n" + "M=D\n" + "@SP\n" + "M=M+1\n");
        }
    }

    //this is a method that sreves as a format for many strings in the writeCall function
    private static String callFormat(String segment){
        String ret = "@" + segment + "\n" + "D=M\n" + "@SP\n" + "A=M\n" + "M=D\n" + "@SP\n" + "M=M+1\n";
        return ret;
    }

    public void writeCall(String functionName, int nArgs){
        //functionName = functionName+"$ret." + markLabel;
        outFile.print("@" + "RETURN_ADD" + markLabel + "\n" + "D=A\n" + "@SP\n" + "A=M\n" + "M=D\n" + "@SP\n" + "M=M+1\n" // save the return address
                + callFormat("LCL") // save LCL
                + callFormat("ARG") // save ARG
                +callFormat("THIS") // save THIS
                +callFormat("THAT") // save THAT
                +"@SP\n" + "D=M\n" + "@5\n" + "D=D-A\n" + "@" + nArgs + "\n" + "D=D-A\n" + "@ARG\n" + "M=D\n" //repsition ARG to SP -5 -nArgs, beacuse this is where the arguments for this function where pushed and stored
                + "@SP\n" + "D=M\n" + "@LCL\n" + "M=D\n"//reposition LCL so it would point to SP
                + "@" + functionName + "\n" + "0;JMP\n" // goto function name
                + "(" + "RETURN_ADD" + markLabel + ")\n"); // this part injects the return address to the code.
        markLabel++;
    }

    public void writeReturn () {
        //endFrame = LCL
        outFile.print("@LCL\n" + "D=M\n" + "@R13\n" + "M=D\n");
        // retAddr = *(endFrame - 5) // we set the address to this and also the value at the address
        outFile.print("@endFrame\n" + "D=M\n" + "@5\n" + "D=D-A\n" + "A=D\n" + "D=M\n" + "@retAddr\n" + "M=D\n");
        //*ARG = pop() puts the return value for the caller
        // Pop the top value of the stack and store it in D
        outFile.print("@SP\n" + "M=M-1\n" + "A=M\n" + "D=M\n");
        //// Store the value in *ARG
        outFile.print("@ARG\n" + "A=M\n" + "M=D\n");
        //SP = ARG + 1
        outFile.print("@ARG\n" + "D=M\n" + "D=D+1\n" + "@SP\n" + "M=D\n");
        //restores THAT
        outFile.print("@endFrame\n" + "M=M-1\n" + "A=M\n" + "D=M\n" + "@THAT\n" + "M=D\n");
        //restores THIS
        outFile.print("@endFrame\n" + "M=M-1\n" + "A=M\n" + "D=M\n" + "@THIS\n" + "M=D\n");
        //restores ARG
        outFile.print("@endFrame\n" + "M=M-1\n" + "A=M\n" + "D=M\n" + "@ARG\n" + "M=D\n");
        //restores LCL
        outFile.print("@endFrame\n" + "M=M-1\n" + "A=M\n" + "D=M\n" + "@LCL\n" + "M=D\n");
        //goto retAddr
        outFile.print("@retAddr\n" + "A=M\n" + "0;JMP\n");
    }


    // Closes the output file
    public void close() {
        outFile.close();
    }

    public void writeBootstrap() {
        outFile.print("@256\n" + "D=A\n" + "@SP\n" + "M=D\n");
        writeCall("Sys.init", 0);
    }
}