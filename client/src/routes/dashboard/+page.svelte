<script lang="ts">
	import { placemarkApi, type Placemark, getLastCategory, setLastCategory, setToken, getToken } from '$lib/api';
	import { onMount } from 'svelte';
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import ImageSearchModal from '$lib/components/ImageSearchModal.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let placemarks = $state<Placemark[]>([]);
	let loading = $state(false);
	let error = $state('');

	let mapExpanded = $state(true);
	let formExpanded = $state(true);
	let listExpanded = $state(true);
	let selectedCategory = $state<string | null>(null);

	let map = $state<LeafletMap | null>(null);

	$effect(() => {
		if (data.placemarks) {
			placemarks = data.placemarks;
		}
	});
	let mapReady = $state(false);

	let title = $state('');
	let description = $state('');
	let category = $state(getLastCategory());
	let customCategory = $state('');
	let latitude = $state('');
	let longitude = $state('');
	let imageFiles = $state<File[]>([]);
	let imagePreviews = $state<string[]>([]);
	let editingId = $state<string | null>(null);
	let submitting = $state(false);
	let mapEditMode = $state(false);

	const defaultCategories = ['Sightseeing', 'Restaurants', 'Bars', 'Clubs'];
	const allCategories = $derived.by(() => {
		const used = placemarks.map((p) => p.category);
		return [...new Set([...defaultCategories, ...used])].sort();
	});

	const groupedPlacemarks = $derived.by(() => {
		const groups: Record<string, Placemark[]> = {};
		const filteredPlacemarks = selectedCategory
			? placemarks.filter((p) => p.category === selectedCategory)
			: placemarks;
		
		filteredPlacemarks.forEach((p) => {
			if (!groups[p.category]) {
				groups[p.category] = [];
			}
			groups[p.category].push(p);
		});
		return Object.entries(groups).map(([category, items]) => ({ category, items }));
	});

	const filteredPlacemarksCount = $derived.by(() => {
		return selectedCategory
			? placemarks.filter((p) => p.category === selectedCategory).length
			: placemarks.length;
	});

	onMount(() => {
		if (data.token && !getToken()) {
			setToken(data.token);
		}
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

	function resetForm() {
		title = '';
		description = '';
		category = 'Sightseeing';
		customCategory = '';
		latitude = '';
		longitude = '';
		imageFiles = [];
		imagePreviews = [];
		editingId = null;
		mapEditMode = false;
	}

	function startMapEdit() {
		mapEditMode = true;
		mapExpanded = true;
		setTimeout(() => {
			const mapSection = document.querySelector('.map-section');
			mapSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
	}

	function handleMapConfirm(lat: number, lng: number) {
		latitude = lat.toFixed(6);
		longitude = lng.toFixed(6);
		mapEditMode = false;
	}

	function handleMapCancel() {
		mapEditMode = false;
	}

	let showImageSearch = $state(false);

	function handleSearchImagesAdded(files: File[], previews: string[]) {
		imageFiles = [...imageFiles, ...files];
		imagePreviews = [...imagePreviews, ...previews];
		showImageSearch = false;
	}

	async function handleImageSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const newFiles = Array.from(target.files || []);
		
		imageFiles = [...imageFiles, ...newFiles];
		
		const newPreviews: string[] = [];
		for (const file of newFiles) {
			const preview = await new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = (event) => {
					resolve(event.target?.result as string);
				};
				reader.readAsDataURL(file);
			});
			newPreviews.push(preview);
		}
		imagePreviews = [...imagePreviews, ...newPreviews];
		
		target.value = '';
	}

	function removeImage(index: number) {
		imageFiles = imageFiles.filter((_, i) => i !== index);
		imagePreviews = imagePreviews.filter((_, i) => i !== index);
	}

	function startEdit(placemark: Placemark) {
		title = placemark.title;
		description = placemark.description;
		category = placemark.category;
		latitude = placemark.latitude.toString();
		longitude = placemark.longitude.toString();
		editingId = placemark._id || null;
		formExpanded = true;
	}

	async function handleSubmit() {
		if (submitting) return;
		try {
			submitting = true;
			error = '';
			const finalCategory = customCategory.trim() || category;
			const placemarkData = {
				title,
				description,
				category: finalCategory,
				latitude: parseFloat(latitude),
				longitude: parseFloat(longitude),
			};

			if (editingId) {
				await placemarkApi.update(editingId, placemarkData);
				if (imageFiles.length > 0) {
					await placemarkApi.uploadImages(editingId, imageFiles);
				}
			} else {
				const newPlacemark = await placemarkApi.create(placemarkData);
				if (imageFiles.length > 0 && newPlacemark._id) {
					await placemarkApi.uploadImages(newPlacemark._id, imageFiles);
				}
			}

			setLastCategory(finalCategory);
			resetForm();
			await loadPlacemarks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error saving placemark';
		} finally {
			submitting = false;
		}
	}

	async function deletePlacemark(id: string) {
		if (!confirm('Are you sure you want to delete this placemark?')) return;
		try {
			await placemarkApi.delete(id);
			await loadPlacemarks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error deleting placemark';
		}
	}

	async function handleDeleteImage(placemarkId: string, imageUrl: string) {
		try {
			await placemarkApi.deleteImage(placemarkId, imageUrl);
			await loadPlacemarks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error deleting image';
		}
	}

	function createPopupContent(placemark: Placemark): string {
		const firstImage = placemark.images && placemark.images.length > 0 
			? placemark.images[0]
			: null;
		const imgHtml = firstImage
			? `<img src="${firstImage}" alt="${placemark.title}" style="width: 100%; max-height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />`
			: `<img src="/favicon.png" alt="Placeholder" style="width: 40px; height: 40px; object-fit: contain; margin: 0 auto 8px; display: block; background: #f5f5f7; padding: 4px; border-radius: 4px;" />`;

		return `
			<div style="min-width: 180px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
				${imgHtml}
				<h3 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #1d1d1f;">${placemark.title}</h3>
				<p style="margin: 0; font-size: 11px; color: #86868b;">${placemark.category}</p>
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
			if (map) map.addMarker(placemark.latitude, placemark.longitude, popupContent, placemark.category);
			bounds.push([placemark.latitude, placemark.longitude]);
		});

		if (bounds.length > 1) {
			const latitudes = bounds.map((b) => b[0]);
			const longitudes = bounds.map((b) => b[1]);
			map.fitBounds([
				[Math.min(...latitudes), Math.min(...longitudes)],
				[Math.max(...latitudes), Math.max(...longitudes)]
			]);
		}
	}

	$effect(() => {
		if (placemarks.length > 0 && !loading && mapExpanded) {
			addMarkersToMap();
		}
	});
</script>

<div class="dashboard-container">
	<div class="dashboard-header">
		<h1 class="dashboard-title">Dashboard</h1>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	<!-- Map Preview Section (Full Width) -->
	<div class="collapsible-section map-section">
		<button 
			class="collapsible-header"
			onclick={() => mapExpanded = !mapExpanded}
			aria-expanded={mapExpanded}
		>
			<span class="collapsible-icon">{mapExpanded ? '▼' : '▶'}</span>
			<span class="collapsible-title">Map Preview</span>
			<span class="collapsible-info">{placemarks.length} placemarks</span>
		</button>
		{#if mapExpanded}
			<div class="collapsible-content map-content">
				<LeafletMap 
					bind:this={map} 
					height={40}
					editMode={mapEditMode}
					onConfirm={handleMapConfirm}
					onCancel={handleMapCancel}
				/>
			</div>
		{/if}
	</div>

	<!-- Two Column Layout -->
	<div class="dashboard-content">
		<!-- Left Column: Add/Edit Placemark Form -->
		<div class="dashboard-column">
			<div class="collapsible-section">
				<button 
					class="collapsible-header"
					onclick={() => formExpanded = !formExpanded}
					aria-expanded={formExpanded}
				>
					<span class="collapsible-icon">{formExpanded ? '▼' : '▶'}</span>
					<span class="collapsible-title">{editingId ? 'Edit Placemark' : 'Add New Placemark'}</span>
				</button>
				{#if formExpanded}
					<div class="collapsible-content">
						<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="dashboard-form">
							<div class="form-group">
								<label for="title" class="form-label">Placemark Title</label>
								<input
									id="title"
									class="form-input"
									type="text"
									placeholder="Enter placemark title"
									bind:value={title}
									required
								/>
							</div>

							<div class="form-group">
								<label for="description" class="form-label">Description</label>
								<textarea
									id="description"
									class="form-input form-textarea"
									placeholder="Enter description"
									bind:value={description}
									required
								></textarea>
							</div>

							<div class="form-group">
								<label for="images" class="form-label">
									Images {imageFiles.length > 0 ? `(${imageFiles.length} selected)` : ''}
								</label>
								<div class="image-buttons">
									<label class="image-action-button">
										<i class="fas fa-upload"></i>
										<span>Upload Files</span>
										<input
											id="images"
											type="file"
											accept="image/*"
											multiple
											onchange={handleImageSelect}
											hidden
										/>
									</label>
									<button 
										type="button" 
										class="image-action-button"
										onclick={() => showImageSearch = true}
									>
										<i class="fas fa-search"></i>
										<span>Search Images</span>
									</button>
								</div>
								{#if imagePreviews.length > 0}
									<div class="image-previews">
										{#each imagePreviews as preview, index}
											<div class="image-preview-item">
												<img src={preview} alt="Preview {index + 1}" class="preview-image" />
												<button
													type="button"
													class="remove-image-button"
													onclick={() => removeImage(index)}
													aria-label="Remove image"
												>
													<i class="fas fa-times"></i>
												</button>
												<div class="preview-filename">{imageFiles[index]?.name || ''}</div>
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<div class="form-group">
								<label for="category" class="form-label">Category</label>
								<div class="form-row">
									<div class="form-group form-group-half">
										<div class="select-wrapper">
											<select id="category" class="form-input form-select" bind:value={category}>
												{#each allCategories as cat}
													<option value={cat}>{cat}</option>
												{/each}
											</select>
											<svg class="select-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
											</svg>
										</div>
									</div>
									<div class="form-group form-group-half">
										<input
											class="form-input"
											type="text"
											placeholder="Or enter custom category"
											bind:value={customCategory}
										/>
									</div>
								</div>
							</div>

							<div class="form-row location-row">
								<div class="form-group form-group-coord">
									<label for="latitude" class="form-label">Latitude</label>
									<input
										id="latitude"
										class="form-input"
										type="number"
										step="any"
										placeholder="e.g. 49.0134"
										bind:value={latitude}
										required
									/>
								</div>
								<div class="form-group form-group-coord">
									<label for="longitude" class="form-label">Longitude</label>
									<input
										id="longitude"
										class="form-input"
										type="number"
										step="any"
										placeholder="e.g. 12.1016"
										bind:value={longitude}
										required
									/>
								</div>
							<div class="form-group form-group-picker">
								<label class="form-label">&nbsp;</label>
								<button 
									type="button" 
									class="map-picker-button"
									class:active={mapEditMode}
									onclick={startMapEdit}
									title="Select coordinates on map"
								>
									<i class="fas fa-map-marker-alt"></i>
									<span>Pick on Map</span>
								</button>
							</div>
							</div>

							<div class="form-actions">
								<button class="button" type="submit" disabled={submitting}>
									{#if submitting}
										<span class="spinner-small"></span>
										{editingId ? 'Updating...' : 'Adding...'}
									{:else}
										{editingId ? 'Update Placemark' : 'Add Placemark'}
									{/if}
								</button>
								{#if editingId}
									<button class="button secondary-button" type="button" onclick={resetForm}>Cancel</button>
								{/if}
							</div>
						</form>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Column: Placemarks List -->
		<div class="dashboard-column">
			<div class="collapsible-section">
				<button 
					class="collapsible-header"
					onclick={() => listExpanded = !listExpanded}
					aria-expanded={listExpanded}
				>
					<span class="collapsible-icon">{listExpanded ? '▼' : '▶'}</span>
					<span class="collapsible-title">Your Placemarks</span>
					<span class="collapsible-info">{filteredPlacemarksCount} items</span>
				</button>
				{#if listExpanded}
					<div class="collapsible-content">
						{#if loading}
							<p class="loading-text">Loading placemarks...</p>
						{:else if groupedPlacemarks.length === 0}
							<p class="empty-text">No placemarks available. Add your first one!</p>
						{:else}
							<!-- Filter Section -->
							<div class="filter-section">
								<div class="filter-label">
									<i class="fas fa-filter" style="color: #ff6b35; margin-right: 0.5rem;"></i>
									Filter by Category:
								</div>
								<div class="filter-buttons">
									<button
										class="filter-button"
										class:active={selectedCategory === null}
										onclick={() => selectedCategory = null}
									>
										<svg class="filter-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M2 2h12M2 8h12M2 14h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
										</svg>
										All
									</button>
									{#each allCategories as cat}
										<button
											class="filter-button"
											class:active={selectedCategory === cat}
											onclick={() => selectedCategory = cat}
										>
											<svg class="filter-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
											</svg>
											{cat}
										</button>
									{/each}
								</div>
							</div>
							<div class="placemarks-list">
								{#each groupedPlacemarks as group}
									<div class="category-group">
										<h3 class="category-title">{group.category}</h3>
										{#each group.items as placemark}
											<article class="placemark-card">
												<div class="placemark-image">
													<ImageGallery 
														images={placemark.images || []} 
														onDelete={placemark._id ? (url) => handleDeleteImage(placemark._id as string, url) : undefined}
													/>
												</div>
												<div class="placemark-content">
													<div class="placemark-header">
														<h4 class="placemark-title">{placemark.title}</h4>
														<button
															class="delete-button"
															onclick={() => deletePlacemark(placemark._id!)}
													aria-label="Delete placemark"
												>
													<i class="fas fa-trash"></i>
												</button>
											</div>
											<p class="placemark-description">{placemark.description}</p>
											<div class="placemark-location">
												<i class="fas fa-map-marker-alt"></i> {placemark.latitude}, {placemark.longitude}
											</div>
													<button class="button button-small" onclick={() => startEdit(placemark)}>
														Edit
													</button>
												</div>
											</article>
										{/each}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<ImageSearchModal
	open={showImageSearch}
	onClose={() => showImageSearch = false}
	onImagesAdded={handleSearchImagesAdded}
/>

<style>
	.dashboard-container {
		flex: 1;
		min-height: 100%;
		padding: 2rem 4rem;
		background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
	}

	.dashboard-header {
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.dashboard-title {
		font-size: 2rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0;
		letter-spacing: -0.5px;
	}

	/* Collapsible Sections */
	.collapsible-section {
		background: #ffffff;
		border-radius: 5px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		margin-bottom: 1.5rem;
		overflow: hidden;
	}

	.collapsible-header {
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

	.collapsible-header:hover {
		background: #f5f5f7;
	}

	.collapsible-icon {
		font-size: 0.75rem;
		color: #86868b;
		width: 1rem;
	}

	.collapsible-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1d1d1f;
		flex: 1;
	}

	.collapsible-info {
		font-size: 0.875rem;
		color: #86868b;
	}

	.collapsible-content {
		padding: 0 1.5rem 1.5rem 1.5rem;
	}

	/* Map Section */
	.map-section {
		margin-bottom: 2rem;
	}

	.map-content {
		padding: 0;
		border-radius: 0 0 5px 5px;
		overflow: hidden;
	}

	/* Two Column Layout */
	.dashboard-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.dashboard-column {
		display: flex;
		flex-direction: column;
	}

	.dashboard-form {
		display: flex;
		flex-direction: column;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	/* Location Row with Map Picker */
	.location-row {
		align-items: flex-end;
	}

	.form-group-coord {
		flex: 1;
		min-width: 0;
	}

	.form-group-picker {
		flex-shrink: 0;
	}

	.map-picker-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0 1rem;
		background: #ffffff;
		border: 1px solid #d2d2d7;
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.2s;
		color: #1d1d1f;
		font-size: 0.875rem;
		min-width: 130px;
		height: 48px;
		width: 100%;
	}

	.map-picker-button:hover {
		background: #ff6b35;
		border-color: #ff6b35;
		color: white;
	}

	.map-picker-button.active {
		background: #ff6b35;
		border-color: #ff6b35;
		color: white;
	}

	.map-picker-button i {
		font-size: 1rem;
	}

	.map-picker-button span {
		font-weight: 500;
	}

	.filter-section {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e5e7;
	}

	.filter-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1d1d1f;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
	}

	.filter-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-button {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #86868b;
		background: #f5f5f7;
		border: 1px solid #e5e5e7;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-icon {
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		transition: all 0.2s ease;
	}

	.filter-button:hover {
		background: #e5e5e7;
		border-color: #d2d2d7;
		color: #1d1d1f;
	}

	.filter-button.active {
		background: #ff6b35;
		color: white;
		border-color: #ff6b35;
	}

	.filter-button.active .filter-icon {
		stroke: white;
	}

	.placemarks-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.category-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.category-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #f5f5f7;
	}

	.placemark-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0;
		background: #fafafa;
		border-radius: 6px;
		border: 1px solid #e5e5e7;
		transition: all 0.2s ease;
		overflow: hidden;
	}

	.placemark-card:hover {
		background: #f5f5f7;
		border-color: #d2d2d7;
	}

	.placemark-image {
		width: 100%;
		flex-shrink: 0;
	}

	.placemark-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
	}

	.placemark-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.placemark-title {
		font-size: 1rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0;
	}

	.delete-button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		padding: 0;
		color: #86868b;
		transition: color 0.2s ease;
	}

	.delete-button:hover {
		color: #c53030;
	}

	.placemark-location i {
		color: #ff6b35;
		margin-right: 0.25rem;
	}

	.placemark-description {
		font-size: 0.875rem;
		color: #86868b;
		margin: 0;
		line-height: 1.5;
	}

	.placemark-location {
		font-size: 0.8125rem;
		color: #86868b;
		margin: 0.25rem 0;
	}

	.button-small {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		align-self: flex-start;
		margin-top: 0.5rem;
	}

	.loading-text,
	.empty-text {
		color: #86868b;
		text-align: center;
		padding: 2rem;
		margin: 0;
	}

	/* Image Buttons */
	.image-buttons {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.image-action-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #ffffff;
		border: 1px solid #d2d2d7;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		color: #1d1d1f;
		cursor: pointer;
		transition: all 0.2s;
	}

	.image-action-button:hover {
		background: #ff6b35;
		border-color: #ff6b35;
		color: white;
	}

	.image-action-button i {
		font-size: 0.9375rem;
	}

	/* Image Preview Styles */
	.image-previews {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
		padding: 0.5rem 0;
	}

	.image-preview-item {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: #ffffff;
		border-radius: 12px;
		padding: 0.75rem;
		border: 2px solid #e5e5e7;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		transition: all 0.2s ease;
		overflow: hidden;
	}

	.image-preview-item:hover {
		border-color: #ff6b35;
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.15);
		transform: translateY(-2px);
	}

	.preview-image {
		width: 100%;
		height: 140px;
		object-fit: cover;
		border-radius: 8px;
		background: #f5f5f7;
		border: 1px solid #e5e5e7;
		transition: transform 0.2s ease;
	}

	.image-preview-item:hover .preview-image {
		transform: scale(1.02);
	}

	.remove-image-button {
		position: absolute;
		top: 0.875rem;
		right: 0.875rem;
		background: rgba(197, 48, 48, 0.95);
		color: white;
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		z-index: 2;
		box-shadow: 0 2px 6px rgba(197, 48, 48, 0.3);
		opacity: 0.9;
	}

	.image-preview-item:hover .remove-image-button {
		opacity: 1;
	}

	.remove-image-button:hover {
		background: rgba(197, 48, 48, 1);
		transform: scale(1.1);
		box-shadow: 0 3px 8px rgba(197, 48, 48, 0.4);
	}

	.remove-image-button:active {
		transform: scale(0.95);
	}

	.preview-filename {
		font-size: 0.75rem;
		color: #1d1d1f;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		padding: 0.25rem 0.5rem;
		background: #f5f5f7;
		border-radius: 6px;
		font-weight: 500;
		text-align: center;
		line-height: 1.4;
	}

	/* File Input Styling */
	.form-file {
		padding: 0.75rem 1rem;
		cursor: pointer;
		background: #ffffff;
		border: 2px dashed #d2d2d7;
		border-radius: 8px;
		transition: all 0.2s ease;
		font-size: 0.9375rem;
	}

	.form-file:hover {
		border-color: #ff6b35;
		background: #fff5f2;
	}

	.form-file:focus {
		border-color: #ff6b35;
		background: #fff5f2;
		box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
	}

	.form-file::file-selector-button {
		padding: 0.5rem 1rem;
		margin-right: 1rem;
		border: 1px solid #ff6b35;
		border-radius: 6px;
		background: #ff6b35;
		color: white;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.form-file::file-selector-button:hover {
		background: #e55a2b;
		border-color: #e55a2b;
		transform: translateY(-1px);
		box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
	}

	.form-group:has(.form-file) .form-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #1d1d1f;
	}

	/* Select Icon Styling */
	.select-wrapper {
		position: relative;
	}

	.select-wrapper::after {
		display: none;
	}

	.select-icon {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		color: #1d1d1f;
		width: 16px;
		height: 16px;
		transition: all 0.2s ease;
		z-index: 1;
	}

	.select-wrapper:hover .select-icon,
	.form-select:focus + .select-icon {
		color: #ff6b35;
	}

	.form-select:focus + .select-icon {
		transform: translateY(-50%) rotate(180deg);
	}

	@media (max-width: 1024px) {
		.dashboard-content {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.dashboard-container {
			padding: 1rem 1.5rem;
		}

		.collapsible-header {
			padding: 0.875rem 1rem;
		}

		.collapsible-content {
			padding: 0 1rem 1rem 1rem;
		}

		.filter-buttons {
			gap: 0.375rem;
		}

		.filter-button {
			padding: 0.375rem 0.75rem;
			font-size: 0.8125rem;
		}

		.image-previews {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
			gap: 0.75rem;
		}

		.preview-image {
			height: 100px;
		}

		.remove-image-button {
			width: 28px;
			height: 28px;
			font-size: 0.75rem;
		}

		.preview-filename {
			font-size: 0.6875rem;
			padding: 0.2rem 0.4rem;
		}

		.form-file::file-selector-button {
			padding: 0.4rem 0.75rem;
			font-size: 0.8125rem;
			margin-right: 0.75rem;
		}
	}

	/* Spinner for button loading state */
	.spinner-small {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-right: 0.5rem;
		vertical-align: middle;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
