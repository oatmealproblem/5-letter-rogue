import { Howl } from 'howler';

import nom from './106392__j1987__carrotnom.webm';
import fall from './364660__original_sound__whoosh-simpler.webm';
import magic from './376745__zenithinfinitivestudios__fantasy_ui_button_3.webm';
import grunt from './446517__usuarioleal__47-auch.webm';
import miss from './733889__velcronator__whoosh-02.webm';
import water from './743910__alex_eapo__jump-on-water.webm';
import uiBack from './back_001.webm';
import uiClick from './click_001.webm';
import uiError from './error_005.webm';
import explosion from './explosionCrunch_000.webm';
import footstep from './footstep_grass_000.webm';
import knifeSlice from './knifeSlice.webm';
import laser from './laserSmall_000.webm';
import slime from './slime_000.webm';

const soundUrls = {
	explosion,
	fall,
	footstep,
	grunt,
	knifeSlice,
	laser,
	magic,
	miss,
	nom,
	slime,
	uiBack,
	uiClick,
	uiError,
	water,
};

export type SoundId = keyof typeof soundUrls;

const sounds = Object.fromEntries(
	Object.entries(soundUrls)
		.map<[string, Howl]>(([key, val]) => [key, new Howl({ src: val })])
		.map<[string, () => void]>(([key, val]) => [key, throttle(() => val.play(), 50)]),
);

export function playSound(sound: SoundId) {
	sounds[sound]?.();
}

function throttle<Args extends unknown[]>(
	func: (...args: Args) => void,
	delay: number,
): (...args: Args) => void {
	let timerId: number | undefined;

	return (...args: Args) => {
		if (!timerId) {
			func(...args);
		}
		timerId = setTimeout(() => {
			timerId = undefined;
		}, delay);
	};
}
