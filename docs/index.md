# Práctica 9 - Sistema de ficheros y creación de procesos en Node.js
## Introducción
En esta práctica haremos diferentes ejercicios para prácticar el uso de las APIs que proporciona Node.js para interactuar con el sistema de ficheros.También trabajeremos con  la creación de procesos. La [explicacion](https://ull-esit-inf-dsi-2021.github.io/prct08-filesystem-notes-app/) de los ejercicios se explicarán a continuación.
### Ejercicio 1
#### Traza
Primer caso: Los argumentos pasados son distintos de tres por lo que no se introduce un fichero.
Lo unico que se ejecutaría es el console.log de ese if.
Segundo caso: al programa le pasan un fichero que existe.
El método acces pasa a la pila de llamadas. Después se manda a la Web Api. Lo siguiente que hará es mandar la callback a la cola. No hay nada en la pila de llamadas por lo que entra la callback y se evalua los if de error. Si es un error ahi se termina el programa, en caso de que no, pasa watcher a la pila de llamadas . Watcher pasa a la web Api esperando que se emita algun evento. Cuando esto ocurra es mandada a la cola y como no hay nada más en la pila de llamada se evalua si es un evento change o rename. Si es change se imprime que el fichero ha sido modificado y en otro caso imprime que el fichero a dejado de observarse.
Asi susecivamente hasta que se deje de emitir eventos o se emite un rename con lo que acabaría el programa.
#### Qué hace la función access? ¿Para qué sirve el objeto constants?
La función access comprueba que tipo de acceso sobre el fichero. El tipo se comprueba utilisando las distintas constantes:
W_OK: Comprueba si un fichero puede ser escrito
F_OK: Comprueba si el fichero existe. Pero no comprueba sus permisos
X_OK: Comprueba si un fichero puede ser ejecutado
R_OK: Comprueba si el fichero puede ser leído
### Ejercicio 2 in hacer uso del método pipe
~~~
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
    let output = '';
    ls.stdout.on('data', (chunk) => (output += chunk));
    let outputError = '';
    ls.stderr.on('data', (chunk) => (outputError += chunk));
    ls.on('close', (code) => {
      if (code) {
        console.log(`Command ${command} exited with code ${code}`);
        if (outputError) {
          console.log(outputError);
        }
        process.exit(code);
      }
      console.log(output);
    });
  }
});
~~~
Lo primero que hemos realizado es comprobar que se introduce un comando al ejecutar el programa.Los segundo es comprobar que el programa recibe el comando **wc**  y las opciones soportadas por el programa ya que para la funcionalidad que pide necesitamos solo esas opciones y no otras. Por ultimo comprobamos que el fichero pasado al programa existe. Si es así ejecutaremos el comando con la opcion pasada con spawn y mostraremos la salida de este. En caso de que tenga un error como salida imprimimos el error por consola, en caso contrario imprimos la salida exitosa del comando.
### ¿qué sucede si indica desde la línea de comandos un fichero que no existe o una opción no válida?
Si el fichero no existe salta un error indicando que el fichero no exite. Esto se comprueba con **fs.access**. Si se introduce una opción no válida sale un mensaje por pantalla indicando las opciones que soporta el programa. Si introduce un comando que no es **wc**, sale por pantalla que el comando que utiliza el programa es el wc.Todo esto se comprueba en las lineas antes del **fs.access**.
### Ejercicio 2 haciendo uso del método pipe
~~~
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
~~~
Hacemos lo mismo pero en vez de guardar elo resultado en un string lo lanzamos por la salida estandar gracias a pipe. Antes de esto se comprueba si el comanod se ejecuta correctamente con **ls.on('error)**.
### Ejercicio 3
~~~
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
~~~
Lo primero que hacemos es comprobar si se pasan todos los argumentos.
Después comprobamos que la ruta pasada existe. En caso de que exista Declaramos una variable x que se utilizará como flag para saber si se crea, renombre o borra algo de la ruta.
Con watch controlamos los cambios. Este emite un evento: rename en caso de que un fichero cambie de nombre, se elimine o se cree y change que se emite cuando un fichero se modifica.
Si se emite change mostramos por consola que el fichero ha cambiado. 
1. Si se emite rename aumentamos la **x** en 1 y retrasamos  la evaluación con **settime** para ver si es un renombramiento de un documento o una creación o eliminación de fichero. Una vez que ha pasado el tiempo si hubiese otro rename se sumaría otra **x** , por lo que el fichero se ha renombrado
2. Si no se emite ningun evento rename más quiere decir que se ha creado o eliminado un fichero, esto lo distinguimos con fs.acces. Si hay un error quiere decir que no existe por lo que se ha eliminado, en caso contrario es que se ha creado un fichero.
Al final esta comprobacion se pone la x  otra vez a 0
#### ¿Cómo haría para mostrar, no solo el nombre, sino también el contenido del fichero, en el caso de que haya sido creado o modificado?
Si nos fijamos, watch además de el evento name y change, emite el nombre del fichero que produjo el evento anterior por lo que con la ruta que hemos pasado y añadiendole ese fichero, con un con comando cat podriamos imprimir el contenido del fichero.
#### ¿Cómo haría para que no solo se observase el directorio de un único usuario sino todos los directorios correspondientes a los diferentes usuarios de la aplicación de notas?
Si pedimos la ruta por argumento tendria que recibir la del directorio notas aunque no haría falta pedirla ya que si quieres observar los cambios de las notas de todos los usuarios solo hay una ruta. Para ello utilizria wath con la opcion recursive, es decir que mire dentro de los directiorios del directorio **fs.watch(filename, {recursive: true});**
### Ejercicio 4
Para este ejercico utilizamos yargs. La explicación se divirá por los apartados que se va pidiendo
#### Dada una ruta concreta, mostrar si es un directorio o un fichero.
~~~
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
~~~
Tenemos un comando info al que se le pasa una ruta. Con fs.stat miramos si se puede acceder ala ruta pasada. EN caso de que no imprimimos por consola fallo al leer. en otro caso fs.stat emite un objeto stat que podemos usar un método isDirectory() que devuelve true en caso de ser un directorio. Con eso comprobamos si es true, en este caso imprimimos que la ruta corresponde a un directorio y en otro caso pues imprimimos que no lo es.
#### Crear un nuevo directorio a partir de una nueva ruta que recibe como parámetro.
~~~
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
                console.log("fallo al crear el directorio");
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
~~~
El comando recibe como argumentos la ruta en la que se desea crear el directorio y el nombre que este va a tener. Comprobamos si la ruta que se ha pasado corresponde a un directorio como en el anterior ejercicio. En caso de que no sea un directorio imprimimos que la ruta pasada es un fichero, ya que dentro de un dichero no puedes crear un directorio. En otro caso creamos el directorio controlando los errores. ya que si emite err quiere decir que hubo un fallo. En otro caso el directorio se crea e imprimios por pantalla que se ha creado

#### Listar los ficheros dentro de un directorio.
~~~
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
~~~
El comando ls recibe como argumento la ruta.
Primero comprobamos que la ruta existe, en caso de que no imprimimos que la  ruta no existe.
En caso de que sí, ejecutamos el comando ls en esa ruta e imprimimos el resultado ppor consola.
#### Mostrar el contenido de un fichero (similar a ejecutar el comando cat).
~~~
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
~~~
Este comando recibe como argumento la ruta del fichero que se quiere leer el contenido.
Lo primero que se hace es comprobar si la ruta es un directorio, en cuyo caso imprimimos que es un directorio. En otro caso ejecutamos el comando cat sobre la ruta que nos han pasado e imprimimos por pantalla el resultado.
#### Borrar ficheros y directorios.
~~~
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
~~~
Este comando recibe como argumento la ruta del fichero ó directorio  que se quiere borrar y la opción que va a utilizar.
En caso de que sea un directorio tiene que usar la opcion -R y en caso de que sea un fichero -r
Si es un directorio en el fs.rm hay que actrivar recursive a true para que borre todo lo que contenga ese directorio en caso contrario   se utilizara recursive a false. Los errores los controlamos con el evento err. En caso de que emita este evento es muy probable que la ruta no exista por lo que lo indicamos con mensaje por pantalla.
#### Mover y copiar ficheros y/o directorios de una ruta a otra.
Este apartado lo he dividido en dos comandos, uno para copiar y otro para mover.
##### Mover
~~~
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
~~~
Este comando recibe como argumento la ruta del fichero que se quiere mover y a la ruta a la que se quiere mover.
Para ello utilizamos el comando mv y comprobamos que el comando se ejecute correctamente. En caso de no hacerlo imprimimos el error po pantalla en otro caso imprimmos que se ha hecho de manera exitosa
##### Copiar
~~~
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
~~~
Este comando lo utilizamos igual que el anterior pero con la diferencia que comprobamos si la ruta pasada es un directorio o no. Si es un directorio se utiliza el comando cp con la opcion -R y en otro caso pues se utiliza sin ninguna opcion.

## Conclusión
Una vez que vas entendiendo los eventos te resulta mucho más fácil interactuar con todas las herramientas que te ofrece la APPi de node por lo que he resuelto los ejercicios con relativa facilidad. Uno de los ejercicios que más me ha costado ha sido el primero que aunque entienda el concepto me cuesta ver la traza ya que me genera muchas dudas que elemento se ejecuta y cual pasa en espera. Espero ir entiendo mejor el proceso de ejecución para en un futuro poder resolver fallos que seguramente me enfrentaré a la hora de programar.


