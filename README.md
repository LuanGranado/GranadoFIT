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
