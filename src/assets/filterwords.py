# Open the input file and read its contents
with open('html.txt', 'r', encoding='utf-8') as file:
    content = file.read()

# Replace spaces with newline characters
new_content = content.replace(' ', '\n')

# Save the new content to an output file
with open('better.txt', 'w', encoding='utf-8') as file:
    file.write(new_content)

with open("better.txt", "r") as infile:
    filtered_words = [line.strip() for line in infile if len(line.strip()) >= 4]

with open("better.txt", "w") as outfile:
    for word in filtered_words:
        outfile.write(word + "\n")