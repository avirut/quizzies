<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { difficultyMap } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Progress from '$lib/components/ui/progress/index.js';
	import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
	import { ChevronRight, Pause, Play } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { Tossup, PlayerState, TimerState, AudioElementRef } from '$lib/types';
	import {
		createAudioUrl,
		startTimer,
		parseQuestion,
		parseTimings,
		formatVisibleText,
		cleanupAudio,
		updateWordProgress,
		fetchTossup
	} from '$lib/utils';
	import { settings } from '$lib/stores/settings';
	import { filters } from '$lib/stores/filters';

	const QUEUE_SIZE = 5;

	let tossupQueue = $state<Tossup[]>([]);
	let tossup = $state<Tossup>();

	let audioElement: AudioElementRef;
	let scrollRequired: HTMLParagraphElement | null = $state(null);

	// Player state
	let playerState = $state<PlayerState>({
		currentWordIndex: 0,
		status: 'initial',
		isPlaying: false,
		audioUrl: '',
		words: [],
		wordTimings: [],
		buzzTimerProgress: 0,
		endTimerProgress: 0
	});

	// Timer state
	let timerState = $state<TimerState>({
		progressInterval: undefined,
		timerInterval: undefined
	});

	// Derived values
	const visibleText = $derived(
		formatVisibleText(playerState.words, playerState.currentWordIndex, tossup?.powerMark || null)
	);

	onMount(() => {
		refreshQueue();

		const unsubscribe = filters.subscribe(() => {
			clearState();
			refreshQueue();
		});

		return () => unsubscribe();
	});

	onDestroy(() => {
		clearState();
	});

	function clearState() {
		cleanupAudio(playerState.audioUrl);
		clearTimers();
		clearQueue();
	}

	function clearTimers() {
		if (timerState.timerInterval) {
			clearInterval(timerState.timerInterval);
			timerState.timerInterval = undefined;
		}
		if (timerState.progressInterval) {
			clearInterval(timerState.progressInterval);
			timerState.progressInterval = undefined;
		}
	}

	function setupTossup(newTossup: Tossup) {
		if (!newTossup) return;

		cleanupAudio(playerState.audioUrl);
		tossup = newTossup;
		playerState.audioUrl = createAudioUrl(new Uint8Array(tossup?.audio?.data || null));
		playerState.words = parseQuestion(tossup?.question || null);
		playerState.wordTimings = parseTimings(tossup?.wordTiming || null);
		playerState.currentWordIndex = 0;
		playerState.status = 'initial';
	}

	function clearQueue() {
		tossupQueue = [];
	}

	async function refreshQueue() {
		const needed = QUEUE_SIZE - tossupQueue.length + (tossup ? 0 : 1);

		for (let i = 0; i < needed; i++) {
			try {
				const newTossup = await fetchTossup($filters.difficulties, $filters.categories);
				if (!newTossup) continue;

				if (!tossup) {
					setupTossup(newTossup);
				} else {
					tossupQueue = [...tossupQueue, newTossup];
				}
			} catch (error) {
				console.error('Failed to fetch tossup:', error);
			}
		}
	}

	function scrollToBottom(): void {
		if (!scrollRequired) return;
		scrollRequired.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}

	function togglePlayPause(): void {
		if (!audioElement) return;

		if (playerState.isPlaying) {
			audioElement.pause();
			clearInterval(timerState.progressInterval);
			playerState.isPlaying = false;
		} else {
			audioElement.play();
			startProgressTracking();
			playerState.isPlaying = true;
			if (playerState.status === 'initial') {
				playerState.status = 'reading';
			}
		}
	}

	function startProgressTracking(): void {
		if (timerState.progressInterval) clearInterval(timerState.progressInterval);

		timerState.progressInterval = setInterval(() => {
			if (!audioElement) return;

			playerState.currentWordIndex = updateWordProgress(
				audioElement.currentTime,
				playerState.wordTimings,
				playerState.currentWordIndex
			);
			if (playerState.isPlaying) {
				scrollToBottom();
			}
		}, 50);
	}

	function handleAudioEnd(): void {
		playerState.isPlaying = false;
		playerState.status = 'complete';
		clearInterval(timerState.progressInterval);

		if (timerState.timerInterval) clearInterval(timerState.timerInterval);

		timerState.timerInterval = startTimer(
			5,
			(progress) => (playerState.endTimerProgress = progress),
			() => {
				if (playerState.status !== 'revealed') {
					playerState.status = 'buzzedOrExpired';
				}
			}
		);
	}

	function handleNext(): void {
		if (!tossupQueue.length) {
			console.error('Tossup queue is empty.');
			refreshQueue();
			return;
		}

		clearTimers();
		if (audioElement) audioElement.pause();

		playerState.isPlaying = false;
		playerState.currentWordIndex = 0;
		playerState.status = 'initial';
		playerState.buzzTimerProgress = 0;
		playerState.endTimerProgress = 0;

		setupTossup(tossupQueue.shift() as Tossup);
		refreshQueue();

		if ($settings.autoplayNext) {
			setTimeout(togglePlayPause, 100);
		}
	}

	function handleBuzzReveal(): void {
		if (['initial', 'reading', 'complete'].includes(playerState.status)) {
			if (audioElement) audioElement.pause();
			playerState.isPlaying = false;
			clearInterval(timerState.progressInterval);
			playerState.status = 'buzzedOrExpired';

			if (timerState.timerInterval) clearInterval(timerState.timerInterval);

			timerState.timerInterval = startTimer(
				10,
				(progress) => (playerState.buzzTimerProgress = progress)
			);
		} else if (playerState.status === 'buzzedOrExpired') {
			playerState.status = 'revealed';
			clearTimers();
			setTimeout(scrollToBottom, 50);
		} else if (playerState.status === 'revealed') {
			// Return to pre-buzz state based on question progress
			clearTimers();
			playerState.buzzTimerProgress = 0;
			playerState.endTimerProgress = 0;

			// If we're at the end of the question, return to 'complete'
			// Otherwise, return to 'reading' state
			playerState.status =
				playerState.currentWordIndex >= playerState.words.length ? 'complete' : 'reading';

			if (playerState.status === 'reading' && audioElement) {
				// Reset audio to current word timing if we're mid-question
				const currentWordTiming = playerState.wordTimings[playerState.currentWordIndex] || 0;
				audioElement.currentTime = currentWordTiming;
			}
		}
	}
