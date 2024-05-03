var palabrasFinales = [];

function readFile() {
    var fileInput = document.getElementById('fileInput');
    var originalContent = document.getElementById('originalContent');

    var file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(event) {
        var text = event.target.result;
        originalContent.value = text;
    };
    reader.readAsText(file);
}

function splitContent() {
    var lectura = document.getElementById('originalContent');
    var analizado = document.getElementById('analizado');

    var content = lectura.value;
    var lines = content.split('\n');
    var words = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.trim().startsWith(';')) {
            // Ignore comments starting with ';'
            continue;
        }
        var tokens = line.split(/[ ;]/); // Split line into words
        for (var j = 0; j < tokens.length; j++) {
            var token = tokens[j].trim();
            if (token && token !== '.') {
                words.push(token);
            } else {
                break; // Stop processing line after encountering '.'
            }
        }
    }

    analizado.value = words.join('\n');
}





function analizarFile() {
  palabrasFinales = [];
  const separatedContentDiv = document.getElementById("separatedContent");
  const originalContentDiv = document.getElementById("originalContent").innerHTML;
  const lines = originalContentDiv.split("\n");
  separatedContentDiv.innerHTML = "";

  let contenidoSinComentarios = "";
  lines.forEach(function (line) {
    if (line[0] !== ";" && line !== "<br>" && line !== "<br> ") {
      let aux = line.replace(new RegExp("<br>", "g"), " ");
      aux = aux.replace(new RegExp("<div>", "g"), " ");
      aux = aux.replace(new RegExp("</div>", "g"), " ");
      contenidoSinComentarios += aux;
    }
  });
}


function analizarFile2(){
  const originalContentDiv = document.getElementById("originalContent");
  const divContent = originalContentDiv.value;
  //console.log(divContent)
  const lines = divContent.split("\n")//split(/[<br></br><div></div>]+/);//;
  //console.log(lines)
  analisisSemantico(lines)
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
  tabla.style.border = "1px solid #fbf6f600";

  // Agregar la tabla al div con id "tablaContainer"
  const contenedorTabla = document.getElementById("tiposContent");
  contenedorTabla.appendChild(tabla);
}


