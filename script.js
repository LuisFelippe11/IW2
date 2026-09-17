const API = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_API = "https://pokeapi.co/api/v2/pokemon-species/";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const randomBtn = document.getElementById("randomBtn");
const themeBtn = document.getElementById("themeBtn");

const status = document.getElementById("status");

const card = document.getElementById("card");

const pDex = document.getElementById("pDex");
const pGenus = document.getElementById("pGenus");
const pImg = document.getElementById("pImg");
const pName = document.getElementById("pName");
const pIdSmall = document.getElementById("pIdSmall");
const pFlavor = document.getElementById("pFlavor");
const pHeight = document.getElementById("pHeight");
const pWeight = document.getElementById("pWeight");

const pNameCenter = document.getElementById("pNameCenter");
const pIdCenter = document.getElementById("pIdCenter");
const pTypes = document.getElementById("pTypes");
const pSize = document.getElementById("pSize");
const pOrigin = document.getElementById("pOrigin");
const pGeneration = document.getElementById("pGeneration");
const pColor = document.getElementById("pColor");

const statsList = document.getElementById("statsList");

const pArtwork = document.getElementById("pArtwork");
const pRecord = document.getElementById("pRecord");

const typeLegend = document.getElementById("typeLegend");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentPokemon = 1;

const typeColors = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"
};

const typeNames = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    electric: "Elétrico",
    grass: "Grama",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Veneno",
    ground: "Terrestre",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"
};

const colorNames = {
    red: "Vermelho",
    blue: "Azul",
    yellow: "Amarelo",
    green: "Verde",
    black: "Preto",
    brown: "Marrom",
    purple: "Roxo",
    gray: "Cinza",
    white: "Branco",
    pink: "Rosa"
};

const generationNames = {
    "generation-i": "GEN I",
    "generation-ii": "GEN II",
    "generation-iii": "GEN III",
    "generation-iv": "GEN IV",
    "generation-v": "GEN V",
    "generation-vi": "GEN VI",
    "generation-vii": "GEN VII",
    "generation-viii": "GEN VIII",
    "generation-ix": "GEN IX"
};

