from .home.views import home_bp
import datetime
import os

def get_file_names(name="", extension="txt", encode=True, string=""):
    if not name:
        name = '_'.join(string[:10].split(' '))
    else: 
        name = '.'.join(name.split('.')[:-1])
    from_c_folder = '../../../app/'
    from_root = 'app/'
    time = datetime.datetime.utcnow()
    fname = 'codec_files/' + '_'.join(str(time)[:19].replace(':', '-').split(' ')) + '_' + name 
    if encode:
        in_path = fname + '_toencode.' + extension
        out_path = fname + '_encoded.fa'
    else:
        in_path = fname + '_toencode.' + extension
        out_path = fname + '_encoded.fa'
    return from_root + in_path, from_root + out_path, from_c_folder + in_path, from_c_folder + out_path

def get_num_bytes(input_file):
    input_file.seek(0, os.SEEK_END)
    num_bytes = input_file.tell()
    # with open('filesize_time.csv', 'a') as f:
    #     f.write(str(num_bytes) + ',')
    if num_bytes > 1000000:
        # when reached a MB, don't calculate enc string?
        # don't render on the front end 
        enc_string = ""
    input_file.seek(0)
    return num_bytes

def limit_length(string):
    if len(string) > 30:
        return string[:30] + "..."
    else:
        return string

