// public/products.js
document.addEventListener('DOMContentLoaded', function() {
    let currentConfig;
    let currentRecord;

    const modal = document.getElementById('product-modal');
    const zoomModal = document.getElementById('zoom-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    const span = document.getElementsByClassName('close')[0];
    const zoomClose = document.getElementsByClassName('zoom-close')[0];
    const form = document.getElementById('product-form');
    const recordIdField = document.createElement('input'); // Hidden field for record ID
    recordIdField.type = 'hidden';
    recordIdField.id = 'record-id';
    form.appendChild(recordIdField);
    const editButton = document.getElementById('edit-button');

    span.onclick = function() {
        modal.style.display = 'none';
    };

    zoomClose.onclick = function() {
        zoomModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
        if (event.target === zoomModal) {
            zoomModal.style.display = 'none';
        }
    };

    fetch('/config')
        .then(response => response.json())
        .then(config => {
            console.log('Config fetched:', config);
            currentConfig = config;
            const apiKey = config.apiKey;
            const baseId = config.baseId;
            const tableName = config.tableName;
            const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

            fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Data fetched:', data);
                const products = data.records;
                const container = document.getElementById('product-list');
                container.innerHTML = '';

                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';

                    const productName = document.createElement('h2');
                    productName.textContent = product.fields.Name || 'No Name';
                    productName.onclick = () => showModal(product);
                    productCard.appendChild(productName);

                    if (product.fields.Photo && product.fields.Photo.length > 0) {
                        const photo = product.fields.Photo[0];
                        const productImage = document.createElement('img');
                        productImage.src = photo.url;
                        productImage.alt = photo.filename;
                        productImage.onclick = () => showModal(product);
                        productCard.appendChild(productImage);

                        const magnifierIcon = document.createElement('span');
                        magnifierIcon.className = 'magnifier-icon';
                        magnifierIcon.innerHTML = '🔍';
                        magnifierIcon.onclick = () => showZoomModal(photo.url);
                        productCard.appendChild(magnifierIcon);
                    }

                    // Ajouter l'icône bio si la variable "Bio" est true
                    if (product.fields.Bio) {
                        const bioIcon = document.createElement('span');
                        bioIcon.className = 'bio-logo';
                        bioIcon.textContent = '🌿';
                        productCard.appendChild(bioIcon);
                    }

                    container.appendChild(productCard);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
        })
        .catch(error => console.error('Error fetching config:', error));

    function showModal(record) {
        currentRecord = record;
        console.log('Showing modal for record:', record);
        form.innerHTML = ''; // Clear existing form fields
        recordIdField.value = record.id; // Set record ID

        Object.keys(record.fields).forEach(key => {
            const label = document.createElement('label');
            label.htmlFor = `record-${key}`;
            label.textContent = `${key}:`;

            if (key === 'Photo') {
                // Display current photos and provide an input to add new ones
                record.fields[key].forEach(photo => {
                    const img = document.createElement('img');
                    img.src = photo.url;
                    img.alt = photo.filename;
                    img.style.maxWidth = '100px';
                    img.style.margin = '10px';
                    form.appendChild(img);
                });

                const photoInput = document.createElement('input');
                photoInput.type = 'file';
                photoInput.id = `record-${key}`;
                photoInput.name = key;
                photoInput.multiple = true;
                form.appendChild(label);
                form.appendChild(photoInput);
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

        form.appendChild(recordIdField); // Append hidden ID field to form

        modal.style.display = 'block';
    }

    editButton.onclick = function() {
        const data = { id: recordIdField.value, fields: {} }; // Include the ID in the update data

        const formData = new FormData(form);
        formData.forEach((value, key) => {
            if (key === 'Photo') {
                // Handle photos
                const photos = currentRecord.fields.Photo.map(photo => ({ id: photo.id }));
                const newFiles = form.querySelector(`#record-${key}`).files;

                for (let file of newFiles) {
                    photos.push({ url: URL.createObjectURL(file), filename: file.name });
                }
                data.fields[key] = photos;
            } else {
                data.fields[key] = key === 'Bio' ? (value === 'true') : key === 'Quantity' || key === 'Price' ? parseFloat(value) : value;
            }
        });

        console.log('Data to be sent:', JSON.stringify({ records: [data] })); // Add log

        updateRecord(currentConfig, data).then(() => {
            modal.style.display = 'none';
            window.dispatchEvent(new Event('refreshRecords')); // Trigger custom event to refresh records
        });
    };

    function showZoomModal(imageUrl) {
        zoomedImage.src = imageUrl;
        zoomModal.style.display = 'block';
    }

    function updateRecord(config, data) {
        const { apiKey, baseId, tableName } = config;
        const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
        console.log('Updating record at URL:', url);
        console.log('Update data:', data);
        return fetch(url, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records: [data] })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    console.error('Error response:', err);
                    throw err;
                });
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error updating record:', error);
            alert('Error updating record: ' + error.message);
        });
    }
});
