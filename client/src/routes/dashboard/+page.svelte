<script lang="ts">
	import { placemarkApi, type Placemark, getToken, getLastCategory, setLastCategory } from '$lib/api';
	import { requireAuth, isAuthenticated, checkAdminStatus, clearUser, logout } from '$lib/auth';
	import { userApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import LeafletMap from '$lib/components/LeafletMap.svelte';

	let placemarks = $state<Placemark[]>([]);
	let loading = $state(true);
	let error = $state('');
	let isAdmin = $state(false);

	// Collapsible sections state
	let mapExpanded = $state(true);
	let formExpanded = $state(true);
	let listExpanded = $state(true);

	// Map reference
	let map: LeafletMap;
	let mapReady = $state(false);

	// Form fields
	let title = $state('');
	let description = $state('');
	let category = $state(getLastCategory());
	let customCategory = $state('');
	let latitude = $state('');
	let longitude = $state('');
	let imageFile = $state<File | null>(null);
	let editingId = $state<string | null>(null);

	const defaultCategories = ['Sightseeing', 'Restaurants', 'Bars', 'Clubs'];
	const allCategories = $derived.by(() => {
		const used = placemarks.map((p) => p.category);
		return [...new Set([...defaultCategories, ...used])].sort();
	});

	const groupedPlacemarks = $derived.by(() => {
		const groups: Record<string, Placemark[]> = {};
		placemarks.forEach((p) => {
			if (!groups[p.category]) {
				groups[p.category] = [];
			}
			groups[p.category].push(p);
		});
		return Object.entries(groups).map(([category, items]) => ({ category, items }));
	});

	onMount(() => {
		if (!isAuthenticated()) {
			requireAuth();
			return;
		}
		loadPlacemarks();
		checkAdmin();
	});

	async function checkAdmin() {
		try {
			const token = getToken();
			if (!token) return;
			
			const payload = JSON.parse(atob(token.split('.')[1]));
			if (payload.id) {
				const user = await userApi.findOne(payload.id);
				isAdmin = user.isAdmin === true;
			}
		} catch (err) {
			console.error('Error checking admin status:', err);
		}
	}

	function handleLogout() {
		goto('/logout', { keepFocus: false, preserveScroll: false });
	}

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
		imageFile = null;
		editingId = null;
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
		try {
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
				if (imageFile) {
					await placemarkApi.uploadImage(editingId, imageFile);
				}
			} else {
				const newPlacemark = await placemarkApi.create(placemarkData);
				if (imageFile && newPlacemark._id) {
					await placemarkApi.uploadImage(newPlacemark._id, imageFile);
				}
			}

			setLastCategory(finalCategory);
			resetForm();
			await loadPlacemarks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error saving placemark';
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

	// Map functions
	function createPopupContent(placemark: Placemark): string {
		const imgHtml = placemark.img
			? `<img src="${placemark.img}" alt="${placemark.title}" style="width: 100%; max-height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />`
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
			map.addMarker(placemark.latitude, placemark.longitude, popupContent, placemark.category);
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
		<div class="dashboard-header-left">
			<img src="/favicon.png" alt="discoverRegensburg logo" class="dashboard-logo" />
			<div class="dashboard-title-wrapper">
				<h1 class="dashboard-title">Dashboard</h1>
			</div>
		</div>
		<nav class="dashboard-menu">
			{#if isAdmin}
				<a href="/admin" class="button">Admin</a>
			{/if}
			<a href="/map" class="button">Full Map</a>
			<button class="button" onclick={handleLogout}>Logout</button>
		</nav>
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
				<LeafletMap bind:this={map} height={40} />
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
								<label for="image" class="form-label">Image</label>
								<input
									id="image"
									class="form-input form-file"
									type="file"
									accept="image/*"
									onchange={(e) => {
										const target = e.target as HTMLInputElement;
										imageFile = target.files?.[0] || null;
									}}
								/>
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

							<div class="form-row">
								<div class="form-group form-group-half">
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
								<div class="form-group form-group-half">
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
							</div>

							<div class="form-actions">
								<button class="button" type="submit">
									{editingId ? 'Update Placemark' : 'Add Placemark'}
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
					<span class="collapsible-info">{placemarks.length} items</span>
				</button>
				{#if listExpanded}
					<div class="collapsible-content">
						{#if loading}
							<p class="loading-text">Loading placemarks...</p>
						{:else if groupedPlacemarks.length === 0}
							<p class="empty-text">No placemarks available. Add your first one!</p>
						{:else}
							<div class="placemarks-list">
								{#each groupedPlacemarks as group}
									<div class="category-group">
										<h3 class="category-title">{group.category}</h3>
										{#each group.items as placemark}
											<article class="placemark-card">
												<div class="placemark-image">
													{#if placemark.img}
														<img src={placemark.img} alt={placemark.title} />
													{:else}
														<img src="/favicon.png" alt="Placeholder" class="placeholder-image" />
													{/if}
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

	.dashboard-header-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.dashboard-logo {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.dashboard-title-wrapper {
		display: flex;
		align-items: center;
	}

	.dashboard-menu {
		display: flex;
		gap: 1rem;
		align-items: center;
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
		gap: 1rem;
		padding: 1rem;
		background: #fafafa;
		border-radius: 5px;
		border: 1px solid #e5e5e7;
		transition: all 0.2s ease;
	}

	.placemark-card:hover {
		background: #f5f5f7;
		border-color: #d2d2d7;
	}

	.placemark-image {
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		border-radius: 5px;
		overflow: hidden;
	}

	.placemark-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placemark-image .placeholder-image {
		object-fit: contain;
		padding: 1rem;
		background: #f5f5f7;
	}

	.placemark-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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

		.placemark-card {
			flex-direction: column;
		}

		.placemark-image {
			width: 100%;
			height: 200px;
		}
	}
</style>
