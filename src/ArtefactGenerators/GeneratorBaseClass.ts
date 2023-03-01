import { RNG } from "../Randomizer";

export interface ArtefactGeneratorParameters {
	[key: string]: any;
	seed: string | number;
}

export abstract class ArtefactGenerator<T> {
	constructor(private rng: RNG) {}

	public abstract generateArtefact(parameters: ArtefactGeneratorParameters): T;
}