</script>

<div class="mx-4 my-auto h-[calc(100vh-6rem)] md:my-8 md:h-[50vh]">
	<Card.Root class="flex h-full flex-col">
		<Card.Header class="flex-none">
			<div class="flex items-center justify-between">
				<div class="text-muted-foreground flex items-center gap-2 text-sm">
					<span>{tossup?.category}</span>
					<Separator orientation="vertical" class="hidden h-4 md:block" />
					<span class="hidden md:block">{tossup?.subcategory}</span>
				</div>
				<Badge variant="outline">
					{difficultyMap[tossup?.difficulty as keyof typeof difficultyMap]}
				</Badge>
			</div>
		</Card.Header>

		<Card.Content class="min-h-0 flex-1 px-0">
			<ScrollArea.Root class="h-full">
				<div class="scrollable-content space-y-4 px-6 pb-4">
					{#if visibleText}
						<p
							class="prose dark:prose-invert max-w-none text-lg leading-relaxed"
							bind:this={scrollRequired}
						>
							{@html visibleText}
						</p>
					{:else}
						<p class="text-muted-foreground text-lg">Press play to begin reading the question...</p>
					{/if}

					{#if playerState.status == 'revealed' && tossup?.answer}
						<Separator class="my-4" />
						<div class="prose dark:prose-invert max-w-none">
							<p class="text-lg" bind:this={scrollRequired}>
								{@html tossup?.answer}
							</p>
						</div>
					{/if}
				</div>
			</ScrollArea.Root>
		</Card.Content>

		<div class="bg-card flex-none">
			<div class="h-1">
				{#if playerState.endTimerProgress > 0 && playerState.buzzTimerProgress <= 0}
					<Progress.Root
						value={playerState.endTimerProgress * 100}
						max={100}
						class="bg-primary/20 h-full w-full rounded-none"
					/>
				{/if}

				{#if playerState.buzzTimerProgress > 0}
					<Progress.Root
						value={playerState.buzzTimerProgress * 100}
						max={100}
						class="bg-destructive/20 h-full w-full rounded-none"
					/>
				{/if}
			</div>

			<Card.Footer class="flex gap-2 pt-8 sm:gap-4">
				<audio
					bind:this={audioElement}
					src={playerState.audioUrl}
					onended={handleAudioEnd}
					preload="auto"
				>
				</audio>

				<Button.Root
					variant="secondary"
					size="icon"
					onclick={togglePlayPause}
					class="h-12 w-12 sm:h-14 sm:w-14"
				>
					{#if playerState.isPlaying}
						<Pause class="h-6 w-6 sm:h-8 sm:w-8" />
					{:else}
						<Play class="h-6 w-6 sm:h-8 sm:w-8" />
					{/if}
				</Button.Root>

				<Button.Root
					variant={playerState.status === 'revealed' ? 'secondary' : 'destructive'}
					onclick={handleBuzzReveal}
					class="h-12 flex-1 text-base font-medium sm:h-14 sm:text-lg"
				>
					{#if playerState.status === 'revealed'}
						Unreveal
					{:else if playerState.status === 'buzzedOrExpired'}
						Reveal
					{:else}
						Buzz
					{/if}
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
		</div>
	</Card.Root>
</div>