function analisisSemantico(lines) {
  const expresionRegular = /\.data segment |ends|.stack segment /i;
  const variableRegExp = /\b([a-zA-Z_]\w*)\b/;
  const constanteDecimal = /^\d+d?$/i;
  const constanteHexadecimal = /^\d+h?$/i;
  const constanteOctales = /^\d+[q|o]?$/i;
  const constantebinario = /^\d+b?$/i;
  const tiposDatos = [
    "BYTE",
    "SBYTE",
    "WORD",
    "SDWORD",
    "SDWORD",
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
  let constantes = /^(\d+[bho]?|[0-9a-fA-F]+[h])(,(\d+[bho]?|[0-9a-fA-F]+[h]))*$/;



  let analisis = []
  let par = 0;
  lines.forEach(function (line) {
    //console.log(line)
    if (expresionRegular.test(line) && line.length !== 0) {
      if (line === "ends" && par === 0) {
        par = 1;
        // console.log(line)
        analisis.push(line)
      } else {
        if (par === 1 && line === ".stack segment") {
          par = 0;
          // console.log(line)
          analisis.push(line)
        } else {
          if (line === ".data segment") {
            analisis.push(line)
          }
        }
      }
    } else {
      if (par === 0) {
        analisis.push(line)
        //console.log(line)
      }
    }
  });

  //console.log(analisis)
  let final = []
  analisis.map(item => {
    let aux = {}
    if (item !== "" && item.trim()[0] !== ";" && item !== "  ") {
      if (expresionRegular.test(item.trim())) {
        aux.linea = item;
        aux.validacion = "Correcta"
        analisis.simbolo = "-"
        aux.tipo = "-"
        final.push(aux)
      } else {
        aux.linea = item;
        let pal = item.trim();
        //console.log(pal)
        palabras = pal.split(/[;]+/)
        let estruc = palabras[0].split(/[\s]+/);
        //console.log(estruc)

        for (let index = 0; index < 3; index++) {
          let valida = false;
          aux.simbolo = estruc[0]


          if (variableRegExp.test(estruc[0]) || tiposDatos.includes(estruc[0].toUpperCase())) {
            if (tiposDatos.includes(estruc[0].toUpperCase())) {
              aux.tipo = "-"
            } else {
              aux.tipo = "variable"
            }
            if (tiposDatos.includes(estruc[1].toUpperCase()) || constanteDecimal.test(estruc[1])) {
              if (estruc[1].toUpperCase() !== "db".toUpperCase() && estruc[1].toUpperCase() !== "dw".toUpperCase() && estruc[1].toUpperCase() !== "dd".toUpperCase() && estruc[1].toUpperCase() !== "dq".toUpperCase() && estruc[1].toUpperCase() !== "dt".toUpperCase()) {
                aux.tamanio = estruc[1]
              } else {
                if (estruc[1].toUpperCase() === "db".toUpperCase()) {
                  aux.tamanio = "BYTE"
                }
                if (estruc[1].toUpperCase() === "dw".toUpperCase()) {
                  aux.tamanio = "WORD"
                }
                if (estruc[1].toUpperCase() === "dd".toUpperCase()) {
                  aux.tamanio = "DWORD"
                }
                if (estruc[1].toUpperCase() === "dq".toUpperCase()) {
                  aux.tamanio = "QWORD"
                }
                if (estruc[1].toUpperCase() === "dt".toUpperCase()) {
                  aux.tamanio = "TBYTE"
                }

              }
              if (constantes.test(estruc[2]) || estruc[2] == "?" || estruc[2] == "dup(0)" || estruc[2] == "dup(?)") {
                if (estruc[2] == "dup(0)" || estruc[2] == "dup(?)") {
                  aux.valor = "-"
                } else {
                  aux.valor = estruc[2]
                }
                valida = true
              }

            }
          }
          if (valida) {
            aux.validacion = "Correcta"
          } else {
            aux.validacion = "Incorrecta"
          }
        }

        final.push(aux)
      }

    }
  })
  //console.table(final)

  document.getElementById("semantiContent").innerHTML = ""
  document.getElementById("semantiContent1").innerHTML = ""

  const divElement = document.getElementById('semantiContent');

  // Create h4 element

  const h4Element = document.createElement('h4');
  h4Element.textContent = 'Análisis';
  h4Element.setAttribute("id", "titulo")
  // Append h4 element to div
  divElement.appendChild(h4Element);
  // Create table element
  const table = document.createElement('table');
  table.setAttribute("class","table table-hover")
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
  <th>Línea</th>
  <th>Verificación</th>`;
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');
  final.forEach(rowData => {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td>${rowData.linea}</td>
    <td>${rowData.validacion}</td>
  `;
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  // Append table to div
  divElement.appendChild(table);

  //tabla de simbolos
  const divElement2 = document.getElementById('semantiContent1');
  const h4Element2 = document.createElement('h4');
  h4Element2.textContent = 'Tabla de Simbolos';
  h4Element2.setAttribute("id", "titulo")
  divElement2.appendChild(h4Element2);

  const table1 = document.createElement('table');
  table1.setAttribute("class","table table-hover")  // Create table header
  const thead1 = document.createElement('thead');
  const headerRow1 = document.createElement('tr');
  headerRow1.innerHTML = `
  <th>Símbolo</th>
  <th>Tipo</th>
  <th>Valor</th>
  <th>Tamaño</th>`;
  thead1.appendChild(headerRow1);
  table1.appendChild(thead1);

  // Create table body
  const tbody1 = document.createElement('tbody');
  final.forEach(rowData => {
    if (rowData.tipo !== "-" && rowData.valor!==undefined) {
      const row = document.createElement('tr');
      row.innerHTML = `
      <td>${rowData.simbolo}</td>
      <td>${rowData.tipo}</td>
      <td>${rowData.valor}</td>
      <td>${rowData.tamanio}</td>
    `;
      tbody1.appendChild(row);
    }
  });
  table1.appendChild(tbody1);
  // Append table to div
  divElement2.appendChild(table1);




}
