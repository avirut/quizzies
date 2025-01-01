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
	import type {
		PlayerProps,
		PlayerState,
		TimerState,
		AudioElementRef
	} from '$lib/types';
	import {
		createAudioUrl,
		startTimer,
		parseQuestion,
		parseTimings,
		formatVisibleText,
		cleanupAudio,
		updateWordProgress
	} from '$lib/utils';
    import { settings } from '$lib/stores/settings';

	let { tossup, onNext }: PlayerProps = $props();

	let audioElement: AudioElementRef;
    let scrollRequired: HTMLParagraphElement | null = $state(null);

	// Player state
	let playerState = $state<PlayerState>({
		currentWordIndex: 0,
		status: 'initial',
		isPlaying: false,
		audioUrl: '',
		words: [] as string[],
		wordTimings: [] as number[],
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
		formatVisibleText(playerState.words, playerState.currentWordIndex, tossup.powerMark)
	);

	// Parse tossup data when it changes
	$effect(() => {
		playerState.words = parseQuestion(tossup.question);
		playerState.wordTimings = parseTimings(tossup.wordTiming);
	});

	// Handle audio blob creation
	$effect(() => {
		playerState.audioUrl = createAudioUrl(tossup.audio);
	});

    $effect(() => {
        if (playerState.currentWordIndex > 0) {
            scrollToBottom();
        }
    });

	onDestroy(() => {
		cleanupAudio(playerState.audioUrl);
		clearInterval(timerState.timerInterval);
		clearInterval(timerState.progressInterval);
	});

    function scrollToBottom(): void {
        scrollRequired?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

	function togglePlayPause(): void {
		if (playerState.isPlaying) {
			audioElement.pause();
			clearInterval(timerState.progressInterval);
		} else {
			audioElement.play();
			startProgressTracking();
		}
		playerState.isPlaying = !playerState.isPlaying;
	}

	function startProgressTracking(): void {
		timerState.progressInterval = setInterval(() => {
			playerState.currentWordIndex = updateWordProgress(
				audioElement.currentTime,
				playerState.wordTimings,
				playerState.currentWordIndex
			);
		}, 50);
	}

	function handleAudioEnd(): void {
		playerState.isPlaying = false;
		clearInterval(timerState.progressInterval);
		timerState.timerInterval = startTimer(
			5,
			(progress) => (playerState.endTimerProgress = progress),
			() => {if (playerState.status != 'revealed') playerState.status = 'buzzedOrExpired'}
		);
	}

	function handleNext(): void {
		audioElement.pause();
		playerState = {
			...playerState,
			isPlaying: false,
			currentWordIndex: 0,
			status: 'initial',
			buzzTimerProgress: 0,
			endTimerProgress: 0
		};
		clearInterval(timerState.progressInterval);
		onNext();
	}

	function handleBuzzReveal(): void {
		if (playerState.status == 'initial' || playerState.status == 'reading' || playerState.status == 'complete') {
			audioElement.pause();
			playerState.isPlaying = false;
			clearInterval(timerState.progressInterval);
			playerState.status = 'buzzedOrExpired';
			timerState.timerInterval = startTimer(
				10,
				(progress) => (playerState.buzzTimerProgress = progress)
			);
		} else if (playerState.status == 'buzzedOrExpired') {
			playerState.status = 'revealed';
			clearInterval(timerState.timerInterval);
		}
	}
</script>

<div class="md:h-[50vh] h-[calc(100vh-6rem)] mx-4 my-auto md:my-8">
    <Card.Root class="h-full flex flex-col">
        <Card.Header class="flex-none">
			<div class="flex items-center justify-between">
				<div class="text-muted-foreground flex items-center gap-2 text-sm">
					<span>{tossup.category}</span>
					<Separator orientation="vertical" class="h-4 hidden md:block" />
					<span class="hidden md:block">{tossup.subcategory}</span>
				</div>
				<Badge variant="outline">
					{difficultyMap[tossup.difficulty as keyof typeof difficultyMap]}
				</Badge>
			</div>
		</Card.Header>
	
        <Card.Content class="flex-1 min-h-0 px-0">
            <ScrollArea.Root class="h-full">
                <div class="scrollable-content space-y-4 px-6 pb-4">
					{#if visibleText}
						<p class="prose dark:prose-invert max-w-none text-lg leading-relaxed" bind:this={scrollRequired}>
							{@html visibleText}
						</p>
					{:else}
						<p class="text-muted-foreground text-lg">Press play to begin reading the question...</p>
					{/if}
		
					{#if playerState.status == 'revealed' && tossup.answer}
						<Separator class="my-4" />
						<div class="prose dark:prose-invert max-w-none">
							<p class="text-lg" bind:this={scrollRequired}>
								{@html tossup.answer}
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
					variant={playerState.status == 'revealed' ? 'secondary' : 'destructive'}
					onclick={handleBuzzReveal}
					disabled={playerState.status == 'revealed'}
					class="h-12 flex-1 text-base font-medium sm:h-14 sm:text-lg"
				>
					{playerState.status == 'revealed' ? 'Revealed' : playerState.status == 'buzzedOrExpired' ? 'Reveal' : 'Buzz'}
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