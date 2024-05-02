function readFile() {
    var fileInput = document.getElementById('fileInput');
    var outputTextarea = document.getElementById('outputTextarea');

    var file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(event) {
        var text = event.target.result;
        var words = text.split(/\s+/); // Split text into words
        outputTextarea.value = words.join('\n'); // Display words in textarea
    };
    reader.readAsText(file);
}

