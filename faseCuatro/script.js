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
  const lines = divContent.split("\n");
  analisisSemantico(lines);
}

function verificarInstrucciones() {
  const originalContentDiv = document.getElementById("originalContent");
  const divContent = originalContentDiv.value;
  const lines = divContent.split("\n");
  let resultados = [];

  const nemonicos = [
    "MUL", "JNE", "POP", "JMP", "CMP", "SUB", "INC", "SHL", "AND", "CALL"
  ];
  
  const registros = [
    "EAX", "AX", "AH", "AL", "EBX", "BX", "BH", "BL", "ECX", "CX", "CH", "CL", "EDX", "DX", "DH", "DL", "ESI", "SI", "EDI", "DI", "EBP", "SP", "ESP", "BP"
  ];

  lines.forEach(line => {
    if (line.trim() === "" || line.trim().startsWith(";")) {
      return;
    }

    const tokens = line.trim().split(/\s+/);
    const mnem = tokens[0].toUpperCase();
    const ops = tokens.slice(1).join(" ").toUpperCase();
    let isValid = false;

    if (nemonicos.includes(mnem)) {
      isValid = true;
      const operandos = ops.split(",").map(op => op.trim());

      switch (mnem) {
        case "MUL":
          // MUL requires one register operand
          isValid = operandos.length === 1 && registros.includes(operandos[0]);
          break;
        case "JNE":
        case "JMP":
        case "CALL":
          // JNE, JMP, and CALL require one label operand (no comma)
          isValid = operandos.length === 1 && /^[a-zA-Z_]\w*$/.test(operandos[0]);
          break;
        case "POP":
          // POP requires one memory address or register operand
          isValid = operandos.length === 1 && (registros.includes(operandos[0]) || isNaN(parseInt(operandos[0])));
          break;
	case "CMP":
 	 // CMP requires first operand to be a register and second operand to be a register or immediate value
 	 isValid = operandos.length === 2 && registros.includes(operandos[0]) && (registros.includes(operandos[1]) || !isNaN(parseInt(operandos[1])));
 	 break;
        case "SUB":
          // SUB requires two distinct operands (registers)
          isValid = operandos.length === 2 && operandos[0] !== operandos[1] && registros.includes(operandos[0]) && registros.includes(operandos[1]);
          break;
	case "INC":
  	// INC requires one register operand
  	isValid = operandos.length === 1 && registros.includes(operandos[0]);
 	break;
	case "AND":
  	// AND requires one register operand and one register operand or immediate value operand
  	isValid = operandos.length === 2 && registros.includes(operandos[0]) && (registros.includes(operandos[1]) || !isNaN(parseInt(operandos[1])));
  	break;
	case "SHL":
  	// SHL requires one register operand and one immediate value operand (mayor que 1)
  	isValid = operandos.length === 2 && registros.includes(operandos[0]) && parseInt(operandos[1]) > 1;
 	 break;
        default:
          // This shouldn't happen, but handle unexpected mnemonics
          isValid = false;
          break;
      }
    }

    resultados.push({
      linea: line,
      validacion: isValid ? "Correcta" : "Incorrecta"
    });
  });

  crearTablaVerificacion(resultados);
}



