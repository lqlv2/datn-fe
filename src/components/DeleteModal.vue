<template>
  <a-modal
      v-model:open="props.isDeleteModalVisible"
      title="Confirm Deletion"
      :closable="false"
      :maskClosable="false"
      :width="420"
  >
    <template #icon>
      <ExclamationCircleOutlined style="color: #ff4d4f; font-size: 22px; margin-right: 10px"/>
    </template>
    <div style="display: flex; align-items: center; margin-bottom: 16px">
      <div
          style="background-color: #fff2f0; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; margin-right: 16px">
        <ExclamationCircleOutlined style="color: #ff4d4f; font-size: 22px"/>
      </div>
      <div>
        <p style="font-size: 16px; font-weight: 500; margin-bottom: 8px">{{props.message}}</p>
        <p style="color: #666; margin-bottom: 0">This action cannot be undone.</p>
      </div>
    </div>
    <template #footer>
      <a-button key="cancel" @click="props.onCancel">Cancel</a-button>
      <a-button key="delete" danger type="primary" @click="props.onDelete">Delete</a-button>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
import {PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from "@ant-design/icons-vue";

const props = defineProps({
  message : {
    type: String,
    required: true
  },
  isDeleteModalVisible: {
    type: Boolean,
    required: true
  },
  onDelete: {
    type: Function,
    required: true
  },
  onCancel: {
    type: Function,
    required: true
  }
});


</script>