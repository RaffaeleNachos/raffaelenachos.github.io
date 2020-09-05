# Impossible Password HackTheBox Reversing Challenge

First thing first, download the zip, extract, give permissions (+x) to the executable and run it

```bash
$ ./impossible_password.bin
* abcdefghijklmnopqrstuv
[abcdefghijklmnopqrst]
```

It asks for a string/password in input, so let's try the tool *strings* that automatically searches for strings in a file, and return them line by line

```bash
$ strings impossible_password.bin 
...
GLIBC_2.7
GLIBC_2.2.5
UH-x
UH-x
=1	 
[]A\A]A^A_
SuperSeKretKey
%20s
...
```

We found *SuperSeKretKey*, let's try it

```bash
./impossible_password.bin
* SuperSeKretKey
[SuperSeKretKey]
** abcdefghijklmnopqrstuv
```

It works but it asks for a second password. Let's try using the *ltrace* utility which traces library calls from the execution of a process.

```bash
$ ltrace ./impossible_password.bin
__libc_start_main(0x40085d, 1, 0x7ffc7b471398, 0x4009e0 <unfinished ...>
printf("* ")                                     = 2
__isoc99_scanf(0x400a82, 0x7ffc7b471290, 0, 0* SuperSeKretKey
)   = 1
printf("[%s]\n", "SuperSeKretKey"[SuperSeKretKey]
)               = 17
strcmp("SuperSeKretKey", "SuperSeKretKey")       = 0
printf("** ")                                    = 3
__isoc99_scanf(0x400a82, 0x7ffc7b471290, 0, 0** aaaaaaaaaaaaaaaaaaaaaaaaaaa
)   = 1
time(0)                                          = 1599219849
srand(0x73e8d1c5, 21, 0x726b2ab4, 0)             = 0
malloc(21)                                       = 0x253fac0
rand(4, 0, 33, 0x253fad0)                        = 0x554ab6b7
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac0, 94) = 0x11b51f09
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac1, 94) = 0x319b5dd5
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac2, 94) = 0x3679c900
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac3, 94) = 0x73f0f452
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac4, 94) = 0x52191676
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac5, 94) = 0xb028983
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac6, 94) = 0x171147df
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac7, 94) = 0x185d9f66
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac8, 94) = 0xce06885
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fac9, 94) = 0x122d5366
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253faca, 94) = 0x24758b6d
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253facb, 94) = 0x35487c7a
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253facc, 94) = 0x3fa774f0
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253facd, 94) = 0xa4b859a
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253face, 94) = 0x121afe5a
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253facf, 94) = 0x5025b76c
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fad0, 94) = 0xedd1de4
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fad1, 94) = 0x2c97df52
rand(0x7f329610a740, 0x7ffc7b4711f4, 0x253fad2, 94) = 0x28b43a83
strcmp("aaaaaaaaaaaaaaaaaaaa", "XT:ekc,NIl-twkI'?#%`") = 9
+++ exited (status 9) +++

```

We can see the first strcmp (the one that compares SuperSekretKey) and the second, the last key is created by some rand calculations, so it changes every time we execute the file!

Let's load the binary in Ghidra and let's try reversing the function that calculates the second key. The function that checks the two keys is the following:

```c
void FUN_0040085d(void)

