import csv
import json
import sys

# Replace 'column1' and 'column2' with the actual names of your columns.
desired_columns = ['address']
data_to_convert = []
max_address = [1, 9999]
amount = str(sys.argv[2])
if len(sys.argv)>3:
    begin = int(sys.argv[3])
    end = int(sys.argv[4])
    max_address[0] = begin
    max_address[1] = end


# Open the CSV file
with open(sys.argv[1], mode='r', encoding='utf-8') as csv_file:
    # Create a CSV reader
    csv_reader = csv.DictReader(csv_file)
    
    count = 0
    # Process each row in the CSV
    for row in csv_reader:
        count += 1
        #print(count, row)
        #print(max_address[0])
        if count < max_address[0]:
            continue
        if count > max_address[1]:
            break
        # Select only the desired columns for each row
        selected_data = {key: row[key] for key in desired_columns}
        selected_data['amount'] = amount
        data_to_convert.append(selected_data)

# Convert the list of dictionaries to a JSON string
json_data = json.dumps(data_to_convert, indent=4)

# Print the JSON data or write it to a file
print(json_data)
with open("recipients.json","w") as file1:
    file1.write(json_data)
# Or write it to a file
# with open('output.json', 'w', encoding='utf-8') as json_file:
#     json_file.write(json_data)

