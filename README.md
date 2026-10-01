# GranadoFit

Site responsivo para organizar treinos, alimentação, cardio e evolução corporal. O visual usa a referência **Black Iris** (`#080813`) com superfícies translúcidas.

## Rodar no computador

Requer Node.js. Na pasta do projeto:

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:5173/`. O botão **Explorar demonstração** funciona sem conta e salva alterações apenas neste navegador. Os dados iniciais nessa demonstração são exemplos editáveis.

## Ativar contas pessoais

1. Crie um projeto no Supabase.
2. Execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor do projeto. A tabela usa Row Level Security para limitar cada pessoa aos próprios dados.
3. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a URL e a chave pública do projeto. Nunca use a service role key no navegador.
4. Configure o endereço do site em **Authentication → URL Configuration** e habilite o provedor de e-mail conforme a política desejada.
5. Reinicie `npm run dev`.

Contas novas começam sem medidas corporais, treinos ou refeições presumidos. Após o primeiro acesso, a pessoa preenche o perfil e personaliza os planos. O IMC é uma referência geral, não um diagnóstico. Dieta e treino não são prescritos automaticamente.

## Catálogos e fichas

- **Treinos:** 876 exercícios pesquisáveis por nome, grupo muscular e equipamento. Todos têm nome apresentado em português do Brasil; 873 têm duas fotos locais da execução e 868 têm instruções em português. Há 32 vídeos locais para movimentos correspondidos e revisados. Nesses exercícios, as fotos são quadros do mesmo vídeo; nos demais, o guia mostra as posições em fotos. O filtro **Só com vídeo** facilita encontrar a cobertura disponível. Ao tocar em um exercício da ficha, a pessoa abre um guia maior com mídia, músculos, instruções e séries. Há movimentos com peso corporal, halteres, barra, cabo e máquinas. Cada dia pode ser ativado ou colocado em folga sem apagar sua ficha.
- **Alimentação:** 7.793 alimentos com energia e macronutrientes por 100 g. A pessoa escolhe os itens, informa gramas e vê os totais calculados da refeição. Os alimentos comuns aparecem com nomes em português; a base completa mantém a descrição original em inglês quando não há tradução revisada.
- Exercícios e alimentos criados pela pessoa entram somente nos dados da demonstração local ou, quando o Supabase for conectado, no registro privado da própria conta. Não alteram o catálogo compartilhado.

O catálogo de exercícios deriva do [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (Unlicense), com nomes e instruções da [versão PT-BR](https://github.com/gugeldev/exercicios-bd-ptbr) (CC0) e ajustes terminológicos do GranadoFit. Os 32 clipes vêm do [wger](https://wger.de/), têm atribuição individual no guia e licença CC BY-SA 4.0. O catálogo alimentar deriva do [USDA FoodData Central SR Legacy, abril de 2018](https://fdc.nal.usda.gov/download-datasets/) (domínio público/CC0). Os dados gerados estão em `public/data/`, as imagens em `public/exercises/` e os vídeos em `public/videos/`. Para atualizar os exercícios, execute `node scripts/prepare-exercise-catalog.mjs` e depois `node scripts/prepare-exercise-videos.mjs` (requer FFmpeg). Para atualizar o CSV alimentar, baixe o pacote SR Legacy oficial, extraia em `.cache/usda/csv/` e execute `scripts/prepare-food-catalog.py` com Python. Essas operações só são necessárias para manutenção da base.

No celular, a navegação principal fica em uma barra inferior; **Mais** abre evolução e perfil. O botão de acessibilidade permite ampliar a interface até 150%, ativar alto contraste e reduzir animações. No guia de exercícios, os músculos aparecem por nome; o mapa corporal pode ser aberto quando desejado.

## Verificação

```bash
npm test
npm run build
npm audit
```

Prévia visual: [`docs/previews`](docs/previews). Especificação: [`docs/spec.md`](docs/spec.md).
Revisão técnica e de segurança: [`docs/review.md`](docs/review.md).

## Limite atual

A integração com uma conta real do Supabase depende das credenciais públicas e da execução do schema no projeto escolhido. Até lá, o fluxo pessoal pode ser experimentado no modo de demonstração local.
Ainda não há cobertura gratuita verificada para todos os 876 exercícios. O app mostra vídeo somente nas 32 correspondências conferidas e mantém fotos e instruções para os outros movimentos. Novos clipes devem ser adicionados ao mapeamento em `scripts/prepare-exercise-videos.mjs` após conferir nome, variante, aparelho, licença e fotogramas.
