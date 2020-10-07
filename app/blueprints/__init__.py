from .home.views import home_bp


def construct_blueprint(codec_location="./master/Codec/c"):
    from flask import Blueprint
    if 'master' in codec_location: 
        home_bp = Blueprint('master', __name__)
    else:
        home_bp = Blueprint('dev', __name__)

    from flask import Flask, render_template, request, redirect, url_for
    # from flaskr.codec.encoding import encode
    # from flaskr.codec.decoding import decode
    from flask import jsonify
    import json 
    from flask import current_app
    from flask import abort
    # from app.factory import app

    import os
    import subprocess
    from Bio import SeqIO
    from Bio.Seq import Seq
    from Bio.SeqRecord import SeqRecord
    import io
    import re
    import datetime

    # app = Flask(__name__)

    # add C files to path (??), OR docker/virtual environment

    @home_bp.route("/", methods=['GET', 'POST'])
    def home():
        current_app.logger.info('Processing request for home.')
        print(os.getcwd())
        # a process can't change a subprocesses' working directory
        # wd = os.getcwd()
        subprocess.Popen("make", cwd=codec_location)
        return render_template("react-base.html")

    def string_en_decode(string, encode=True, name=""):
        if not name:
            name = '_'.join(string[:10].split(' '))
        from_c_folder = '../../../app/'
        from_root = 'app/'
        time = datetime.datetime.utcnow()
        fname = 'codec_files/' + '_'.join(str(time)[:19].replace(':', '-').split(' ')) + '_' + name 
        if encode:
            in_path = fname + '.txt'
            out_path = fname + '_encoded.fa'
            # make a file with the word
            with open(from_root + in_path, 'w+') as f:
            # call encoding on the input word thru command line
                f.write(string)
            command = f"./dnad_encode --in {from_c_folder + in_path} --out {from_c_folder + out_path} --encoding lee19_hw"
        else:
            in_path = fname + '.fa'
            out_path = fname + '_decoded.txt'
            # write a fasta  file
            try:
                # record = SeqRecord(Seq(string), id=string, name="DNAtoString", description="Conversion from input string DNA to decoded string")
                # SeqIO.write(record, from_root + in_path, "fasta")
                # with open('seq_test_DNAinput.txt', 'w+') as f:
                with open(from_root + in_path, 'w+') as f:
                    seq_list = string.split(',')
                    print('decoded process DNA')
                    for seq in seq_list:
                        f.write('>seq\n')
                        f.write('g' + seq + '\n')
                    # f.write(f'>{str(time)[:19]} Conversion from input string DNA to decoded string\n{string}\n')
            except:
                print('conversion didnt work')
            command = f"./dnad_decode --in {from_c_folder + in_path} --out {from_c_folder + out_path} --encoding lee19_hw"

        process = subprocess.Popen(command.split(' '), cwd=codec_location, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = process.communicate()
        return process, out, err, from_root + in_path, from_root + out_path

    def get_encoding_info(in_path, out_path):
        enc_string = ""
        gc_content = []
        if os.path.isfile(out_path):
            print('encoded process DNA')
            for seq_record in SeqIO.parse(out_path, "fasta"):
                # remove the lowercase g at the start of the 
                # sequence
                seq_str = str(seq_record.seq)[1:] 
                gc_content.append((seq_str.count("G") + seq_str.count("C"))/len(seq_str))
                enc_string += (seq_str + ',')
            letter_dict = {
                "A": enc_string.count("A"),
                "G": enc_string.count("G"),
                "T": enc_string.count("T"),
                "C": enc_string.count("C"),
            }
            # print('got to the end')
        else:
            print('This file not found: ', out_path)
            print('This file found: ', os.path.isfile(out_path))
            current_app.logger.error(f"ENCODING typed {in_path} {out_path} --- File not found error ::: Input: {input_word} Encoding: {enc_string}")
            raise FileNotFoundError
        return enc_string, letter_dict, gc_content
            # (response, status, headers)
            
    def handle_enc_input(input_word, fname="", input_type="typed"):
        # automatically waits for end of the process
        payload_trits = -1
        address_length = -1
        if fname:
            (process, out, err, in_path, out_path) = string_en_decode(input_word, fname)
        else:
            (process, out, err, in_path, out_path) = string_en_decode(input_word)
        # stdout_list = out.decode("utf-8").strip().split('\n')
        srch = re.search('Payload trits:.*?(\d+)\nAddress length:.*?(\d+)', out.decode("utf-8"))
        try:
            payload_trits = int(srch[1])
            address_length = int(srch[2])
        except:
            # didn't return as expected
            current_app.logger.error(f"ENCODING {input_type} {in_path} {out_path} --- Problem finding payload/address info. C stdout: {str(out)} C stderr: {str(err)} ::: Input: {input_word}")
            raise ValueError
        process.wait()
        try:
            (enc_string, letter_dict, gc_content) = get_encoding_info(in_path, out_path)
        except:
            # return render_template('error.html', title='404 Error', msg="File not found!: " + enc_path)
            raise ValueError
        current_app.logger.info(f"ENCODING {input_type} {in_path} {out_path} --- All good! ::: Input: {input_word} Encoding: {enc_string}")
        return enc_string, letter_dict, payload_trits, address_length, gc_content

    # DON'T PUT A SLASH, does not work
    @home_bp.route("/encode_string", methods=['POST'])
    def encode_string():
        jsonData = request.get_json()
        input_word = jsonData['input']
        try:
            (enc_string, letter_dict, payload_trits, address_length, gc_content) = handle_enc_input(input_word)
            return jsonify(
                status="success",
                word=enc_string,
                letter_dict=letter_dict,
                payload_trits=payload_trits,
                address_length=address_length,
                gc_content=gc_content,
            )
        except:
            return jsonify(status="error", word=""), 504

    @home_bp.route("/decode_string", methods=['POST'])
    def decode_string():
        jsonData = request.get_json(force=True)
        input_word = jsonData['input']
        (process, out, err, in_path, out_path) = string_en_decode(input_word, False)
        print(out, err)
        srch = re.search('Synthesis length:.*?(\d+)\n*.*?\n*Address length:.*?(\d+)', out.decode("utf-8"))
        try:
            synthesis_length = int(srch[1])
            address_length = int(srch[2])
        except:
            # didn't return as expected
            current_app.logger.error(f"DECODING typed {in_path} {out_path} --- Problem finding payload/address info. C stdout: {str(out)} C stderr: {str(err)} ::: Input: {input_word}")
            return jsonify(status="error")
        decoded_str = ""
        try:
            with open(out_path, 'r') as f:
                decoded_list = f.readlines()
                decoded_str = '\n'.join(decoded_list)
        except:
            current_app.logger.error(f"DECODING typed {in_path} {out_path} --- File not found error ::: Input: {input_word}")
            return jsonify(status="error", word="", letter_dict={}), 404
        current_app.logger.info(f"DECODING typed {in_path} {out_path} --- All good! ::: Input: {input_word} Decoding: {decoded_str}")
        return jsonify(status="success", word=decoded_str, synthesis_length=synthesis_length, address_length=address_length)

    @home_bp.route("/encode_file", methods=['POST'])
    def encode_file():
        # check if the post request has the file part
        print(request.files)
        print(request.form)
        # print(request.get_data())
        if 'file' not in request.files:
            # not working yet
            print('No file part')
            # return redirect(request.url)
            return jsonify(status="error") 
        
        print('File is here ')
        
        wrapper = io.TextIOWrapper(request.files['file'])
        fname = request.files['file'].filename
        input_word = wrapper.read()
        try:
            (enc_string,
            letter_dict,
            payload_trits,
            address_length,
            gc_content) = handle_enc_input(input_word, fname)
            return jsonify(
                status="success",
                word=enc_string,
                letter_dict=letter_dict,
                payload_trits=payload_trits,
                address_length=address_length,
                gc_content=gc_content,
            )
        except:
            return jsonify(status="error", word=""), 504
        

    return home_bp
    # @app.errorhandler(404)
    # def page_not_found(error):
    #     app.logger.error('Page not found %s', (request.path))
    #     return render_template('error.html', title='404 Error', msg=request.path)

    # if __name__ == "__main__":
        # This is to set FLASK_ENV=development if this is being 
        # run using python app.py 
        # app.run(debug=True)
        # app.run()
        # app.run(host="0.0.0.0", port=80)
        # app.run(port=5000)

dev_bp = construct_blueprint("./dev/Codec/c")
master_bp = construct_blueprint()