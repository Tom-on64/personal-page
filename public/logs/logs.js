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

### How does is run the OS?
When you boot your PC, the first thing that runs is the BIOS. It sets up some stuff and then looks for the bootloader.

And how does it do that?
Well, it just loops through all storage units (HDD, SSD, Optical Drives, etc.) and looks at the first sector (512 Bytes) of that unit.
All it does, is that it checks the last two bytes of that sector and sees it they're the magic number 0x55aa.
Why that number? I have no clue, but it's all that's needed to make that drive bootable.
If it finds such a drive, it will load the first sector into memory and run it.

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

If you want to write your own os, i'd recommend these resourcses:
[Writing a simple OS from scratch - Nick Blundell](https://www.cs.bham.ac.uk//~exr/lectures/opsys/10_11/lectures/os-dev.pdf)
[Bran's Kernel Development Tutorials](http://www.osdever.net/bkerndev/index.php)
[Nanobyte - Building an OS](https://youtube.com/playlist?list=PLFjM7v6KGMpiH2G-kT781ByCNC_0pKpPN&si=j-o5_xDT0dmKBSkU)
[OSDev Wiki](https://wiki.osdev.org/Main_Page)
[Daedalus Comunity - Making an OS (x86)](https://youtube.com/playlist?list=PLm3B56ql_akNcvH8vvJRYOc7TbYhRs19M&si=co1nzRp-g0ihOD7q)

And it you want to check out kern:
[Source Code](https://github.com/Tom-on64/kern)
`

const logs = {
  webdev0: {
    title: "Website devlog #0",
    description: "Intro to my website devlogs",
    tags: ["devlog", "info", "series", "web"], 
    content: webdev0, 
  }, 
  osdev0: {
    title: "OS Dev #1", 
    description: "Some basic info about OS Development", 
    tags: ["devlog", "osdev", "series"], 
    content: osdev1, 
  }, 
};

export default logs;
