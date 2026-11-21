# Revisão da LP — vídeo de 16/11/2026

Referência: `WhatsApp Video 2026-11-16 at 09.50.53.mp4` (3min28s), imagem de ondas fornecida e https://sueca.aprovabox.com.br/.

## Conferência dos pedidos

| Trecho | Pedido | Implementação |
| --- | --- | --- |
| 00:06–00:19 | Substituir o fio único pela onda da marca | SVG com 12 linhas, cinza/vermelho; ampliado e inclinado atrás do rolamento na hero; também no contato. |
| 00:19–00:28 | Padronizar fontes | Montserrat local, pesos 400–700; hierarquia comum de títulos, textos e controles. |
| 00:29–00:49 | Diferenciais em destaque sem cards; “Produtos de alta tecnologia” | Texto aberto com acento vermelho; sem fundo, borda ou caixa. |
| 00:49–00:58 | Retirar a tarja de “SKF na SUECA” | Texto vermelho, sem tarja. |
| 00:58–01:21 | Informar estados e ampliar a descrição de produtos | Mapa com RS, PR, SP, MT e GO; lista de estados; descrição institucional com as linhas já confirmadas no portfólio. |
| 01:21–01:49 | App mais contínuo, textos maiores e cinza escuro | Seção sem card; nome do app sem cápsula; texto de 17px no desktop; ícones em cinza, legendas alinhadas. Botões das lojas preservados. |
| 01:49–02:26 | Diminuir espaços e variar o alinhamento | Espaçamentos reduzidos; títulos centrais no portfólio, rolamento, segmentos e certificações, intercalados com composições laterais. |
| 02:26–02:53 | Compactar a página e acrescentar contato junto ao rolamento | Botão de contato após a introdução do rolamento; ritmo de seções reduzido. |
| 02:53–03:15 | Trocar o técnico repetido por uma técnica | Imagem ilustrativa da técnica de manutenção na seção Indústria. |
| 03:15–03:28 | FAQ após contato; onda também no contato | FAQ ao final do conteúdo principal; onda multilinhas no contato. |

## Complementos solicitados por escrito

- Ordem: institucional → portfólio → espaço Service → precisão SKF → segmentos → certificações → aplicativo → contato → FAQ.
- O espaço Service, inicialmente reservado, foi preenchido na revisão seguinte com os textos e os quatro serviços fornecidos na imagem pelo cliente.
- Destaque do aplicativo: “Proteja-se contra falsificações.”
- Identificação da seção: “Aplicativo SKF Authenticate”.
- “Onde a SKF atua” substituído por “Segmentos”.
- Onda maior, diagonal e atrás do rolamento, mantendo seu giro.

## Movimento e desempenho

- Entradas reaparecem quando o visitante retorna às seções; cards entram em sequência.
- Ondas, composição do rolamento e imagem do app acompanham o scroll via ScrollTrigger.
- O giro da hero pausa fora da tela. Animações pausam com a aba oculta.
- A preferência de movimento reduzido é respeitada, inclusive quando alterada com a página aberta.
- Navegação pelo teclado expõe imediatamente o conteúdo que recebe foco.
- Atualizações do cabeçalho são agrupadas por quadro com `requestAnimationFrame`.
- Imagens WebP: 12,44 → 3,02 MiB no conjunto convertido. A imagem do app é lossless e pixel a pixel idêntica ao original.
- Dimensões explícitas nas imagens, decodificação assíncrona, carregamento tardio abaixo da hero e fontes locais prioritárias.

## Validação

Os 12 testes automatizados passaram: retorno das animações, pausa da aba, foco por teclado, limpeza de observadores, mudança para movimento reduzido, recuperação após falha e seleção de filiais/localização. Conferidos também JavaScript, referências locais, SVG, identificadores, âncoras e ordem das seções.

Limite: o host de acesso ao navegador estava indisponível nesta sessão. Não foi possível confirmar a composição final em uma captura do navegador nem medir Core Web Vitals; a redução informada é de bytes de arquivos, não uma medição de velocidade de carregamento.
