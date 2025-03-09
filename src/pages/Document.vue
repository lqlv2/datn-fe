<template>
  <div>
    <a-row :gutter="16">
      <!-- Document List Section -->
      <a-col :span="24">
        <a-button
          @click="showUploadForm"
          style="
            float: right;
            background-color: azure;
            color: black;
            margin-top: 13px;
            margin-right: 4px;
          "
        >
          <img
            src="@/assets/upload.png"
            alt="Upload"
            style="
              width: 14px;
              height: 14px;
              margin-right: 9px;
              margin-top: 3px;
            "
          />
          Upload
        </a-button>

        <h2 claes="header-title">Document Management</h2>

        <a-row gutter="16" style="margin-bottom: 16px">
          <!-- Position Filter -->
          <a-col span="10">
            <a-input
              v-model:value="docFilter.title"
              placeholder="Keywords"
              allowClear
              style="width: 100%"
            />
          </a-col>

          <!-- Status Filter -->
          <a-col span="3">
            <a-select
              v-model:value="docFilter.format"
              placeholder="Format"
              allowClear
              style="width: 100%"
            >
              <a-select-option value="PDF">PDF</a-select-option>
              <a-select-option value="DOCX">DOCX</a-select-option>
              <a-select-option value="XLSX">XLSX</a-select-option>
              <a-select-option value="PPTX">PPTX</a-select-option>
              <a-select-option value="IMAGE">IMAGE</a-select-option>
            </a-select>
          </a-col>

          <a-col span="4">
            <a-select
              v-model:value="docFilter.type"
              placeholder="Type"
              allowClear
              style="width: 100%"
            >
              <a-select-option value="General">General</a-select-option>
              <a-select-option value="Education">Education</a-select-option>
              <a-select-option value="Program">Program</a-select-option>
            </a-select>
          </a-col>

          <a-button
            type="primary"
            style="margin-left: 8px"
            @click="applyFilters"
            >Search</a-button
          >

          <a-button style="margin-left: 8px" @click="resetFilters"
            >Reset</a-button
          >
        </a-row>

        <a-table
          :data-source="documents"
          :pagination="pagination"
          @change="handlePaginationChange"
          bordered
          row-key="id"
        >
          <a-table-column
            title=""
            :customRender="renderFormatIcon"
            :width="1"
            fixed="left"
          />
          <a-table-column :dataIndex="'title'" :width="450" align="left">
            <template #title>
              <div style="text-align: center">Title</div>
            </template>
          </a-table-column>
          <a-table-column
            title="Type"
            :dataIndex="'type'"
            align="center"
            :width="130"
          />
          <a-table-column
            title="Uploaded By"
            :dataIndex="'uploadDate'"
            align="center"
            :width="130"
          />
          <a-table-column
            title="Uploaded At"
            :dataIndex="'uploadedAt'"
            align="center"
            :width="130"
          />

          <a-table-column title="Actions" align="center" :width="170">
            <template v-slot="record">
              <a-button
                @click="controlAccess(record)"
                type="text"
                style="padding: 2px; min-width: auto; height: auto"
              >
                <img
                  src="@/assets/permission.png"
                  alt="Permission"
                  style="width: 15px; height: 15px"
              /></a-button>

              <a-button
                v-if="record.value.format === 'PDF'"
                @click="openInBrowser(record)"
                type="text"
                style="
                  padding: 2px;
                  min-width: auto;
                  height: auto;
                  margin-left: 7px;
                "
              >
                <img
                  src="@/assets/open-in-browser.png"
                  alt="Open"
                  style="width: 15px; height: 15px"
              /></a-button>
              <a-button
                @click="downloadDoc(record)"
                type="text"
                style="
                  padding: 2px;
                  min-width: auto;
                  height: auto;
                  margin-left: 7px;
                "
              >
                <img
                  src="@/assets/download-button.png"
                  alt="Download"
                  style="width: 15px; height: 15px"
                />
              </a-button>
              <a-button
                @click="deleteDoc(record)"
                type="text"
                style="
                  padding: 2px;
                  min-width: auto;
                  height: auto;
                  margin-left: 7px;
                "
              >
                <img
                  src="@/assets/delete.png"
                  alt="Delete"
                  style="width: 15px; height: 15px"
              /></a-button>
            </template>
          </a-table-column>
        </a-table>
      </a-col>

      <!-- Modal for Upload Form -->
      <a-modal
        v-model:visible="isUploadFormVisible"
        title="Upload Document"
        @cancel="handleCancel"
        @ok="uploadFile"
        width="500px"
      >
        <!-- Upload Form Fields -->
        <a-form ref="formDocument" :model="form">
          <!-- Title Field -->
          <a-form-item
            label="Title"
            name="title"
            :rules="[{ required: true, message: 'Please enter title' }]"
          >
            <a-input
              v-model:value="form.title"
              placeholder="Enter document title"
            />
          </a-form-item>

          <a-form-item
            label="Type"
            name="type"
            :rules="[{ required: true, message: 'Please select type' }]"
          >
            <a-select
              v-model:value="form.type"
              placeholder="Select document type"
            >
              <a-select-option value="GENERAL">General</a-select-option>
              <a-select-option value="EDUCATION">Education</a-select-option>
              <a-select-option value="PROGRAM">Program</a-select-option>
            </a-select>
          </a-form-item>

          <!-- Description Field -->
          <a-form-item label="Description">
            <a-textarea
              v-model:value="form.description"
              placeholder="Enter document description"
              :rows="3"
            />
          </a-form-item>

          <!-- Upload Field -->
          <a-form-item
            label="Document"
            :rules="[{ required: true, message: 'Please select a file' }]"
          >
            <a-upload
              list-type="text"
              :maxCount="1"
              :customRequest="handleUpload"
              :show-upload-list="true"
            >
              <div class="upload-button">
                <a-icon style="font-size: 24px; color: #1890ff" />
                <div style="color: #1890ff">Select Document</div>
              </div>
            </a-upload>
          </a-form-item>
        </a-form>
      </a-modal>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, h } from "vue";
