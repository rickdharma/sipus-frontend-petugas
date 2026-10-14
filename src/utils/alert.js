import Swal from "sweetalert2";
import { getErrorMessage } from "./getErrorMessage";

// Warna mengikuti desain aplikasi (indigo-600 dan rose-600)
const COLORS = { primary: "#4f46e5", danger: "#e11d48" };

// Nama kelas "sipus-*" didefinisikan di src/index.css
const dialogClasses = {
  popup: "sipus-popup",
  title: "sipus-title",
  htmlContainer: "sipus-text",
  actions: "sipus-actions",
  validationMessage: "sipus-validation",
  cancelButton: "sipus-cancel",
};

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  customClass: { popup: "sipus-toast" },
});

export function toastSuccess(title) {
  Toast.fire({ icon: "success", title });
}

export function toastError(title) {
  Toast.fire({ icon: "error", title, timer: 4000 });
}

function errorText(err) {
  return getErrorMessage(err, "Terjadi kesalahan").split("\n").join("; ");
}

// Dialog konfirmasi. Kalau "action" diberikan, fungsi itu dijalankan di dalam dialog
// (dengan loading), dan error dari backend ditampilkan di dialog tanpa menutupnya.
// Hasil: { confirmed: true/false, data: hasil dari action }
export async function confirmAction({
  title,
  text,
  confirmText = "Ya, lanjutkan",
  icon = "question",
  danger = false,
  action,
}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: danger ? COLORS.danger : COLORS.primary,
    reverseButtons: true,
    focusCancel: danger,
    customClass: {
      ...dialogClasses,
      confirmButton: danger ? "sipus-confirm sipus-confirm-danger" : "sipus-confirm",
    },
    showLoaderOnConfirm: Boolean(action),
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: action
      ? async () => {
          try {
            return { data: await action() };
          } catch (err) {
            Swal.showValidationMessage(errorText(err));
            return false; // dialog tetap terbuka
          }
        }
      : undefined,
  });

  return { confirmed: result.isConfirmed, data: result.value?.data };
}

// Dialog saat token login kedaluwarsa (dipakai oleh src/services/api.js)
export function alertSessionExpired() {
  return Swal.fire({
    icon: "warning",
    title: "Sesi berakhir",
    text: "Silakan login kembali.",
    confirmButtonText: "Ke halaman login",
    confirmButtonColor: COLORS.primary,
    allowOutsideClick: false,
    customClass: { ...dialogClasses, confirmButton: "sipus-confirm" },
  });
}