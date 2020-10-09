# A dictionary storing which bit comes next given
# the previous base and the current base.
DECODE_TRANSITIONS = {
    'A': {'C': '1', 'G': '0', 'T': '2'},
    'C': {'A': '2', 'G': '1', 'T': '0'},
    'G': {'A': '0', 'C': '2', 'T': '1'},
    'T': {'A': '1', 'C': '0', 'G': '2'}
}

# Input: string - comma-separated sequences of A,T,G,C
# Output: string - the decoded output string
def decode(myString):
    packets = [get_packet_from_template(temp)
                                        for temp in myString.split(",")]
    chars = []
    for packet in packets:
        chars.append(get_char_from_packet(packet))

    return "".join(chars)


# Input: string - a DNA sequence
# Output: string -  a single string of ternary bits corresponding to the sequence
def get_packet_from_template(template):
    packet = []
    packet.append(DECODE_TRANSITIONS['G'][template[0]])
    for i in range(1, len(template)):
        prev_base = template[i-1]
        current_letter = template[i]
        packet.append(DECODE_TRANSITIONS[prev_base][current_letter])
    return "".join(packet)


# Input: string - a ternary bit string
# Output: char - a character corresponding to the ternary bit string
def get_char_from_packet(packet):
    return chr(ternary_to_decimal(packet))


# Input: string - the input as ternary bits
# Output: int - a decimal number to convert to ternary

def ternary_to_decimal(ternary):
    decimal = 0
    exponent = len(ternary) - 1
    for c in ternary:
        decimal += int(c) * (3 ** exponent)
        exponent -= 1
    return decimal

