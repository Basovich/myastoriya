import yaml
import json

with open('/home/administrator/.gemini/antigravity/brain/98c6b88d-87dd-41a1-b490-ecd85ad95311/.system_generated/steps/1159/output.txt', 'r') as f:
    data = yaml.safe_load(f)

def find_nodes(node, res):
    if 'text' in node:
        res.append({"id": node['id'], "name": node['name'], "text": node['text']})
    if 'children' in node:
        for child in node['children']:
            find_nodes(child, res)

res = []
for node in data.get('nodes', []):
    find_nodes(node, res)

for i, r in enumerate(res):
    if "упаковка" in r['text'] or "2 500" in r['text'] or "330" in r['text'] or "М`ясні" in r['text'] or "Тартар" in r['text'] or "Карпачо" in r['text'] or "Новинки" in r['text']:
        print(r)
