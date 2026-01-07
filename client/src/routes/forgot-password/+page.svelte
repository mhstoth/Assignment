<script lang="ts">
  import { userApi } from '$lib/api';

  let email = $state('');
  let loading = $state(false);
  let message = $state('');
  let error = $state('');

  async function submit() {
    loading = true;
    message = '';
    error = '';
    try {
      const result = await userApi.forgotPassword(email);
      message = result.message;
    } catch (err: any) {
      error = err.message || 'Something went wrong';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <img src="/favicon.png" alt="Logo" class="auth-logo" />
      <h1 class="auth-title">Forgot Password</h1>
      <p class="auth-subtitle">Enter your email to receive a reset link</p>
    </div>
      
      {#if message}
        <div class="success-message">
          {message}
        </div>
        <div class="auth-footer">
          <p class="auth-link">
             <a href="/login">Back to Login</a>
          </p>
        </div>
      {:else}
        <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="auth-form">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input class="form-input" id="email" type="email" placeholder="name@example.com" bind:value={email} required disabled={loading} />
          </div>

          {#if error}
            <div class="error-message">
              {error}
            </div>
          {/if}

          <button class="button" type="submit" disabled={loading} style="width: 100%; margin-top: 0.5rem;">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
        </form>

        <div class="auth-footer">
          <p class="auth-link">
             <a href="/login">Back to Login</a>
          </p>
        </div>
      {/if}
  </div>
</div>
