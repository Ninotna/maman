// public/modal.js
import { fetchSchema, createRecord, updateRecord } from './api.js';

const modal = document.getElementById('modal');
const span = document.getElementsByClassName('close')[0];
const form = document.getElementById('edit-form');
const recordIdField = document.getElementById('record-id');

span.onclick = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

export function showModal(config, record = null) {
    form.innerHTML = ''; // Clear existing form fields
    if (record) {
        recordIdField.value = record.id;
        Object.keys(record.fields).forEach(key => {
            const label = document.createElement('label');
            label.htmlFor = `record-${key}`;
            label.textContent = `${key}:`;

            if (key === 'Attachments') {
                const attachments = record.fields[key];
                attachments.forEach(att => {
                    const img = document.createElement('img');
                    img.src = att.thumbnails ? att.thumbnails.small.url : att.url;
                    img.style.maxWidth = '100px';
                    img.style.margin = '10px';
                    form.appendChild(img);
                });
            } else {
                const input = document.createElement('input');
                input.type = key === 'Quantity' || key === 'Price' ? 'number' : 'text';
                input.id = `record-${key}`;
                input.name = key;
                input.value = record.fields[key];

                form.appendChild(label);
                form.appendChild(input);
            }
        });
    } else {
        recordIdField.value = '';
        fetchSchema(config).then(fields => {
            fields.forEach(key => {
                const label = document.createElement('label');
                label.htmlFor = `record-${key}`;
                label.textContent = `${key}:`;

                const input = document.createElement('input');
                input.type = key === 'Quantity' || key === 'Price' ? 'number' : 'text';
                input.id = `record-${key}`;
                input.name = key;

                form.appendChild(label);
                form.appendChild(input);
            });
        });
    }

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Enregistrer';
    form.appendChild(submitButton);

    modal.style.display = 'block';
}

form.onsubmit = function(event) {
    event.preventDefault();
    const config = JSON.parse(localStorage.getItem('config')); // Retrieve config from localStorage
    const recordId = recordIdField.value;
    const data = { fields: {} };

    const formData = new FormData(form);
    formData.forEach((value, key) => {
        data.fields[key] = key === 'Quantity' || key === 'Price' ? parseFloat(value) : value;
    });

    if (recordId) {
        updateRecord(config, recordId, data).then(() => {
            modal.style.display = 'none';
            window.dispatchEvent(new Event('refreshRecords')); // Trigger custom event to refresh records
        });
    } else {
        createRecord(config, data).then(() => {
            modal.style.display = 'none';
            window.dispatchEvent(new Event('refreshRecords')); // Trigger custom event to refresh records
        });
    }
};
