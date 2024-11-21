<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Tossup } from '$lib/types';
	import { difficultyMap } from '$lib/types';

	// export let tossup: Tossup;
	// export let onNext: () => void;

	let { tossup, onNext }: { tossup: Tossup; onNext: () => void } = $props();

	let audioElement: HTMLAudioElement;

	let currentWordIndex = $state(0);
	let isPlaying = $state(false);
	let progressInterval = $state<ReturnType<typeof setInterval> | undefined>(undefined);
	let audioUrl = $state('');
	let words = $state<string[]>([]);
	let wordTimings = $state<number[]>([]);

	let buzzTimerProgress = $state(0);
	let endTimerProgress = $state(0);
	let timerInterval = $state<ReturnType<typeof setInterval> | undefined>(undefined);
	let showAnswer = $state(false);
	let isBuzzed = $state(false);
	let canReveal = $state(false);

	// Derived values
	const visibleText = $derived(
		words
			.slice(0, currentWordIndex)
			.map((word, index) => (index <= (tossup.powerMark || 0) ? `<strong>${word}</strong>` : word))
			.join(' ')
	);

	const buttonText = $derived(() => {
		if (showAnswer) return 'Revealed';
		if (canReveal) return 'Reveal';
		return 'Buzz';
	});

	const buttonClass = $derived(`control-btn buzz-btn ${showAnswer ? 'revealed' : ''}`);

	// Parse tossup data when it changes
	$effect(() => {
		words = JSON.parse(tossup.question || '[]');
		wordTimings = JSON.parse(tossup.wordTiming || '[]');
	});

	// Handle audio blob creation
	$effect(() => {
		if (tossup.audio) {
			const blob = new Blob([tossup.audio], { type: 'audio/mpeg' });
			audioUrl = URL.createObjectURL(blob);
		}
	});

	onDestroy(() => {
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}
		clearInterval(timerInterval);
	});

	function togglePlayPause(): void {
		if (isPlaying) {
			audioElement.pause();
			clearInterval(progressInterval);
		} else {
			audioElement.play();
			startProgressTracking();
		}
		isPlaying = !isPlaying;
	}

	function startProgressTracking(): void {
		progressInterval = setInterval(() => {
			const currentTime = audioElement.currentTime;
			while (
				currentWordIndex < wordTimings.length &&
				wordTimings[currentWordIndex] <= currentTime
			) {
				currentWordIndex++;
			}
		}, 50);
	}

	function handleAudioEnd(): void {
		isPlaying = false;
		clearInterval(progressInterval);
		startTimer(
			5,
			(progress) => (endTimerProgress = progress),
			() => (canReveal = true)
		);
	}

	function handleNext(): void {
		audioElement.pause();
		isPlaying = false;
		currentWordIndex = 0;
		clearInterval(progressInterval);
		showAnswer = false;
		canReveal = false;
		buzzTimerProgress = 0;
		endTimerProgress = 0;
		onNext();
	}

	function handleBuzzReveal(): void {
		if (!canReveal && !showAnswer) {
			// State 1: Pre-buzz - Initial buzz
			audioElement.pause();
			isPlaying = false;
			clearInterval(progressInterval);
			isBuzzed = true;
			canReveal = true;
			startTimer(10, (progress) => {
				buzzTimerProgress = progress;
			});
		} else if (canReveal && !showAnswer) {
			// State 2: Pre-reveal - Show answer
			showAnswer = true;
			clearInterval(timerInterval);
		}
		// State 3: Post-reveal - Button does nothing
	}

	function startTimer(
		duration: number,
		onProgress: (progress: number) => void,
		onComplete?: () => void
	) {
		const startTime = Date.now();
		clearInterval(timerInterval);

		timerInterval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / (duration * 1000), 1);
			onProgress(progress);

			if (progress >= 1) {
				clearInterval(timerInterval);
				if (onComplete) onComplete();
			}
		}, 50);
	}
</script>

<div class="tossup-container">
	<div class="metadata">
		<span class="category">{tossup.category}</span>
		<span class="divider">›</span>
		<span class="subcategory">{tossup.subcategory}</span>
		<span class="difficulty">{difficultyMap[tossup.difficulty as keyof typeof difficultyMap]}</span>
	</div>

	<div class="question-container">
		{#if visibleText}
			<p class="question-text">{@html visibleText}</p>
		{:else}
			<p class="empty-text">Press play to begin reading the question...</p>
		{/if}

		{#if showAnswer}
			<div class="answer">
				<p>{@html tossup.answer}</p>
			</div>
		{/if}

		{#if endTimerProgress > 0}
			<div class="timer-bar end-timer" style="--progress: {endTimerProgress * 100}%"></div>
		{/if}

		{#if buzzTimerProgress > 0}
			<div class="timer-bar buzz-timer" style="--progress: {buzzTimerProgress * 100}%"></div>
		{/if}
	</div>

	<div class="controls">
		<audio bind:this={audioElement} src={audioUrl} onended={handleAudioEnd} preload="auto"> </audio>
		<button
			class="control-btn play-btn"
			onclick={togglePlayPause}
			aria-label={isPlaying ? 'Pause' : 'Play'}
		>
			{isPlaying ? 'Pause' : 'Play'}
		</button>

		<button
			class={buttonClass}
			onclick={handleBuzzReveal}
			aria-label={buttonText()}
			disabled={showAnswer}
		>
			{buttonText()}
		</button>

		<button class="control-btn next-btn" onclick={handleNext} aria-label="Next"> Next </button>
	</div>
</div>

<style>
	.tossup-container {
		max-width: 48rem;
		margin: 2rem auto;
		background: white;
		border-radius: 1rem;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
	}

	.metadata {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.divider {
		margin: 0 0.5rem;
		color: #9ca3af;
	}

	.difficulty {
		float: right;
		color: #6b7280;
	}

	.question-container {
		min-height: 12rem;
		padding: 1.5rem;
		background-color: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		position: relative;
	}

	.question-text {
		font-size: 1.125rem;
		line-height: 1.75;
		color: #1f2937;
	}

	.empty-text {
		color: #6b7280;
		font-size: 1.125rem;
	}

	.controls {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		background-color: white;
		border-bottom-left-radius: 1rem;
		border-bottom-right-radius: 1rem;
		position: relative;
	}

	.control-btn {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.5rem;
		transition: all 150ms ease;
	}

	.play-btn {
		background-color: #047857;
		color: white;
		min-width: 5rem;
	}

	.play-btn:hover {
		background-color: #065f46;
	}

	.buzz-btn {
		width: 100%;
		background-color: #dc2626;
		color: white;
	}

	.buzz-btn:hover {
		background-color: #b91c1c;
	}

	.buzz-btn.revealed {
		background-color: #9ca3af;
		cursor: default;
	}

	.buzz-btn.revealed:hover {
		background-color: #9ca3af;
	}

	.next-btn {
		background-color: #4b5563;
		color: white;
		margin-left: auto;
		min-width: 5rem;
	}

	.next-btn:hover {
		background-color: #374151;
	}

	button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.timer-bar {
		position: absolute;
		left: 0;
		height: 3px;
		background-color: #3b82f6;
		transition: width 50ms linear;
	}

	.end-timer {
		bottom: 0;
		width: var(--progress);
	}

	.buzz-timer {
		bottom: 0;
		width: var(--progress);
		background-color: #dc2626;
	}

	.answer {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
		color: #1f2937;
		font-size: 1.125rem;
		line-height: 1.75;
	}
</style>
