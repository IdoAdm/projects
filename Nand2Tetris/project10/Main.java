import java.io.File;
import java.util.ArrayList;

public class Main {

    // Insert all the .jack files in the directory into an ArrayList
    public static ArrayList<File> getJackFiles(File directory) {
        File[] files = directory.listFiles();
        ArrayList<File> fileResults = new ArrayList<>();
        if (files != null) {
            for (File file : files) {
                if (file.getName().endsWith(".jack")) {
                    fileResults.add(file);
                }
            }
        }
        return fileResults;
    }

    public static void main(String[] args) {
        if (args.length == 0) {
            throw new IllegalArgumentException("No arguments provided. Please specify a file or directory name.");
        }
        File fileName = new File(args[0]);
        File fileOut;
        ArrayList<File> files = new ArrayList<>();
        if (args.length != 1) {
            throw new IllegalArgumentException("More than 1 argument is inserted");
        } else if (fileName.isFile() && !(args[0].endsWith(".jack"))) {
            throw new IllegalArgumentException("The file is in the wrong format");
        } else {
            if (fileName.isFile() && args[0].endsWith(".jack")) {
                files.add(fileName);
                String parentDir = fileName.getParent(); // Get the parent directory of the file
                String outFileName = fileName.getName().replace(".jack", ".xml");
                fileOut = new File(parentDir, outFileName); // Create the output file in the same directory
            } else {
                files = getJackFiles(fileName);
                String parentDir = fileName.getAbsolutePath(); // Use the directory path
                String outFileName = fileName.getName() + ".xml";
                fileOut = new File(parentDir, outFileName);
            }
        }

        for (File file : files) {
            String name =  file.toString().substring(0, file.toString().length() - 4) + "xml";
            File outputFile = new File(name);
            CompilationEngine ce = new CompilationEngine(file , outputFile);
            ce.compileClass();
        }
    }
}