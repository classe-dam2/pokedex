// ==========================================================
// EXERCICI 1: Llistar els 151 Pokémon
// ==========================================================
// TODO: Implementa la lògica de l'exercici 1 seguint els requisits

import {
	BasePokemon,
	DetailedPokemon,
	type IPokeApiDetail,
	type IPokeApiTypeResponse,
	type PokemonTypeName,
} from "./models";
import {
	amagarEstat,
	container,
	generarBotonsTipus,
	getElement,
	mostrarEstat,
	netejarCercador,
	netejarDetallCard,
	renderitzarDetallCard,
	renderitzarLlistaNoms,
} from "./utils";

const mapaPokemon = new Map<number, BasePokemon>();
const cachePokemons = new Map<number, DetailedPokemon>();

document.querySelector("#btn-show-all")?.addEventListener("click", async () => {
	mostrarEstat("Carregant llista de Pokémon...", "loading");

	fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
		.then(async (response) => {
			if (!response.ok) {
				mostrarEstat("Error al carregar la llista de Pokémon.", "error");
				return;
			}
			return await response.json();
		})
		.then((data) => {
			for (const result of data.results) {
				const pok = new BasePokemon({ name: result.name, url: result.url });

				mapaPokemon.set(
					pok.id,
					new BasePokemon({ name: result.name, url: result.url }),
				);
			}

			renderitzarLlistaNoms(mapaPokemon.values().toArray());
			amagarEstat();
			netejarCercador();
		})
		.catch(() => {
			mostrarEstat("Error al carregar la llista de Pokémon.", "error");
		});
});

// ==========================================================
// EXERCICI 2: Cercador en temps real
// ==========================================================
// TODO: Implementa la lògica de l'exercici 2 seguint els requisits

const input = getElement<HTMLInputElement>("#search-input");

input.addEventListener("input", () => {
	const searchTerm = input.value.trim().toLowerCase();

	if (searchTerm === "") {
		renderitzarLlistaNoms(mapaPokemon.values().toArray());
		return;
	}

	renderitzarLlistaNoms(
		mapaPokemon
			.values()
			.filter((pok) => {
				return pok.name.includes(searchTerm);
			})
			.toArray(),
	);
});

// ==========================================================
// EXERCICI 3: Detall del Pokémon, cache i crit
// ==========================================================
// TODO: Implementa la lògica de l'exercici 3 seguint els requisits

async function carregarDetallPokemon(id: number) {
	mostrarEstat("buscant pokemon", "loading");

	const cached: DetailedPokemon | undefined = cachePokemons.get(id);

	if (cached) {
		renderitzarDetallCard(cached);
		amagarEstat();
		return;
	}

	const url = `https://pokeapi.co/api/v2/pokemon/${id}`;

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const pokemon: IPokeApiDetail = await res.json();
		const result = new DetailedPokemon(pokemon, url);
		cachePokemons.set(id, result);

		renderitzarDetallCard(result);
		amagarEstat();
	} catch {
		mostrarEstat("error al obtenir el pokemon", "error");
	}
}

container.addEventListener("click", (e) => {
	const li = (e.target as HTMLElement).closest("li");
	const id = Number(li?.dataset.id);
	if (!id) return;

	carregarDetallPokemon(id);
});

// ==========================================================
// EXERCICI 4: Botons de filtre per tipus
// ==========================================================
// TODO: Implementa la lògica de l'exercici 4 seguint els requisits

window.onload = () => {
	generarBotonsTipus();
};

// ==========================================================
// EXERCICI 5: Filtrar la llista per tipus
// ==========================================================
// TODO: Implementa la lògica de l'exercici 5 seguint els requisits

export async function carregarPokemonPerTipus(tipus: PokemonTypeName) {
	mostrarEstat("Carregant llista de Pokémon...", "loading");

	let results: IPokeApiTypeResponse["pokemon"];
	try {
		const res = await fetch(`https://pokeapi.co/api/v2/type/${tipus}`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		results = ((await res.json()) as IPokeApiTypeResponse).pokemon;
	} catch {
		mostrarEstat("Error al carregar la llista de Pokémon.", "error");
		return;
	}

	mapaPokemon.clear();

	for (const pokemon of results) {
		const pok = new BasePokemon(pokemon.pokemon);
		if (pok.id > 151) {
			continue;
		}

		mapaPokemon.set(pok.id, pok);
	}

	renderitzarLlistaNoms(mapaPokemon.values().toArray());
	amagarEstat();
	netejarCercador();
	netejarDetallCard();
}
