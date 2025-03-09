<template>
  <div>
    <h2>Project Transfers</h2>
    <a-table :dataSource="projectTransfers" :columns="columns" rowKey="id" />
  </div>
</template>
  
  <script setup>
import { ref, computed, onMounted, h } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons-vue";
import { Input } from "ant-design-vue";

const projectStore = useProjectStore();
const authStore = useAuthStore();
const approvalComments = ref({});

const projectTransfers = computed(() => projectStore.transfers);
const userRole = computed(() => authStore.userRole);
const { approveTransfer, denyTransfer } = projectStore;

const handleEdit = (record) => {
  console.log("Edit", record);
  
};

const handleDelete = (record) => {
  console.log("Delete", record);
  // Implement delete logic
};

const handleApprove = async (record) => {
  console.log(
    "Approve",
    record,
    "Comment:",
    approvalComments.value[record.id] || ""
  );

  try {
    await approveTransfer(record.id, approvalComments.value[record.id]); // ✅ Wait for approval API to complete
    fetchTransfersByRole(); // ✅ Fetch updated transfers list
  } catch (error) {
    console.error("Approval failed:", error);
  }
};

const handleDeny = async (record) => {
  console.log(
    "Deny",
    record,
    "Comment:",
    approvalComments.value[record.id] || ""
  );

  try {
    await denyTransfer(record.id, approvalComments.value[record.id]); // ✅ Wait for approval API to complete
    fetchTransfersByRole(); // ✅ Fetch updated transfers list
  } catch (error) {
    console.error("Deny failed:", error);
  }
};

const columns = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Project ID", dataIndex: "projectId", key: "projectId", width: "50px" },
  { title: "Project Name", dataIndex: "projectName", key: "projectName" },
  { title: "Reason", dataIndex: "reason", key: "reason" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "ApprovedBy(id)", dataIndex: "approvedBy", key: "approvedBy" },
  { title: "Approved At", dataIndex: "approvedAt", key: "approvedAt" },
  { title: "Approval Comment", dataIndex: "apComment", key: "apComment" },
  { title: "CreatedBy(id)", dataIndex: "createdBy", key: "createdBy" },
  { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
  {
    title: "Action",
    key: "action",
    align: "center",
    customRender: ({ record }) => {
      if (record.status !== "PENDING") {
        return "HANDLED";
      }

      if (userRole.value === "INTERN") {
        return h("div", { style: "display: flex; gap: 8px" }, [
          h(EditOutlined, {
            onClick: () => handleEdit(record),
            style: { color: "blue", cursor: "pointer" },
          }),
          h(DeleteOutlined, {
            onClick: () => handleDelete(record),
            style: { color: "red", cursor: "pointer" },
          }),
        ]);
      } else {
        return h(
          "div",
          { style: "display: flex; flex-direction: column; gap: 8px" },
          [
            h(Input, {
              placeholder: "Enter approval comment...",
              value: approvalComments.value[record.id] || "",
              onInput: (event) =>
                (approvalComments.value[record.id] = event.target.value),
              style: { width: "100px" },
            }),
            h("div", { style: "display: flex; gap: 8px; margin-top: 8px" }, [
              h(CheckOutlined, {
                onClick: () => handleApprove(record),
                style: {
                  color: "green",
                  cursor: "pointer",
                },
                disabled: !approvalComments.value[record.id],
              }),
              h(CloseOutlined, {
                onClick: () => handleDeny(record),
                style: {
                  color: "red",
                  cursor: "pointer",
                },
              }),
            ]),
          ]
        );
      }
    },
  },
];

const fetchTransfersByRole = () => {
  switch (userRole.value) {
    case "DL":
      projectStore.fetchCompanyProjectTransfer();
      break;
    case "MENTOR":
      projectStore.fetchPersonalProjectTransfer();
      break;
    case "INTERN":
      projectStore.fetchOwnProjectTransfer();
      break;
    default:
      console.warn("Unknown role, no transfer fetched");
  }
};

onMounted(async () => {
  fetchTransfersByRole();
});
</script>
  