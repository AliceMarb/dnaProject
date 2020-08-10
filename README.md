### Kern Systems Applicant String to DNA code 

## Codec
Contains two folders, encoding and decoding. 
In encode.py, two functions have been added to the original codebase: get_letter_frequency and get_encoding.

1) get_letter_frequency generates a dictionary with keys representing DNA letters and values representing
the number of times that letter appears in given DNA templates. This dictionary is called by main and 
used on the frontend to display a bar chart of letter frequencies.
2) get_encoding is a wrapper function that takes a string and returns the DNA templates as a string
separated by commas, as well as the letter frequency dictionary.

decode.py contains the functions to convert comma-separated (no space) DNA templates to the decoded string. To differentiate with encode.py, functions are named with the input value as well, e.g. get_packet_from_template and get_char_from_packet.

## Flask app (main.py)
Defines one route, the root. Strings to convert are sent by POST request. If the button pressed is DNA to string, a different template, stringOutput.html, is rendered. If string to DNA is pressed, dnaOutput.html
is rendered. The input string, the output string, and for string to DNA, the letter dictionary, are passed to the template as arguments. By default, template.html is rendered, which contains the title and the input boxes and buttons. The other templates inherit from template.html. 

## Frontend
The two buttons (DNA to string, and string to DNA), are part of a form element, and are input elements with type "submit". Whenever a button is pressed, a post request is sent to the app (backend), and the page re-renders with another template. Arguments passed to the frontend in render_template are accessed using Jinja curly brackets, e.g. {{word}}. dnaOutput.html uses d3 to display a bar chart for the letter frequency dictionary, which is written {{ letter_dict | safe}} to avoid malicious user input.

## To note: 
Make sure to input DNA with no spaces.