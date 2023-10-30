const webdev0 = `
# Website Devlog #0
---
So, this is the first web devlog i'm writing, so it might not be very good, but i'll try.
I'm writing this in my very experimental Markdown-like format.

[Here's it's code so far!](https://github.com/Tom-on64/personal-page/blob/main/public/logs/log.js) 

I really don't know what to write here so yeah.

Today i finished working on the [Project](../project/) tab, where i added the MyUtils, Infinity Clicker, JSONStore and kern.
I also made this page and changed some global styling.

If you want to see it, here's the [source code](https://github.com/Tom-on64/personal-page)
I want to add categories to these logs, but that's not for today. So that's it!

Bye!
`
const osdev1 = `
# OS Dev #1
---

Hey! Today made my custom OS work!
I called it 'kern.', because i didn't know what to call it, but i actually like it now, so it's going to stay.

### Now, how exactly does it work?
Well in general an OS is actually really simple. It is usually split into these two parts:
- Bootloader
- Kernel

The bootloader is code that is ran by the BIOS (Basic I/O System) and it's purpose is to gather information about the computer, prepare the computer for the kernel and to load and run the kernel.
The kernel is everything else, like handling I/O, the filesystem and more.

### How does it run the OS?
When you boot your PC, the first thing that runs is the BIOS. It sets up some stuff and then looks for the bootloader.

And how does it do that?
Well, it just loops through all the drives (HDD, SSD, Optical Drives, etc.) and looks at the last two bytes of the first sector (512 Bytes) of that drive.
If they're the magic number 0x55aa, then the first sector (also known as the boot sector) gets loaded into memory and executed.
Why that number? I have no clue, but it's all that's needed to make that drive bootable.

### Bootloades
My bootloader is written in NASM assembly and it's only 512 bytes long.
Most bootloaders are split into stages, because they are usually more than 512 bytes in size, but since kern is quite simple, i didn't need more than that.

Here's the most basic bootloader you can make:
\`\`\`nasm
[bits 16] ; Signify to nasm that we're writing 16-bit code
_start:
  jmp $   ; Get's stuck in an infinite loop

times 510-($-$$) db 0 ; Fill the remaining bytes with 0
dw 0x55aa ; Add the magic number
\`\`\`
This is a very simple example and all it does, is that it gets stuck in an infinite loop (simular to while(true)).

### Kernel
My kernel is written mostly in C. Unlike the example bootloader, the kernel is in 32-bit mode. It's the job of the bootloader to enter 32-bit mode and run the kernel.
In the kernel you have not standard libs, so if you want to print something to the screen, you need to write directly to video memory.
But after you've made some basic setup like making the IDT, setting up IRQs, etc. you can finally start working on the design of the os.

For kern i decided to go with a Command Line Interface and a custom shell. 
I will also make a custom filesystem and some custom drivers.

Well, that's going to be it for today.

If you want to write your own os, i'd recommend these resources:
[Writing a simple OS from scratch - Nick Blundell](https://www.cs.bham.ac.uk//~exr/lectures/opsys/10_11/lectures/os-dev.pdf)
[Bran's Kernel Development Tutorials](http://www.osdever.net/bkerndev/index.php)
[Nanobyte - Building an OS](https://youtube.com/playlist?list=PLFjM7v6KGMpiH2G-kT781ByCNC_0pKpPN&si=j-o5_xDT0dmKBSkU)
[OSDev Wiki](https://wiki.osdev.org/Main_Page)
[Daedalus Comunity - Making an OS (x86)](https://youtube.com/playlist?list=PLm3B56ql_akNcvH8vvJRYOc7TbYhRs19M&si=co1nzRp-g0ihOD7q)

And it you want to check out kern:
[Source Code](https://github.com/Tom-on64/kern)
`
const neon1 = `
# The making of Neon #1
---

In this series, i'll be documenting how my programming language - Neon is made.
In part #1 i'll be explaining the design and the stages of making a compiler.

## About Neon
Neon is my compiled, strongly typed, multi-paradigm programming language.
Now what do those words mean?

Compiled means that when you want to run the program, you first need to compile the source code into an executable, unlike an interpreted language like Python where you just give the source code to the interpreter and it runs it without needing to make an executable.
Now a interpreted language just seems better, right? Well for an interpreted language you need the interpreter program to run the source code, unlike a compiled language where you can just run the executable without any other program.

Strongly typed means that when you declare a variable, you need to say what type it's going to be (for example an Intiger, String or Float). This usually leads to cleaner code with less bugs (usually).

And lastly, Multi-paradigm just means that it supports more than one coding paradigm (style), like OOP, Functional, Procedural, etc.

Neon is written in TypeScript, but once it gets good enough, i want to rewrite Neon in itself. This is known as self-hosting.
Neons syntax is very simular to that of C, but with some aspects of JS and C#.

## How does a programming language work?
A programming language is just the text and syntax you write, the hard part is writing the compiler.
The compiler is a program that converts the source code into an execuatble that your computer can run.
A compiler is usually split into three parts.

### 1. The Lexer
The lexers job is to take the source code a split it up into individual tokens.
For example:
\`\`\`Input
int a = 1;
int b = 2;
return a + b;
\`\`\`
Would be tokenized into these tokens:
\`\`\`Output
[Type:int], [Identifier:a], [Equals], [IntLit:1], [EOL], 
[Type:int], [Identifier:b], [Equals], [IntLit:2], [EOL], 
[Return], [Identifier:a], [Plus], [Identifier:b], [EOL], 
[EOF]
\`\`\`

### 2. The Parser
The parser is the most complicated part of the compiler. It's job is to take the tokens from the Lexer and make the into an AST.
An AST (Abstract Syntax Tree) is a tree of nodes that indicate how the program should run.
Our example tokens could become this AST:
![neondev0_ast.png]

### 3. The Generator
The generators job is usually to navigate the AST and generate Assembly code.
I won't be converting the example AST to assembly, because i'd have to explain too much about how we save variables and such.
I'll make seprate articles, about Generation and all the previously mentioned parts of a compiler at some point.

### 4. Assembler + Linker
These two are usually considered a part of a compiler, but sometimes they are considered as different parts of the whole system.
An assemblers task is to convert the generated assembly into machine code or an object file for the linker. It is sometimes skipped by generating machine code instead of assembly right away.
The linkers job to combine multible object files and libraries (if applicable) into a single executable.

## Last few words
So yeah, that's basically how a compiler works!
I'll be documenting the making of the Neon compiler here so stay tuned for updates.

Also if you want to check out the source code of Neon (i don't reccomend it), here's the repository:
[Tom-on64/Neon on Github](https://github.com/Tom-on64/neon)
`

const logs = {
  webdev0: {
    title: "Website devlog #0",
    description: "Intro to my website devlogs",
    tags: ["devlog", "info", "series", "web"], 
    content: webdev0, 
  }, 
  osdev1: {
    title: "OS Dev #1", 
    description: "Some basic info about OS Development", 
    tags: ["devlog", "osdev", "series", "tutorial"], 
    content: osdev1, 
  }, 
  neondev1: {
    title: "The Making Of Neon #1", 
    description: "The first of many articles about how Neon is made", 
    tags: ["neon", "devlog", "series"],
    content: neon1, 
  }
};

export default logs;
