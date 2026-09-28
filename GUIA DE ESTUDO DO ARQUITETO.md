# GUIA DE ESTUDO DO ARQUITETO

## Resumo executivo

Este projeto é uma boa demonstração de engenharia de software aplicada a processamento visual no navegador. Ele combina conceitos de computação gráfica, otimização de renderização, paleta limitada, algoritmos de dithering, mapeamento de luminância e uso estratégico de Canvas 2D versus WebGL.

A ideia central é simples: reduzir a qualidade da imagem para um conjunto limitado de cores e texturas, simulando os constraints de sistemas antigos, mas mantendo o resultado interessante e performático em tempo real. Em engenharia, isso representa um bom equilíbrio entre arte, algoritmo e execução em runtime.

## 1. Quantização de Cores e Paletas 8-bit

### Conceito

A quantização de cores reduz um espaço contínuo de tons para um conjunto discreto e finito. Em vez de trabalhar com milhares de cores em 24 bits, o sistema aproxima cada pixel para uma paleta com poucos níveis.

### Analogia do mundo real

É como trocar uma caixa enorme de lápis de cor por um estojo com apenas alguns tons. O artista perde variedade, mas ganha consistência, legibilidade e estética controlada.

### Como funciona no projeto

O algoritmo percorre cada pixel, mede a distância da cor atual para cada cor da paleta e escolhe a mais próxima. Em termos práticos, o projeto usa uma distância ponderada por luminância para priorizar as componentes que mais afetam a percepção visual.

### Por que isso importa

- simula a estética de consoles e computadores clássicos;
- reduz custo de processamento e memória;
- facilita a reprodução de paletas específicas, como Game Boy, CGA, cyberpunk e vaporwave;
- permite controlar a qualidade visual com parâmetros como `colorPaletteSize`.

### Como responder em entrevista

"Eu reduzo o espaço de cores para um conjunto pequeno e controlado, porque a percepção visual em sistemas retro é mais importante do que a fidelidade absoluta. Isso melhora a performance e produz uma estética consistente, além de refletir como os hardwares antigos operavam com memória e paleta limitadas."

## 2. Dithering Ordenado (Matriz de Bayer)

### Conceito

O dithering ordenado usa uma matriz de thresholds para suavizar o efeito de quantização. Em vez de transformar a imagem em uma sequência rígida de blocos, o algoritmo distribui o erro visual de forma estruturada pela imagem.

### Analogia do mundo real

É como um fotografador imprime uma paisagem em um jornal com pontos pretos e brancos: ele não consegue reproduzir todo o detalhe, mas espalha os pontos de forma inteligente para criar a ilusão de gradação.

### Como funciona no projeto

A matriz Bayer 4x4 ou 8x8 é aplicada a cada pixel. Cada posição da matriz gera um offset de threshold; isso faz com que diferentes pixels sejam arredondados para níveis diferentes, criando transições menos abruptas mesmo com paleta limitada.

### Por que isso importa

- reduz bandas artificiais e degradês duros;
- reproduz a aparência de displays antigos;
- oferece um controle visual entre nitidez e textura retro;
- é eficiente porque depende de operações simples por pixel e não de um pipeline pesado.

### Como responder em entrevista

"O dithering ordenado é uma forma de distribuir visualmente o erro de quantização. Em vez de todos os pixels serem arredondados da mesma forma, usamos uma matriz para quebrar a regularidade, o que deixa a imagem mais natural e mais semelhante ao comportamento de sistemas de baixa profundidade de cor."

## 3. Mapeamento de Luminância para ASCII / Matrix

### Conceito

Em vez de desenhar a imagem em pixels, o sistema calcula a luminância de cada região e a transforma em um caractere visual. O resultado é uma matriz de símbolos que representa a imagem em um estilo textual.

### Analogia do mundo real

É como transformar uma foto em um mapa térmico. Em vez de ver a informação cromática diretamente, você observa a intensidade da luz e a converte em um conjunto de elementos visuais que evocam volume, contraste e densidade.

### Como funciona no projeto

O código reduz a imagem para uma grade menor, calcula a luminância com uma fórmula de Rec. 601 e associa cada valor à posição de um ramp de caracteres, como um conjunto de pontos ou símbolos ASCII. Cada bloco representa um intervalo de intensidade.

