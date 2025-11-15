<template>
  <div class="q-mb-lg">
    <div class="text-h5 text-primary text-weight-bold">{{ titulo }}</div>
    <div class="text-grey-7 q-mt-xs">{{ descripcion }}</div>
  </div>
</template>

<script setup>
defineProps({
  titulo: String,
  descripcion: String
});
</script>
