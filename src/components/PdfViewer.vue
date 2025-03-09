<template>
    <div>
      <!-- Displaying the PDF document -->
      <pdf :src="pdfUrl" :page="page" :scale="scale" />
    </div>
  </template>
  
  <script setup>
  import { ref, watchEffect } from 'vue';
  import  Pdf  from 'vue3-pdfjs';
  
  // Props for the PdfViewer component
  const props = defineProps({
    url: {
      type: String,
      required: true,
    },
  });
  
  // State to manage the PDF page and scale
  const page = ref(1); // Start on the first page
  const scale = ref(1); // Default scale for the PDF
  
  const pdfUrl = ref('');
  
  // Watch the `url` prop to change the PDF file dynamically
  watchEffect(() => {
    pdfUrl.value = props.url;
  });
  </script>
  
  <style scoped>
  /* You can style the PDF container here */
  </style>
  