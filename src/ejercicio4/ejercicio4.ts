/*Desarrolle una aplicación que permita hacer de wrapper de los distintos comandos empleados en Linux para el manejo de ficheros y directorios. En concreto, la aplicación deberá permitir:

    **Dada una ruta concreta, mostrar si es un directorio o un fichero.
    **Crear un nuevo directorio a partir de una nueva ruta que recibe como parámetro.
    **Listar los ficheros dentro de un directorio.
    **Mostrar el contenido de un fichero (similar a ejecutar el comando cat).
    **Borrar ficheros y directorios.
    Mover y copiar ficheros y/o directorios de una ruta a otra. Para este caso, la aplicación recibirá una ruta origen y una ruta destino. En caso de que la ruta origen represente un directorio, 
    se debe copiar dicho directorio y todo su contenido a la ruta destino.*/
import * as fs from 'fs';
import { spawn } from 'child_process';
////const command = process.argv[3];
//const commandOptions = process.argv.splice(4);
import * as yargs from 'yargs';

yargs.command({
  command: 'info',
  describe: 'información sobre la ruta dada',
  builder: {
    ruta: {
      describe: 'ruta',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      fs.stat(argv.ruta, (err, stat) => {
        if (err) {
          console.log("fallo al leer");
        } else {
          if (stat.isDirectory()) {
            console.log("la ruta corresponde a un directorio");
          } else {
            console.log("la ruta corresponde a un fichero");
          }
        }
      });
    } else {
      console.log("la ruta pasada no es de tipo string");
    }
  },
});
yargs.command({
  command: 'mkdir',
  describe: 'crea directorio en la ruta',
  builder: {
    ruta: {
      describe: 'ruta',
      demandOption: true,
      type: 'string',
    },
    directory: {
      describe: 'directory',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string' && typeof argv.directory === 'string') {
      const ruta = argv.ruta + "/" + argv.directory;
      fs.stat(argv.ruta, (err, stat) => {
        if (err) {
          console.log("fallo al leer");
        } else {
          if (stat.isDirectory()) {
            fs.mkdir(ruta, (err) => {
              if (err) {
                console.log("ffallo al crear el directorio");
              } else {
                console.log("directoiro creado");
              }
            });
          } else {
            console.log("la ruta corresponde a un fichero");
          }
        }
      });
    } else {
      console.log("la ruta pasada no es de tipo string");
    }
  },
});
yargs.command({
  command: 'rm',
  describe: 'elimina directorio o fichero',
  builder: {
    ruta: {
      describe: 'ruta',
      demandOption: true,
      type: 'string',
    },
    opcion: {
      describe: 'opcion',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string' && argv.opcion == "R") {
      fs.rm(argv.ruta, { recursive: true }, (err) => {
        if (err) {
          console.log("error al eliminar, compruebe que la ruta existe");
        } else {
          console.log("eliminado con exito");
        }
      });
    } else if (typeof argv.ruta === 'string' && argv.opcion == "r") {
      fs.rm(argv.ruta, { recursive: false }, (err) => {
        if (err) {
          console.log("error al eliminar, compruebe que la ruta existe");
        } else {
          console.log("eliminado con exito");
        }
      });
    } else {
      console.log("opciones permitidas R:directorios, r:ficheros");
    }
  },
});
yargs.command({
  command: 'ls',
  describe: 'lista las notas del usuario',
  builder: {
    ruta: {
      describe: 'ruta',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      const ruta = argv.ruta;
      fs.access(ruta, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`File ${ruta} does not exist!`);
        } else {
          const ls = spawn("ls", [ruta]);
          ls.stdout.pipe(process.stdout);
        }
      });
    }
  },
});

yargs.command({
  command: 'cat',
  describe: 'mostar contenido de un fichero',
  builder: {
    ruta: {
      describe: 'ruta',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      const ruta = argv.ruta;
      fs.stat(ruta, (err, stat) => {
        if (err) {
          console.log("fallo al leer");
        } else {
          if (stat.isDirectory()) {
            console.log("la ruta corresponde a un directorio");
          } else {
            const cat = spawn("cat", [ruta]);
            cat.stdout.pipe(process.stdout);
          }
        }
      });
    } else {
      console.log("la ruta pasada no es de tipo string");
    }
  },
});
yargs.command({
  command: 'cp',
  describe: 'mostar contenido de un fichero',
  builder: {
    origen: {
      describe: 'origen',
      demandOption: true,
      type: 'string',
    },
    destino: {
      describe: 'destino',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.origen === 'string' && typeof argv.destino === 'string') {
      const origen = argv.origen;
      const destino = argv.destino;

      fs.stat(origen, (err, stat) => {
        if (err) {
          console.log("fallo, compruebe que existe la ruta");
        } else {
          if (stat.isDirectory()) {
            const cp = spawn("cp", ["-R", origen, destino]);
            let outputError = '';
            cp.stderr.on('data', (chunk) => (outputError += chunk));
            if (outputError) {
              console.log(outputError);
            } else {
              cp.stdout.pipe(process.stdout);
            }
          } else {
            const cp = spawn("cp", [origen, destino]);
            let outputError = '';
            cp.stderr.on('data', (chunk) => (outputError += chunk));
            if (outputError) {
              console.log(outputError);
            } else {
              cp.stdout.pipe(process.stdout);
            }
          }
        }
      });
    } else {
      console.log("la ruta pasada no es de tipo string");
    }
  },
});
yargs.command({
  command: 'mv',
  describe: 'mostar contenido de un fichero',
  builder: {
    origen: {
      describe: 'origen',
      demandOption: true,
      type: 'string',
    },
    destino: {
      describe: 'destino',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.origen === 'string' && typeof argv.destino === 'string') {
      const origen = argv.origen;
      const destino = argv.destino;
      const cp = spawn("mv", [origen, destino]);
      let outputError = '';
      cp.stderr.on('data', (chunk) => (outputError += chunk));
      if (outputError) {
        console.log(outputError);
      } else {
        cp.stdout.pipe(process.stdout);
      }
    } else {
      console.log("la ruta pasada no es de tipo string");
    }
  },
});
yargs.parse();

/*
fs.access(filename, fs.constants.F_OK, (err) => {
  if (err) {
    console.log(`File ${filename} does not exist!`);
  } else {
    const watcher = fs.watch(filename);

    watcher.on('change', (eventType) => {
      switch (eventType) {
        case 'rename':
          console.log(`Watched file ${filename} has been moved or deleted`);
          process.exit(-1);
        case 'change':
          const cmd = spawn(command, [...commandOptions, filename]);

          cmd.on('error', () => {
            console.log(`Command ${command} could not be executed`);
            process.exit(-1);
          });

          let output = '';
          cmd.stdout.on('data', (chunk) => (output += chunk));

          let outputError = '';
          cmd.stderr.on('data', (chunk) => (outputError += chunk));

          cmd.on('close', (code) => {
            if (code) {
              console.log(`Command ${command} exited with code ${code}`);
              if (outputError) {
                console.log(outputError);
              }
              process.exit(code);
            }
            console.log(output);
          });
          break;
      }
    });
  }
});*/