<script lang="ts">
	import type { PageData } from './$types';
	import type { Placemark } from '$lib/api';
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	import MiniMap from '$lib/components/MiniMap.svelte';

	let { data }: { data: PageData } = $props();

	let map: LeafletMap;
	let placemarks = $state<Placemark[]>(data.placemarks || []);
	let loading = $state(false);
	let error = $state('');
	let mapReady = $state(false);
	let categoryMapsExpanded = $state(true);

	const categories = $derived.by(() => {
		const cats = [...new Set(placemarks.map((p: Placemark) => p.category))].sort();
		return cats;
	});

	function getPlacemarksByCategory(category: string): Placemark[] {
		return placemarks.filter((p) => p.category === category);
	}

	function createPopupContent(placemark: Placemark): string {
		const firstImage = placemark.images && placemark.images.length > 0 
			? placemark.images[0]
			: null;
		const imgHtml = firstImage
			? `<img src="${firstImage}" alt="${placemark.title}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />`
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
			setTimeout(addMarkersToMap, 100);
			return;
		}

		mapReady = true;

		const bounds: [number, number][] = [];

		placemarks.forEach((placemark) => {
			const popupContent = createPopupContent(placemark);
			map.addMarker(placemark.latitude, placemark.longitude, popupContent, placemark.category);
			bounds.push([placemark.latitude, placemark.longitude]);
		});

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
		<!-- Category Mini Maps Section -->
		{#if categories.length > 0}
			<div class="category-maps-section">
				<button 
					class="section-header"
					onclick={() => categoryMapsExpanded = !categoryMapsExpanded}
					aria-expanded={categoryMapsExpanded}
				>
					<span class="section-icon">{categoryMapsExpanded ? '▼' : '▶'}</span>
					<span class="section-title">
						<i class="fas fa-layer-group"></i>
						Filter by Category
					</span>
					<span class="section-info">{categories.length} categories</span>
				</button>
				
				{#if categoryMapsExpanded}
					<div class="category-maps-grid">
						{#each categories as cat}
							{@const categoryPlacemarks = getPlacemarksByCategory(cat)}
							<div class="map-card">
								<div class="map-card-header">
									<span class="category-name">{cat}</span>
									<span class="category-count">{categoryPlacemarks.length} POI{categoryPlacemarks.length !== 1 ? 's' : ''}</span>
								</div>
								<MiniMap placemarks={categoryPlacemarks} category={cat} height={180} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Main Map -->
		<div class="main-map-section">
			<h2 class="section-label">
				<i class="fas fa-map"></i>
				All Placemarks
			</h2>
			<div class="map-wrapper">
				<LeafletMap bind:this={map} height={60} />
			</div>
		</div>

		<div class="map-legend">
			<p class="legend-title">Legend</p>
			<p class="legend-info">
				{placemarks.length} placemark{placemarks.length !== 1 ? 's' : ''} across
				{categories.length} categories
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

	/* Category Maps Section */
	.category-maps-section {
		background: #ffffff;
		border-radius: 5px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		margin-bottom: 1.5rem;
		overflow: hidden;
	}

	.section-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		background: #ffffff;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s ease;
	}

	.section-header:hover {
		background: #f5f5f7;
	}

	.section-icon {
		font-size: 0.75rem;
		color: #86868b;
		width: 1rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1d1d1f;
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-title i {
		color: #ff6b35;
	}

	.section-info {
		font-size: 0.875rem;
		color: #86868b;
	}

	.category-maps-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		padding: 0 1.5rem 1.5rem 1.5rem;
	}

	.map-card {
		background: #ffffff;
		border-radius: 5px;
		border: 1px solid #e5e5e7;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.map-card:hover {
		border-color: #ff6b35;
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.15);
	}

	.map-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: #fafafa;
		border-bottom: 1px solid #e5e5e7;
	}

	.category-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1d1d1f;
	}

	.category-count {
		font-size: 0.75rem;
		color: #86868b;
		background: #f5f5f7;
		padding: 0.25rem 0.5rem;
		border-radius: 10px;
	}

	/* Main Map Section */
	.main-map-section {
		margin-bottom: 1rem;
	}

	.section-label {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0 0 0.75rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-label i {
		color: #ff6b35;
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

	/* Responsive Grid */
	@media (max-width: 1400px) {
		.category-maps-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 1024px) {
		.category-maps-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.map-container {
			padding: 1rem;
		}

		.category-maps-grid {
			grid-template-columns: 1fr;
			padding: 0 1rem 1rem 1rem;
		}

		.section-header {
			padding: 0.875rem 1rem;
		}
	}
</style>
