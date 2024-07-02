// public/api.js

export function fetchConfig()
{
	return fetch('/config')
		.then(response => response.json())
		.catch(error => console.error('Error fetching config:', error));
}

export function fetchRecords(config)
{
	const { apiKey, baseId, tableName } = config;
	const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
	return fetch(url, {
		headers: {
			Authorization: `Bearer ${apiKey}`
		}
	})
	.then(response => response.json())
	.then(data => data.records)
	.catch(error => console.error('Error fetching data:', error));
}

export function fetchSchema(config)
{
	const { apiKey, baseId, tableName } = config;
	const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
	return fetch(url, {
		headers: {
			Authorization: `Bearer ${apiKey}`
		}
	})
	.then(response => response.json())
	.then(data => {
		if (data.records.length > 0)
		{
			return Object.keys(data.records[0].fields);
		}
		return [];
	})
	.catch(error => {
		console.error('Error fetching schema:', error);
		return [];
	});
}

export function createRecord(config, data)
{
	const { apiKey, baseId, tableName } = config;
	const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
	return fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.catch(error => console.error('Error creating record:', error));
}

export function updateRecord(config, id, data)
{
	const { apiKey, baseId, tableName } = config;
	const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${id}`;
	return fetch(url, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.catch(error => console.error('Error updating record:', error));
}

export function deleteRecord(config, id)
{
	const { apiKey, baseId, tableName } = config;
	const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${id}`;
	return fetch(url, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${apiKey}`
		}
	})
	.then(response => response.json())
	.catch(error => console.error('Error deleting record:', error));
}
