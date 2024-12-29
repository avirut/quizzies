<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Tossup } from '$lib/types';
	import { difficultyMap } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Progress from '$lib/components/ui/progress/index.js';
	import { PlayCircle, PauseCircle, Zap, ChevronRight } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

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

<Card.Root class="mx-auto w-full max-w-3xl">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div class="text-muted-foreground flex items-center gap-2 text-sm">
				<span>{tossup.category}</span>
				<Separator orientation="vertical" class="h-4" />
				<span>{tossup.subcategory}</span>
			</div>
			<Badge variant="outline">
				{difficultyMap[tossup.difficulty as keyof typeof difficultyMap]}
			</Badge>
		</div>
	</Card.Header>

	<Card.Content class="relative space-y-4">
		{#if visibleText}
			<p class="prose dark:prose-invert max-w-none text-lg leading-relaxed">
				{@html visibleText}
			</p>
		{:else}
			<p class="text-muted-foreground text-lg">Press play to begin reading the question...</p>
		{/if}

		{#if showAnswer}
			<Separator class="my-4" />
			<div class="prose dark:prose-invert max-w-none">
				<p class="text-lg">{@html tossup.answer}</p>
			</div>
		{/if}

		{#if endTimerProgress > 0}
			<Progress.Root
				value={endTimerProgress * 100}
				max={100}
				class="bg-primary/20 absolute bottom-0 left-0 right-0"
			/>
		{/if}

		{#if buzzTimerProgress > 0}
			<Progress.Root
				value={buzzTimerProgress * 100}
				max={100}
				class="bg-destructive/20 absolute bottom-0 left-0 right-0"
			/>
		{/if}
	</Card.Content>

	<Card.Footer class="flex gap-2 sm:gap-4">
		<audio bind:this={audioElement} src={audioUrl} onended={handleAudioEnd} preload="auto"> </audio>

		<Button.Root
			variant="default"
			size="icon"
			onclick={togglePlayPause}
			class="h-12 w-12 sm:h-14 sm:w-14"
		>
			{#if isPlaying}
				<PauseCircle class="h-6 w-6 sm:h-8 sm:w-8" />
			{:else}
				<PlayCircle class="h-6 w-6 sm:h-8 sm:w-8" />
			{/if}
		</Button.Root>

		<Button.Root
			variant={showAnswer ? 'secondary' : 'destructive'}
			onclick={handleBuzzReveal}
			disabled={showAnswer}
			class="h-12 flex-1 text-base font-medium sm:h-14 sm:text-lg"
		>
			<Zap class="mr-2 h-5 w-5" />
			{showAnswer ? 'Revealed' : canReveal ? 'Reveal' : 'Buzz'}
		</Button.Root>

		<Button.Root
			variant="secondary"
			size="icon"
			onclick={handleNext}
			class="h-12 w-12 sm:h-14 sm:w-14"
		>
			<ChevronRight class="h-6 w-6 sm:h-8 sm:w-8" />
		</Button.Root>
	</Card.Footer>
</Card.Root>