import { useDocumentStore } from "@/stores/documentStore";
import pdfIcon from "@/assets/pdf.png";
import docxIcon from "@/assets/doc.png";
import xlsxIcon from "@/assets/xlsx.png";
import pptxIcon from "@/assets/powerpoint.png";
import { downloadDocument } from "@/services/documentService";
import { message, Modal } from "ant-design-vue";

// Define reactive variables
const documentStore = useDocumentStore();
const documents = computed(() => documentStore.documents);
const currentPage = computed(() => documentStore.currentPage);
const totalElements = computed(() => documentStore.totalElements);
const currentDocument = ref(null);

const { list, upload } = documentStore;
const isUploadFormVisible = ref(false);
const formDocument = ref(null);

// Show the upload modal
function showUploadForm() {
  isUploadFormVisible.value = true;
}

const form = reactive({
  title: null,
  description: null,
  type: null,
  file: null,
});

// Handle modal cancel (close modal)
function handleCancel() {
  formDocument.value?.resetFields();
  isUploadFormVisible.value = false;
}

const handleUpload = ({ file, onSuccess }) => {
  setTimeout(() => {
    form.file = file;
    console.log("File ready for preview:", file);
    onSuccess("ok");
  }, 800);
};

const uploadFile = async () => {
  const isValid = await formDocument.value?.validate();

  if (!isValid) {
    // If validation fails, Ant Design automatically shows error messages for each invalid field
    return; // No need to proceed with API call
  }

  try {
    await upload(form.file, form.title, form.description, form.type);
    message.success("Uploaded file successfully!");
    formDocument.value?.resetFields();
    isUploadFormVisible.value = false;
  } catch (error) {
    // Display error message from the backend response
    const errorMessage = error.message || "An unexpected error occurred!";
    showErrorModal(errorMessage);
  }
};

const docFilter = reactive({
  title: null,
  format: null,
  type: null,
});

const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
  pageSizeOptions: ["10", "20", "30"],
  showSizeChanger: true,
  showQuickJumper: true,
});

const applyFilters = () => {
  documentStore.filters = { ...docFilter };
  console.log(docFilter);
  console.log("Applied Filters:", documentStore.filters);
  list(1, pagination.pageSize, documentStore.filters);
};

const resetFilters = () => {
  docFilter.title = null;
  docFilter.type = null;
  docFilter.format = null;
  documentStore.filters = { ...docFilter };
  list(1, pagination.pageSize, documentStore.filters);
};

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  list(paginationConfig.current, pagination.pageSize, documentStore.filters);
};

const renderFormatIcon = ({ record }) => {
  const format = record.format;
  const iconMap = {
    PDF: pdfIcon,
    DOCX: docxIcon,
    PPTX: pptxIcon,
    XLSX: xlsxIcon,
  };
  const icon = iconMap[format];

  // Use h() to create the img tag dynamically
  return h("img", {
    src: icon,
    alt: format,
    style: "width: 26px; height: 26px;",
  });
};

// Download Document - Trigger the downloadk
const downloadDoc = async (record) => {
  try {
    // Trigger the download from the backend
    console.log(record);
    const documentId = record.value.id;
    const response = await downloadDocument(documentId);
    console.log(response.data);
    const path = record.value.path;

    const lastDotIndex = path.lastIndexOf(".");

    const fileExtension =
      lastDotIndex !== -1 ? path.slice(lastDotIndex + 1) : "";

    // Create a URL for the file data
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create an anchor tag to trigger the download
    const link = document.createElement("a");
    link.href = url;

    // Set the filename dynamically (optional, you can extract from response if needed)
    const filename = record.value.title;
    link.setAttribute("download", `${filename}.${fileExtension}`);

    // Append the link to the document and trigger the click event to download
    document.body.appendChild(link);
    link.click();

    // Clean up the object URL after download
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading document:", error);
  }
};

const openInBrowser = (record) => {
  const baseUrl = "http://localhost:8080"; // Your backend base URL

  // Define the prefix to be removed
  const prefix = "target\\classes\\static\\documents\\";

  // Remove the prefix from the path
  const relativePath = record.value.path.replace(prefix, "");

  // Encode the remaining path to handle special characters
  const encodedPath = encodeURIComponent(relativePath);

  // Construct the full URL to the document
  const fileUrl = `${baseUrl}/documents/${encodedPath}`;

  // Open the file in a new browser tab
  window.open(fileUrl, "_blank");
};

const showErrorModal = (errorMessage) => {
  Modal.error({
    title: "Error",
    content: errorMessage,
  });
};

// Fetch documents when the component is mounted
onMounted(async () => {
  await list();
});
</script>

<style scoped>
.header-title {
  margin-left: 10px;
}

.upload-button {
  align-items: center;
  cursor: pointer;
}

.upload-button:hover {
  background-color: #f0f0f0;
  border-radius: 2px;
}

.custom-input {
  font-size: 16px; /* Adjust text size */
  padding: 12px 16px; /* Adjust padding to increase the input height */
  width: 100%; /* Make the input take up full width */
}
</style>
