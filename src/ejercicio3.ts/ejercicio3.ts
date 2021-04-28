import * as fs from 'fs';
if (process.argv.length < 4) {
  console.log('Faltan argumentos, se necesitan usuario y ruta del directorio');
  process.exit(-1);
}
const filename = process.argv[2];
fs.access(filename, fs.constants.F_OK, (err) => {
  if (err) {
    console.log(`File ${filename} does not exist!`);
  } else {
    let x = 0; // varibale para sabe cuatos rename emite 1 rename crea o elimina, 2 cambia de nombre
   // const watcher = fs.watch(filename, {recursive: true});
    const watcher = fs.watch(filename);
    watcher.on('change', (event, file) => {
      if (event == "change") { // si cambia el contenido del fichero
        console.log(`se ha editado el fichero ${file}`);
      } else if (event == "rename") { // si el fichero ha sido
        x++;
        setTimeout(() => {
          if (x == 1) {
            fs.access(`${filename}/${file}`, fs.constants.F_OK, (err) => {
              if (err) {
                console.log(`nota ${file} eliminada`);
              } else {
                console.log(`nota ${file} añadida"`);
              }
            });
            x=0;
          } else {
            x=0;
            console.log("renombrado");
          }
        }, 1);
      }
    });
  }
});
/*
import * as fs from 'fs';

if (process.argv.length < 4) {
  console.log('At least, a file to watch and a command must be specified');
  process.exit(-1);
}

const filename = process.argv[2];

fs.access(filename, fs.constants.F_OK, (err) => {
  if (err) {
    console.log(`File ${filename} does not exist!`);
  } else {
    // Example when handled through fs.watch() listener
    fs.watch(filename, {encoding: 'buffer'}, (event, filename) => {
      console.log(event);
      if (filename) {
        console.log(filename.toString());
        // Prints: <Buffer ...>
      }
      else {console.log("se fue");}
    });
  }
});*/
