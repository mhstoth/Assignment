<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map as LeafletMapType, Marker } from 'leaflet';
	import type { Placemark } from '$lib/api';

	interface Props {
		placemarks?: Placemark[];
		category?: string;
		height?: number;
	}

	let { placemarks = [], category = '', height = 180 }: Props = $props();

	const mapId = `minimap-${category.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 9)}`;
	
	const defaultLocation = { lat: 49.0134, lng: 12.1016 };
	const defaultZoom = 12;

	let L: typeof import('leaflet');
	let imap: LeafletMapType;
	let markers: Marker[] = [];

	onMount(async () => {
		const leaflet = await import('leaflet');
		L = leaflet.default;

		const OrangeIcon = L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [20, 33],
			iconAnchor: [10, 33],
			popupAnchor: [1, -28],
			shadowSize: [33, 33]
		});

		const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OSM'
		});

		imap = L.map(mapId, {
			center: [defaultLocation.lat, defaultLocation.lng],
			zoom: defaultZoom,
			layers: [tileLayer],
			zoomControl: false,
			attributionControl: false
		});

		addMarkers(OrangeIcon);

		return () => {
			if (imap) {
				imap.remove();
			}
		};
	});

	function createPopupContent(placemark: Placemark): string {
		const firstImage = placemark.images && placemark.images.length > 0 
			? placemark.images[0]
			: null;
		const imgHtml = firstImage
			? `<img src="${firstImage}" alt="${placemark.title}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />`
			: `<div style="width: 100%; height: 60px; background: #f5f5f7; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">
				<img src="/favicon.png" alt="Placeholder" style="width: 32px; height: 32px; opacity: 0.5;" />
			   </div>`;

		const shortDesc = placemark.description.length > 60 
			? placemark.description.substring(0, 60) + '...' 
			: placemark.description;

		return `
			<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-width: 160px; max-width: 200px;">
				${imgHtml}
				<h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #1d1d1f;">${placemark.title}</h4>
				<p style="margin: 0 0 6px 0; font-size: 11px; color: #86868b; line-height: 1.4;">${shortDesc}</p>
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<span style="font-size: 10px; color: #86868b;">
						<i class="fas fa-map-marker-alt" style="color: #ff6b35;"></i>
						${placemark.latitude.toFixed(4)}, ${placemark.longitude.toFixed(4)}
					</span>
				</div>
			</div>
		`;
	}

	function addMarkers(icon: L.Icon) {
		if (!L || !imap || placemarks.length === 0) return;

		markers.forEach(m => m.remove());
		markers = [];

		const bounds: [number, number][] = [];

		placemarks.forEach((placemark) => {
			const marker = L.marker([placemark.latitude, placemark.longitude], { icon });
			const popupContent = createPopupContent(placemark);
			
			marker.bindPopup(popupContent, { maxWidth: 220 });
			marker.addTo(imap);
			markers.push(marker);
			bounds.push([placemark.latitude, placemark.longitude]);
		});

		if (bounds.length > 0) {
			const latitudes = bounds.map(b => b[0]);
			const longitudes = bounds.map(b => b[1]);
			
			if (bounds.length === 1) {
				imap.setView([latitudes[0], longitudes[0]], 14);
			} else {
				imap.fitBounds([
					[Math.min(...latitudes), Math.min(...longitudes)],
					[Math.max(...latitudes), Math.max(...longitudes)]
				], { padding: [20, 20] });
			}
		}
	}
</script>

<div id={mapId} class="minimap" style="height: {height}px;"></div>

<style>
	.minimap {
		width: 100%;
		border-radius: 5px;
		background: #f5f5f7;
	}

	/* Override Leaflet styles for compact look */
	:global(.minimap .leaflet-popup-content-wrapper) {
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	:global(.minimap .leaflet-popup-content) {
		margin: 8px 10px;
	}
</style>

