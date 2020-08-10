from encoding.encode import get_packets,get_template

def repl():

	encode_prompt = "Enter 'exit' or the phrase you want to encode:"
	user_input = take_input(encode_prompt)

	while (user_input != "exit"):
		encode_with_display(user_input)
		user_input = take_input(encode_prompt)


# Input: string - phrase displayed between newlines prompting user for input
# Output: string - (formatted) user input
def take_input(phrase):
	user_input = input("\n" + phrase + "\n")
	print()
	return user_input


# Input: string - a string to be encoded into DNA
# Output: string list - the encoded input as a list of DNA sequences
def encode_with_display(myString):
	packets = get_packets(myString)

	templates = []
	for packet in packets:
		templates.append(get_template(packet))

	display_encoding_info(myString, packets, templates)
	return templates


# A function just to display information
def display_encoding_info(myString, packets, templates):
	print("\'" + myString + "\': ")
	print(packets)
	print(templates)