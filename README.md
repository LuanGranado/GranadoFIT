# GranadoFit

Site responsivo para organizar treinos, alimentação, cardio e evolução corporal. O visual usa a referência **Black Iris** (`#080813`) com superfícies translúcidas.

**Site público:** [granado-fit.vercel.app](https://granado-fit.vercel.app/). A demonstração salva dados somente no navegador. Contas pessoais salvam os dados no Supabase.

## Rodar no computador

Requer Node.js. Na pasta do projeto:

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:5173/`. O botão **Explorar demonstração** funciona sem conta e salva alterações apenas neste navegador. Os dados iniciais nessa demonstração são exemplos editáveis.

## Contas pessoais

O projeto Supabase do GranadoFit já está conectado ao site público. A tabela `app_state` guarda um documento por conta e usa Row Level Security para leitura e gravação somente pelo próprio usuário. As alterações são enviadas à nuvem; se o navegador fechar antes de concluir o envio, uma cópia pendente naquele navegador é reenviada na próxima abertura da conta.

Para rodar com contas no computador, copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a URL e a chave **publicável** do projeto. A chave de serviço nunca deve ir ao navegador. O arquivo `.env.local` não entra no Git.

Por escolha para esta primeira versão, o cadastro não exige confirmação de e-mail. Antes de abrir o cadastro ao público em escala, configure SMTP próprio, reative a confirmação de e-mail e a recuperação de senha no Supabase. Sem SMTP, o serviço padrão só envia mensagens a membros autorizados da equipe.

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

As contas são separadas por usuário dentro de um único banco do projeto, não por bancos independentes. O fluxo de duas contas de teste confirmou cadastro, entrada novamente, persistência e bloqueio de leitura/gravação entre usuários. Edições simultâneas da mesma conta em dispositivos diferentes ainda usam a última gravação completa; evite editar em dois dispositivos ao mesmo tempo nesta fase.
Ainda não há cobertura gratuita verificada para todos os 876 exercícios. O app mostra vídeo somente nas 32 correspondências conferidas e mantém fotos e instruções para os outros movimentos. Novos clipes devem ser adicionados ao mapeamento em `scripts/prepare-exercise-videos.mjs` após conferir nome, variante, aparelho, licença e fotogramas.
