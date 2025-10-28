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
  background: rgba(255, 255, 255, 0.9);
  border-radius: 28px;
  padding: 1.6rem;
  box-shadow: 0 18px 40px rgba(15, 19, 36, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.heading {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ce4d1c;
}
</style>
