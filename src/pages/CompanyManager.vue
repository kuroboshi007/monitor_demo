<template>
  <div class="page_container">
    <h1>施工会社管理</h1>
    <p>Edit -> inline</p>
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
        :row-key="(row) => row.key"
        :scroll-x="1400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref } from "vue";
import type { DataTableColumns } from "naive-ui";
import { NDataTable, NButton, NTag, NInput, NIcon, useMessage } from "naive-ui";
import { Search } from "@vicons/ionicons5";

type RowData = {
  key: number;
  companyName: string;
  licenseNo: string; // ← non-editable field
  contactName: string;
  phone: string;
  address: string;
  tags: string[];
};

const message = useMessage();

// --- editable state ---
const editingRowKey = ref<number | null>(null);
const editableRow = reactive<Partial<RowData>>({}); // stores a working copy while editing

function startEdit(row: RowData) {
  editingRowKey.value = row.key;
  Object.assign(editableRow, row); // shallow copy fields into the working draft
}

function submitEdit(key: number) {
  const idx = data.value.findIndex((r) => r.key === key);
  if (idx !== -1) {
    // write back editable fields (leave licenseNo untouched)
    const target = data.value[idx];
    target.companyName = String(editableRow.companyName ?? target.companyName);
    target.contactName = String(editableRow.contactName ?? target.contactName);
    target.phone = String(editableRow.phone ?? target.phone);
    target.address = String(editableRow.address ?? target.address);
    // tags left as-is for now; can be made editable later
    message.success(`Updated: ${target.companyName}`);
  }
  editingRowKey.value = null;
  // clear draft
  for (const k of Object.keys(editableRow)) delete (editableRow as any)[k];
}

// --- columns ---
function createColumns(): DataTableColumns<RowData> {
  return [
    { type: "selection", fixed: "left" },

    {
      title: "#",
      key: "serial",
      width: 64,
      render: (_, index) => `${index + 1}`,
    },

    {
      title: "Company",
      key: "companyName",
      minWidth: 180,
      render(row) {
        const isEditing = editingRowKey.value === row.key;
        if (!isEditing) return row.companyName;
        return h(NInput, {
          value: editableRow.companyName as string,
          "onUpdate:value": (v) => (editableRow.companyName = v),
          placeholder: "Company name",
        });
      },
    },

    {
      title: "License No.",
      key: "licenseNo",
      minWidth: 140,
      // non-editable (explicit)
      render(row) {
        return h(
          NTag,
          { type: "success", bordered: false, round: true, size: "small" },
          { default: () => row.licenseNo }
        );
      },
    },

    {
      title: "Contact",
      key: "contactName",
      minWidth: 140,
      render(row) {
        const isEditing = editingRowKey.value === row.key;
        return isEditing
          ? h(NInput, {
              value: editableRow.contactName as string,
              "onUpdate:value": (v) => (editableRow.contactName = v),
              placeholder: "Contact name",
            })
          : row.contactName;
      },
    },

    {
      title: "Phone",
      key: "phone",
      minWidth: 140,
      render(row) {
        const isEditing = editingRowKey.value === row.key;
        return isEditing
          ? h(NInput, {
              value: editableRow.phone as string,
              "onUpdate:value": (v) => (editableRow.phone = v),
              placeholder: "Phone",
            })
          : row.phone;
      },
    },

    {
      title: "Address",
      key: "address",
      minWidth: 220,
      render(row) {
        const isEditing = editingRowKey.value === row.key;
        return isEditing
          ? h(NInput, {
              value: editableRow.address as string,
              "onUpdate:value": (v) => (editableRow.address = v),
              placeholder: "Address",
            })
          : row.address;
      },
    },

    {
      title: "Tags",
      key: "tags",
      minWidth: 160,
      render(row) {
        return row.tags.map((tag) =>
          h(
            NTag,
            { style: { marginRight: "6px" }, type: "info", bordered: false },
            { default: () => tag }
          )
        );
      },
    },

    {
      title: "Action",
      key: "actions",
      width: 160,
      fixed: "right",
      render(row) {
        const isEditing = editingRowKey.value === row.key;
        if (!isEditing) {
          return h("div", { style: "display: flex; gap: 8px;" }, [
            h(
              NButton,
              {
                size: "small",
                onClick: () => startEdit(row),
              },
              { default: () => "Edit" }
            ),
            h(
              NButton,
              {
                size: "small",
                type: "error",
              },
              { default: () => "Delete" }
            ),
          ]);
        } else {
          return h("div", { style: "display: flex; gap: 8px;" }, [
            h(
              NButton,
              {
                size: "small",
                onClick: () => {
                  editingRowKey.value = null;
                  Object.keys(isEditing).forEach(
                    (k) => delete (isEditing as any)[k]
                  );
                },
              },
              { default: () => "Cancel" }
            ),
            h(
              NButton,
              {
                size: "small",
                type: "primary",
                onClick: () => submitEdit(row.key),
              },
              { default: () => "Submit" }
            ),
          ]);
        }
      },
    },
  ];
}

function createData(): RowData[] {
  return [
    {
      key: 1001,
      companyName: "Yamada Construction Co., Ltd.",
      licenseNo: "LIC-13-001-A",
      contactName: "Taro Yamada",
      phone: "+81-3-1234-5678",
      address: "Chiyoda, Tokyo",
      tags: ["general", "ISO9001"],
    },
    {
      key: 1002,
      companyName: "Sakura Build Partners",
      licenseNo: "LIC-27-054-B",
      contactName: "Hanako Sakura",
      phone: "+81-6-2345-6789",
      address: "Kita, Osaka",
      tags: ["subcontractor"],
    },
    {
      key: 1003,
      companyName: "Hokkaido Engineering",
      licenseNo: "LIC-01-777-C",
      contactName: "Satoshi North",
      phone: "+81-11-3456-7890",
      address: "Sapporo, Hokkaido",
      tags: ["civil", "bridge"],
    },
  ];
}

const data = ref<RowData[]>(createData());
const columns = createColumns();
const pagination = { pageSize: 10 };
</script>
