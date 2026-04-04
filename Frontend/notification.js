/**
 * Critical AI - Custom Notification System
 * Based on SweetAlert2 with dark theme styling
 */

const swalTheme = {
  confirmButtonColor: '#4A5BFF',
  cancelButtonColor: '#6B7280',
  background: '#1E1E2F',
  color: '#FFFFFF',
  confirmButtonText: 'OK',
  cancelButtonText: 'Hủy',
  allowOutsideClick: false,
  backdrop: 'rgba(0, 0, 0, 0.7)',
  customClass: {
    popup: 'critical-alert-popup',
    title: 'critical-alert-title',
    htmlContainer: 'critical-alert-content',
    confirmButton: 'critical-alert-btn',
    cancelButton: 'critical-alert-btn-cancel'
  }
};

/**
 * Show success notification (toast style)
 * @param {string} message - The message to display
 */
function showSuccess(message) {
  Swal.fire({
    ...swalTheme,
    icon: 'success',
    title: '✓ Thành công',
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(74, 91, 255, 0.15))',
    border: '1px solid rgba(34, 197, 94, 0.3)'
  });
}

/**
 * Show error notification (toast style)
 * @param {string} message - The message to display
 */
function showError(message) {
  Swal.fire({
    ...swalTheme,
    icon: 'error',
    title: '✗ Lỗi',
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(197, 44, 90, 0.15))',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  });
}

/**
 * Show info notification (toast style)
 * @param {string} message - The message to display
 */
function showInfo(message) {
  Swal.fire({
    ...swalTheme,
    icon: 'info',
    title: 'ℹ Thông tin',
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    background: 'linear-gradient(135deg, rgba(74, 91, 255, 0.15), rgba(123, 140, 255, 0.15))',
    border: '1px solid rgba(74, 91, 255, 0.3)'
  });
}

/**
 * Show success modal (centered)
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 */
function showSuccessModal(title, message) {
  return Swal.fire({
    ...swalTheme,
    icon: 'success',
    title: '✓ ' + title,
    text: message,
    position: 'center',
    showCancelButton: false,
    confirmButtonColor: 'linear-gradient(135deg, #22C55E, #4A5BFF)'
  });
}

/**
 * Show error modal (centered)
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 */
function showErrorModal(title, message) {
  return Swal.fire({
    ...swalTheme,
    icon: 'error',
    title: '✗ ' + title,
    text: message,
    position: 'center',
    showCancelButton: false,
    confirmButtonColor: 'linear-gradient(135deg, #EF4444, #C52C5A)'
  });
}

/**
 * Show info modal (centered)
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 */
function showInfoModal(title, message) {
  return Swal.fire({
    ...swalTheme,
    icon: 'info',
    title: 'ℹ ' + title,
    text: message,
    position: 'center',
    showCancelButton: false
  });
}

/**
 * Show confirmation dialog
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @returns {Promise} - Promise that resolves to true/false
 */
function showConfirm(title, message) {
  return Swal.fire({
    ...swalTheme,
    icon: 'question',
    title: title,
    text: message,
    position: 'center',
    showCancelButton: true,
    confirmButtonColor: '#4A5BFF',
    cancelButtonColor: '#6B7280'
  });
}

/**
 * Loading spinner
 * @param {string} message - Loading message
 */
function showLoading(message = 'Đang xử lý...') {
  Swal.fire({
    ...swalTheme,
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

/**
 * Close current notification/modal
 */
function closeNotification() {
  Swal.close();
}