<script lang="ts">
	import { placemarkApi, type Placemark } from '$lib/api';
	import { isAuthenticated, requireAuth } from '$lib/auth';
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	import { onMount } from 'svelte';

	let map: LeafletMap;
	let placemarks = $state<Placemark[]>([]);
	let loading = $state(true);
	let error = $state('');
	let mapReady = $state(false);

	onMount(() => {
		if (!isAuthenticated()) {
			requireAuth();
			return;
		}
		loadPlacemarks();
	});

	async function loadPlacemarks() {
		try {
			loading = true;
			error = '';
			placemarks = await placemarkApi.findAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error loading placemarks';
		} finally {
			loading = false;
		}
	}

	function createPopupContent(placemark: Placemark): string {
		const imgHtml = placemark.img
			? `<img src="${placemark.img}" alt="${placemark.title}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />`
			: `<img src="/favicon.png" alt="Placeholder" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto 8px; display: block; background: #f5f5f7; padding: 8px; border-radius: 4px;" />`;

		return `
			<div style="min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
				${imgHtml}
				<h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1d1d1f;">${placemark.title}</h3>
				<p style="margin: 0 0 4px 0; font-size: 12px; color: #86868b;">${placemark.category}</p>
				<p style="margin: 0 0 8px 0; font-size: 12px; color: #1d1d1f; line-height: 1.4;">${placemark.description.substring(0, 100)}${placemark.description.length > 100 ? '...' : ''}</p>
				<a href="/dashboard" style="font-size: 12px; color: #ff6b35; text-decoration: none;">View in Dashboard →</a>
			</div>
		`;
	}

	function addMarkersToMap() {
		if (!map || !map.isReady()) {
			// Wait for map to be ready
			setTimeout(addMarkersToMap, 100);
			return;
		}

		mapReady = true;

		// Group placemarks by category and add markers
		const bounds: [number, number][] = [];

		placemarks.forEach((placemark) => {
			const popupContent = createPopupContent(placemark);
			map.addMarker(placemark.latitude, placemark.longitude, popupContent, placemark.category);
			bounds.push([placemark.latitude, placemark.longitude]);
		});

		// Fit map to show all markers
		if (bounds.length > 0) {
			const latitudes = bounds.map((b) => b[0]);
			const longitudes = bounds.map((b) => b[1]);
			const minLat = Math.min(...latitudes);
			const maxLat = Math.max(...latitudes);
			const minLng = Math.min(...longitudes);
			const maxLng = Math.max(...longitudes);

			if (bounds.length > 1) {
				map.fitBounds([
					[minLat, minLng],
					[maxLat, maxLng]
				]);
			}
		}
	}

	$effect(() => {
		if (placemarks.length > 0 && !loading) {
			addMarkersToMap();
		}
	});
</script>

<svelte:head>
	<title>Map | discoverRegensburg</title>
</svelte:head>

<div class="map-container">
	<div class="map-header">
		<h1 class="map-title">Explore Placemarks</h1>
		<p class="map-subtitle">
			View all placemarks on the map. Use the layer control (top right) to filter by category.
		</p>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	{#if loading}
		<div class="loading-container">
			<p class="loading-text">Loading placemarks...</p>
		</div>
	{:else}
		<div class="map-wrapper">
			<LeafletMap bind:this={map} height={70} />
		</div>

		<div class="map-legend">
			<p class="legend-title">Legend</p>
			<p class="legend-info">
				{placemarks.length} placemark{placemarks.length !== 1 ? 's' : ''} across
				{new Set(placemarks.map((p) => p.category)).size} categories
			</p>
		</div>
	{/if}
</div>

<style>
	.map-container {
		flex: 1;
		min-height: 100%;
		padding: 2rem;
		background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
	}

	.map-header {
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.map-title {
		font-size: 2rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0 0 0.5rem 0;
	}

	.map-subtitle {
		font-size: 1rem;
		color: #86868b;
		margin: 0;
	}

	.map-wrapper {
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e5e7;
	}

	.map-legend {
		margin-top: 1rem;
		padding: 1rem;
		background: #ffffff;
		border: 1px solid #e5e5e7;
		border-radius: 5px;
		text-align: center;
	}

	.legend-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0 0 0.25rem 0;
	}

	.legend-info {
		font-size: 0.875rem;
		color: #86868b;
		margin: 0;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
	}

	.loading-text {
		font-size: 1rem;
		color: #86868b;
	}

	.error-message {
		background: #fff5f5;
		color: #c53030;
		padding: 0.75rem 1rem;
		border-radius: 5px;
		border: 1px solid #feb2b2;
		margin-bottom: 1rem;
		font-size: 0.875rem;
		text-align: center;
	}
</style>

