// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.

//initialize to the bootom of the screen and then we loop up to the beginning of the screen.
(START)
@8192 
D=A //store 8192 in D
@SCREEN_SIZE
M=D // set ScreenSize to 8192

(LOOP)
@SCREEN_SIZE
M=M-1 //decrease SCREEN_SIZE by 1
D=M //load SCREEN_SIZE into D
@START
D;JLT //if screen_size < 0 , we restart the program

@KBD
D=M //load the value of KBD into D //if keyboars = 0 goto WLOOP
@WHITE 
D;JEQ //if key is not pressed (D == 0) go to WHITE //if keyboard != 0 goto BLOOP
@BLACK 
0;JMP //if key is pressed (D != 0) go to BLACK

(WHITE)
@SCREEN
D=A //load the base add. of screen (top left hand side)
@SCREEN_SIZE
A=D+M //calculate the current memory location (screen + screen_size)
M=0 //clear the pixel (insert 0 into it)
@LOOP
0;JMP //jump back to LOOP for checking the next pixel

(BLACK)
@SCREEN
D=A //load the base add. of screen (top left hand side)
@SCREEN_SIZE
A=D+M //calculate the current memory location (screen + screen_size)
M=-1 //make the pixel black (insert -1 into it)
@LOOP
0;JMP //jump back to LOOP for checking the next pixel

(END) // Infinite loop to prevent program from running off
@END
0;JMP