def construct_blueprint(codec_location="./master/Codec/c"):
    from flask import Blueprint
    if 'master' in codec_location: 
        home_bp = Blueprint('master', __name__)
    else:
        home_bp = Blueprint('dev', __name__)

    from flask import Flask, make_response, request, render_template, send_from_directory
    from flask import jsonify
    import json 
    from flask import current_app
    from flask import abort
    # from app.factory import app

    import subprocess
    from Bio import SeqIO
    from Bio.Seq import Seq
    from Bio.SeqRecord import SeqRecord
    import io
    import re
    
    import time
    from subprocess import Popen, PIPE

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

    def codec_en_decode(string, encode=True, fnames=[], input_type="text", extension="txt"):
        
        if encode: 
            
            if input_type == "text":
                root_in_path, root_out_path, c_in_path, c_out_path = get_file_names("", extension, True, string)
                # make a file with the word
                with open(root_in_path, 'w+') as f:
                # call encoding on the input word thru command line
                    f.write(string)
            else:
                # already wrote the file to the system (might change this later for
                # security or reducing space requirements).
                root_in_path, root_out_path, c_in_path, c_out_path = fnames
            command = f"./dnad_encode --in {c_in_path} --out {c_out_path} --encoding lee19_hw"
        else:
            if input_type == "text":
                root_in_path, root_out_path, c_in_path, c_out_path = get_file_names("", extension, True, string)
                # write a fasta  file
                try:
                    # record = SeqRecord(Seq(string), id=string, name="DNAtoString", description="Conversion from input string DNA to decoded string")
                    # SeqIO.write(record, from_root + in_path, "fasta")
                    # with open('seq_test_DNAinput.txt', 'w+') as f:
                    with open(root_in_path, 'w+') as f:
                        seq_list = string.split(',')
                        print('decoded process DNA')
                        for seq in seq_list:
                            f.write('>seq\n')
                            f.write('g' + seq + '\n')
                        # f.write(f'>{str(time)[:19]} Conversion from input string DNA to decoded string\n{string}\n')
                except:
                    print('conversion didnt work')
            command = f"./dnad_decode --in {c_in_path} --out {c_out_path} --encoding lee19_hw"

        process = subprocess.Popen(command.split(' '), cwd=codec_location, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = process.communicate()
        return process, out, err, root_in_path, root_out_path

    def get_encoding_info(in_path, out_path, input_type, fname):
        start = time.time()
        enc_string = ""
        letters = [0] * 4
        gc_content_fname = in_path.replace('app/codec_files/', "gc_content_") 
        
        gc_content_path = "app/static/react-app/public/frontend_textfiles/" + gc_content_fname
        if os.path.isfile(out_path):
            # very slow to go line by line. Instead use awk (works on AWS Ubuntu)
            """
            To get total count of As, Gs, Cs and Ts:
            cat {file} | grep g | awk 'BEGIN{a=0; c=0; g=0; t=0;} {a=gsub("A",""); c=gsub("C",""); g=gsub("G",""); t=gsub("T","");} END{print a,c,g,t}'
            To get fraction of GC content per line:
            cat {file} | grep g | awk '{a=gsub("A",""); c=gsub("C",""); g=gsub("G",""); t=gsub("T",""); printf "%0.2f\\n", (g+c)/(a+g+c+t)}'
            """
            def get_seq_lines():
                return Popen('grep g'.split(' '), stdin=open(out_path, 'r'), stdout=PIPE, stderr=PIPE)
            
            count_letters_command = [
                "awk",
                'BEGIN{a=0; c=0; g=0; t=0;} {a+=gsub("A",""); c+=gsub("C",""); g+=gsub("G",""); t+=gsub("T","");} END{print a,c,g,t}'
            ]
            get_gc_command = [
                "awk",
                '{a=gsub("A",""); c=gsub("C",""); g=gsub("G",""); t=gsub("T",""); printf "%0.2f\\n", (g+c)/(a+g+c+t)}'
            ]
            count_process = Popen(
                count_letters_command,
                stdin=get_seq_lines().stdout,
                stdout=PIPE,
                stderr=PIPE)
            out, err = count_process.communicate()
            if out:
                (a,g,c,t) = out.decode('utf-8').strip().split(' ')
            elif err:
                print(err)
            
            gc_process = Popen(
                get_gc_command,
                stdin=get_seq_lines().stdout,
                stdout=open(gc_content_path, 'w+'),
                stderr=PIPE)

            out1, err1, = gc_process.communicate()
            if err1:
                # error found
                print(err1)

            if input_type == "text":
                for seq_record in SeqIO.parse(out_path, "fasta"):
                    seq_str = str(seq_record.seq)[1:]
                    enc_string += (seq_str + ',')
            # don't want so many it crashes the browser
            else:
                for i, seq_record in enumerate(SeqIO.parse(out_path, "fasta")):
                    if i > 5000: 
                        enc_string += "..."
                        break
                    seq_str = str(seq_record.seq)[1:]
                    enc_string += (seq_str + ',')

            letter_dict = {"A": a, "G": g, "T": t, "C": c}
            end = time.time()
            secs = end - start
            print('TIME TAKEN FOR THIS ENCODING COUNT: ' + str(secs) + "\n")
        else:
            print('This file found: ', os.path.isfile(out_path))
            current_app.logger.error(f"ENCODING {input_type} {in_path} --- File not found error ::: Input: {out_path}")
            raise FileNotFoundError
        # with open('filesize_time.csv', 'a') as f:
                # f.write(str(secs) + '\n')
        return enc_string, letter_dict, gc_content_fname
            
    def handle_enc_input(input_word, fnames=[], fname="", input_type="text", extension="plain"):
        # automatically waits for end of the process
        payload_trits = -1
        address_length = -1
        if extension == "plain":
            file_ext = "txt"
        else: 
            file_ext = extension
        if fnames:
            (process, out, err, in_path, out_path) = codec_en_decode(input_word, encode=True, fnames=fnames, input_type=input_type, extension=file_ext)
        else:
            (process, out, err, in_path, out_path) = codec_en_decode(input_word)
        # stdout_list = out.decode("utf-8").strip().split('\n')
        srch = re.search('Auto Payload trits:.*?(\d+)\nAuto Address length:.*?(\d+)', out.decode("utf-8"))
        try:
            payload_trits = int(srch[1])
            address_length = int(srch[2])
        except:
            # didn't return as expected
            current_app.logger.error(f"ENCODING {input_type} {in_path} {out_path} --- Problem finding payload/address info. C stdout: {str(out)} C stderr: {str(err)} ::: Input: {limit_length(input_word)}")
            raise ValueError
        process.wait()
        try:
            (enc_string, letter_dict, gc_content_fname) = get_encoding_info(in_path, out_path, input_type, fname)
        except:
            raise ValueError
        current_app.logger.info(f"ENCODING {input_type} {in_path} {out_path} --- All good! ::: Input: {limit_length(input_word)}")
        return enc_string, letter_dict, payload_trits, address_length, gc_content_fname

    # DON'T PUT A SLASH, does not work
    @home_bp.route("/encode/<input_type>", methods=['POST'])
    def encode(input_type="json"):
        if input_type == "json":
            jsonData = request.get_json()
            input_word = jsonData['input']
            try:
                (enc_string, letter_dict, payload_trits, address_length, gc_content_fname) = handle_enc_input(input_word)
            except:
                return jsonify(status="error", word=""), 504
        elif input_type == "file":
            if 'file' not in request.files:
                # not working yet
                print('No file part')
                return jsonify(status="error") 
            else:
                print('File is here ')
                # check the file size, and don't build output string if too big
                input_file = request.files['file']
                for header in input_file.headers:
                    if header[0] == 'Content-Type':
                        ftype = header[1]
                        break
                fname = request.files['file'].filename
                # easier for command line if no spaces
                fname_no_space = fname.replace(' ', '_')
                if ftype == 'text/plain':
                    try:
                        wrapper = io.TextIOWrapper(request.files['file'])
                        input_word = wrapper.read()
                        (enc_string, letter_dict, payload_trits, address_length, gc_content_fname) = handle_enc_input(input_word, fname_no_space)
                    except Exception as e:
                        print(e)
                    # handle_enc_input(input_word, fname_no_space)
                else:
                    try:
                        file_type, extension = ftype.split('/')
                        file_names = get_file_names(name=fname_no_space, extension=extension)
                        file_name = file_names[0]
                        import tempfile
                        tf = request.files['file'].stream
                        f = tf.rollover()
                        tf.seek(0)
                        content = tf.read()
                        with open(file_name, 'wb') as open_file:
                            open_file.write(content)
                    except Exception as e:
                        print(e)
                    (enc_string, letter_dict, payload_trits, address_length, gc_content_fname) = handle_enc_input("", file_names, file_name, file_type, extension)
        try:
            response = make_response(
                send_from_directory(
                    current_app.config['ENCODED_FILE_LOC'],
                    filename=gc_content_fname, 
                    as_attachment=True,
                    mimetype="text/plain"),
                200,
                {
                    'letter_dict': jsonify(letter_dict),
                    'payload_trits':payload_trits,
                    'address_length':address_length,
                    'gc_content_fname':gc_content_fname,
                    'enc_string': enc_string
                }
            )
            response.headers['letter_dict'] = letter_dict
            response.headers['payload_trits'] = payload_trits
            response.headers['address_length'] = address_length
            return response
        except FileNotFoundError:
                abort(404)
        return

    @home_bp.route("/decode_string", methods=['POST'])
    def decode_string():
        jsonData = request.get_json(force=True)
        input_word = jsonData['input']
        (process, out, err, in_path, out_path) = codec_en_decode(input_word, False)
        print(out, err)
        srch = re.search('Synthesis length:.*?(\d+)\n*.*?\n*Address length:.*?(\d+)', out.decode("utf-8"))
        try:
            synthesis_length = int(srch[1])
            address_length = int(srch[2])
        except:
            # didn't return as expected
            current_app.logger.error(f"DECODING typed {in_path} {out_path} --- Problem finding payload/address info. C stdout: {str(out)} C stderr: {str(err)} ::: Input: {limit_length(input_word)}")
            return jsonify(status="error")
        decoded_str = ""
        try:
            with open(out_path, 'r') as f:
                decoded_list = f.readlines()
                decoded_str = ''.join(decoded_list)
        except:
            current_app.logger.error(f"DECODING typed {in_path} {out_path} --- File not found error ::: Input: {limit_length(input_word)}")
            return jsonify(status="error", word="", letter_dict={}), 404
        current_app.logger.info(f"DECODING typed {in_path} {out_path} --- All good! ::: Input: {limit_length(input_word)}")
        return jsonify(status="success", word=decoded_str, synthesis_length=synthesis_length, address_length=address_length)  

    return home_bp
    # @app.errorhandler(404)
    # def page_not_found(error):
    #     app.logger.error('Page not found %s', (request.path))

    # if __name__ == "__main__":
        # This is to set FLASK_ENV=development if this is being 
        # run using python app.py 
        # app.run(debug=True)
        # app.run()
        # app.run(host="0.0.0.0", port=80)
        # app.run(port=5000)

dev_bp = construct_blueprint("./dev/Codec/c")
master_bp = construct_blueprint()