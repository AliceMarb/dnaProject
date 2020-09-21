from flask import Blueprint

home_bp = Blueprint('home', __name__)

from flask import Flask, render_template, request, redirect, url_for
# from flaskr.codec.encoding import encode
# from flaskr.codec.decoding import decode
from flask import jsonify
import json 
from flask import current_app

# from app.factory import app

import os
import subprocess
from Bio import SeqIO

# app = Flask(__name__)

# add C files to path (??), OR docker/virtual environment

@home_bp.route("/", methods=['GET', 'POST'])
def home():
    current_app.logger.info('Processing request for home.')
    print(os.getcwd())
    # a process can't change a subprocesses' working directory
    # wd = os.getcwd()
    subprocess.Popen("make", cwd="./Codec/c")
    return render_template("template.html")

@home_bp.route("/call_cli", methods=['POST'])
def call_cli():
    jsonData = request.get_json()
    input_word = jsonData['input']
    print(os.getcwd())
    # make a file with the word
    os.system('cd ./Codec/c')
    from_c_folder = '../../app/'
    from_views_folder = 'app/'
    fname = 'codec_files/test_' + '_'.join(input_word[:10].split(' '))
    in_path = from_views_folder + fname + '.txt'
    enc_path = from_views_folder + fname + '.fa'
    with open(in_path, 'w+') as f:
    # call encoding on the input word thru command line
        f.write(input_word)
    enc_command = f"./dnad_encode --in {from_c_folder + in_path} --out {from_c_folder + enc_path} --encoding lee19_hw"
    subprocess.Popen(enc_command.split(' '), cwd="./Codec/c")
    enc_string = ""
    if os.path.isfile(enc_path):
        for seq_record in SeqIO.parse(enc_path, "fasta"):
            # remove the lowercase g at the start of the 
            # sequence
            enc_string += str(seq_record.seq)[1:]
        letter_dict = {
            "A": enc_string.count("A"),
            "G": enc_string.count("G"),
            "T": enc_string.count("T"),
            "C": enc_string.count("C"),
        }
    else:
        return render_template('error.html', title='404 Error', msg="File not found: " + enc_path)
    return jsonify(status="success", word=enc_string, letter_dict=letter_dict) 

@home_bp.route("/upload_file", methods=['POST'])
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


# @app.errorhandler(404)
# def page_not_found(error):
#     app.logger.error('Page not found %s', (request.path))
#     return render_template('error.html', title='404 Error', msg=request.path)

if __name__ == "__main__":
    # This is to set FLASK_ENV=development if this is being 
    # run using python app.py 
    # app.run(debug=True)
    # app.run()
    # app.run(host="0.0.0.0", port=80)
    app.run(port=5000)