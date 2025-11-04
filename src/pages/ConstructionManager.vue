<template>
  <div class="page_container">
    <h1>工事管理</h1>
    <p>Edit -> modal</p>
    <div class="data_box">
      <div class="data_bar">
        <div class="data_bar_left">
          <n-button> Export </n-button>
          <n-button> Import </n-button>
          <n-button type="error"> Delete </n-button>
        </div>
        <div class="data_bar_right">
          <n-input placeholder="Search">
            <template #prefix>
              <n-icon :component="Search" />
            </template>
          </n-input>
          <n-button type="primary"> Add New </n-button>
        </div>
      </div>
      <n-data-table
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-key="(row) => row.key" />
    </div>

    <!-- Edit modal -->
    <n-modal
      v-model:show="showEdit"
      preset="card"
      title="Edit Construction"
      style="width: 600px">
      <n-form
        ref="formRef"
        :model="editModel"
        :rules="rules"
        label-placement="left"
        label-width="120">
        <n-form-item label="Project Name" path="projectName">
          <n-input
            v-model:value="editModel.projectName"
            placeholder="Project name" />
        </n-form-item>
        <n-form-item label="Company" path="companyName">
          <n-input
            v-model:value="editModel.companyName"
            placeholder="Company name" />
        </n-form-item>
        <n-form-item label="Start Date" path="startDate">
          <n-input
            v-model:value="editModel.startDate"
            placeholder="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="End Date" path="endDate">
          <n-input v-model:value="editModel.endDate" placeholder="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="Status" path="status">
          <n-input
            v-model:value="editModel.status"
            placeholder="Planned / Ongoing / Completed" />
        </n-form-item>
        <n-form-item label="Site Address" path="siteAddress">
          <n-input
            v-model:value="editModel.siteAddress"
            placeholder="Address" />
        </n-form-item>
      </n-form>

      <template #action>
        <div style="display: flex; justify-content: space-between; width: 100%">
          <n-button quaternary @click="onCancel">Cancel</n-button>
          <n-button type="primary" @click="onSubmit">Submit</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref } from "vue";
import type { DataTableColumns, FormInst, FormRules } from "naive-ui";
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NIcon,
  useMessage,
  NPopconfirm,
  NTooltip,
} from "naive-ui";
import { Search, Create, TrashBin } from "@vicons/ionicons5";

type RowData = {
  key: number;
  projectName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: string;
  siteAddress: string;
};

const message = useMessage();

// table data (construction-focused mock)
const data = ref<RowData[]>([
  {
    key: 2001,
    projectName: "Shinjuku Office Tower Renovation",
    companyName: "Yamada Construction Co., Ltd.",
    startDate: "2025-06-01",
    endDate: "2026-02-28",
    status: "Ongoing",
    siteAddress: "Shinjuku, Tokyo",
  },
  {
    key: 2002,
    projectName: "Osaka Riverside Bridge",
    companyName: "Sakura Build Partners",
    startDate: "2025-03-15",
    endDate: "2026-07-30",
    status: "Planned",
    siteAddress: "Kita, Osaka",
  },
  {
    key: 2003,
    projectName: "Sapporo Logistics Hub",
    companyName: "Hokkaido Engineering",
    startDate: "2024-11-20",
    endDate: "2025-12-31",
    status: "Ongoing",
    siteAddress: "Atsubetsu, Sapporo",
  },
]);

// modal state & form model
const showEdit = ref(false);
const editingKey = ref<number | null>(null);
const formRef = ref<FormInst | null>(null);
const editModel = reactive<Partial<RowData>>({});

// simple required rules (can extend later)
const rules: FormRules = {
  projectName: [{ required: true, message: "Project name is required" }],
  companyName: [{ required: true, message: "Company is required" }],
  startDate: [{ required: true, message: "Start date is required" }],
  endDate: [{ required: true, message: "End date is required" }],
  status: [{ required: true, message: "Status is required" }],
  siteAddress: [{ required: true, message: "Address is required" }],
};

// actions
function startEdit(row: RowData) {
  editingKey.value = row.key;
  Object.assign(editModel, row);
  showEdit.value = true;
}

function onCancel() {
  showEdit.value = false;
  // reset draft
  for (const k of Object.keys(editModel)) delete (editModel as any)[k];
  editingKey.value = null;
}

function onSubmit() {
  formRef.value?.validate((errors) => {
    if (errors) return;
    const idx = data.value.findIndex((r) => r.key === editingKey.value);
    if (idx !== -1) {
      const target = data.value[idx];
      target.projectName = String(editModel.projectName ?? target.projectName);
      target.companyName = String(editModel.companyName ?? target.companyName);
      target.startDate = String(editModel.startDate ?? target.startDate);
      target.endDate = String(editModel.endDate ?? target.endDate);
      target.status = String(editModel.status ?? target.status);
      target.siteAddress = String(editModel.siteAddress ?? target.siteAddress);
      message.success(`Updated: ${target.projectName}`);
    }
    onCancel(); // close & clear
  });
}

// columns
function createColumns(): DataTableColumns<RowData> {
  return [
    { type: "selection", fixed: "left" },
    {
      title: "#",
      key: "serial",
      width: 64,
      render: (_, index) => `${index + 1}`,
    },
    { title: "Project", key: "projectName", minWidth: 220 },
    { title: "Company", key: "companyName", minWidth: 180 },
    { title: "Start", key: "startDate", minWidth: 120 },
    { title: "End", key: "endDate", minWidth: 120 },
    { title: "Status", key: "status", minWidth: 120 },
    { title: "Address", key: "siteAddress", minWidth: 220 },
    {
      title: "Action",
      key: "actions",
      width: 120,
      fixed: "right",
      render(row) {
        return h("div", { style: "display: flex; gap: 8px;" }, [
          // Edit
          h(
            NButton,
            {
              strong: true,
              secondary: true,
              circle: true,
              type: "info",
              onClick: () => startEdit(row),
            },
            {
              icon: () => h(NIcon, null, { default: () => h(Create) }),
            }
          ),
          // Delete
          h(
            NPopconfirm,
            {
              positiveButtonProps: { type: "error" },
              negativeText: "Cancel",
              positiveText: "Delete",
              onPositiveClick: () => {
                handleConfirmDelete(row);
              },
            },
            {
              trigger: () =>
                h(
                  NButton,
                  {
                    strong: true,
                    secondary: true,
                    circle: true,
                    type: "error",
                  },
                  { icon: () => h(NIcon, null, { default: () => h(TrashBin) }) }
                ),
              default: () => `Confirm delete ${row.projectName}?`,
            }
          ),
        ]);
      },
    },
  ];
}

function handleConfirmDelete(row: RowData) {
  const idx = data.value.findIndex((r) => r.key === row.key);
  if (idx >= 0) {
    data.value.splice(idx, 1);
    message.success(`Deleted: ${row.projectName}`);
  }
}

const columns = createColumns();
const pagination = { pageSize: 10 };
</script>
