# Contexto
Vamos criar um app que sera um app de músicas ao estilo spotify, só que focado em blues e jazz, deve ser elegante e classíco

# Code guideline
## html
- use tags semânticas
- use data-attributes values

## css 
- use padrão BEM 
- o app deve ser feito pensando mobile first
- use a font IBM Plex Sans do google fonts como fonte principal (https://fonts.google.com/specimen/IBM+Plex+Sans?query=ibm+plex)

## JS
- use padrão funcional
- modularize sempre que achar necessário
- separe um arquivo só pra constantes

# Screens (telas)
- o App terá 3 telas: 
  - `home` -> tela inicial com trendings playlists (aqui vamos chamar de MOODS) em um carrousel de cards retangulares e bordas arredondadas (cada um de uma cor) e embaixo desse carrousel de círculos com outros moods
    - na hora de criar a interface use como referência de design system o arquivo `ui/home.png`

  - `playlist`: ao selecionar um mood, deve abrir uma tela com as músicas daquela categoria, uma listagem com um círculo contendo a imagem da thumbnail do vídeo, e do lado direito o nome da música e embaixo o nome do autor se tiver
      - na hora de criar a interface use como referência de design system o arquivo `ui/playlist.png`

  - `playing`: tela de now playing, deve executar apenas o aúdio de um vídeo do youtube e principais botões (play, pause, previous track, next track), os botões devem ser apenas ícones svg
          - na hora de criar a interface use como referência de design system o arquivo `ui/playing.png`

# Dados 
os dados iniciais estão em src/data/seed.json




