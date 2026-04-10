import json

def get_type_name(t):
    if not t:
        return 'Unknown'
    kind = t.get('kind')
    if kind == 'NON_NULL':
        return f"{get_type_name(t.get('ofType'))}!"
    if kind == 'LIST':
        return f"[{get_type_name(t.get('ofType'))}]"
    return t.get('name') or 'Unknown'

def parse_fields(fields):
    rows = []
    for field in fields:
        name = field['name']
        description = field.get('description') or ''
        return_type = get_type_name(field['type'])
        
        args = []
        for arg in field.get('args', []):
            arg_name = arg['name']
            arg_type = get_type_name(arg['type'])
            args.append(f"{arg_name}: {arg_type}")
        
        args_str = ", ".join(args)
        if args_str:
            full_name = f"`{name}({args_str})`"
        else:
            full_name = f"`{name}()`"
            
        rows.append({
            'name': full_name,
            'args': "`" + ", ".join([a.split(':')[0] for a in args]) + "`" if args else "—",
            'returns': f"`{return_type}`",
            'description': description.replace('\n', ' ')
        })
    return rows

def main():
    with open('schema.json', 'r', encoding='utf-8') as f:
        schema = json.load(f)
    
    types = schema['data']['__schema']['types']
    
    query_type = next((t for t in types if t['name'] == 'Query'), None)
    mutation_type = next((t for t in types if t['name'] == 'Mutation'), None)
    
    print("# GraphQL Schema Overview")
    
    if query_type:
        print("\n## Queries")
        print("| Query | Аргументи | Повертає | Опис |")
        print("| :--- | :--- | :--- | :--- |")
        rows = parse_fields(query_type['fields'])
        for row in rows:
            print(f"| {row['name']} | {row['args']} | {row['returns']} | {row['description']} |")
            
    if mutation_type:
        print("\n## Mutations")
        print("| Mutation | Аргументи | Повертає | Опис |")
        print("| :--- | :--- | :--- | :--- |")
        rows = parse_fields(mutation_type['fields'])
        for row in rows:
            print(f"| {row['name']} | {row['args']} | {row['returns']} | {row['description']} |")

if __name__ == "__main__":
    main()
