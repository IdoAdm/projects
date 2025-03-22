import java.util.HashMap;

public class SymbolTable {

private HashMap<String, Integer> symbol;
//Creats a new empty symbol table.
public SymbolTable(){
    this.symbol = new HashMap<>();
}

//Adds <symbol,address> to the table.
public void addEntry(String Value, int add){
    this.symbol.put(Value, add);
}

//Does the symbol table contain the given symbol?
public boolean contains(String Value){
    return this.symbol.containsKey(Value);
}

 //Returns the address associated with the symbol.
public int getAddress(String Value){
    
    return this.symbol.get(Value);   
}

}


