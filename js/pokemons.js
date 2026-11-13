/**************************************************************************************************
 * Objetivo: Consumir a PokéAPI (Pokémon da 1ª geração, 1996) e criar os cards dinamicamente
 * Autor: Wellington de Paula Silva
 * Versão: 1.0
 * API: https://pokeapi.co/api/v2/pokemon?limit=151
 *************************************************************************************************/

// URL base da PokéAPI limitando estritamente aos 151 Pokémon da 1ª Geração (Kanto)
const URL_API = 'https://pokeapi.co/api/v2/pokemon?limit=151'

let todosPokemons = []      // guarda os dados recebidos da API
let somenteFavoritos = false

// Dicionário para traduzir os tipos de Pokémon do inglês (API) para o português
const traducaoTipos = {
    fire: 'fogo',
    water: 'água',
    grass: 'grama',
    electric: 'elétrico',
    poison: 'veneno',
    bug: 'inseto',
    flying: 'voador',
    normal: 'normal',
    ground: 'terra',
    psychic: 'psíquico',
    rock: 'pedra',
    ice: 'gelo',
    fighting: 'lutador',
    ghost: 'fantasma',
    dragon: 'dragão',
    fairy: 'fada'
}

// Recuperar os favoritos salvos no navegador (localStorage)
let favoritos = []
try {
    favoritos = JSON.parse(localStorage.getItem('favoritos')) || []
} catch (erro) {
    favoritos = []
}

const salvarFavoritos = function () {
    try {
        localStorage.setItem('favoritos', JSON.stringify(favoritos))
    } catch (erro) {
        console.error('Não foi possível salvar os favoritos:', erro.message)
    }
}

// Cards dos pokemons
const setCreateCard = function (listaPokemons) {
    let divCards = document.getElementById('cardPersonagens')
    divCards.innerText = '' // limpa os cards anteriores

    listaPokemons.forEach(function (pokemon) {

        // Criação dinâmica dos elementos HTML do card
        let divCard      = document.createElement('div')
        let divTopo      = document.createElement('div')
        let h2Nome       = document.createElement('h2')
        let spanCoracao  = document.createElement('span')
        let figureImagem = document.createElement('figure')
        let imgPokemon   = document.createElement('img')
        let divTexto     = document.createElement('div')
        let divTipos     = document.createElement('div')
        let pNumero      = document.createElement('p')
        let pMedidas     = document.createElement('p')

        // Atribuição de classes CSS para estilização
        divCard.setAttribute('class', 'card')
        divTopo.setAttribute('class', 'card_topo')
        spanCoracao.setAttribute('class', 'coracao')
        spanCoracao.setAttribute('title', 'Favoritar')
        figureImagem.setAttribute('class', 'card_imagem')
        imgPokemon.setAttribute('src', pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default)
        imgPokemon.setAttribute('alt', 'Imagem do Pokémon ' + pokemon.name)
        divTexto.setAttribute('class', 'card_texto')
        divTipos.setAttribute('class', 'tipos')

        // Textos
        h2Nome.innerText      = pokemon.name
        spanCoracao.innerText = favoritos.includes(pokemon.id) ? '♥' : '♡'
        pNumero.innerText     = 'Nº ' + String(pokemon.id).padStart(3, '0')
        pMedidas.innerText    = 'Altura: ' + (pokemon.height / 10) + ' m | Peso: ' + (pokemon.weight / 10) + ' kg'

        // Tipo do pokemon
        pokemon.types.forEach(function (itemTipo) {
            let spanTipo = document.createElement('span')
            let tipoIngles = itemTipo.type.name

            // A classe continua em inglês para o CSS aplicar a cor correta (.tipo.grass)
            spanTipo.setAttribute('class', 'tipo ' + tipoIngles)

            // O texto exibido usa o dicionário em português
            spanTipo.innerText = traducaoTipos[tipoIngles] || tipoIngles

            divTipos.appendChild(spanTipo)
        })

        // Associação de elementos
        divCards.appendChild(divCard)
        divCard.appendChild(divTopo)
        divTopo.appendChild(h2Nome)
        divTopo.appendChild(spanCoracao)
        divCard.appendChild(figureImagem)
        figureImagem.appendChild(imgPokemon)
        divCard.appendChild(divTexto)
        divTexto.appendChild(divTipos)
        divTexto.appendChild(pNumero)
        divTexto.appendChild(pMedidas)

        // Evento: favoritar / desfavoritar
        spanCoracao.addEventListener('click', function () {
            if (favoritos.includes(pokemon.id)) {
                favoritos = favoritos.filter(function (id) { return id !== pokemon.id })
                spanCoracao.innerText = '♡'
            } else {
                favoritos.push(pokemon.id)
                spanCoracao.innerText = '♥'
            }
            salvarFavoritos()

            // Se estiver na visão de favoritos, atualiza a lista
            if (somenteFavoritos) {
                aplicarFiltros()
            }
        })
    })
}

// Busca a lista e depois os detalhes de cada Pokémon
const getDadosPokemonsAPI = async function () {
    let mensagem = document.getElementById('mensagem')

    try {
        let response = await fetch(URL_API)

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status)
        }

        let lista = await response.json()

        // A lista só tem nome e URL, então buscamos os detalhes de cada um
        let requisicoes = lista.results.map(function (item) {
            return fetch(item.url).then(function (resp) { return resp.json() })
        })

        todosPokemons = await Promise.all(requisicoes)

        mensagem.innerText = ''
        aplicarFiltros()

    } catch (erro) {
        console.error('Erro ao consumir a API:', erro.message)
        mensagem.innerText = 'Não foi possível carregar os Pokémon. Verifique sua conexão e recarregue a página.'
    }
}

// Aplica a busca por texto e o filtro de favoritos
const aplicarFiltros = function () {
    let texto = document.getElementById('busca').value.toLowerCase().trim()
    let mensagem = document.getElementById('mensagem')

    let filtrados = todosPokemons.filter(function (pokemon) {
        let combinaBusca = pokemon.name.includes(texto) || String(pokemon.id) === texto
        let combinaFavorito = !somenteFavoritos || favoritos.includes(pokemon.id)
        return combinaBusca && combinaFavorito
    })

    mensagem.innerText = filtrados.length === 0 ? 'Nenhum Pokémon encontrado.' : ''
    setCreateCard(filtrados)
}

// Eventos
document.getElementById('busca').addEventListener('input', aplicarFiltros)

document.getElementById('btnFavoritos').addEventListener('click', function () {
    somenteFavoritos = !somenteFavoritos
    this.classList.toggle('ativo', somenteFavoritos)
    this.innerText = somenteFavoritos ? 'Mostrar todos' : 'Mostrar favoritos'
    aplicarFiltros()
})

window.addEventListener('load', function () {
    getDadosPokemonsAPI()
})