<script setup lang="ts">
interface Props {
  theme?: 'primary' | 'ghost' | 'danger';
  size?: 'md' | 'lg' | 'sm';
  disabled?: boolean;
  icon?: string;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'primary',
  size: 'md',
  disabled: false,
  icon: '',
  type: 'button'
});

const emits = defineEmits<{ click: [MouseEvent] }>();

const onClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emits('click', event);
};
</script>

<template>
  <button
    class="app-button"
    :class="[theme, size, { disabled }]"
    :disabled="disabled"
    :type="type"
    @click="onClick"
  >
    <span v-if="icon" class="icon">{{ icon }}</span>
    <span class="label"><slot /></span>
  </button>
</template>

<style scoped>
.app-button {
  border: none;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  padding: 0.85rem 1.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  font-size: 1rem;
  color: #0f1324;
}

.app-button.primary {
  background: linear-gradient(120deg, #ff9b73, #ffd25a);
  box-shadow: 0 10px 20px rgba(255, 155, 115, 0.4);
}

.app-button.ghost {
  background: rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.app-button.danger {
  background: linear-gradient(120deg, #ff6d8e, #ff5674);
  color: #fff;
}

.app-button.sm {
  font-size: 0.85rem;
  padding: 0.6rem 1rem;
}

.app-button.lg {
  font-size: 1.1rem;
  padding: 1rem 2.2rem;
}

.app-button:not(.disabled):hover {
  transform: translateY(-2px);
}

.app-button.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.icon {
  font-size: 1.1rem;
}
</style>
