<script lang="ts">
	interface Props {
		images?: string[];
		onDelete?: (imageUrl: string) => void;
	}

	let { images = [], onDelete }: Props = $props();
	let currentIndex = $state(0);

	function nextImage() {
		if (images.length > 0) {
			currentIndex = (currentIndex + 1) % images.length;
		}
	}

	function prevImage() {
		if (images.length > 0) {
			currentIndex = (currentIndex - 1 + images.length) % images.length;
		}
	}

	function handleDelete(imageUrl: string, event: MouseEvent) {
		event.stopPropagation();
		if (onDelete) {
			onDelete(imageUrl);
			// Adjust current index if needed
			if (currentIndex >= images.length - 1 && currentIndex > 0) {
				currentIndex = currentIndex - 1;
			}
		}
	}
</script>

<div class="gallery">
	{#if images.length > 0}
		<div class="main-image-container">
			{#if images.length > 1}
				<button class="nav-button prev" onclick={prevImage} aria-label="Previous image">
					<i class="fas fa-chevron-left"></i>
				</button>
			{/if}
			<div class="main-image">
				<img src={images[currentIndex]} alt="Image {currentIndex + 1} of {images.length}" />
				{#if onDelete}
					<button class="delete-button" onclick={(e) => handleDelete(images[currentIndex], e)} aria-label="Delete image">
						<i class="fas fa-trash"></i>
					</button>
				{/if}
			</div>
			{#if images.length > 1}
				<button class="nav-button next" onclick={nextImage} aria-label="Next image">
					<i class="fas fa-chevron-right"></i>
				</button>
			{/if}
		</div>
		{#if images.length > 1}
			<div class="thumbnails">
				{#each images as img, i}
					<button
						class="thumbnail"
						class:active={i === currentIndex}
						onclick={() => currentIndex = i}
						aria-label="View image {i + 1}"
					>
						<img src={img} alt="Thumbnail {i + 1}" />
						{#if onDelete}
							<button
								class="thumbnail-delete"
								onclick={(e) => handleDelete(img, e)}
								aria-label="Delete image {i + 1}"
							>
								<i class="fas fa-times"></i>
							</button>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="placeholder">
			<img src="/favicon.png" alt="Placeholder" class="placeholder-logo" />
		</div>
	{/if}
</div>

<style>
	.gallery {
		width: 100%;
	}

	.main-image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #f5f5f7;
		border-radius: 0;
		overflow: hidden;
		margin-bottom: 0;
	}

	.main-image {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.main-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		transition: background 0.2s;
	}

	.nav-button:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	.nav-button.prev {
		left: 12px;
	}

	.nav-button.next {
		right: 12px;
	}

	.delete-button {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgba(255, 107, 53, 0.9);
		color: white;
		border: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		transition: background 0.2s;
	}

	.delete-button:hover {
		background: rgba(255, 107, 53, 1);
	}

	.thumbnails {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding: 4px 0;
	}

	.thumbnail {
		position: relative;
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		border: 2px solid transparent;
		border-radius: 6px;
		overflow: hidden;
		cursor: pointer;
		background: #f5f5f7;
		padding: 0;
		transition: border-color 0.2s;
	}

	.thumbnail:hover {
		border-color: #ff6b35;
	}

	.thumbnail.active {
		border-color: #ff6b35;
		border-width: 3px;
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail-delete {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(255, 107, 53, 0.9);
		color: white;
		border: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.thumbnail:hover .thumbnail-delete {
		opacity: 1;
	}

	.thumbnail-delete:hover {
		background: rgba(255, 107, 53, 1);
	}

	.placeholder {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #f5f5f7;
		border-radius: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #86868b;
	}

	.placeholder-logo {
		width: 120px;
		height: 120px;
		object-fit: contain;
		opacity: 0.3;
	}

	@media (max-width: 768px) {
		.nav-button {
			width: 32px;
			height: 32px;
		}

		.thumbnail {
			width: 60px;
			height: 60px;
		}
	}
</style>

