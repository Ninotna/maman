document.addEventListener('DOMContentLoaded', function()
{
	fetch('/config')
	.then(response => response.json())
	.then(config => {
		const apiKey = config.apiKey;
		const baseId = config.baseId;
		const tableName = config.tableName;

		const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

		const modal = document.getElementById('modal');
		const span = document.getElementsByClassName('close')[0];
		const form = document.getElementById('edit-form');
		const recordIdField = document.getElementById('record-id');

		span.onclick = function()
		{
			modal.style.display = 'none';
		};

		window.onclick = function(event)
		{
			if (event.target === modal)
			{
				modal.style.display = 'none';
			}
		};

		document.getElementById('add-product').onclick = function()
		{
			showModal();
		};

		form.onsubmit = function(event)
		{
			event.preventDefault();
			const recordId = recordIdField.value;
			const data = { fields: {} };

			const formData = new FormData(form);
			formData.forEach((value, key) => {
				data.fields[key] = key === 'Quantity' || key === 'Price' ? parseFloat(value) : value;
			});

			if (recordId)
			{
				updateRecord(recordId, data);
			}
			else
			{
				createRecord(data);
			}
		};

		function fetchRecords()
		{
			fetch(url, {
				headers: {
					Authorization: `Bearer ${apiKey}`
				}
			})
			.then(response => response.json())
			.then(data => {
				const records = data.records;
				const container = document.getElementById('data-container');
				container.innerHTML = '';

				records.forEach(record => {
					const recordElement = document.createElement('div');
					recordElement.className = 'record';

					const fields = record.fields;
					Object.keys(fields).forEach(key => {
						const fieldElement = document.createElement('p');
						fieldElement.textContent = `${key}: ${fields[key]}`;
						recordElement.appendChild(fieldElement);
					});

					const editButton = document.createElement('button');
					editButton.textContent = 'Modifier';
					editButton.onclick = () => showModal(record);
					recordElement.appendChild(editButton);

					const deleteButton = document.createElement('button');
					deleteButton.textContent = 'Supprimer';
					deleteButton.onclick = () => deleteRecord(record.id);
					recordElement.appendChild(deleteButton);

					container.appendChild(recordElement);
				});
			})
			.catch(error => console.error('Error fetching data:', error));
		}

		function showModal(record = null)
		{
			form.innerHTML = ''; // Clear existing form fields
			if (record)
			{
				recordIdField.value = record.id;
				Object.keys(record.fields).forEach(key => {
					const label = document.createElement('label');
					label.htmlFor = `record-${key}`;
					label.textContent = `${key}:`;

					const input = document.createElement('input');
					input.type = key === 'Quantity' || key === 'Price' ? 'number' : 'text';
					input.id = `record-${key}`;
					input.name = key;
					input.value = record.fields[key];

					form.appendChild(label);
					form.appendChild(input);
				});
			}
			else
			{
				recordIdField.value = '';
				fetchSchema().then(fields => {
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

		function createRecord(data)
		{
			fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
			.then(response => response.json())
			.then(() => {
				fetchRecords();
				modal.style.display = 'none';
			})
			.catch(error => console.error('Error creating record:', error));
		}

		function updateRecord(id, data)
		{
			fetch(`${url}/${id}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
			.then(response => response.json())
			.then(() => {
				fetchRecords();
				modal.style.display = 'none';
			})
			.catch(error => console.error('Error updating record:', error));
		}

		function deleteRecord(id)
		{
			fetch(`${url}/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${apiKey}`
				}
			})
			.then(() => {
				fetchRecords();
			})
			.catch(error => console.error('Error deleting record:', error));
		}

		function fetchSchema()
		{
			return fetch(url, {
				headers: {
					Authorization: `Bearer ${apiKey}`
				}
			})
			.then(response => response.json())
			.then(data => {
				const records = data.records;
				if (records.length > 0)
				{
					const fields = Object.keys(records[0].fields);
					return fields;
				}
				return [];
			})
			.catch(error => {
				console.error('Error fetching schema:', error);
				return [];
			});
		}

		fetchRecords(); // Fetch records on load
	})
	.catch(error => console.error('Error fetching config:', error));
});