function crearTablaVerificacion(resultados) {
  const divElement = document.getElementById('verificacionContent');
  divElement.innerHTML = "";

  const h4Element = document.createElement('h4');
  h4Element.textContent = 'Verificación de Instrucciones';
  h4Element.setAttribute("id", "titulo");
  divElement.appendChild(h4Element);

  const table = document.createElement('table');
  table.setAttribute("class","table table-hover");

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
    <th>Línea</th>
    <th>Verificación</th>`;
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  resultados.forEach(rowData => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${rowData.linea}</td>
      <td>${rowData.validacion}</td>
    `;
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  divElement.appendChild(table);
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
    "BYTE", "SBYTE", "WORD", "SDWORD", "SWORD", "DWORD", "FWORD", "QWORD", "TBYTE", "REAL4", "REAL8", "REAL10", "DB", "DW", "DD", "DQ", "DT"
  ];

  // Arrays para almacenar registros, variables y palabras reservadas
  const nemonicos = [
    "MOV", "ADD", "SUB", "CMP", "JMP", "JE", "JNE", "JG", "JL", "INC", "DEC", "LOOP", "MUL"
  ];
  const palabrasReservadas = [
    "FLAT", "STDCALL", "EXITPROCESS", "PROTO", "DWEXITCODE", "MAIN", "PROC", "ENDP", "END", "4096", "INVOKE", "?"
  ];
  let final = [];

  palabras.map((palabra) => {
    let aux = {};
    aux.palabra = palabra;
    if (registroRegExp.test(palabra)) {
      aux.tipo = "Registro";
    } else if (directivasRegExp.test(palabra)) {
      aux.tipo = "Directiva";
    } else if (palabrasReservadas.includes(palabra.toUpperCase())) {
      aux.tipo = "Palabra Reservada";
    } else if (tiposDatos.includes(palabra.toUpperCase())) {
      aux.tipo = "Tipo de Dato";
    } else if (nemonicos.includes(palabra.toUpperCase())) {
      aux.tipo = "Nemonico";
    } else if (constanteDecimal.test(palabra)) {
      aux.tipo = "Constante decimal";
    } else if (constanteHexadecimal.test(palabra)) {
      aux.tipo = "Constante hexadecimal";
    } else if (constanteOctales.test(palabra)) {
      aux.tipo = "Constante octal";
    } else if (variableRegExp.test(palabra)) {
      aux.tipo = "Variable o simbolo";
    }
    final.push(aux);
  });

  return final;
}

function crearTablaDesdeJSON(jsonData) {
  document.getElementById("tiposContent").innerHTML = "";
  const tabla = document.createElement("table");

  const cabecera = document.createElement("thead");
  const cabeceraFila = document.createElement("tr");

  const keys = Object.keys(jsonData[0]);

  keys.forEach((key) => {
    const celdaCabecera = document.createElement("th");
    celdaCabecera.textContent = key;
    cabeceraFila.appendChild(celdaCabecera);
  });

  cabecera.appendChild(cabeceraFila);
  tabla.appendChild(cabecera);

  const cuerpoTabla = document.createElement("tbody");

  jsonData.forEach((item) => {
    const fila = document.createElement("tr");

    keys.forEach((key) => {
      const celda = document.createElement("td");
      celda.textContent = item[key];
      fila.appendChild(celda);
    });

    cuerpoTabla.appendChild(fila);
  });

  tabla.appendChild(cuerpoTabla);

  tabla.width = "100%";
  tabla.style.borderCollapse = "collapse";
  tabla.style.border = "1px solid #fbf6f600";

  const contenedorTabla = document.getElementById("tiposContent");
  contenedorTabla.appendChild(tabla);
}

