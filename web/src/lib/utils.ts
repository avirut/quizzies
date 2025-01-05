import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { page } from '$app/stores';
import { get } from 'svelte/store';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

// lib/components/player/utils.ts
import type { TimerCallback, TimerCompleteCallback, Tossup } from './types';

export function createAudioUrl(audio: Uint8Array | null): string {
	if (!audio) return '';
	const blob = new Blob([audio], { type: 'audio/mpeg' });
	return URL.createObjectURL(blob);
}

export function startTimer(
	duration: number,
	onProgress: TimerCallback,
	onComplete?: TimerCompleteCallback
): ReturnType<typeof setInterval> {
	const startTime = Date.now();
	const interval = setInterval(() => {
		const elapsed = Date.now() - startTime;
		const progress = Math.min(elapsed / (duration * 1000), 1);
		onProgress(progress);

		if (progress >= 1) {
			clearInterval(interval);
			if (onComplete) onComplete();
		}
	}, 50);

	return interval;
}

export function parseQuestion(question: string | null): string[] {
	try {
		return JSON.parse(question || '[]');
	} catch {
		return [];
	}
}

export function parseTimings(timings: string | null): number[] {
	try {
		return JSON.parse(timings || '[]');
	} catch {
		return [];
	}
}

export function formatVisibleText(
	words: string[], 
	currentIndex: number, 
	powerMark: number | null
): string {
	return words
		.slice(0, currentIndex)
		.map((word, index) => (
			index <= (powerMark || 0) ? 
			`<strong>${word}</strong>` : 
			word
		))
		.join(' ');
}

export function cleanupAudio(url: string): void {
	if (url) {
		URL.revokeObjectURL(url);
	}
}

export function updateWordProgress(
	currentTime: number,
	wordTimings: number[],
	currentIndex: number
): number {
	let newIndex = currentIndex;
	while (
		newIndex < wordTimings.length &&
		wordTimings[newIndex] <= currentTime
	) {
		newIndex++;
	}
	return newIndex;
}

export async function fetchTossup(difficulties: number[], categories: string[]): Promise<Tossup> {
	const response = await fetch(window.location.href + '/api/getTossup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			difficulties: difficulties,
			categories: categories
		})
	});

	if (!response.ok) {
		throw new Error('Failed to fetch tossup');
	}

	const newTossup = await response.json() as Tossup;
	return newTossup;
}

export async function fetchTossupCount(difficulties: number[], categories: string[]): Promise<number> {
	const response = await fetch(window.location.href + '/api/getTossupCount', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			difficulties: difficulties,
			categories: categories
		})
	});

	if (!response.ok) {
		throw new Error('Failed to fetch tossup');
	}

	const answer = await response.json();
	return answer.count as number;
}