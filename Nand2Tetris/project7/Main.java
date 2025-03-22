import java.io.File;
import java.util.ArrayList;

public class Main {

    // Insert all the .vm files in the directory into an ArrayList
    public static ArrayList<File> getVMFiles(File directory) {
        File[] files = directory.listFiles();
        ArrayList<File> fileResults = new ArrayList<>();
        if (files != null) {
            for (File file : files) {
                if (file.getName().endsWith(".vm")) fileResults.add(file);
            }
        }
        return fileResults;
    }

    public static void main(String[] args) {
        File fileName = new File(args[0]);
        File fileOut;
        ArrayList<File> files = new ArrayList<>();

        if (args.length != 1) {
            throw new IllegalArgumentException("More than 1 argument is inserted");
        } else if (fileName.isFile() && !(args[0].endsWith(".vm"))) {
            throw new IllegalArgumentException("The file is in the wrong format");
        } else {
            if (fileName.isFile() && args[0].endsWith(".vm")) {
                files.add(fileName);
                String parentDir = fileName.getParent(); // Get the parent directory of the file
                String outFileName = fileName.getName().replace(".vm", ".asm");
                fileOut = new File(parentDir, outFileName); // Create the output file in the same directory
            } else {
                files = getVMFiles(fileName);
                String parentDir = fileName.getAbsolutePath(); // Use the directory path
                String outFileName = fileName.getName() + ".asm";
                fileOut = new File(parentDir, outFileName);
            }
        }

        ArrayList<Parser> parsers = new ArrayList<>();
        for (File file : files) {
            Parser parser = new Parser(file);
            parsers.add(parser);
        }

        CodeWriter pw = new CodeWriter(fileOut);
        for (Parser parser : parsers) {
            int commandType = -1;
            while (parser.hasMoreLines()) {
                parser.advance();
                commandType = parser.commandType();
                if (commandType == Parser.C_ARITHMETIC) {
                    pw.writeArithmetic(parser.arg1());
                } else if (commandType == Parser.C_POP || commandType == Parser.C_PUSH) {
                    pw.writePushPop(commandType, parser.arg1(), parser.arg2());
                }
            }
        }
        pw.close();
    }
}