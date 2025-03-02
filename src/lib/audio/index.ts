import { Howl } from 'howler';

import uiBack from './back_001.webm';
import uiClick from './click_001.webm';
import uiError from './error_005.webm';
import explosion from './explosionCrunch_000.webm';
import footstep from './footstep_grass_000.webm';
import magic from './forceField_004.webm';
import knifeSlice from './knifeSlice.webm';
import laser from './laserSmall_000.webm';

const soundUrls = {
	explosion,
	footstep,
	knifeSlice,
	magic,
	laser,
	uiBack,
	uiClick,
	uiError,
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
