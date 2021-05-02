import * as fs from 'fs';
/**
 * comprueba si se han introducido todos los argumentos
 */
if (process.argv.length < 4) {
  console.log('Faltan argumentos, se necesitan usuario y ruta del directorio');
  process.exit(-1);
}
const filename = process.argv[2];
/**
 * comprueba si se tienen acceso al fichero
 */
fs.access(filename, fs.constants.F_OK, (err) => {
  if (err) {
    console.log(`File ${filename} does not exist!`);
  } else {
    let x = 0; // varibale para sabe cuatos rename emite 1 rename crea o elimina, 2 cambia de nombre
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
