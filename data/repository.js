import axios from "axios";

const getGiftCards = async (apiKey, limit, offset) => {
	return await axios.get(`https://api.giftup.app/gift-cards?limit=${limit}&offset=${offset}&createdOnOrAfter=2021-12-21T00:00:01.000Z`, {
		headers: {
			"Authorization": `Bearer ${apiKey}`
		}
	})
}


const fulfilOrder = async (id, supplier, codes) => {
	let apiKey = "";

	switch(supplier){
		case "LOVEIOM":
			apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGI5ZWQwMi05MjkxLTRlM2ItOWFjMC1kZTM5YTQzNDUwMTgiLCJzdWIiOiJ0b21AaW1wZWxsaXR5LmNvbSIsImV4cCI6MTk0Mjg0NDI5NywiaXNzIjoiaHR0cHM6Ly9naWZ0dXAuYXBwLyIsImF1ZCI6Imh0dHBzOi8vZ2lmdHVwLmFwcC8ifQ.b13rTRxKvwaL5zEctWDIHDW00bxqfGQPRRBJ3CVSYP0";
			break;
		case "HARBOURLIGHTS":
			apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNjQ5NTgzNS0wMGUzLTQ1YTctYjY2YS1lMzM1ODc1YjQ5ODYiLCJzdWIiOiJiZW5AZ3RpLmltIiwiZXhwIjoxODY5NzQwNDkwLCJpc3MiOiJodHRwczovL2dpZnR1cC5hcHAvIiwiYXVkIjoiaHR0cHM6Ly9naWZ0dXAuYXBwLyJ9.0yrgQ5naXkILzfAKVwCWht6h2hZx5KmtI0eIKAd5ZXM";
			break;
	}

	return axios.post(`https://api.giftup.app/orders/${id}/post`, {
		codes
	}, {
		headers: {
			"Authorization": `Bearer ${apiKey}`
		}
	})
}

export default {
	getGiftCards,
	fulfilOrder
}