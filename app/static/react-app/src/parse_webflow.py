import re

replacements = {
""""<textarea placeholder="Text string, e.g. &quot;Hello&quot;" maxLength={5000} id="TextInput" name="TextInput" data-name="Text Input" className="textarea input-text-string-area w-input" defaultValue={""} />""":
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
/>
"""
}



header = """
  <div data-collapse="small" data-animation="default" data-duration={400} role="banner" className="navigation w-nav">
    <div className="navigation-wrap">
      <div className="menu"><a href="/old-home" className="link-block w-inline-block" />
        <div className="menu-button w-nav-button"><img src="images/menu-icon_1menu-icon.png" width={22} alt="" className="menu-icon" /></div>
        <nav role="navigation" className="nav-menu w-nav-menu">
          <div className="text-block-4">Version:</div><a href="/" aria-current="page" className="nav-link-2 nav-bar-master-link w-nav-link w--current">Master</a><a href="/development" className="nav-link nav-bar-link-2 w-nav-link">Development</a><a href="#" className="nav-link nav-bar-link-3 w-nav-link">1.3</a></nav>
      </div>
    </div>
  </div>
"""
replacement_header = """
        <div data-collapse="small" data-animation="default" data-duration="400" role="banner" className="navigation w-nav">
          <div className="navigation-wrap">
            <div className="menu">
              <nav role="navigation" className="nav-menu w-nav-menu">
                <div className="text-block-4">Version:</div>
                <NavLink to="/master" aria-current="page" activeClassName="active-route" className="nav-link w-nav-link">Master</NavLink>
                <NavLink to="/dev" aria-current="page" activeClassName="active-route" className="nav-link w-nav-link">Development</NavLink>
              </nav>
            </div>
          </div>
        </div>
"""
section_heading = """
  <div className="section-heading-wrap">
    <h2 className="heading-2 dna-synthesizer-title">DNA Synthesizer<br /></h2>
    <div className="label cc-light dna-synthesizer-short-title">Encode your data into our synthetic dna<br /></div>
  </div>
"""

input_block = """
    <div className="panel-nav">
      <div data-w-id="555ec916-369b-67ad-10b5-ae562a9d19f6" className="panel-trigger">
        <h3 className="accordion-label">Input</h3><img src="images/arrow-mid-blue-down-96x96.png" loading="lazy" width={10} alt="" className="accordion-arrow" /></div>
    </div>
    <div className="panel-block">
      <div data-w-id="b3df5cfc-7716-175b-6877-256bb15805eb" className="input-block">
        <div className="panel-title">
          <h4 className="heading-6">Input</h4>
        </div>
        <div className="accordion-wrapper">
          <div className="w-form">
            <form id="wf-form-Encode-Text-Form" name="wf-form-Encode-Text-Form" data-name="Encode Text Form">
              <div className="accordion-closed-item">
                <div className="accordion-closed-item-trigger input-text-string-block-button">
                  <h3 className="accordion-label input-text-string-block-label">Text string</h3><img src="images/arrow-mid-blue-96x96.png" loading="lazy" width={10} alt="" className="accordion-arrow input-text-string-block-arrow" /></div>
                <div className="accordion-item-content"><textarea placeholder="Text string, e.g. &quot;Hello&quot;" maxLength={5000} id="TextInput" name="TextInput" data-name="Text Input" className="textarea input-text-string-area w-input" defaultValue={""} /></div>
              </div>
              <div className="accordion-closed-item">
                <div className="accordion-closed-item-trigger input-file-upload-block-button">
                  <h3 className="accordion-label input-file-upload-block-label">Upload file</h3><img src="images/arrow-mid-blue-96x96.png" loading="lazy" width={10} alt="" className="accordion-arrow input-file-upload-block-arrow" /></div>
                <div className="accordion-item-content"><input type="submit" defaultValue="Upload File" data-wait="Please wait..." className="submit-button input-file-upload-submit-button w-button" /></div>
              </div><input type="submit" defaultValue="Encode" data-wait="Please wait..." className="submit-button input-encode-submit-buttion w-button" /></form>
            <div className="w-form-done">
              <div>Thank you! Your submission has been received!</div>
            </div>
            <div className="w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
          <div className="form-block w-form">
            <form id="wf-form-Decode-DNA-Form" name="wf-form-Decode-DNA-Form" data-name="Decode DNA Form" className="form">
              <div className="accordion-closed-item">
                <div className="accordion-closed-item-trigger input-dna-seq-decode-block-button">
                  <h3 className="accordion-label input-dna-seq-decode-block-label">DNA Sequence Decode</h3><img src="images/arrow-mid-blue-96x96.png" loading="lazy" width={10} alt="" className="accordion-arrow" /></div>
                <div className="accordion-item-content"><textarea placeholder="DNA sequence, e.g. AGATGAG, ACGATCA, ATACTCT, TCGTCTC, TACGACT," maxLength={5000} id="DNA-Input" name="DNA-Input" data-name="DNA Input" className="textarea input-dna-sequence-textarea w-input" defaultValue={""} /><input type="submit" defaultValue="Decode" data-wait="Please wait..." className="submit-button input-dna-seq-decode-submit-button w-button" /></div>
              </div>
            </form>
            <div className="w-form-done">
              <div>Thank you! Your submission has been received!</div>
            </div>
            <div className="w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
        </div>
      </div>
"""

output_block = \
"""
      <div className="output-block">
        <div className="panel-title">
          <h4 className="heading-6">Output</h4>
        </div>
        <div className="w-form">
          <form id="email-form" name="email-form" data-name="Email Form" className="form-2">
            <div className="w-row">
              <div className="w-col w-col-4">
                <div className="output-sub-block">
                  <div className="label basic-data-block-label">DATA</div>
                  <div>
                    <div className="div-block-3">
                      <div className="text-block-6 address-length-label">Address Length: </div>
                      <div className="addres-length-output-value">%AddressLengthOutputValue</div>
                    </div>
                    <div className="div-block-3">
                      <div className="text-block-6 payload-length-label">Payload Data</div>
                      <div className="payload-output-value">%PayloadOutputValue</div>
                    </div>
                  </div>
                </div>
                <div className="output-sub-block">
                  <div className="label nc-content-block-label">Nucleotide content</div>
                  <div className="w-layout-grid grid-2">
                    <div id="w-node-435fc0572bd0-56126d0b" className="nc-content-a-value"><strong>A: </strong>500</div>
                    <div className="nc-content-t-value"><strong>T: </strong>234</div>
                    <div className="nc-content-c-value"><strong>C:</strong> 23423</div>
                    <div className="nc-content-g-value"><strong>G:</strong> 235</div>
                  </div>
                </div>
              </div>
              <div className="w-col w-col-8">
                <div className="output-sub-block">
                  <div className="label dna-seq-output-block-label">DNA Sequence</div><textarea placeholder="DNA Sequence Output" maxLength={5000} id="DNA-Sequence-Output" data-name="DNA Sequence Output" name="DNA-Sequence-Output" className="dna-seq-output-text-area w-input" defaultValue={""} /><input type="submit" defaultValue="Copy DNA Sequence to Input" data-wait="Please wait..." className="submit-button copy-dna-seq-to-input-submit-button w-button" /></div>
              </div>
            </div>
          </form>
          <div className="w-form-done">
            <div>Thank you! Your submission has been received!</div>
          </div>
          <div className="w-form-fail">
            <div>Oops! Something went wrong while submitting the form.</div>
          </div>
        </div>
        <div className="output-sub-block">
          <div className="accordion-closed-item">
            <div className="accordion-closed-item-trigger gc-content-plot-button">
              <h3 className="accordion-label gc-content-plot-block-label">GC Content PLot</h3><img src="images/arrow-mid-blue-96x96.png" loading="lazy" width={10} alt="" className="accordion-arrow" /></div>
            <div className="accordion-item-content"><img src="images/Screen-Shot-2020-09-30-at-11.09.53-AM.png" loading="lazy" srcSet="images/Screen-Shot-2020-09-30-at-11.09.53-AM-p-500.png 500w, images/Screen-Shot-2020-09-30-at-11.09.53-AM.png 518w" sizes="(max-width: 479px) 100vw, (max-width: 767px) 89vw, (max-width: 991px) 68vw, 95vw" alt="" className="gccontent-image" /></div>
          </div>
        </div>
        <div className="output-sub-block">
          <div className="label nc-content-plot-block-label">Nucleotide content plot</div>
          <div>
            <div className="nc-content-plot-value w-embed">GC conten%</div>
          </div>
        </div>
      </div>
    </div>
"""

def clean_up(string):
    return " ".join(string.replace('\n', '').split())

spaces_removed = clean_up(test_text)
for old_html, replacement in replacements.items():
    q = re.sub(clean_up(old_html), clean_up(replacement), clean_up(test_text))
    print(q)

