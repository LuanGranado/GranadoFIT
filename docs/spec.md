# GranadoFit — especificação inicial

## Problema
Uma pessoa que treina precisa reunir ficha semanal, dieta, cardio e evolução corporal em um único lugar simples de usar.

## Solução
Site responsivo com painel pessoal, planos semanais editáveis, registro de treinos e refeições, cronômetro de cardio, dados corporais e IMC. O visual usa Black Iris como base e vidro translúcido.

## Histórias de usuário
1. Como visitante, quero conhecer o produto e abrir uma demonstração, para avaliar a experiência.
2. Como usuário, quero criar conta e entrar, para acessar meus próprios dados.
3. Como usuário, quero registrar nome, altura, peso, meta e objetivo, para personalizar o painel.
4. Como usuário, quero ver os treinos de cada dia, para saber o que fazer na semana.
5. Como usuário, quero editar exercícios, séries, repetições e descanso, para ajustar minha ficha.
6. Como usuário, quero marcar exercícios como concluídos, para acompanhar a execução.
7. Como usuário, quero ver e editar as refeições da semana, para seguir a dieta planejada.
8. Como usuário, quero marcar refeições consumidas, para acompanhar o dia.
9. Como usuário, quero usar um cronômetro de cardio com pausa e reinício, para medir a sessão.
10. Como usuário, quero guardar uma sessão de cardio, para ver o total realizado.
11. Como usuário, quero registrar novo peso e consultar o histórico, para acompanhar minha evolução.
12. Como usuário, quero ver meu IMC e sua classificação, para ter uma referência básica.
13. Como usuário, quero que meus dados privados fiquem ligados somente à minha conta.

## Decisões de implementação
- Interface React e TypeScript, com navegação interna e layout adaptável.
- Persistência de demonstração no navegador; contas reais usam Supabase Auth e um documento de dados por usuário protegido por RLS.
- O modo de demonstração é explicitamente identificado, sem simular proteção de conta.
- IMC é calculado de peso e altura; é uma referência geral, não um diagnóstico.
- Dieta e treino são registros editáveis pelo usuário, sem prescrição automática.

## Decisões de teste
- Testar a lógica pura do IMC e os fluxos visíveis de edição, conclusão, cronômetro e persistência.
- Revisar comportamento em desktop e celular com Playwright.

## Fora do escopo inicial
- Prescrição médica/nutricional automática, integração com wearables, pagamentos e área de treinador.

## Nota
Não havia repositório nem issue tracker configurado ao início; esta especificação é local e pode ser migrada para o rastreador escolhido depois.
