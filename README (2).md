# 🧌 Merge Troll – Jogo de Fusão

> Um jogo de puzzle de merge estilo 2048 com tabuleiro 5×5, estilingue e o simpático Troll!

![Merge Troll Banner](https://img.shields.io/badge/Jogo-Merge%20Troll-orange?style=for-the-badge&logo=gamepad)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🎮 Como Jogar

| Ação | Controle |
|------|----------|
| Soltar bloco em uma coluna | **Clique/toque** na coluna desejada |
| Desfazer última jogada | Botão **↩** ou tecla **Z** |
| Trocar bola atual ↔ próxima | Botão **🔄** ou tecla **S** |
| Pausar | Botão **⏸** ou tecla **Escape** |
| Escolher coluna (teclado) | Teclas **1 a 5** |

### 📜 Regras
- O tabuleiro tem **5 colunas e 5 linhas**.
- Você lança blocos numerados de cima para baixo em cada coluna.
- Blocos do **mesmo valor** que ficam adjacentes (em uma coluna) **se fundem** e dobram o valor.
- A gravidade faz todos os blocos **caírem** para a posição mais baixa disponível.
- Chegue ao bloco **2048** para vencer! Após ganhar, você pode continuar para pontuações maiores.
- O jogo acaba quando o **tabuleiro está completamente cheio**.

---

## ✨ Funcionalidades

| Feature | Detalhe |
|---------|---------|
| 🎨 Arte CSS pura | Personagens desenhados 100% com CSS (sem imagens externas) |
| 📱 Responsivo | Funciona em mobile e desktop |
| 💾 Recorde salvo | Melhor pontuação salva no `localStorage` |
| ↩ Undo | Desfaz a última jogada (1 nível) |
| 🔄 Swap | Troca a bola atual com a próxima (3 trocas por partida) |
| ⭐ Pontuação | Pontos = soma dos valores de cada fusão |
| 📈 Níveis | Nível sobe automaticamente conforme a pontuação |
| 🎉 Partículas | Efeitos visuais em vitória e fusões especiais |
| ⌨️ Teclado | Suporte completo por teclado para jogar no PC |
| 🌙 Tela de loading | Animação de carregamento com barra de progresso |

---

## 🚀 Como Executar

### Localmente
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/merge-troll.git

# Entre na pasta
cd merge-troll

# Abra no navegador (qualquer método):
# Opção 1: Abra o index.html diretamente no browser
# Opção 2: Use um servidor local
npx serve .
# ou
python3 -m http.server 8080
```

### GitHub Pages
1. Faça o push para o GitHub
2. Vá em **Settings → Pages**
3. Selecione a branch `main` e pasta `/root`
4. Acesse em `https://seu-usuario.github.io/merge-troll`

---

## 📁 Estrutura de Arquivos

```
merge-troll/
├── index.html   # Estrutura principal do jogo (HTML semântico)
├── style.css    # Todos os estilos, animações e arte CSS
├── game.js      # Lógica do jogo, mecânicas e controles
└── README.md    # Este arquivo
```

---

## 🎨 Paleta de Cores dos Blocos

| Valor | Cor |
|-------|-----|
| 2 | 🔴 Vermelho |
| 4 | 🩷 Rosa |
| 8 | 🟣 Roxo |
| 16 | 🔵 Azul |
| 32 | 🟢 Verde |
| 64 | 🟠 Laranja escuro |
| 128 | 🟧 Laranja |
| 256 | 🩵 Ciano |
| 512 | 💚 Verde médio |
| 1024 | 🧡 Âmbar |
| 2048 | 🌟 Dourado brilhante |

---

## 🛠️ Tecnologias

- **HTML5** – Estrutura e semântica
- **CSS3** – Estilos, animações, arte de personagens sem imagens
- **JavaScript ES6+** – Lógica do jogo, gerenciamento de estado, eventos
- **localStorage** – Persistência do recorde

---

## 📝 Licença

MIT © 2024 – Livre para uso, modificação e distribuição.

---

<p align="center">Feito com ❤️ e muito CSS 🎨</p>
