<script lang="ts">
  import { page } from '$app/stores';
  import { userApi } from '$lib/api';
  import { goto } from '$app/navigation';

  let token = $derived($page.url.searchParams.get('token') || '');
  let password = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);
  let error = $state('');
  let success = $state('');

  async function submit() {
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    if (password.length < 5) {
      error = 'Password must be at least 5 characters';
      return;
    }

    loading = true;
    error = '';
    try {
      await userApi.resetPassword(token, password);
      success = 'Password successfully reset. Redirecting to login...';
      setTimeout(() => {
        goto('/login');
      }, 3000);
    } catch (err: any) {
      error = err.message || 'Invalid or expired token';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <img src="/favicon.png" alt="Logo" class="auth-logo" />
      <h1 class="auth-title">Reset Password</h1>
      <p class="auth-subtitle">Enter your new password below</p>
    </div>

      {#if !token}
        <div class="error-message">
          Missing reset token. Please check the link from your email.
        </div>
      {:else}
        {#if success}
          <div class="success-message">
            {success}
          </div>
        {:else}
          <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="auth-form">
            <div class="form-group">
              <label class="form-label" for="password">New Password</label>
              <input class="form-input" id="password" type="password"  placeholder="New Password" bind:value={password} required disabled={loading} />
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmPassword">Confirm Password</label>
              <input class="form-input" id="confirmPassword" type="password" placeholder="Confirm Password" bind:value={confirmPassword} required disabled={loading} />
            </div>

            {#if error}
              <div class="error-message">
                {error}
              </div>
            {/if}

            <button class="button" type="submit" disabled={loading} style="width: 100%; margin-top: 0.5rem;">
               {loading ? 'Reseting...' : 'Reset Password'}
            </button>
            
          </form>

          <div class="auth-footer">
            <p class="auth-link">
               <a href="/login">Back to Login</a>
            </p>
          </div>
        {/if}
      {/if}
  </div>
</div>
