# Revisão do GranadoFit — 30/09/2026

## Aderência à especificação

- Painel, treino semanal editável, dieta semanal editável, cardio, peso, perfil e IMC implementados.
- Fluxos de demonstração, edição de exercício, conclusão de treino, registro de cardio e peso verificados no navegador em desktop e celular.
- Acesso pessoal com Supabase Auth e dados separados por usuário foi implementado no código e no schema. O teste com uma conta real permanece pendente porque não há projeto Supabase conectado a este workspace.

## Código

- Compilação TypeScript e build de produção passaram.
- Cinco testes de lógica passaram. O gráfico é carregado somente ao abrir a evolução, reduzindo o pacote inicial.
- A base era uma pasta vazia, sem padrão de código, issue tracker ou ponto de comparação anterior. A revisão foi feita contra a especificação local e o código criado nesta entrega.
- Ponto de manutenção futuro: dividir as páginas hoje reunidas no componente principal quando o produto crescer.

## Segurança e privacidade

- O schema ativa Row Level Security e limita leitura, inserção e atualização de dados ao próprio `auth.uid()`.
- A chave de serviço não é usada no navegador. A configuração esperada usa somente a chave pública do Supabase.
- A demonstração informa que seus dados ficam neste navegador; contas reais começam sem medidas, refeições ou treinos inventados.
- Nenhum segredo foi encontrado nos arquivos de código/configuração examinados. `npm audit` retornou zero vulnerabilidades.
- As políticas RLS e o fluxo de autenticação ainda precisam de uma prova ponta a ponta em um projeto Supabase configurado antes de publicação com contas reais.

## Ampliação de catálogos — 30/09/2026

- Adição de exercícios por catálogo visual com abas musculares, filtro por equipamento, foto do movimento, mapa muscular, séries, repetições/tempo e descanso. O catálogo inclui peso corporal e pesos livres. Movimentos pessoais ficam no estado da conta, fora da biblioteca compartilhada.
- Dias sem treino podem ser desativados e reativados sem perder a ficha; o painel e os totais da semana consideram somente dias ativos.
- Refeições agora aceitam alimentos do catálogo, porções em gramas e cálculo de energia e macronutrientes. Alimentos pessoais são guardados no estado da conta.
- Catálogo importado: 876 exercícios, 873 fotos locais e 7.793 alimentos com nutrientes completos. Dados anteriores recebem migração ao carregar; exemplos antigos permanecem editáveis.
- Build TypeScript, 9 testes, consulta e edição no navegador, criação de exercício e alimento pessoal, alternância de dia e persistência após recarga verificados. Revisão visual do seletor em 1440 × 900 e 390 × 844.
- A base USDA é de referência, predominantemente em inglês e não representa todas as preparações brasileiras. O mapa muscular é um esquema visual baseado na classificação da fonte. Valores nutricionais e músculos recrutados variam com preparo, técnica e indivíduo.
- Não há projeto Supabase conectado: isolamento entre duas contas reais, RLS e sincronização remota continuam sem validação ponta a ponta. O estado de demonstração é local ao navegador.

## Guia de execução e localização — 30/09/2026

- Exercícios da ficha abrem um guia amplo, com 20 clipes MP4 H.264 locais de movimentos associados manualmente ao catálogo. Reprodução de Leg press confirmada no navegador com dimensões 960 × 540, duração 20 s e avanço do tempo de reprodução.
- Todos os 876 registros recebem nome apresentado em PT-BR; 868 incluem instruções em português e 873 têm duas imagens locais. O guia sem clipe foi conferido com troca entre as duas imagens de agachamento.
- A versão PT-BR CC0 é associada pelos IDs originais; termos mais usados no Brasil receberam revisão manual. Nomes antigos salvos são atualizados pelo ID, preservando a configuração do exercício.
- Vídeos wger foram convertidos para MP4 e incluem crédito do autor, link da fonte e licença CC BY-SA 4.0 na interface. A ausência de clipe não é apresentada como vídeo.
- Os passos traduzidos são informação geral da biblioteca. A execução real depende da técnica e condição da pessoa; o guia recomenda orientação profissional em caso de dúvida.

## Navegação, leitura e mídia coerente — 30/09/2026

- A terceira barra do vídeo de referência foi adaptada para cinco destinos no celular, com destaque vermelho na aba ativa. Evolução e perfil ficam em Mais; a navegação lateral continua disponível por esse menu.
- O controle de acessibilidade inclui escala de 100%, 115%, 130% e 150%, alto contraste e redução de animações. No celular, o modo de 150% foi conferido sem rolagem horizontal nas telas principais. A interface ainda não passou por uma auditoria formal completa de WCAG 2.2.
- Músculos aparecem como etiquetas textuais principais e auxiliares; o mapa corporal ficou em um bloco expansível. Isso evita depender apenas de cor ou de desenho para a informação.
- A biblioteca agora tem 32 clipes wger verificados. Para cada um, o cartaz e dois quadros usados como fotos são extraídos do mesmo MP4, com crédito do autor e licença na seleção e no guia. Três candidatos foram rejeitados na revisão visual porque demonstravam variações diferentes do nome do catálogo.
- Os outros 844 exercícios não receberam vídeo, pois não houve fonte gratuita revisada suficiente para uma correspondência de movimento, variante e aparelho. A busca permite filtrar os 32 com vídeo, sem esconder os demais do catálogo.