{
  int iVar1;
  char *__s2;
  byte local_48;
  undefined local_47;
  undefined local_46;
  undefined local_45;
  undefined local_44;
  undefined local_43;
  undefined local_42;
  undefined local_41;
  undefined local_40;
  undefined local_3f;
  undefined local_3e;
  undefined local_3d;
  undefined local_3c;
  undefined local_3b;
  undefined local_3a;
  undefined local_39;
  undefined local_38;
  undefined local_37;
  undefined local_36;
  undefined local_35;
  char local_28 [20];
  int local_14;
  char *local_10;
  
  local_10 = "SuperSeKretKey";
  local_48 = 0x41;
  local_47 = 0x5d;
  local_46 = 0x4b;
  local_45 = 0x72;
  local_44 = 0x3d;
  local_43 = 0x39;
  local_42 = 0x6b;
  local_41 = 0x30;
  local_40 = 0x3d;
  local_3f = 0x30;
  local_3e = 0x6f;
  local_3d = 0x30;
  local_3c = 0x3b;
  local_3b = 0x6b;
  local_3a = 0x31;
  local_39 = 0x3f;
  local_38 = 0x6b;
  local_37 = 0x38;
  local_36 = 0x31;
  local_35 = 0x74;
  printf("* ");
  __isoc99_scanf(&DAT_00400a82,local_28);
  printf("[%s]\n",local_28);
  local_14 = strcmp(local_28,local_10);
  if (local_14 != 0) {
                    /* WARNING: Subroutine does not return */
    exit(1);
  }
  printf("** ");
  __isoc99_scanf(&DAT_00400a82,local_28);
  __s2 = (char *)FUN_0040078d(0x14);
  iVar1 = strcmp(local_28,__s2);
  if (iVar1 == 0) {
    FUN_00400978(&local_48);
  }
  return;
}
```

Now let's change some variable names and try to infer types... after some tweaking...

```c

void checkPasswords(void)

{
  int isEqual_;
  char *secondKey;
  char strangeStr [20];
  char inputKey [20];
  int isEqual;
  char *firstKey;
  
  firstKey = "SuperSeKretKey";
  strangeStr[0] = 'A';
  strangeStr[1] = ']';
  strangeStr[2] = 'K';
  strangeStr[3] = 'r';
  strangeStr[4] = '=';
  strangeStr[5] = '9';
  strangeStr[6] = 'k';
  strangeStr[7] = '0';
  strangeStr[8] = '=';
  strangeStr[9] = '0';
  strangeStr[10] = 'o';
  strangeStr[11] = '0';
  strangeStr[12] = ';';
  strangeStr[13] = 'k';
  strangeStr[14] = '1';
  strangeStr[15] = '?';
  strangeStr[16] = 'k';
  strangeStr[17] = '8';
  strangeStr[18] = '1';
  strangeStr[19] = 't';
  printf("* ");
  __isoc99_scanf(&DAT_00400a82,inputKey);
  printf("[%s]\n",inputKey);
  isEqual = strcmp(inputKey,firstKey);
  if (isEqual != 0) {
                    /* WARNING: Subroutine does not return */
    exit(1);
  }
  printf("** ");
  __isoc99_scanf(&DAT_00400a82,inputKey);
  secondKey = (char *)buildSecondKey(20);
  isEqual_ = strcmp(inputKey,secondKey);
  if (isEqual_ == 0) {
    printFlag((byte *)strangeStr);
  }
  return;
}


```

We can try to bypass the second strcmp simply facing out what printFlag() does: printFlag() takes strangeStr byte array as an input:

```c
void printFlag(byte *param)

{
  int flagLenght;
  char *flag;
  
  flagLenght = 0;
  flag = (char *)param;
  while ((*flag != '\t' && (flagLenght < 0x14))) {
    putchar((int)(char)(*flag ^ 9));
    flag = flag + 1;
    flagLenght = flagLenght + 1;
  }
  putchar(10);
  return;
}
```

printFlag() checks until the end of the array ('\t') and until the max lenght (20 in decimal, 0x14 in hex) and it does a XOR operation with '0x9'

Let's do it by hand for the first letter and then we will write a simple python script in order to automate it. So the first letter is A that in HEX is 0x41 ant then XOR it with 0x9

> 1000001    0x41
> 
> 0001001    0x9
> 
> 1001000    0x48

0x48 in ASCII is H and we know that the format of the flag is HTB{...} so we are following the correct road!

Let's automate it with python:

```python
hexes = [0x41, 0x5d, 0x4b, 0x72, 0x3d, 0x39, 0x6b, 0x30, 0x3d, 0x30, 0x6f, 0x30, 0x3b, 0x6b, 0x31, 0x3f, 0x6b, 0x38, 0x31, 0x74]
flag = ''
for hex_ in hexes:
	letter = hex(hex_ ^ 0x9)
	flag = flag + letter[2:].decode('hex')
print(flag)
```

What we are doing here? We are "xoring" the array of hexes one by one with 0x9. And then decoding the output to an ASCII character. 

The output of the python script will be the flag: 

```bash
python imp.py
HTB{40b**************b18}
```




