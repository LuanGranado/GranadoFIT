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

## Ampliação — catálogo e personalização (30/09/2026)

### Problema

Digitar o nome de cada exercício ou alimento torna a ficha lenta de montar. Também falta uma referência visual para o movimento e os músculos trabalhados, e a semana precisa refletir apenas os dias em que a pessoa treina.

### Histórias de usuário

14. Como usuário, quero navegar por abas de músculos e buscar exercícios, para montar a ficha rapidamente.
15. Como usuário, quero ver uma foto do movimento e um mapa dos músculos principais e secundários antes de escolher.
16. Como usuário, quero escolher um exercício e então ajustar séries, repetições e descanso.
17. Como usuário, quero encontrar exercícios com peso corporal, pesos livres, cabos e máquinas.
18. Como usuário, quero criar um exercício privado com grupo muscular e equipamento quando o catálogo não atender.
19. Como usuário, quero desativar dias sem treino sem perder a ficha caso eu volte a usá-los.
20. Como usuário, quero buscar alimentos com valores por 100 g e informar a porção usada na refeição.
21. Como usuário, quero criar um alimento privado com valores próprios por 100 g.
22. Como usuário, quero manter minhas refeições anteriores ao atualizar o app.

### Decisões

- Catálogo público de exercícios local e versionado a partir do Free Exercise DB, com fotos locais e atribuição da fonte. Traduções selecionadas facilitam o uso em português; os demais nomes originais são mantidos.
- Mapa corporal próprio destaca músculos principais e secundários, distinto da foto do movimento.
- Catálogo público de alimentos local e versionado a partir do USDA FoodData Central SR Legacy; valores por 100 g. Itens frequentes recebem nomes em português e o restante preserva a descrição de origem.
- Itens personalizados são armazenados somente no documento da pessoa. Desativar um dia preserva seus exercícios.
- Refeições antigas com texto e calorias manuais continuam legíveis; novas refeições podem conter alimentos e porções calculadas.

### Teste

- Verificar busca, filtro muscular, cálculo de porção, migração de dados e dias desativados em testes de lógica.
- Testar com Playwright a seleção visual, criação de itens privados, edição de refeições e alternância de dias em desktop e celular.

## Ampliação — guia de execução e nomes PT-BR (30/09/2026)

23. Ao tocar no exercício da ficha, a pessoa vê um guia amplo com vídeo quando houver correspondência verificada, ou duas imagens da execução quando não houver.
24. O guia mostra os músculos, a configuração da ficha e passos em português; permite editar séries e marcar a conclusão.
25. A busca, a ficha e o guia apresentam nomes em português brasileiro. O nome original permanece como sinônimo de busca.

**Decisão revista:** a tradução parcial da etapa anterior foi substituída pela base PT-BR CC0 correspondente aos mesmos IDs do Free Exercise DB, com ajustes manuais para termos usuais no Brasil. O guia usa 20 clipes locais derivados de vídeos wger CC BY-SA 4.0, com autor e licença visíveis. Os demais exercícios usam duas imagens locais; nenhuma mídia é anunciada como vídeo quando é apenas uma sequência de fotos.

**Verificação:** nomes antigos da ficha são atualizados pelo ID preservando séries e repetições; vídeo deve reproduzir em navegador; fotos devem alternar; instruções e atribuição devem aparecer no guia.
