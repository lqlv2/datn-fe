<template>
    <div class="tab-container">
      <!-- Tab buttons to switch between Evaluation and Feedback -->
      <div class="tab-buttons">
        <button
          :class="{ active: selectedTab === 'evaluation' }"
          @click="selectTab('evaluation')"
        >
          Evaluation
        </button>
        <button
          :class="{ active: selectedTab === 'feedback' }"
          @click="selectTab('feedback')"
        >
          Feedback
        </button>
      </div>
  
      <div class="tab-content">
        <Evaluation v-if="selectedTab === 'evaluation'" />
        <Feedback v-if="selectedTab === 'feedback'" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import Evaluation from "@/components/Evaluation.vue";
  import Feedback from "@/components/Feedback.vue";
  
  // Define the selectedTab using ref
  const selectedTab = ref("evaluation"); // Default selected tab
  
  // Method to switch the selected tab
  function selectTab(tab) {
    selectedTab.value = tab;
  }
  </script>
  
  <style scoped>
  .tab-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .tab-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .tab-buttons button {
    padding: 10px 20px;
    margin: 0 10px;
    border: none;
    background-color: #f0f0f0;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
  }
  
  .tab-buttons button.active {
    background-color: #007bff;
    color: white;
  }
  
  .tab-buttons button:hover {
    background-color: #ddd;
  }
  
  .tab-content {
    margin-top: 15px;
  }
  </style>
  