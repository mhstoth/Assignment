<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map as LeafletMap, Control, LayerGroup, Marker } from 'leaflet';

	let { height = 70 } = $props();

	let id = 'placemark-map';
	// Regensburg center coordinates
	let location = { lat: 49.0134, lng: 12.1016 };
	let zoom = 13;
	let minZoom = 5;

	let imap: LeafletMap;
	let control: Control.Layers;
	let categoryLayers: Record<string, LayerGroup> = {};
	let L: typeof import('leaflet');

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

<div {id} style="height: {height}vh; width: 100%; border-radius: 5px;"></div>

