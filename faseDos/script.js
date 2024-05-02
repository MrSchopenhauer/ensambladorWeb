function readFile() {
    var fileInput = document.getElementById('fileInput');
    var lectura = document.getElementById('lectura');

    var file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(event) {
        var text = event.target.result;
	lectura.value = text;
    };
    reader.readAsText(file);
}

function splitContent() {
    var lectura = document.getElementById('lectura');
    var analizado = document.getElementById('analizado');
    const separatedContentDiv = document.getElementById('analizado');
    const palabrasFinales = [];
    separatedContentDiv.innerHTML = "";

    var contenidoSinComentarios = lectura.value.replace(/;.*/g, ''); // Eliminar comentarios
    const words = contenidoSinComentarios.split(/[\s\n,:]+/); // Split content into words

    words.map((item) => {
        separatedContentDiv.innerHTML += item + "<br>";
        if (item !== "") {
            palabrasFinales.push(item);
        }
    });
    analizado.value = words.join('\n');
    const resultados = identificarPalabrasEnsamblador(palabrasFinales);
    crearTablaDesdeJSON(resultados);
}


function identificarPalabrasEnsamblador(palabras) {
  // Expresiones regulares para identificar registros y variables
  const registroRegExp = /\b(EAX|AX|AH|AL|EBX|BX|BH|BL|ECX|CX|CH|CL|EDX|DX|DH|DL|ESI|SI|EDI|DI|EBP|SP|ESP|BP|CS|SS|DS|ES|FS|GS)\b/i;
  const variableRegExp = /\b([a-zA-Z_]\w*)\b/;
  const directivasRegExp = /\.\w+/;
  const constanteDecimal = /^\d+d?$/i;
  const constanteHexadecimal = /^\d+h?$/i;
  const constanteOctales = /^\d+[q|o]?$/i;
  const constantebinario = /^\d+b?$/i;
  const tiposDatos = [
    "BYTE",
    "SBYTE",
    "WORD",
    "SDWORD",
    "SWORD",
    "DWORD",
    "FWORD",
    "QWORD",
    "TBYTE",
    "REAL4",
    "REAL8",
    "REAL10",
    "DB",
    "DW",
    "DD",
    "DQ",
    "DT",
  ];

  // Arrays para almacenar registros, variables y palabras reservadas
  const nemonicos = [
    "MOV",
    "ADD",
    "SUB",
    "CMP",
    "JMP",
    "JE",
    "JNE",
    "JG",
    "JL",
    "INC",
    "DEC",
    "LOOP",
  ];
  const palabrasReservadas = [
    "FLAT",
    "STDCALL",
    "EXITPROCESS",
    "PROTO",
    "DWEXITCODE",
    "MAIN",
    "PROC",
    "ENDP",
    "END",
    "4096",
    "INVOKE",
    "?",
  ];
  let final = [];

  // Procesa palabra por palabra
  palabras.map((palabra) => {
    let aux = {};
    aux.palabra = palabra;
    // Identifica registros
    if (registroRegExp.test(palabra)) {
      aux.tipo = "Registro";
    } else {
      if (directivasRegExp.test(palabra)) {
        aux.tipo = "Directiva";
      } else {
        if (palabrasReservadas.includes(palabra.toUpperCase())) {
          aux.tipo = "Palabra Reservada";
        } else {
          if (tiposDatos.includes(palabra.toUpperCase())) {
            aux.tipo = "Tipo de Dato";
          } else {
            if (nemonicos.includes(palabra.toUpperCase())) {
              aux.tipo = "Nemonico";
            } else {
              if (constanteDecimal.test(palabra)) {
                aux.tipo = "Constante decimal";
              } else {
                if (constanteHexadecimal.test(palabra)) {
                  aux.tipo = "Constante hexadecimal";
                } else {
                  if (constanteOctales.test(palabra)) {
                    aux.tipo = "Constante octal";
                  } else {
                    if (variableRegExp.test(palabra)) {
                      aux.tipo = "Variable o simbolo";
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    final.push(aux);
  });

  //console.log(final);
  // Devuelve los resultados
  return final;
}

// Función para crear la tabla desde el JSON
function crearTablaDesdeJSON(jsonData) {
  document.getElementById("tiposContent").innerHTML = "";
  // Crear la tabla
  const tabla = document.createElement("table");

  // Crear la cabecera
  const cabecera = document.createElement("thead");
  const cabeceraFila = document.createElement("tr");

  // Obtener las claves (nombres de las propiedades) del primer objeto del JSON
  const keys = Object.keys(jsonData[0]);

  // Crear celdas de cabecera con los nombres de las propiedades
  keys.forEach((key) => {
    const celdaCabecera = document.createElement("th");
    celdaCabecera.textContent = key;
    cabeceraFila.appendChild(celdaCabecera);
  });

  // Agregar la fila de cabecera al thead
  cabecera.appendChild(cabeceraFila);

  // Agregar el thead a la tabla
  tabla.appendChild(cabecera);

  // Crear el cuerpo de la tabla (tbody)
  const cuerpoTabla = document.createElement("tbody");

  // Iterar sobre los elementos del JSON para crear filas y celdas
  jsonData.forEach((item) => {
    const fila = document.createElement("tr");

    keys.forEach((key) => {
      const celda = document.createElement("td");
      celda.textContent = item[key];
      fila.appendChild(celda);
    });

    cuerpoTabla.appendChild(fila);
  });

  // Agregar el tbody a la tabla
  tabla.appendChild(cuerpoTabla);

  // Agregar estilos a la tabla (opcional)
  tabla.width = "100%";
  tabla.style.borderCollapse = "collapse";
  tabla.style.border = "1px solid black";

  // Agregar la tabla al div con id "tablaContainer"
  const contenedorTabla = document.getElementById("tiposContent");
  contenedorTabla.appendChild(tabla);
}
