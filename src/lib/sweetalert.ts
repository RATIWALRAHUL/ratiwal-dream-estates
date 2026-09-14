import Swal, { type SweetAlertIcon, type SweetAlertPosition } from "sweetalert2";

export interface ToastOptions {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
  timer?: number;
  position?: SweetAlertPosition;
}

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDangerous?: boolean;
  icon?: SweetAlertIcon;
}

/**
 * Global SweetAlert2 Toast with Ratiwal Dream Estates background logo watermark
 */
export const ratiwalToast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  customClass: {
    popup: "ratiwal-sweetalert-toast",
    title: "ratiwal-toast-title",
    htmlContainer: "ratiwal-toast-body",
    timerProgressBar: "ratiwal-toast-progressbar",
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

/**
 * Global SweetAlert2 Modal with Ratiwal Dream Estates background logo watermark
 */
export const ratiwalModal = Swal.mixin({
  customClass: {
    popup: "ratiwal-sweetalert-modal",
    title: "ratiwal-modal-title",
    htmlContainer: "ratiwal-modal-body",
    confirmButton: "ratiwal-modal-confirm-btn",
    cancelButton: "ratiwal-modal-cancel-btn",
  },
  buttonsStyling: false,
});

/**
 * Convenient helper functions for toasts with background logo
 */
export const showToast = {
  success: (title: string, text?: string) => {
    return ratiwalToast.fire({
      icon: "success",
      title,
      text,
    });
  },

  error: (title: string, text?: string) => {
    return ratiwalToast.fire({
      icon: "error",
      title,
      text,
      timer: 4500,
    });
  },

  warning: (title: string, text?: string) => {
    return ratiwalToast.fire({
      icon: "warning",
      title,
      text,
    });
  },

  info: (title: string, text?: string) => {
    return ratiwalToast.fire({
      icon: "info",
      title,
      text,
    });
  },
};

/**
 * Confirmation dialog helper (for delete or high-impact actions)
 */
export async function showConfirmModal({
  title,
  text,
  confirmButtonText = "Yes, proceed",
  cancelButtonText = "Cancel",
  isDangerous = false,
  icon = "warning",
}: ConfirmOptions): Promise<boolean> {
  const result = await ratiwalModal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "ratiwal-sweetalert-modal",
      title: "ratiwal-modal-title",
      htmlContainer: "ratiwal-modal-body",
      confirmButton: isDangerous
        ? "ratiwal-modal-danger-btn"
        : "ratiwal-modal-confirm-btn",
      cancelButton: "ratiwal-modal-cancel-btn",
    },
  });

  return result.isConfirmed;
}

/**
 * Specialized single delete confirmation
 */
export async function confirmDeleteInquiry(reference: string, clientName?: string): Promise<boolean> {
  return showConfirmModal({
    title: "Delete Lead Inquiry?",
    text: `Are you sure you want to permanently delete lead inquiry ${reference}${clientName ? ` for ${clientName}` : ""}? All timeline logs and notes will be purged.`,
    confirmButtonText: "Delete Inquiry",
    cancelButtonText: "Cancel",
    isDangerous: true,
    icon: "warning",
  });
}

/**
 * Specialized bulk delete confirmation
 */
export async function confirmBulkDeleteInquiries(count: number): Promise<boolean> {
  return showConfirmModal({
    title: `Delete ${count} Lead Inquiries?`,
    text: `You are about to permanently delete ${count} selected lead records. This action cannot be undone.`,
    confirmButtonText: `Delete ${count} Leads`,
    cancelButtonText: "Cancel",
    isDangerous: true,
    icon: "warning",
  });
}
