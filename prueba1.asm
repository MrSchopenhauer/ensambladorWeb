; test.ams -- suma de dos numeros de 32 bits

 

.386
.model flat,stdcall
.stack 4096
ExitProcess proto,dwExitCode:dword

 

.data
sum DWORD ?
var1 byte 125
var2 sdword 125h
valor1 word 65535
valor2 qword 123659854879


 

.code
main proc
    mov eax,7
    add eax,4
    mov sum,eax 
    invoke ExitProcess, 0

 

main endp
end main