import * as fs from 'fs';
import {spawn} from 'child_process';

if (process.argv.length < 4) {
  console.log('Tienes que introducir un comando');
  process.exit(-1);
}

const filename = process.argv[2];
const command = process.argv[3];
const commandOptions = process.argv.splice(4);
if (command != "wc") {
  console.log('Debes introducir wc para ver la informacion');
  process.exit(-1);
}
/* wc -l <fichero> número de líneas 
   wc -m <fichero> imprime el número de caracteres
   wc -w <fichero> imprime el número de palabras*/

commandOptions.forEach((element) => {
  console.log(element);
  if (element != "-l" && element != "-m" &&
    element != "-w") {
    console.log(
        'Opcion no valida, deber introducir una de las siguientes opciones');
    console.log(`wc -l número de líneas 
    wc -m imprime el número de caracteres
    wc -w imprime el número de palabras`);
    process.exit(-1);
  }
});

fs.access(filename, fs.constants.F_OK, (err) => {
  if (err) {
    console.log(`el fichero ${filename} does not exist!`);
  } else {
    const ls = spawn(command, [...commandOptions, filename]);
    ls.on('error', () => {
      console.log(`El comando ${command} no puede ejecutarse`);
      process.exit(-1);
    });
    ls.stdout.pipe(process.stdout);
  }
});