function formatName(name) {
    return name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function setColor(color) {
    const mainColor = typeColors[color] || "#e0483a";

    const hex = mainColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const darker = `rgb(${Math.max(0, r - 70)}, ${Math.max(0, g - 70)}, ${Math.max(0, b - 70)})`;

    document.documentElement.style.setProperty("--accent", mainColor);
    document.documentElement.style.setProperty("--deep", darker);
    document.documentElement.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
}

function createType(type) {
    const element = document.createElement("span");

    element.className = "type";

    element.textContent = typeNames[type] || formatName(type);

    element.style.background = typeColors[type] || "#777";

    return element;
}

function createLegend() {
    typeLegend.innerHTML = "";

    Object.keys(typeColors).forEach(type => {
        const element = document.createElement("span");

        element.className = "legend";

        element.textContent = typeNames[type];

        element.style.background = typeColors[type];

        typeLegend.appendChild(element);
    });
}

function createStat(name, value) {
    const stat = document.createElement("div");

    stat.className = "stat";

    const translatedNames = {
        hp: "HP",
        attack: "Ataque",
        defense: "Defesa",
        "special-attack": "Ataque Esp.",
        "special-defense": "Defesa Esp.",
        speed: "Velocidade"
    };

    const percentage = Math.min((value / 255) * 100, 100);

    stat.innerHTML = `
        <span>${translatedNames[name] || formatName(name)}</span>
        <div class="bar">
            <i style="width: ${percentage}%"></i>
        </div>
        <strong>${value}</strong>
    `;

    return stat;
}

async function loadPokemon(pokemon) {
    try {
        status.textContent = "Carregando Pokémon...";

        const response = await fetch(`${API}${pokemon}`);

        if (!response.ok) {
            throw new Error("Pokémon não encontrado");
        }

        const data = await response.json();

        let speciesData = null;

        try {
            const speciesResponse = await fetch(`${SPECIES_API}${data.id}`);
            speciesData = await speciesResponse.json();
        } catch (error) {
            console.log("Não foi possível carregar os dados da espécie.");
        }

        currentPokemon = data.id;

        updatePokemon(data, speciesData);

        status.textContent = `Registro carregado: #${String(data.id).padStart(3, "0")} • ${formatName(data.name)}`;

    } catch (error) {

        status.textContent = "Pokémon não encontrado.";

        pName.textContent = "NÃO ENCONTRADO";
        pNameCenter.textContent = "NÃO ENCONTRADO";
        pFlavor.textContent = "Não foi possível encontrar esse Pokémon.";

        pImg.removeAttribute("src");
        pArtwork.removeAttribute("src");

        console.error(error);
    }
}

function updatePokemon(data, species) {

    const id = String(data.id).padStart(3, "0");

    const name = formatName(data.name);

    const primaryType = data.types[0].type.name;

    setColor(primaryType);

    pDex.textContent = `#${id}`;

    pName.textContent = name.toUpperCase();

    pNameCenter.textContent = name.toUpperCase();

    pIdSmall.textContent = `ID ${id}`;

    pIdCenter.textContent = `#${id}`;

    pRecord.textContent = `#${id}`;

    pImg.src = data.sprites.front_default || data.sprites.other["official-artwork"].front_default;

    pImg.alt = `Imagem de ${name}`;

    const artwork =
        data.sprites.other?.["official-artwork"]?.front_default ||
        data.sprites.other?.home?.front_default ||
        data.sprites.front_default;

    pArtwork.src = artwork;

    pArtwork.alt = `Arte oficial de ${name}`;

    pHeight.textContent = `${(data.height / 10).toFixed(1)} m`;

    pWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;

    pSize.textContent =
        `${(data.height / 10).toFixed(1)} m / ${(data.weight / 10).toFixed(1)} kg`;

    pTypes.innerHTML = "";

    data.types.forEach(item => {
        pTypes.appendChild(
            createType(item.type.name)
        );
    });

    statsList.innerHTML = "";

    data.stats.forEach(stat => {
        statsList.appendChild(
            createStat(
                stat.stat.name,
                stat.base_stat
            )
        );
    });

    if (species) {

        pColor.textContent =
            colorNames[species.color.name] ||
            formatName(species.color.name);

        pGeneration.textContent =
            generationNames[species.generation.name] ||
            formatName(species.generation.name);

        const genus = species.genera.find(
            item => item.language.name === "en"
        );

        if (genus) {
            pGenus.textContent = genus.genus.toUpperCase();
        }

        const flavor = species.flavor_text_entries.find(
            item => item.language.name === "en"
        );

        if (flavor) {

            pFlavor.textContent = flavor.flavor_text
                .replace(/\f/g, " ")
                .replace(/\n/g, " ");
        }

        const generation =
            generationNames[species.generation.name];

        if (generation) {
            pGeneration.textContent = generation;
        }

        const regionNames = {
            "generation-i": "KANTO",
            "generation-ii": "JOHTO",
            "generation-iii": "HOENN",
            "generation-iv": "SINNOH",
            "generation-v": "UNOVA",
            "generation-vi": "KALOS",
            "generation-vii": "ALOLA",
            "generation-viii": "GALAR",
            "generation-ix": "PALDEA"
        };

        const region =
            regionNames[species.generation.name] ||
            "DESCONHECIDA";

        pOrigin.textContent = region;
    }
}

searchForm.addEventListener("submit", event => {

    event.preventDefault();

    const value = searchInput.value.trim().toLowerCase();

    if (!value) {
        return;
    }

    loadPokemon(value);
});

randomBtn.addEventListener("click", () => {

    const random =
        Math.floor(Math.random() * 1025) + 1;

    loadPokemon(random);
});

prevBtn.addEventListener("click", () => {

    if (currentPokemon > 1) {
        loadPokemon(currentPokemon - 1);
    }
});

nextBtn.addEventListener("click", () => {

    if (currentPokemon < 1025) {
        loadPokemon(currentPokemon + 1);
    }
});

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light");
});

pImg.addEventListener("error", () => {

    pImg.src =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png";
});

pArtwork.addEventListener("error", () => {

    pArtwork.src =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png";
});

createLegend();

loadPokemon(6);
