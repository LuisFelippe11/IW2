const API_POKE = "https://pokeapi.co/api/v2";
const API_TCG = "https://api.pokemontcg.io/v2/cards";

let currentPokemon = 1;
let currentPokemonName = "";

const elements = {
    status: document.getElementById("status"),
    card: document.getElementById("card"),

    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("searchInput"),

    randomBtn: document.getElementById("randomBtn"),
    themeBtn: document.getElementById("themeBtn"),

    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),

    pDex: document.getElementById("pDex"),
    pGenus: document.getElementById("pGenus"),
    pImg: document.getElementById("pImg"),

    pName: document.getElementById("pName"),
    pIdSmall: document.getElementById("pIdSmall"),
    pFlavor: document.getElementById("pFlavor"),

    pHeight: document.getElementById("pHeight"),
    pWeight: document.getElementById("pWeight"),

    pNameCenter: document.getElementById("pNameCenter"),
    pIdCenter: document.getElementById("pIdCenter"),

    pTypes: document.getElementById("pTypes"),

    pSize: document.getElementById("pSize"),
    pOrigin: document.getElementById("pOrigin"),
    pGeneration: document.getElementById("pGeneration"),
    pColor: document.getElementById("pColor"),

    statsList: document.getElementById("statsList"),

    pArtwork: document.getElementById("pArtwork"),
    pRecord: document.getElementById("pRecord"),

    recordId: document.getElementById("recordId"),

    tcgCard: document.getElementById("tcgCard"),
    tcgCardName: document.getElementById("tcgCardName"),
    tcgCardId: document.getElementById("tcgCardId"),

    led: document.getElementById("led"),
    typeLegend: document.getElementById("typeLegend")
};

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

const generationNames = {
    1: "GEN I",
    2: "GEN II",
    3: "GEN III",
    4: "GEN IV",
    5: "GEN V",
    6: "GEN VI",
    7: "GEN VII",
    8: "GEN VIII",
    9: "GEN IX"
};

const regionNames = {
    1: "KANTO",
    2: "JOHTO",
    3: "HOENN",
    4: "SINNOH",
    5: "UNOVA",
    6: "KALOS",
    7: "ALOLA",
    8: "GALAR",
    9: "PALDEA"
};

const colorNames = {
    black: "PRETO",
    blue: "AZUL",
    brown: "MARROM",
    gray: "CINZA",
    green: "VERDE",
    pink: "ROSA",
    purple: "ROXO",
    red: "VERMELHO",
    white: "BRANCO",
    yellow: "AMARELO"
};