### Por que isso importa

- transforma dados visuais em representação compacta;
- é uma ótima demonstração de conversão entre domínio espacial e domínio simbólico;
- combina processamento de imagem com renderização vetorial de texto em canvas;
- mostra domínio do problema além de filtros visuais.

### Como responder em entrevista

"A luminância é a chave. Em vez de tentar reproduzir a imagem pixel a pixel, eu converto a intensidade da luz em uma escala de símbolos. Isso reduz a informação, mas mantém a legibilidade estrutural e produz um efeito muito forte de representações retrô e de terminal."

## 4. Diferença entre o Pipeline Canvas 2D e WebGL (Shaders)

### Canvas 2D

O Canvas 2D é ideal para processamento por pixel no CPU. O código lê e escreve dados em `ImageData`, altera canais, aplica matrizes, paletas e dithering. Isso é flexível e estratégico para experimentações visuais.

### WebGL

O WebGL move o processamento para a GPU, com shaders executando em paralelo. Isso é particularmente eficiente para efeitos de tela inteira, como curvatura, scanlines, chroma e varreduras.

### Analogia do mundo real

Imagine um atelier manual versus uma linha de montagem. O Canvas 2D é como um artista pintando cada detalhe com cuidado; o WebGL é como uma fábrica automatizada que processa muitos elementos em paralelo.

### Como o projeto separa esses mundos

- o pipeline principal de imagem e vídeo continua em Canvas 2D, porque envolve manipulação de pixels e lógica de paleta/dithering;
- o shader WebGL entra em cena como efeito final de pós-processamento, não para resolver todo o processamento;
- isso mantém o projeto mais legível, mais controlável e mais adequado a iterações rápidas.

### Como responder em entrevista

"Eu não trataria WebGL como substituto universal do Canvas 2D. O Canvas 2D é mais conveniente para processamento por pixel e prototipagem lógica, enquanto WebGL é excelente para efeitos de tela inteira e paralelismo em GPU. A decisão correta depende da etapa do pipeline: no projeto, o processamento visual pesado fica em 2D e a etapa final de imagem fica em shader."

## 3 perguntas técnicas que podem aparecer em entrevistas ou no LinkedIn

### 1. Como você mantém a performance em tempo real no navegador sem travar a UI?

Resposta sugerida:

"Eu mantenho o loop de render separado da UI, uso canvas offscreen para processar a imagem em uma resolução menor e evito re-renders do React durante o frame. O React apenas atualiza configurações em refs, enquanto o pipeline gráfico opera em `requestAnimationFrame` e escreve diretamente em `ImageData` e em canvases de processamento. Isso reduz o custo de renderização e evita work desnecessário no React."

### 2. Por que usar Canvas 2D para o processamento e WebGL apenas para alguns efeitos?

Resposta sugerida:

"Porque cada etapa do pipeline tem um custo diferente. Dithering, quantização e manipulação de pixels são algoritmos de grande flexibilidade e são mais simples de controlar no 2D. WebGL entra para efeitos de pós-processamento em tela inteira, onde o paralelismo da GPU oferece ganho claro. Em outras palavras, uso cada ferramenta para a etapa que ela atende melhor."

### 3. Como você pensa em escalabilidade e manutenção desse tipo de sistema?

Resposta sugerida:

"Eu separo a arquitetura em camadas: entrada de mídia, processamento de pixels, opções de renderização e camada de UI. Isso torna o sistema mais testável, evolutivo e comparável com outros pipelines de processamento. Além disso, definir interfaces claras entre algoritmos e configuração reduz o acoplamento e facilita a introdução de novos efeitos sem quebrar o fluxo principal."

## Conclusão

Este projeto demonstra visão de arquitetura em contextos de graphics, otimização e UX. Ele não é apenas um filtro visual; é um bom exemplo de pipeline de processamento em tempo real com decisões técnicas bem fundamentadas.

A principal mensagem a transmitir em entrevistas é esta:

- o problema não é só “fazer um efeito bonito”;
- o problema é combinar qualidade visual, restrições de performance e escolha correta de tecnologia para cada etapa do pipeline.

Essa é a postura de engenharia que diferencia um implementador de um arquiteto.
