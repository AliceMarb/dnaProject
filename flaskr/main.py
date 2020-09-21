from flask import Flask, render_template, request, redirect, url_for
from flaskr.codec.encoding import encode
from flaskr.codec.decoding import decode
from flask import jsonify
import json 
import logging

app = Flask(__name__)
# format=’%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s’)

logging.basicConfig(filename='logs.log', level=logging.DEBUG,
    format="%(asctime)s %(levelname)s: %(message)s")



@app.route("/", methods=['GET', 'POST'])
def home():
    app.logger.info('Processing request for home.')
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

@app.route("/call_cli", methods=['POST'])
def call_cli():
    jsonData = request.get_json()
    input_word = jsonData['input']
    # make a file with the word
    folder = './flaskr/codec_files/'
    fname = 'test_' + input_word[:10] 
    in_path = folder + fname + '.txt'
    enc_path = folder + fname + '.fa'
    with open(in_path, 'w+') as f:
    # call encoding on the input word thru command line
        f.write(input_word)
    enc_command = "./dnad_encode --in {path} --out {enc_path} --encoding lee19_hw"
    enc_string = ""
    with open(enc_path, 'r') as f:
        enc_string = '\n'.join(f.readlines())
    return jsonify(status="success", word=enc_string) 

@app.route("/upload_file", methods=['POST'])
def upload_file():
    # check if the post request has the file part
    print(request.files)
    print(request.form)
    # print(request.get_data())
    if 'file' not in request.files:
        # not working yet
        print('No file part')
        # return redirect(request.url)
    else:
        print('FIle is here ')
        file = request.files['file']
    # jsonData = request.get_json()

    # word = request.get_data()
    # input_word = "hi there"
    return jsonify(status="success", word="encoded") 


@app.errorhandler(404)
def page_not_found(error):
    app.logger.error('Page not found %s', (request.path))
    return render_template('error.html', title='404 Error', msg=request.path)

if __name__ == "__main__":
    # This is to set FLASK_ENV=development if this is being 
    # run using python app.py 
    # app.run(debug=True)
    # app.run()
    # app.run(host="0.0.0.0", port=80)
    app.run(port=5000)