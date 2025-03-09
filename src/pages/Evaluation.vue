<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useEvaluationStore } from "@/stores/evaluationStore";ev
import { useRouter } from "vue-router";

const isModalOpen = ref(false);
const selectedIntern = ref(null);
const evaluationStore = useEvaluationStore();
const authStore = useAuthStore();
const router = useRouter();

const userRole = computed(() => authStore.userRole);
const evaluations = computed(() => evaluationStore.evaluations);
const selectedEvaluation = computed(() => evaluationStore.selectedEvaluation);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const {
  fetchEvaluations,
  setSelectedEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} = evaluationStore;

const newEvaluation = ref({
  internId: null,
  mentorId: null,
  taskId: null,
  score: null,
  feedback: "",
});

const showModal = (evaluation) => {
  setSelectedEvaluation(evaluation);
  isModalOpen.value = true;
};

const handleOk = async () => {
  if (selectedEvaluation.value) {
    await updateEvaluation(selectedEvaluation.value);
  } else {
    await createEvaluation(newEvaluation.value);
  }
  fetchEvaluations(pagination.current, pagination.pageSize);
  isModalOpen.value = false;
};

const handleDelete = async (evaluation) => {
  await deleteEvaluation(evaluation.id);
  fetchEvaluations(pagination.current, pagination.pageSize);
};

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  fetchEvaluations(paginationConfig.current, pagination.pageSize);
};

onMounted(() => {
  fetchEvaluations(pagination.current, pagination.pageSize);
});
</script>

<template>
  <div>
    <h2 style="margin-left: 10px">Evaluations</h2>

    <a-button
      v-if="userRole === 'MENTOR'"
      style="float: right; margin-right: 8px; background-color: saddlebrown; color: aliceblue;"
      @click="showModal"
    >
      Add Evaluation
    </a-button>

    <div style="margin-bottom: 16px; display: flex; gap: 10px; align-items: center">
      <a-select
        v-model:value="evaluationStore.status"
        placeholder="Status"
        style="width: 130px; margin-left: 10px"
        @change="fetchEvaluations(pagination.current, pagination.pageSize)"
      >
        <a-select-option value="PENDING">Pending</a-select-option>
        <a-select-option value="COMPLETED">Completed</a-select-option>
      </a-select>
    </div>

    <a-table
      :dataSource="evaluations"
      :pagination="pagination"
      @change="handlePaginationChange"
      rowKey="id"
      bordered
      :scroll="{ x: 1500, y: 500 }"
    >
      <a-table-column
        title="ID"
        data-index="id"
        key="id"
        width="20"
        fixed="left"
        align="center"
      />
      <a-table-column
        title="Intern"
        data-index="internName"
        key="internName"
        width="150"
        align="center"
      />
      <a-table-column
        title="Mentor"
        data-index="mentorName"
        key="mentorName"
        width="150"
        align="center"
      />
      <a-table-column
        title="Score"
        data-index="score"
        key="score"
        width="100"
        align="center"
      />
      <a-table-column
        title="Feedback"
        data-index="feedback"
        key="feedback"
        width="200"
        align="center"
      />
      <a-table-column
        title="Status"
        data-index="status"
        key="status"
        width="130"
        align="center"
      />
      <a-table-column title="Actions" align="center" fixed="right" :width="170">
        <template #default="{ record }">
          <a-button
            v-if="userRole === 'MENTOR'"
            @click="showModal(record)"
            type="text"
            style="padding: 2px; min-width: auto; height: auto"
          >
            <img src="@/assets/edit.png" alt="Edit" style="width: 16px; height: 16px" />
          </a-button>
          <a-button
            v-if="userRole === 'MENTOR'"
            @click="handleDelete(record)"
            type="text"
            style="padding: 2px; min-width: auto; height: auto; margin-left: 7px"
          >
            <img src="@/assets/delete.png" alt="Delete" style="width: 15px; height: 15px" />
          </a-button>
        </template>
      </a-table-column>
    </a-table>

    <a-modal v-model:open="isModalOpen" title="Evaluation" @ok="handleOk">
      <a-form layout="vertical">
        <a-form-item label="Intern" required>
          <a-select v-model:value="newEvaluation.internId" placeholder="Select Intern">
            <a-select-option
              v-for="intern in evaluationStore.interns"
              :key="intern.id"
              :value="intern.id"
            >
              {{ intern.fullname }} - {{ intern.position }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Mentor" required>
          <a-select v-model:value="newEvaluation.mentorId" placeholder="Select Mentor">
            <a-select-option
              v-for="mentor in evaluationStore.mentors"
              :key="mentor.id"
              :value="mentor.id"
            >
              {{ mentor.fullname }} - {{ mentor.position }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Score" required>
          <a-input-number v-model:value="newEvaluation.score" :min="1" :max="5" />
        </a-form-item>

        <a-form-item label="Feedback">
          <a-textarea v-model:value="newEvaluation.feedback" placeholder="Enter feedback" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 16px;
}
</style>
