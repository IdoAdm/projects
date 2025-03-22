// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// The algorithm is based on repetitive addition.

@i
M=0 //initialzie the counter i to 0
@mul
M=0 //initialize the mul varaible to 0

(LOOP)
@i 
D=M //load the current value of i into D
@R0
D=D-M //D = i - R0 
@stop
D;JEQ // check if i == R0, if so jump to STOP

@R1
D=M  //load the value of R1 into D
@mul
M=D+M //add R1 to mul 

@i
M=M+1 //increase i by 1

@LOOP
0;JMP //Without this instruction, the program would stop after the first addition

(STOP) //this was not correct
@mul
D=M //load the mul (result) into D
@R2
M=D //store the result in R2 (as asked in the task)

(END) //finish loop, "protection" 
@END 
0;JMP
