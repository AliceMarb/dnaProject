from .home.views import home_bp
import datetime
import os


def get_file_names(time_started, name="", extension="plain", encode=True, string=""):
    if extension == "plain":
        extension = "txt"
    elif extension == "octet-stream":
        extension = "fa"
    if not name:
        name = '_'.join(string[:10].split(' '))
    else:
        name = '.'.join(name.split('.')[:-1])
    from_c_folder = '../../../app/codec_files/'
    from_root = 'app/codec_files/'
    fname = '_'.join(str(time_started)[:19].replace(
        ':', '-').split(' ')) + '_' + name
    if encode:
        in_path = fname + '_toencode.' + extension
        out_path = fname + '_encoded.fa'
    else:
        in_path = fname + '_toencode.' + extension
        out_path = fname + '_decoded.txt'
    return [fname, from_root + in_path, from_root + out_path, from_c_folder + in_path, from_c_folder + out_path]


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

    from flask import Flask, make_response, request, render_template, send_from_directory, session
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
        current_app.logger.info(
            'Processing request for home from {}.'.format(codec_location))
        print(os.getcwd())
        # a process can't change a subprocesses' working directory
        # wd = os.getcwd()
        subprocess.Popen("make", cwd=codec_location)
        session.clear()
        if 'visits' in session:
            # reading and updating session data
            session['visits'] = session.get('visits') + 1
        else:
            session['visits'] = 1  # setting session data
        if 'actions' not in session:
            session["actions"] = {"encode": [], "decode": []}
        return render_template("react-base.html", visits=session['visits'], actions=json.dumps(session["actions"]))

    def codec_en_decode(encode=True, fnames=[]):
        fname, root_in_path, root_out_path, c_in_path, c_out_path = fnames
        if encode:
            # already wrote the file to the system
            command = f"./dnad_encode --in {c_in_path} --out {c_out_path} --encoding lee19_hw"
        else:
            command = f"./dnad_decode --in {c_in_path} --out {c_out_path} --encoding lee19_hw"
        process = subprocess.Popen(command.split(
            ' '), cwd=codec_location, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = process.communicate()
        return process, out, err, root_in_path, root_out_path

    def get_encoding_info(in_path, out_path, fname):
        start = time.time()
        enc_string = ""
        letters = [0] * 4
        gc_content_fname = "gc_content_" + fname + '.txt'
        gc_content_path = "app/codec_files/" + gc_content_fname
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
                (a, g, c, t) = out.decode('utf-8').strip().split(' ')
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

            if int(a) < 1000:
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
            current_app.logger.error(
                f"ENCODING {in_path} --- File not found error ::: Input: {out_path}")
            raise FileNotFoundError
        # with open('filesize_time.csv', 'a') as f:
            # f.write(str(secs) + '\n')
        return enc_string, letter_dict, gc_content_fname

    def handle_enc_input(fnames=[]):
        # automatically waits for end of the process
        payload_trits = -1
        address_length = -1
        (process, out, err, in_path, out_path) = codec_en_decode(fnames=fnames)

        # stdout_list = out.decode("utf-8").strip().split('\n')
        srch = re.search(
            'Auto Payload trits:.*?(\d+)\nAuto Address length:.*?(\d+)', out.decode("utf-8"))
        try:
            payload_trits = int(srch[1])
            address_length = int(srch[2])
        except:
            # didn't return as expected
            current_app.logger.error(
                f"ENCODING {in_path} {out_path} --- Problem finding payload/address info. C stdout: {str(out)} C stderr: {str(err)}")
            raise ValueError
        process.wait()
        try:
            (enc_string, letter_dict, gc_content_fname) = get_encoding_info(
                in_path, out_path, fnames[0])
        except:
            raise ValueError
        current_app.logger.info(f"ENCODING {in_path} {out_path} --- All good!")
        return enc_string, letter_dict, payload_trits, address_length, gc_content_fname

    def save_session(encode, input_type, input_file_or_string, modified_filename, date):
        '''
        Sessions strategy: 
        For encoding: 
        - inputFileNameOrString, modifiedFileName, date
        (encode_input, encoded_file, gc_content_fname, encoding_data_fname
        - In session, save file names of the above 
        - Save all files to encode, encoded files, GC content file
            and encoding data (letter dict, payload, address length), TIME
        '''
        # slack
        if encode:
            key = "encode"
        else:
            key = "decode"
        session["actions"][key].insert(
            0, [input_type, input_file_or_string, modified_filename, date])
        session.modified = True

    def save_file_info(fname_no_space, ftype, time_started, encode=True):
        '''Write the file to server and return data about it'''
        import tempfile
        file_type, extension = ftype.split('/')
        # file_names[0] is the plain input file name
        # 1 and 2 are path to the input + encoded file from the root
        # 3 and 4 are paths to the input + encoded file from the C folder
        file_paths = get_file_names(
            name=fname_no_space, extension=extension, encode=encode, time_started=time_started)

        tf = request.files['file'].stream
        f = tf.rollover()
        tf.seek(0)
        content = tf.read()
        with open(file_paths[1], 'wb') as open_file:
            open_file.write(content)

        return file_paths

    def save_text_info(input_word, time_started):
        file_paths = get_file_names(
            string=input_word, time_started=time_started)
        with open(file_paths[1], 'w+') as open_file:
            open_file.write(input_word)
        return file_paths

    def save_decode_typed_input(input_word, time_started):
        file_paths = get_file_names(
            string=input_word, time_started=time_started, extension="fa")
        root_in_path = file_paths[1]
        # write a fasta file
        try:
            with open(root_in_path, 'w+') as f:
                seq_list = input_word.split(',')
                print('decoded process DNA')
                for seq in seq_list:
                    f.write('>seq\n')
                    f.write('g' + seq + '\n')
        except:
            print('conversion didnt work')
        return file_paths

    @home_bp.route("/get_fasta", methods=['GET'])
    def get_fasta():
        path_to_last_encoded = session["actions"]["encode"][0][2]
        response = make_response(
            send_from_directory(
                current_app.config['ENCODED_FILE_LOC'],
                filename=path_to_last_encoded + "_encoded.fa",
                as_attachment=True,
                mimetype="text/plain"),
            200,
        )
        return response

    # DON'T PUT A SLASH, does not work

    @home_bp.route("/encode/<input_type>", methods=['POST'])
    def encode(input_type="json"):
        time_started = datetime.datetime.utcnow()
        if input_type == "json":
            jsonData = request.get_json()
            input_word = jsonData['input']
            file_paths = save_text_info(input_word, time_started)
        else:
            # type == file
            if 'file' not in request.files:
                return jsonify(status="error")
            print('File is here ')
            # check the file size, and don't build output string if too big
            input_file = request.files['file']
            for header in input_file.headers:
                if header[0] == 'Content-Type':
                    ftype = header[1]
                    break
            # easier for command line if no spaces
            input_word = request.files['file'].filename
            fname_no_space = "_".join(input_word.split())
            # wrapper = io.TextIOWrapper(request.files['file'])
            # input_word = wrapper.read()
            file_paths = save_file_info(fname_no_space, ftype, time_started)
        (enc_string, letter_dict, payload_trits, address_length,
         gc_content_fname) = handle_enc_input(file_paths)
        try:
            encoding_data_fname = "app/codec_files/" + \
                "metadata_" + file_paths[0] + ".txt"
            with open(encoding_data_fname, 'w+') as f:
                f.write(str(letter_dict) + '\n')
                f.write(str(payload_trits) + '\n')
                f.write(str(address_length) + '\n')
                f.write(str(enc_string) + '\n')

            response = make_response(
                send_from_directory(
                    current_app.config['ENCODED_FILE_LOC'],
                    filename=gc_content_fname,
                    as_attachment=True,
                    mimetype="text/plain"),
                200
            )
            can_display_full = os.path.getsize(file_paths[2]) > 5000
            response.headers['letter_dict'] = letter_dict
            response.headers['payload_trits'] = payload_trits
            response.headers['address_length'] = address_length
            response.headers['can_full_display'] = True
            response.headers['enc_string'] = enc_string
            response.headers['date'] = int(
                time.mktime(time_started.timetuple())) * 1000
            response.headers['base_file_name'] = file_paths[0]

            save_session(True, input_type, input_word,
                         file_paths[0], time_started)
            return response
        except FileNotFoundError:
            abort(404)
        return

    def get_extension(input_file_name, out_file_name):
        extension = ""
        # for encoding in session["actions"]["encode"]:
        #     if encoding[2] + "_encoded.fa" == file_name:
        #         return encoding[1].split(".")[-1]
        # no previous encoding found, use LINUX file utility
    
        process = subprocess.Popen(
            ["file", "--mime-type", "-b", out_file_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        out, err = process.communicate() 
        try:
            print(out, err)
            mime_type = out.decode("utf-8").strip()
            file_type, extension = mime_type.split('/')
            if extension == "plain":
                # .fa also counts as ASCII...
                return 'txt', mime_type
            else:
                return extension, mime_type
        except:
            print("Couldn't get extension")
            return 'txt'

    @home_bp.route("/decode/<input_type>", methods=['POST'])
    def decode(input_type="json"):
        time_started = datetime.datetime.utcnow()
        if input_type == "json":
            jsonData = request.get_json(force=True)
            input_word = jsonData['input']
            file_paths = save_decode_typed_input(input_word, time_started)
        else:
            # type == file
            if 'file' not in request.files:
                return jsonify(status="error")
            input_file = request.files['file']
            for header in input_file.headers:
                if header[0] == 'Content-Type':
                    ftype = header[1]
                    break
            input_word = request.files['file'].filename
            fname_no_space = "_".join(input_word.split())
            file_paths = save_file_info(
                fname_no_space, ftype, time_started, False)

        (process, out, err, in_path, out_path) = codec_en_decode(False, file_paths)
        print(out, err)
        srch = re.search(
            'Synthesis length:.*?(\d+)\\n.*?\\n.*?Address length:.*?(\d+)', out.decode("utf-8"))
        try:
            synthesis_length = int(srch[1])
            address_length = int(srch[2])
        except:
            # didn't return as expected
            current_app.logger.error(
                f"DECODING typed {in_path} {out_path} --- Problem finding payload/address info. C stdout: {str(out)} C stderr: {str(err)}")
            return jsonify(status="error")

        # Find out the output type of the decoded
        # input_type == json, assume it is .txt
        if input_type == "file":
            extension, mime_type = get_extension(input_word, out_path)
            new_file = out_path.replace('.txt', '.' + extension)
            os.rename(out_path, new_file)
            out_path = new_file

        current_app.logger.info(
            f"DECODING typed {in_path} {out_path} --- All good!")

        response = make_response(
            send_from_directory(
                current_app.config['ENCODED_FILE_LOC'],
                filename=out_path.replace('app/codec_files/', ''),
                as_attachment=True),
            200,
        )
        can_display_full = os.path.getsize(out_path) > 5000
        response.headers['synthesis_length'] = synthesis_length
        response.headers['address_length'] = address_length
        response.headers['mimetype'] = mime_type
        # can't have \n in header so can't include decoded_str 
        time_in_seconds = int(time.mktime(time_started.timetuple())) * 1000
        response.headers['date'] = time_in_seconds
        response.headers['base_file_name'] = file_paths[0]
        response.headers['can_display_full'] = can_display_full
        save_session(False, input_type, input_word,
                     file_paths[0], time_in_seconds)
        return response
        # return jsonify(status="success", word=decoded_str, synthesis_length=synthesis_length, address_length=address_length)

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
