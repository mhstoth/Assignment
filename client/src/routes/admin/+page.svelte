<script lang="ts">
	import { userApi, placemarkApi, type User, type Placemark, getAdminTab, setAdminTab, setToken, getToken } from '$lib/api';
	import { onMount } from 'svelte';
	// @ts-ignore
	import Chart from 'svelte-frappe-charts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Initialize data from server (SSR)
	let activeTab = $state<'users' | 'analytics'>(getAdminTab());
	let users = $state<User[]>(data.users || []);
	let placemarks = $state<Placemark[]>(data.placemarks || []);
	let loading = $state(false);
	let error = $state('');

	onMount(() => {
		// Sync token to localStorage (for Client-Side Requests)
		if (data.token && !getToken()) {
			setToken(data.token);
		}
	});

	async function loadData() {
		try {
			loading = true;
			error = '';
			// Use admin endpoint to get all placemarks for analytics
			[users, placemarks] = await Promise.all([userApi.findAll(), placemarkApi.findAllForAdmin()]);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error loading data';
		} finally {
			loading = false;
		}
	}

	function switchTab(tab: 'users' | 'analytics') {
		activeTab = tab;
		setAdminTab(tab); // Save to Local Storage
	}

	// Chart data for Placemarks Leaderboard (Placemarks per User)
	const placemarksLeaderboardData = $derived.by(() => {
		const userPlacemarkCounts: Record<string, number> = {};

		// Count placemarks per user - normalize userid to string for comparison
		placemarks.forEach((p) => {
			if (p.userid) {
				const userId = String(p.userid);
				userPlacemarkCounts[userId] = (userPlacemarkCounts[userId] || 0) + 1;
			}
		});

		// Get user names and sort by count - normalize user._id to string for comparison
		const leaderboard = users
			.map((user) => {
				const userId = String(user._id || '');
				return {
					name: `${user.firstName} ${user.lastName}`,
					count: userPlacemarkCounts[userId] || 0,
				};
			})
			.sort((a, b) => b.count - a.count)
			.slice(0, 10); // Top 10

		return {
			labels: leaderboard.map((entry) => entry.name),
			datasets: [
				{
					values: leaderboard.map((entry) => entry.count),
				},
			],
		};
	});

	// Chart data for Categories (Pie Chart)
	const categoriesChartData = $derived.by(() => {
		const categoryCounts: Record<string, number> = {};
		placemarks.forEach((p) => {
			categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
		});

		const categories = Object.keys(categoryCounts).sort();
		const counts = categories.map((cat) => categoryCounts[cat]);

		return {
			labels: categories,
			datasets: [
				{
					values: counts,
				},
			],
		};
	});

	// Chart data for Timeline (Line Chart - Placemarks created over time)
	const timelineChartData = $derived.by(() => {
		// Get last 6 months
		const months: string[] = [];
		const monthCounts: Record<string, number> = {};
		
		for (let i = 5; i >= 0; i--) {
			const date = new Date();
			date.setMonth(date.getMonth() - i);
			const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
			months.push(monthKey);
			monthCounts[monthKey] = 0;
		}

		// Count placemarks per month
		placemarks.forEach((p) => {
			if (p.createdAt) {
				const date = new Date(p.createdAt);
				const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
				if (monthCounts[monthKey] !== undefined) {
					monthCounts[monthKey]++;
				}
			}
		});

		return {
			labels: months,
			datasets: [
				{
					name: 'New POIs',
					values: months.map((m) => monthCounts[m]),
					chartType: 'line',
				},
			],
		};
	});

	// Chart data for Cumulative Growth (Area Chart)
	const cumulativeGrowthData = $derived.by(() => {
		// Get last 6 months
		const months: string[] = [];
		const monthCounts: Record<string, number> = {};
		
		for (let i = 5; i >= 0; i--) {
			const date = new Date();
			date.setMonth(date.getMonth() - i);
			const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
			months.push(monthKey);
			monthCounts[monthKey] = 0;
		}

		// Count placemarks per month
		placemarks.forEach((p) => {
			if (p.createdAt) {
				const date = new Date(p.createdAt);
				const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
				if (monthCounts[monthKey] !== undefined) {
					monthCounts[monthKey]++;
				}
			}
		});

		// Calculate cumulative values
		let cumulative = 0;
		const cumulativeValues = months.map((m) => {
			cumulative += monthCounts[m];
			return cumulative;
		});

		return {
			labels: months,
			datasets: [
				{
					name: 'Total POIs',
					values: cumulativeValues,
				},
			],
		};
	});

	// Chart data for Images (Donut Chart - With Image vs Without Image)
	const imagesChartData = $derived.by(() => {
		let withImage = 0;
		let withoutImage = 0;

		placemarks.forEach((p) => {
			if (p.images && p.images.length > 0) {
				withImage++;
			} else {
				withoutImage++;
			}
		});

		return {
			labels: ['With Image', 'Without Image'],
			datasets: [
				{
					values: [withImage, withoutImage],
				},
			],
		};
	});

	async function deleteUser(id: string) {
		if (!confirm('Are you sure you want to delete this user?')) return;
		try {
			await userApi.delete(id);
			await loadData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error deleting user';
		}
	}

	async function deleteAllUsers() {
		if (!confirm('Are you sure you want to delete ALL users? This action cannot be undone!')) return;
		try {
			await userApi.deleteAll();
			await loadData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error deleting all users';
		}
	}
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1 class="admin-title">Admin Dashboard</h1>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	<div class="admin-tabs">
		<button
			class="tab-button"
			class:active={activeTab === 'users'}
			onclick={() => switchTab('users')}
		>
			User Management
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'analytics'}
			onclick={() => switchTab('analytics')}
		>
			Analytics
		</button>
	</div>

	<div class="admin-content">
		{#if loading}
			<p class="loading-text">Loading...</p>
		{:else if activeTab === 'users'}
			<div class="admin-card">
				<h2 class="section-title">User Management</h2>
				<div class="table-container">
					<table class="users-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Admin</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each users as user}
								<tr>
									<td>{user.firstName} {user.lastName}</td>
									<td>{user.email}</td>
									<td>
										{#if user.isAdmin}
											<span class="admin-badge">Admin</span>
										{:else}
											<span class="user-badge">User</span>
										{/if}
									</td>
									<td>
										<button class="button delete-button" onclick={() => deleteUser(user._id!)}>
											Delete
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="admin-actions">
					<button class="button delete-all-button" onclick={deleteAllUsers}>
						Delete All Users
					</button>
				</div>
			</div>
		{:else if activeTab === 'analytics'}
			<div class="admin-card">
				<h2 class="section-title">Analytics</h2>
				<div class="charts-container">
					<!-- Row 1: Leaderboard & Categories -->
					<div class="chart-card">
						<h3 class="chart-title"><i class="fas fa-chart-bar"></i> Placemarks Leaderboard</h3>
						<p class="chart-subtitle">Top users by placemarks created</p>
						<div class="chart-wrapper">
							<Chart
								data={placemarksLeaderboardData}
								type="bar"
								colors={['#ff6b35']}
								options={{
									colors: ['#ff6b35'],
									tooltipOptions: {
										formatTooltipX: (d: string) => d,
										formatTooltipY: (d: number) => d.toFixed(0) + ' placemarks',
									},
								}}
							/>
						</div>
					</div>
					<div class="chart-card">
						<h3 class="chart-title"><i class="fas fa-chart-pie"></i> Placemarks by Category</h3>
						<p class="chart-subtitle">Distribution across categories</p>
						<div class="chart-wrapper">
							<Chart
								data={categoriesChartData}
								type="pie"
								colors={['#ff6b35', '#e55a2b', '#d97a47', '#ffad7f', '#c44a1f', '#ff8c5a', '#b36a3d']}
								maxSlices={20}
							/>
						</div>
					</div>

					<!-- Row 2: Timeline & Cumulative Growth -->
					<div class="chart-card">
						<h3 class="chart-title"><i class="fas fa-chart-line"></i> POIs Over Time</h3>
						<p class="chart-subtitle">New placemarks per month (last 6 months)</p>
						<div class="chart-wrapper">
							<Chart
								data={timelineChartData}
								type="line"
								colors={['#ff6b35']}
								lineOptions={{
									regionFill: 1,
									hideDots: 0,
									dotSize: 6,
								}}
								axisOptions={{
									xIsSeries: true,
								}}
							/>
						</div>
					</div>
					<div class="chart-card">
						<h3 class="chart-title"><i class="fas fa-chart-area"></i> Cumulative Growth</h3>
						<p class="chart-subtitle">Total POIs over time</p>
						<div class="chart-wrapper">
							<Chart
								data={cumulativeGrowthData}
								type="line"
								colors={['#e55a2b']}
								lineOptions={{
									regionFill: 1,
									hideDots: 0,
									dotSize: 6,
								}}
								axisOptions={{
									xIsSeries: true,
								}}
							/>
						</div>
					</div>

					<!-- Row 3: Images Donut Chart -->
					<div class="chart-card chart-card-full">
						<h3 class="chart-title"><i class="fas fa-images"></i> Image Status</h3>
						<p class="chart-subtitle">Distribution of POIs with and without images</p>
						<div class="chart-wrapper donut-wrapper">
							<Chart
								data={imagesChartData}
								type="donut"
								colors={['#ff6b35', '#d2d2d7']}
								maxSlices={2}
							/>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-container {
		flex: 1;
		min-height: 100%;
		padding: 2rem 4rem;
		background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
	}

	.admin-header {
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.admin-header-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.admin-logo {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.admin-title-wrapper {
		display: flex;
		align-items: center;
	}

	.admin-title {
		font-size: 2rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0;
		letter-spacing: -0.5px;
	}

	.admin-menu {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.admin-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid #e5e5e7;
	}

	.tab-button {
		background: none;
		border: none;
		padding: 1rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		color: #86868b;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.2s ease;
	}

	.tab-button:hover {
		color: #1d1d1f;
	}

	.tab-button.active {
		color: #ff6b35;
		border-bottom-color: #ff6b35;
	}

	.admin-content {
		width: 100%;
	}

	.admin-card {
		background: #ffffff;
		border-radius: 5px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		padding: 2rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0 0 1.5rem 0;
		letter-spacing: -0.3px;
	}

	.table-container {
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.users-table {
		width: 100%;
		border-collapse: collapse;
	}

	.users-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-weight: 600;
		font-size: 0.875rem;
		color: #1d1d1f;
		border-bottom: 1px solid #e5e5e7;
	}

	.users-table td {
		padding: 1rem;
		border-bottom: 1px solid #f5f5f7;
		color: #1d1d1f;
	}

	.users-table tr:hover {
		background-color: #fafafa;
	}

	.admin-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background-color: #f5f5f7;
		color: #1d1d1f;
		border: 1px solid #d2d2d7;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.user-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background-color: transparent;
		color: #86868b;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.delete-button {
		background-color: #ffffff;
		color: #1d1d1f;
		border-color: #d2d2d7;
	}

	.delete-button:hover {
		background-color: #f5f5f7;
		border-color: #ff6b35;
		color: #ff6b35;
	}

	.admin-actions {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e5e7;
	}

	.delete-all-button {
		background-color: #ffffff;
		color: #1d1d1f;
		border-color: #d2d2d7;
		padding: 0.75rem 1.5rem;
	}

	.delete-all-button:hover {
		background-color: #f5f5f7;
		border-color: #ff6b35;
		color: #ff6b35;
	}

	.loading-text {
		text-align: center;
		color: #86868b;
		padding: 2rem;
	}

	.charts-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.chart-card {
		background: #ffffff;
		border-radius: 5px;
		padding: 1.5rem;
		border: 1px solid #e5e5e7;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.chart-card-full {
		grid-column: 1 / -1;
		max-width: 600px;
		margin: 0 auto;
	}

	.donut-wrapper {
		max-width: 400px;
		margin: 0 auto;
	}

	.chart-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0 0 0.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.chart-title i {
		color: #ff6b35;
		font-size: 1rem;
	}

	.chart-subtitle {
		font-size: 0.875rem;
		color: #86868b;
		margin: 0 0 1.5rem 0;
	}

	.chart-wrapper {
		position: relative;
		height: 300px;
		width: 100%;
	}

	/* Force all chart text to be black for readability */
	.chart-wrapper :global(svg text),
	.chart-wrapper :global(text),
	.chart-wrapper :global(.legend text),
	.chart-wrapper :global(.legend-item text),
	.chart-wrapper :global(.legend-label),
	.chart-wrapper :global(.legend-value) {
		fill: #000000 !important;
		color: #000000 !important;
		font-weight: 500 !important;
		font-size: 12px !important;
	}

	/* Ensure legend items have black text */
	.chart-wrapper :global(.legend),
	.chart-wrapper :global(.legend-item),
	.chart-wrapper :global(.legend-item-label) {
		color: #000000 !important;
		fill: #000000 !important;
	}

	/* Frappe Charts Tooltip - graph-svg-tip is the tooltip container */
	:global(.graph-svg-tip) {
		background-color: #1d1d1f !important;
	}

	:global(.graph-svg-tip .title),
	:global(.graph-svg-tip .data-point-list),
	:global(.graph-svg-tip .data-point),
	:global(.graph-svg-tip text),
	:global(.graph-svg-tip tspan),
	:global(.graph-svg-tip *) {
		fill: #ffffff !important;
		color: #ffffff !important;
		font-weight: 500 !important;
		font-size: 11px !important;
	}

	/* Also target SVG text elements directly */
	:global(svg .graph-svg-tip text),
	:global(svg .graph-svg-tip tspan) {
		fill: #ffffff !important;
		font-size: 11px !important;
	}

	/* Pie/Donut chart hover state - subtle darkening effect */
	:global(.donut-path:hover),
	:global(.pie-path:hover),
	:global(.donut-path.hover),
	:global(.pie-path.hover) {
		filter: brightness(0.92) !important;
	}

	@media (max-width: 1024px) {
		.charts-container {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.admin-container {
			padding: 1rem 1.5rem;
		}

		.admin-card {
			padding: 1.5rem;
		}

		.table-container {
			overflow-x: scroll;
		}
	}
</style>

