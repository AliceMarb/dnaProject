import re

replacements = {

"""<textarea
                placeholder="Text string, e.g. &quot;Hello&quot;" maxlength="5000" id="TextInput" name="TextInput"
                data-name="TextInput" class="textarea w-input"></textarea>""":
                """
                <textarea
                                                        value={toEncode}
                                                        onChange={handleEncodeText}
                                                        placeholder="Text string, e.g. &quot;Hello&quot;"
                                                        maxLength={5000}
                                                        data-name="TextInput"
                                                        id="TextInput-3"
                                                        name="TextInput"
                                                        className="textarea w-input"
                                                        type="text"
                                                        required="required"
                                                    >
                                                    </textarea>
                                                    """
}



test_text = """
    <textarea placeholder="Text string, e.g. &quot;Hello&quot;"
                    maxlength="5000" id="TextInput" name="TextInput" data-name="Text Input"
                    class="textarea w-input"></textarea>
    """

def clean_up(string):
    return " ".join(string.replace('\n', '').split())

spaces_removed = clean_up(test_text)
for old_html, replacement in replacements.items():
    q = re.sub(clean_up(old_html), clean_up(replacement), clean_up(test_text))
    print(q)

