import yaml
import json

with open('/home/administrator/.gemini/antigravity/brain/98c6b88d-87dd-41a1-b490-ecd85ad95311/.system_generated/steps/1159/output.txt', 'r') as f:
    data = yaml.safe_load(f)

def find_nodes(node, current_group=None):
    if 'text' in node:
        text = node['text'].strip()
        if any(kw in text for kw in ["М`ясні", "Тартар", "Карпачо", "Мітболи", "Шашлык", "Томлена"]):
            print(f"Group: {current_group} | Text: {text}")
    
    if node['type'] == 'GROUP' or node['type'] == 'FRAME':
        current_group = node['id']
        
    if 'children' in node:
        for child in node['children']:
            if child['type'] == 'RECTANGLE' and 'fills' in child and child['name'] == 'Rectangle 751':
                print(f"Group: {current_group} | Image Node: {child['id']}")
            elif child['type'] == 'RECTANGLE' and child['name'] == 'Rectangle 748':
                print(f"Possible loose image Node: {child['id']}")
            
            find_nodes(child, current_group)

for node in data.get('nodes', []):
    find_nodes(node)
