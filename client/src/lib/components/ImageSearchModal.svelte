<script lang="ts">
	import { imageSearchApi, type ImageSearchResult } from '$lib/api';

	interface Props {
		open: boolean;
		onClose: () => void;
		onImagesAdded: (files: File[], previews: string[]) => void;
	}

	let { open, onClose, onImagesAdded }: Props = $props();

	let searchQuery = $state('');
	let images = $state<ImageSearchResult[]>([]);
	let selectedIds = $state<Set<string>>(new Set());
	let loading = $state(false);
	let downloading = $state(false);
	let error = $state('');

	async function searchImages() {
		if (!searchQuery.trim()) return;

		loading = true;
		error = '';
		try {
			const result = await imageSearchApi.search(searchQuery);
			images = result.images;
			selectedIds = new Set();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Search failed';
			images = [];
		} finally {
			loading = false;
		}
	}

	function toggleImage(id: string) {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedIds = newSet;
	}

	async function addSelectedImages() {
		if (selectedIds.size === 0) return;

		downloading = true;
		error = '';

		try {
			const selectedImages = images.filter((img) => selectedIds.has(img.id));
			const files: File[] = [];
			const previews: string[] = [];

			for (const img of selectedImages) {
				const response = await fetch(img.url);
				const blob = await response.blob();
				const extension = blob.type.split('/')[1] || 'jpg';
				const filename = `${img.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.${extension}`;
				const file = new File([blob], filename, { type: blob.type });
				files.push(file);
				previews.push(img.thumbnail);
			}

			onImagesAdded(files, previews);
			resetAndClose();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to download images';
		} finally {
			downloading = false;
		}
	}

	function resetAndClose() {
		searchQuery = '';
		images = [];
		selectedIds = new Set();
		error = '';
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			resetAndClose();
		}
	}
</script>

{#if open}
	<div class="modal-backdrop" onclick={resetAndClose} onkeydown={handleKeydown} role="button" tabindex="0">
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Search Creative Commons Images</h2>
				<button class="close-button" onclick={resetAndClose} aria-label="Close">
					<i class="fas fa-times"></i>
				</button>
			</div>

			<div class="search-bar">
				<input
					type="text"
					class="search-input"
					bind:value={searchQuery}
					placeholder="Search for images (e.g. 'Regensburg cathedral')"
					onkeydown={(e) => e.key === 'Enter' && searchImages()}
				/>
				<button
					class="search-button"
					onclick={searchImages}
					disabled={loading || !searchQuery.trim()}
				>
					<i class="fas {loading ? 'fa-spinner fa-spin' : 'fa-search'}"></i>
					<span>{loading ? 'Searching...' : 'Search'}</span>
				</button>
			</div>

			{#if error}
				<div class="error-message">
					<i class="fas fa-exclamation-circle"></i>
					{error}
				</div>
			{/if}

			<div class="modal-body">
				{#if images.length === 0 && !loading}
					<div class="empty-state">
						<i class="fas fa-images"></i>
						<p>Search for images to add to your placemark</p>
					</div>
				{:else}
					<div class="image-grid">
						{#each images as image}
							<button
								type="button"
								class="image-item"
								class:selected={selectedIds.has(image.id)}
								onclick={() => toggleImage(image.id)}
							>
								<img src={image.thumbnail} alt={image.title} loading="lazy" />
								{#if selectedIds.has(image.id)}
									<div class="check-overlay">
										<i class="fas fa-check-circle"></i>
									</div>
								{/if}
								<div class="image-info">
									<p class="image-title">{image.title}</p>
									<p class="image-creator">by {image.creator}</p>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			{#if images.length > 0}
				<div class="modal-footer">
					<span class="selection-count">{selectedIds.size} image(s) selected</span>
					<button
						class="add-button"
						onclick={addSelectedImages}
						disabled={selectedIds.size === 0 || downloading}
					>
						{#if downloading}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Adding...</span>
						{:else}
							<i class="fas fa-plus"></i>
							<span>Add {selectedIds.size} Image(s)</span>
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 2rem;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 900px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #e5e5e7;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1d1d1f;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: #86868b;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.close-button:hover {
		background: #f5f5f7;
		color: #1d1d1f;
	}

	.search-bar {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e5e7;
	}

	.search-input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid #d2d2d7;
		border-radius: 8px;
		font-size: 0.9375rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.search-input:focus {
		border-color: #ff6b35;
	}

	.search-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.search-button:hover:not(:disabled) {
		background: #e55a2b;
	}

	.search-button:disabled {
		background: #d2d2d7;
		cursor: not-allowed;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #fef2f2;
		color: #dc2626;
		font-size: 0.875rem;
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		color: #86868b;
	}

	.empty-state i {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.empty-state p {
		margin: 0;
		font-size: 1rem;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 1rem;
	}

	.image-item {
		position: relative;
		border: 2px solid transparent;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s;
		background: none;
		padding: 0;
		text-align: left;
	}

	.image-item:hover {
		border-color: #ff6b35;
	}

	.image-item.selected {
		border-color: #ff6b35;
		border-width: 3px;
	}

	.image-item img {
		width: 100%;
		height: 120px;
		object-fit: cover;
		display: block;
	}

	.check-overlay {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		color: #ff6b35;
		font-size: 1.5rem;
		text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
	}

	.image-info {
		padding: 0.5rem;
		background: #f5f5f7;
	}

	.image-title {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #1d1d1f;
		margin: 0 0 0.125rem 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.image-creator {
		font-size: 0.75rem;
		color: #86868b;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.modal-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e5e7;
		background: #f5f5f7;
		border-radius: 0 0 12px 12px;
	}

	.selection-count {
		font-size: 0.875rem;
		color: #86868b;
	}

	.add-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.add-button:hover:not(:disabled) {
		background: #e55a2b;
	}

	.add-button:disabled {
		background: #d2d2d7;
		cursor: not-allowed;
	}
</style>
