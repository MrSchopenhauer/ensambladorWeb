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

