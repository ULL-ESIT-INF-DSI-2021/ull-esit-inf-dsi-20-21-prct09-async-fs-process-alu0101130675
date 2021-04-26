import * as fs from 'fs';
import {spawn} from 'child_process';


const filename = process.argv[2];
if (!filename) {
  console.log('A file to watch must be specified!');
  process.exit(1);

}
/**
 * comprobamos si el fichero existe
 */
fs.access(filename, fs.constants.F_OK, (err) => {
  if (err) {
    console.log(`no existe fichero'}`);
    throw Error('no existe fichero');
  }
  else {
    /**
 * observamos el fichero que hemos pasado por argumentos
 */
fs.watch(filename, (event) => {
  if (event=="change") { // si cambia el contenido del fichero
    const ls = spawn(`${process.argv[3]}`, [`${process.argv[4]}`,
      `${process.argv[5]}`, `${process.argv[2]}`]);
      /*if (ls.emit("error")) {
        process.exit(1);
      }*/
    let output = '';
    ls.stdout.on('data', (chunk) => (output += chunk));
    ls.on('close', () => {
      const parts = output.split(/\s+/);
      console.log([parts[0], parts[4], parts[8]]);
    });
  }
  else if (event=="rename") { // si el fichero ha sido
    // cambiado de nombre o de lugar
    console.log(
      'el fichero ha cambiado de nombre o ha sido eliminado del directorio actual');
    process.exit(1);
  }
});


      
  }
});
/**
 * 
 */

