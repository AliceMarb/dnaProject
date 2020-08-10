from flask import Flask, render_template, request, redirect, url_for
from codec.encoding import encode
from codec.decoding import decode


app = Flask(__name__)

@app.route("/", methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        if 'word' in request.form:
            word = request.form['word']
            if "submit_button_dna" in request.form:
                method = "dna"
            else:
                method = "string"
            if method == "dna":
                string = decode.decode(word)
                return render_template("stringOutput.html", inputword=word, word=string)
            elif method == "string":
                (string, letter_dict) = encode.get_encoding(word)
                return render_template("dnaOutput.html", inputword=word, word=string, letter_dict=letter_dict)
            
    return render_template("template.html")

# if __name__ == "__main__":
#     app.run(debug=True)