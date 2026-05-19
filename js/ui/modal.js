/* ============================================================================
   MODAL.JS - Modal Dialog System
   ============================================================================ */

class ModalManager {
    constructor(containerId = 'modal-container') {
        this.container = getElement(`#${containerId}`);
        this.activeModal = null;
    }

    /**
     * Create and show modal
     */
    show(title = 'Modal', content = '', options = {}) {
        const {
            size = 'md',
            closeButton = true,
            backdrop = true,
            buttons = [],
            onClose = null
        } = options;

        const modalId = `modal_${generateID()}`;
        const backdropHtml = backdrop ? `<div class="modal-backdrop" data-modal="${modalId}"></div>` : '';
        
        let buttonsHtml = '';
        if (buttons.length > 0) {
            buttonsHtml = '<div class="modal-footer">';
            buttons.forEach(btn => {
                buttonsHtml += `<button class="btn btn-${btn.type || 'primary'}" data-action="${btn.action}">${escapeHTML(btn.label)}</button>`;
            });
            buttonsHtml += '</div>';
        }

        const closeButtonHtml = closeButton ? `
            <button class="modal-close" aria-label="Close modal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        ` : '';

        const html = `
            ${backdropHtml}
            <div class="modal modal-${size}" id="${modalId}">
                <div class="modal-header">
                    <h3 class="modal-title">${escapeHTML(title)}</h3>
                    ${closeButtonHtml}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttonsHtml}
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', html);
        
        const modal = getElement(`#${modalId}`);
        this.activeModal = modal;

        // Event listeners
        if (closeButton) {
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => this.close(modalId, onClose));
        }

        if (backdrop) {
            const bd = this.container.querySelector(`[data-modal="${modalId}"]`);
            bd.addEventListener('click', () => this.close(modalId, onClose));
        }

        // Button actions
        buttons.forEach(btn => {
            const btnEl = modal.querySelector(`[data-action="${btn.action}"]`);
            if (btnEl && btn.onClick) {
                btnEl.addEventListener('click', () => {
                    btn.onClick();
                    this.close(modalId, onClose);
                });
            }
        });

        // Prevent backdrop close when clicking inside modal
        modal.addEventListener('click', (e) => e.stopPropagation());

        return modalId;
    }

    /**
     * Close modal
     */
    close(modalId = null, callback = null) {
        const modal = modalId 
            ? this.container.querySelector(`#${modalId}`)
            : this.activeModal;
        
        if (!modal) return;

        const backdrop = this.container.querySelector(`[data-modal="${modal.id}"]`);
        
        if (modal) modal.remove();
        if (backdrop) backdrop.remove();

        this.activeModal = null;

        if (callback) callback();
    }

    /**
     * Show alert
     */
    alert(message, title = 'Alert', type = 'info') {
        return this.show(title, renderer.buildAlert(message, type), {
            size: 'sm',
            buttons: [
                { label: 'OK', action: 'ok', type: 'primary' }
            ]
        });
    }

    /**
     * Show confirm dialog
     */
    confirm(message, title = 'Confirm', onConfirm = null, onCancel = null) {
        return this.show(title, renderer.buildAlert(message, 'warning'), {
            size: 'sm',
            buttons: [
                { 
                    label: 'Cancel', 
                    action: 'cancel', 
                    type: 'secondary',
                    onClick: onCancel
                },
                { 
                    label: 'Confirm', 
                    action: 'confirm', 
                    type: 'danger',
                    onClick: onConfirm
                }
            ]
        });
    }

    /**
     * Show form modal
     */
    form(fields = [], title = 'Form', onSubmit = null) {
        let formHtml = '<form class="modal-form">';
        fields.forEach(field => {
            formHtml += renderer.buildFormGroup(field.label, field.type, field.attrs);
        });
        formHtml += '</form>';

        return this.show(title, formHtml, {
            size: 'md',
            buttons: [
                { label: 'Cancel', action: 'cancel', type: 'secondary' },
                { 
                    label: 'Submit', 
                    action: 'submit', 
                    type: 'primary',
                    onClick: () => {
                        const form = this.activeModal.querySelector('form');
                        const data = new FormData(form);
                        const formData = Object.fromEntries(data);
                        if (onSubmit) onSubmit(formData);
                    }
                }
            ]
        });
    }

    /**
     * Close all modals
     */
    closeAll() {
        this.container.innerHTML = '';
        this.activeModal = null;
    }
}

/**
 * Global Modal Instance
 */
const modal = new ModalManager();