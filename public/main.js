// public/main.js
import { fetchConfig, fetchRecords, deleteRecord } from './api.js';
import { showModal } from './modal.js';

document.addEventListener('DOMContentLoaded', function() {
    fetchConfig().then(config => {
        localStorage.setItem('config', JSON.stringify(config)); // Store config in localStorage

        document.getElementById('add-product').onclick = function() {
            showModal(config);
        };

        function renderRecords() {
            fetchRecords(config).then(records => {
                const container = document.getElementById('data-container');
                container.innerHTML = '';

                records.forEach(record => {
                    const recordElement = document.createElement('div');
                    recordElement.className = 'record';

                    const fields = record.fields;
                    Object.keys(fields).forEach(key => {
                        if (key === 'Attachments') {
                            const attachments = fields[key];
                            attachments.forEach(att => {
                                const img = document.createElement('img');
                                img.src = att.thumbnails ? att.thumbnails.small.url : att.url;
                                img.className = 'product-image';
                                recordElement.appendChild(img);
                            });
                        } else {
                            const fieldElement = document.createElement('p');
                            fieldElement.textContent = `${key}: ${fields[key]}`;
                            recordElement.appendChild(fieldElement);
                        }
                    });

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Modifier';
                    editButton.onclick = () => showModal(config, record);
                    recordElement.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Supprimer';
                    deleteButton.onclick = () => {
                        deleteRecord(config, record.id).then(() => renderRecords());
                    };
                    recordElement.appendChild(deleteButton);

                    container.appendChild(recordElement);
                });
            });
        }

        // Listen for custom event to refresh records
        window.addEventListener('refreshRecords', renderRecords);

        renderRecords();
    });
});
