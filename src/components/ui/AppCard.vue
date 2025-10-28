<template>
  <section class="app-card">
    <header v-if="$slots.heading" class="heading">
      <slot name="heading" />
    </header>
    <div class="content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.app-card {
  background: var(--card-bg);
  border-radius: 28px;
  padding: 1.6rem;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
}

.heading {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--card-heading);
}

:global(.dark-mode) .app-card {
  backdrop-filter: blur(12px);
}
</style>