function analisisSemantico(lines) {
  const expresionRegular = /\.data segment|ends|.stack segment/i;
  const variableRegExp = /\b([a-zA-Z_]\w*)\b/;
  const constanteDecimal = /^\d+d?$/i;
  const constanteHexadecimal = /^\d+h?$/i;
  const constanteOctales = /^\d+[q|o]?$/i;
  const constantebinario = /^\d+b?$/i;
  const tiposDatos = [
    "BYTE", "SBYTE", "WORD", "SDWORD", "SDWORD", "FWORD", "QWORD", "TBYTE", "REAL4", "REAL8", "REAL10", "DB", "DW", "DD", "DQ", "DT"
  ];
  let constantes = /^(\d+[bho]?|[0-9a-fA-F]+[h])(,(\d+[bho]?|[0-9a-fA-F]+[h]))*$/;

  let analisis = [];
  let par = 0;
  lines.forEach(function (line) {
    if (expresionRegular.test(line) && line.length !== 0) {
      if (line === "ends" && par === 0) {
        par = 1;
        analisis.push(line);
      } else if (par === 1 && line === ".stack segment") {
        par = 0;
        analisis.push(line);
      } else if (line === ".data segment") {
        analisis.push(line);
      }
    } else if (par === 0) {
      analisis.push(line);
    }
  });

  let final = [];
  analisis.map(item => {
    let aux = {};
    if (item !== "" && item.trim()[0] !== ";" && item !== "  ") {
      if (expresionRegular.test(item.trim())) {
        aux.linea = item;
        aux.validacion = "Correcta";
        aux.simbolo = "-";
        aux.tipo = "-";
        final.push(aux);
      } else {
        aux.linea = item;
        let pal = item.trim();
        let palabras = pal.split(/[;]+/);
        let estruc = palabras[0].split(/[\s]+/);

        for (let index = 0; index < 3; index++) {
          let valida = false;
          aux.simbolo = estruc[0];

          if (variableRegExp.test(estruc[0]) || tiposDatos.includes(estruc[0].toUpperCase())) {
            if (tiposDatos.includes(estruc[0].toUpperCase())) {
              aux.tipo = "-";
            } else {
              aux.tipo = "variable";
            }
            if (tiposDatos.includes(estruc[1].toUpperCase()) || constanteDecimal.test(estruc[1])) {
              if (estruc[1].toUpperCase() !== "DB" && estruc[1].toUpperCase() !== "DW" && estruc[1].toUpperCase() !== "DD" && estruc[1].toUpperCase() !== "DQ" && estruc[1].toUpperCase() !== "DT") {
                aux.tamanio = estruc[1];
              } else {
                if (estruc[1].toUpperCase() === "DB") aux.tamanio = "BYTE";
                if (estruc[1].toUpperCase() === "DW") aux.tamanio = "WORD";
                if (estruc[1].toUpperCase() === "DD") aux.tamanio = "DWORD";
                if (estruc[1].toUpperCase() === "DQ") aux.tamanio = "QWORD";
                if (estruc[1].toUpperCase() === "DT") aux.tamanio = "TBYTE";
              }
              if (constantes.test(estruc[2]) || estruc[2] == "?" || estruc[2] == "dup(0)" || estruc[2] == "dup(?)") {
                if (estruc[2] == "dup(0)" || estruc[2] == "dup(?)") {
                  aux.valor = "-";
                } else {
                  aux.valor = estruc[2];
                }
                valida = true;
              }
            }
          }
          if (valida) {
            aux.validacion = "Correcta";
          } else {
            aux.validacion = "Incorrecta";
          }
        }
        final.push(aux);
      }
    }
  });

  document.getElementById("semantiContent").innerHTML = "";
  document.getElementById("semantiContent1").innerHTML = "";

  const divElement = document.getElementById('semantiContent');
  const h4Element = document.createElement('h4');
  h4Element.textContent = 'Análisis';
  h4Element.setAttribute("id", "titulo");
  divElement.appendChild(h4Element);

  const table = document.createElement('table');
  table.setAttribute("class","table table-hover");

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
    <th>Línea</th>
    <th>Verificación</th>`;
  thead.appendChild(headerRow);
  table.appendChild(thead);

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
  divElement.appendChild(table);

  const divElement2 = document.getElementById('semantiContent1');
  const h4Element2 = document.createElement('h4');
  h4Element2.textContent = 'Tabla de Simbolos';
  h4Element2.setAttribute("id", "titulo");
  divElement2.appendChild(h4Element2);

  const table1 = document.createElement('table');
  table1.setAttribute("class","table table-hover");
  const thead1 = document.createElement('thead');
  const headerRow1 = document.createElement('tr');
  headerRow1.innerHTML = `
    <th>Símbolo</th>
    <th>Tipo</th>
    <th>Valor</th>
    <th>Tamaño</th>`;
  thead1.appendChild(headerRow1);
  table1.appendChild(thead1);

  const tbody1 = document.createElement('tbody');
  final.forEach(rowData => {
    if (rowData.tipo !== "-" && rowData.valor !== undefined) {
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
  divElement2.appendChild(table1);
}
