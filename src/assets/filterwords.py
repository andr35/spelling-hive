with open("basic_words.txt", "r") as infile:
    filtered_words = [line.strip() for line in infile if len(line.strip()) >= 4]

with open("basic_words.txt", "w") as outfile:
    for word in filtered_words:
        outfile.write(word + "\n")