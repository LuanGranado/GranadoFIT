"""Converte o CSV SR Legacy oficial da USDA em um catálogo compacto por 100 g."""

import csv
import json
from pathlib import Path

ROOT = Path('.cache/usda/csv')
OUTPUT = Path('public/data/foods.json')
NUTRIENTS = {'1003', '1004', '1005', '1008', '2047'}

FEATURED = {
    '168878': 'Arroz branco cozido',
    '169704': 'Arroz integral cozido',
    '173735': 'Feijão preto cozido',
    '172421': 'Lentilha cozida',
    '173757': 'Grão-de-bico cozido',
    '168917': 'Quinoa cozida',
    '171477': 'Peito de frango assado sem pele',
    '171474': 'Peito de frango cru com pele',
    '171287': 'Ovo inteiro cru',
    '172187': 'Ovo mexido',
    '172185': 'Omelete',
    '173944': 'Banana',
    '171688': 'Maçã com casca',
    '169097': 'Laranja',
    '167762': 'Morango',
    '174683': 'Uva',
    '167765': 'Melancia',
    '171265': 'Leite integral',
    '170886': 'Iogurte natural com baixo teor de gordura',
    '171284': 'Iogurte natural integral',
    '170894': 'Iogurte grego natural sem gordura',
    '173904': 'Aveia em flocos seca',
    '173905': 'Aveia cozida em água',
    '172688': 'Pão integral',
    '174924': 'Pão branco',
    '168928': 'Macarrão cozido',
    '168484': 'Batata-doce cozida',
    '170440': 'Batata cozida',
    '169967': 'Brócolis cozido',
    '170393': 'Cenoura crua',
    '170457': 'Tomate cru',
    '168409': 'Pepino com casca',
    '171705': 'Abacate',
    '171791': 'Carne moída bovina magra cozida',
    '171986': 'Atum em água escorrido',
    '175168': 'Salmão assado',
    '170845': 'Queijo muçarela integral',
    '171413': 'Azeite de oliva',
    '172430': 'Amendoim cru',
    '173806': 'Amendoim torrado sem sal',
    '172470': 'Pasta de amendoim sem sal',
    '171890': 'Café coado sem açúcar',
    '169098': 'Suco de laranja natural',
}

CATEGORIES = {
    'Dairy and Egg Products': 'Laticínios e ovos',
    'Spices and Herbs': 'Temperos e ervas',
    'Baby Foods': 'Alimentos infantis',
    'Fats and Oils': 'Óleos e gorduras',
    'Poultry Products': 'Aves',
    'Soups, Sauces, and Gravies': 'Sopas e molhos',
    'Sausages and Luncheon Meats': 'Embutidos',
    'Breakfast Cereals': 'Cereais matinais',
    'Fruits and Fruit Juices': 'Frutas e sucos',
    'Pork Products': 'Carne suína',
    'Vegetables and Vegetable Products': 'Vegetais',
    'Nut and Seed Products': 'Castanhas e sementes',
    'Beef Products': 'Carne bovina',
    'Beverages': 'Bebidas',
    'Finfish and Shellfish Products': 'Peixes e frutos do mar',
    'Legumes and Legume Products': 'Leguminosas',
    'Lamb, Veal, and Game Products': 'Carnes diversas',
    'Baked Products': 'Panificados',
    'Sweets': 'Doces',
    'Cereal Grains and Pasta': 'Grãos e massas',
    'Fast Foods': 'Fast food',
    'Meals, Entrees, and Side Dishes': 'Refeições prontas',
    'Snacks': 'Lanches',
    'Restaurant Foods': 'Restaurantes',
    'American Indian/Alaska Native Foods': 'Alimentos regionais dos EUA',
}


def rows(name):
    with next(ROOT.rglob(name)).open(encoding='utf-8-sig', newline='') as file:
        yield from csv.DictReader(file)


categories = {row['id']: CATEGORIES.get(row['description'], row['description']) for row in rows('food_category.csv')}
foods = {
    row['fdc_id']: {
        'id': 'usda-' + row['fdc_id'],
        'name': FEATURED.get(row['fdc_id'], row['description']),
        'originalName': row['description'],
        'category': categories.get(row['food_category_id'], 'Outros'),
        'featured': row['fdc_id'] in FEATURED,
    }
    for row in rows('food.csv')
}
values = {key: {} for key in foods}
for row in rows('food_nutrient.csv'):
    if row['fdc_id'] in values and row['nutrient_id'] in NUTRIENTS and row['amount']:
        values[row['fdc_id']][row['nutrient_id']] = float(row['amount'])

result = []
for key, food in foods.items():
    nutrient = values[key]
    if not {'1003', '1004', '1005'}.issubset(nutrient):
        continue
    energy = nutrient.get('1008', nutrient.get('2047'))
    if energy is None:
        continue
    result.append({
        **food,
        'kcal': round(energy, 1),
        'protein': round(nutrient['1003'], 1),
        'fat': round(nutrient['1004'], 1),
        'carbs': round(nutrient['1005'], 1),
    })

result.sort(key=lambda item: (not item['featured'], item['name'].casefold()))
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(json.dumps({'foods': len(result), 'featured': sum(item['featured'] for item in result), 'bytes': OUTPUT.stat().st_size}))
