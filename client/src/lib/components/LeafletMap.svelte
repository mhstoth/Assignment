<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map as LeafletMap, Control, LayerGroup, Marker } from 'leaflet';

	interface Props {
		height?: number;
		editMode?: boolean;
		onConfirm?: (lat: number, lng: number) => void;
		onCancel?: () => void;
	}

	let { 
		height = 70, 
		editMode = false,
		onConfirm,
		onCancel
	}: Props = $props();

	let id = 'placemark-map';
	let location = { lat: 49.0134, lng: 12.1016 };
	let zoom = 13;
	let minZoom = 5;

	let imap: LeafletMap;
	let control: Control.Layers;
	let categoryLayers: Record<string, LayerGroup> = {};
	let L: typeof import('leaflet');
	
	let editMarker: Marker | null = null;
	let pendingLat = $state<number | null>(null);
	let pendingLng = $state<number | null>(null);

	onMount(async () => {
		const leaflet = await import('leaflet');
		L = leaflet.default;

		const OrangeIcon = L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});
		L.Marker.prototype.options.icon = OrangeIcon;

		const baseLayers = {
			'Street Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}),
			Satellite: L.tileLayer(
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{
					attribution:
						'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
				}
			)
		};

		const defaultLayer = baseLayers['Street Map'];

		imap = L.map(id, {
			center: [location.lat, location.lng],
			zoom: zoom,
			minZoom: minZoom,
			layers: [defaultLayer]
		});

		control = L.control.layers(baseLayers, {}).addTo(imap);

		imap.on('click', (e: L.LeafletMouseEvent) => {
			if (editMode) {
				pendingLat = e.latlng.lat;
				pendingLng = e.latlng.lng;
				updateEditMarker(e.latlng.lat, e.latlng.lng);
			}
		});
	});

	function updateEditMarker(lat: number, lng: number) {
		if (!L || !imap) return;
		
		const BlueIcon = L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});
		
		if (editMarker) {
			editMarker.setLatLng([lat, lng]);
		} else {
			editMarker = L.marker([lat, lng], { 
				draggable: true,
				zIndexOffset: 1000,
				icon: BlueIcon
			});
			editMarker.on('dragend', (e: L.DragEndEvent) => {
				const pos = e.target.getLatLng();
				pendingLat = pos.lat;
				pendingLng = pos.lng;
			});
			editMarker.addTo(imap);
		}
	}

	function handleConfirm() {
		if (pendingLat !== null && pendingLng !== null && onConfirm) {
			onConfirm(pendingLat, pendingLng);
		}
		cleanup();
	}

	function handleCancel() {
		if (onCancel) onCancel();
		cleanup();
	}

	function cleanup() {
		if (editMarker) {
			editMarker.remove();
			editMarker = null;
		}
		pendingLat = null;
		pendingLng = null;
	}

	$effect(() => {
		if (!editMode) {
			cleanup();
		}
	});

	export function addCategoryLayer(category: string): LayerGroup {
		if (!L || !imap || !control) return null as unknown as LayerGroup;

		if (!categoryLayers[category]) {
			const layerGroup = L.layerGroup().addTo(imap);
			categoryLayers[category] = layerGroup;
			control.addOverlay(layerGroup, category);
		}
		return categoryLayers[category];
	}

	export function addMarker(
		lat: number,
		lng: number,
		popupContent: string,
		category: string
	): Marker | null {
		if (!L || !imap) return null;

		const layer = addCategoryLayer(category);
		if (!layer) return null;

		const marker = L.marker([lat, lng]);
		const popup = L.popup({ maxWidth: 300 });
		popup.setContent(popupContent);
		marker.bindPopup(popup);
		marker.addTo(layer);

		return marker;
	}

	export function fitBounds(bounds: [[number, number], [number, number]]): void {
		if (!imap) return;
		imap.fitBounds(bounds, { padding: [50, 50] });
	}

	export function isReady(): boolean {
		return !!L && !!imap;
	}
</script>

<div class="map-wrapper" class:edit-active={editMode}>
	{#if editMode}
		<!-- Edit Mode Banner -->
		<div class="edit-banner">
			<i class="fas fa-edit"></i>
			<span>Click on the map to set location</span>
		</div>
		
		<!-- Coordinates Box (top right) -->
		<div class="coordinates-box">
			<div class="coords-display">
				<div class="coord-row">
					<span class="coord-label">Lat:</span>
					<span class="coord-value">{pendingLat?.toFixed(6) ?? '—'}</span>
				</div>
				<div class="coord-row">
					<span class="coord-label">Lng:</span>
					<span class="coord-value">{pendingLng?.toFixed(6) ?? '—'}</span>
				</div>
			</div>
			<div class="coords-actions">
				<button 
					class="confirm-btn" 
					onclick={handleConfirm}
					disabled={pendingLat === null}
					title="Apply coordinates"
				>
					<i class="fas fa-check"></i>
				</button>
				<button 
					class="cancel-btn" 
					onclick={handleCancel}
					title="Cancel"
				>
					<i class="fas fa-times"></i>
				</button>
			</div>
		</div>
	{/if}
	
	<div {id} style="height: {editMode ? 60 : height}vh; width: 100%; border-radius: 5px; transition: height 0.3s ease;"></div>
</div>

<style>
	.map-wrapper {
		position: relative;
		border-radius: 5px;
		overflow: hidden;
	}

	.map-wrapper.edit-active {
		border: 3px solid #ff6b35;
	}

	.edit-banner {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background: #ff6b35;
		color: white;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-align: center;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.coordinates-box {
		position: absolute;
		bottom: 30px;
		left: 10px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 12px rgba(0,0,0,0.15);
		padding: 0.75rem;
		z-index: 1000;
		min-width: 150px;
	}

	.coords-display {
		margin-bottom: 0.75rem;
	}

	.coord-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		margin-bottom: 0.25rem;
	}

	.coord-label {
		color: #86868b;
		font-weight: 500;
	}

	.coord-value {
		color: #1d1d1f;
		font-weight: 600;
		font-family: monospace;
	}

	.coords-actions {
		display: flex;
		gap: 0.5rem;
	}

	.confirm-btn, .cancel-btn {
		flex: 1;
		padding: 0.5rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.confirm-btn {
		background: #ff6b35;
		color: white;
	}

	.confirm-btn:hover:not(:disabled) {
		background: #e55a2b;
	}

	.confirm-btn:disabled {
		background: #d2d2d7;
		cursor: not-allowed;
	}

	.cancel-btn {
		background: #f5f5f7;
		color: #86868b;
		border: 1px solid #e5e5e7;
	}

	.cancel-btn:hover {
		background: #e5e5e7;
		color: #1d1d1f;
	}
</style>