function formatName(name) {
    return name
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatNumber(number) {
    return `#${String(number).padStart(3, "0")}`;
}

function setStatus(message) {
    if (elements.status) {
        elements.status.textContent = message;
    }
}

function setTheme(type) {
    const color = typeColors[type] || "#ef5350";

    const hex = color.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const darker = Math.max(r - 80, 0)
        .toString(16)
        .padStart(2, "0")
        +
        Math.max(g - 80, 0)
            .toString(16)
            .padStart(2, "0")
        +
        Math.max(b - 80, 0)
            .toString(16)
            .padStart(2, "0");

    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--deep", `#${darker}`);
    document.documentElement.style.setProperty(
        "--accent-rgb",
        `${r}, ${g}, ${b}`
    );
}

function clearTCGCard() {
    if (elements.tcgCard) {
        elements.tcgCard.src = "";
        elements.tcgCard.alt = "Carta Pokémon TCG não encontrada";
    }

    if (elements.tcgCardName) {
        elements.tcgCardName.textContent = "SEM CARTA";
    }

    if (elements.tcgCardId) {
        elements.tcgCardId.textContent = "---";
    }
}

async function loadTCGCard(pokemonName) {
    clearTCGCard();

    try {
        const query = encodeURIComponent(`name:${pokemonName}`);

        const response = await fetch(
            `${API_TCG}?q=${query}&pageSize=20&orderBy=-set.releaseDate`
        );

        if (!response.ok) {
            throw new Error("Erro na API TCG");
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            const fallbackQuery = encodeURIComponent(
                `name:${pokemonName}*`
            );

            const fallbackResponse = await fetch(
                `${API_TCG}?q=${fallbackQuery}&pageSize=20&orderBy=-set.releaseDate`
            );

            if (!fallbackResponse.ok) {
                throw new Error("Carta não encontrada");
            }

            const fallbackData = await fallbackResponse.json();

            if (!fallbackData.data || fallbackData.data.length === 0) {
                return;
            }

            showTCGCard(fallbackData.data[0]);
            return;
        }

        showTCGCard(data.data[0]);

    } catch (error) {
        console.error("Erro TCG:", error);
        clearTCGCard();
    }
}

function showTCGCard(card) {
    if (!card) {
        return;
    }

    if (elements.tcgCard && card.images) {
        elements.tcgCard.src = card.images.large || card.images.small || "";
        elements.tcgCard.alt = `Carta ${card.name}`;
    }

    if (elements.tcgCardName) {
        elements.tcgCardName.textContent =
            card.name || "TCG CARD";
    }

    if (elements.tcgCardId) {
        elements.tcgCardId.textContent =
            card.id || "---";
    }
}

async function loadPokemon(identifier) {
    setStatus("Carregando Pokémon...");

    try {
        const pokemonResponse = await fetch(
            `${API_POKE}/pokemon/${encodeURIComponent(identifier)}`
        );

        if (!pokemonResponse.ok) {
            throw new Error("Pokémon não encontrado");
        }

        const pokemon = await pokemonResponse.json();

        const speciesResponse = await fetch(
            pokemon.species.url
        );

        const species = await speciesResponse.json();

        currentPokemon = pokemon.id;
        currentPokemonName = pokemon.name;

        updatePokemon(pokemon, species);

        await loadTCGCard(pokemon.name);

        setStatus(
            `${formatName(pokemon.name)} carregado com sucesso`
        );

    } catch (error) {
        console.error(error);

        setStatus(
            "Pokémon não encontrado. Digite um nome ou número válido."
        );
    }
}

function updatePokemon(pokemon, species) {
    const name = formatName(pokemon.name);
    const number = formatNumber(pokemon.id);

    const types = pokemon.types.map(
        item => item.type.name
    );

    const primaryType = types[0];

    setTheme(primaryType);

    if (elements.pDex) {
        elements.pDex.textContent = number;
    }

    if (elements.pGenus) {
        const genusEntry = species.genera.find(
            item => item.language.name === "en"
        );

        elements.pGenus.textContent =
            genusEntry
                ? genusEntry.genus.toUpperCase()
                : "SPECIES";
    }

    if (elements.pImg) {
        elements.pImg.src =
            pokemon.sprites.front_default ||
            pokemon.sprites.other?.["official-artwork"]?.front_default ||
            "";

        elements.pImg.alt = name;
    }

    if (elements.pArtwork) {
        elements.pArtwork.src =
            pokemon.sprites.other?.["official-artwork"]?.front_default ||
            pokemon.sprites.front_default ||
            "";

        elements.pArtwork.alt = `Arte oficial de ${name}`;
    }

    if (elements.pName) {
        elements.pName.textContent = name.toUpperCase();
    }

    if (elements.pIdSmall) {
        elements.pIdSmall.textContent =
            `ID ${String(pokemon.id).padStart(3, "0")}`;
    }

    if (elements.pNameCenter) {
        elements.pNameCenter.textContent =
            name.toUpperCase();
    }

    if (elements.pIdCenter) {
        elements.pIdCenter.textContent = number;
    }

    if (elements.recordId) {
        elements.recordId.textContent = number;
    }

    if (elements.pRecord) {
        elements.pRecord.textContent = number;
    }

    if (elements.pHeight) {
        elements.pHeight.textContent =
            `${(pokemon.height / 10).toFixed(1)} m`;
    }

    if (elements.pWeight) {
        elements.pWeight.textContent =
            `${(pokemon.weight / 10).toFixed(1)} kg`;
    }

    if (elements.pSize) {
        elements.pSize.textContent =
            `${(pokemon.height / 10).toFixed(1)} m / ${(pokemon.weight / 10).toFixed(1)} kg`;
    }

    updateTypes(types);

    updateSpecies(species);

    updateFlavor(species);

    updateStats(pokemon.stats);
}

function updateTypes(types) {
    if (!elements.pTypes) {
        return;
    }

    elements.pTypes.innerHTML = "";

    types.forEach(type => {
        const span = document.createElement("span");

        span.className = "type";

        span.textContent =
            type.toUpperCase();

        span.style.background =
            typeColors[type] || "#777";

        elements.pTypes.appendChild(span);
    });
}

function updateSpecies(species) {
    const generation =
        species.generation?.name?.replace("generation-", "");

    const generationNumber =
        romanToNumber(generation);

    const region =
        regionNames[generationNumber] ||
        "REGIÃO DESCONHECIDA";

    const color =
        colorNames[species.color?.name] ||
        species.color?.name?.toUpperCase() ||
        "---";

    if (elements.pGeneration) {
        elements.pGeneration.textContent =
            generationNames[generationNumber] ||
            "GEN --";
    }

    if (elements.pOrigin) {
        elements.pOrigin.textContent =
            region;
    }

    if (elements.pColor) {
        elements.pColor.textContent =
            color;
    }
}

function romanToNumber(roman) {
    const values = {
        i: 1,
        ii: 2,
        iii: 3,
        iv: 4,
        v: 5,
        vi: 6,
        vii: 7,
        viii: 8,
        ix: 9
    };

    return values[roman] || 0;
}

function updateFlavor(species) {
    if (!elements.pFlavor) {
        return;
    }

    const entry = species.flavor_text_entries.find(
        item => item.language.name === "en"
    );

    if (!entry) {
        elements.pFlavor.textContent =
            "Descrição não disponível.";
        return;
    }

    const text = entry.flavor_text
        .replace(/\f/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    elements.pFlavor.textContent = text;
}

function updateStats(stats) {
    if (!elements.statsList) {
        return;
    }

    elements.statsList.innerHTML = "";

    const names = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SP. ATK",
        "special-defense": "SP. DEF",
        speed: "SPEED"
    };

    stats.forEach(stat => {
        const row = document.createElement("div");

        row.className = "stat-row";

        const label = document.createElement("span");

        label.textContent =
            names[stat.stat.name] ||
            stat.stat.name.toUpperCase();

        const value = document.createElement("strong");

        value.textContent =
            stat.base_stat;

        const bar = document.createElement("div");

        bar.className = "stat-bar";

        const fill = document.createElement("div");

        fill.className = "stat-fill";

        const percentage =
            Math.min(stat.base_stat / 2.55, 100);

        fill.style.width =
            `${percentage}%`;

        bar.appendChild(fill);

        row.appendChild(label);
        row.appendChild(value);
        row.appendChild(bar);

        elements.statsList.appendChild(row);
    });
}

async function searchPokemon(event) {
    event.preventDefault();

    const value =
        elements.searchInput.value.trim().toLowerCase();

    if (!value) {
        return;
    }

    await loadPokemon(value);
}

function nextPokemon() {
    if (currentPokemon >= 1025) {
        currentPokemon = 1;
    } else {
        currentPokemon++;
    }

    loadPokemon(currentPokemon);
}

function previousPokemon() {
    if (currentPokemon <= 1) {
        currentPokemon = 1025;
    } else {
        currentPokemon--;
    }

    loadPokemon(currentPokemon);
}

function randomPokemon() {
    const random =
        Math.floor(Math.random() * 1025) + 1;

    loadPokemon(random);
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
}

function createTypeLegend() {
    if (!elements.typeLegend) {
        return;
    }

    elements.typeLegend.innerHTML = "";

    Object.entries(typeColors).forEach(
        ([type, color]) => {

            const item =
                document.createElement("span");

            item.textContent =
                type.toUpperCase();

            item.style.borderColor =
                color;

            item.style.color =
                color;

            elements.typeLegend.appendChild(item);
        }
    );
}

if (elements.searchForm) {
    elements.searchForm.addEventListener(
        "submit",
        searchPokemon
    );
}

if (elements.nextBtn) {
    elements.nextBtn.addEventListener(
        "click",
        nextPokemon
    );
}

if (elements.prevBtn) {
    elements.prevBtn.addEventListener(
        "click",
        previousPokemon
    );
}

if (elements.randomBtn) {
    elements.randomBtn.addEventListener(
        "click",
        randomPokemon
    );
}

if (elements.themeBtn) {
    elements.themeBtn.addEventListener(
        "click",
        toggleTheme
    );
}

if (elements.pImg) {
    elements.pImg.addEventListener(
        "error",
        () => {
            elements.pImg.src = "";
        }
    );
}

if (elements.pArtwork) {
    elements.pArtwork.addEventListener(
        "error",
        () => {
            elements.pArtwork.src = "";
        }
    );
}

if (elements.tcgCard) {
    elements.tcgCard.addEventListener(
        "error",
        () => {
            elements.tcgCard.src = "";
        }
    );
}

createTypeLegend();

loadPokemon(1);