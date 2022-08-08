import { getOrders } from "../../data/service";

export default async function handler(req, res) {

	let orders = [
		...await getOrders("LOVEIOM", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGI5ZWQwMi05MjkxLTRlM2ItOWFjMC1kZTM5YTQzNDUwMTgiLCJzdWIiOiJ0b21AaW1wZWxsaXR5LmNvbSIsImV4cCI6MTk0Mjg0NDI5NywiaXNzIjoiaHR0cHM6Ly9naWZ0dXAuYXBwLyIsImF1ZCI6Imh0dHBzOi8vZ2lmdHVwLmFwcC8ifQ.b13rTRxKvwaL5zEctWDIHDW00bxqfGQPRRBJ3CVSYP0"),
		// ...await getOrders("HARBOURLIGHTS", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNjQ5NTgzNS0wMGUzLTQ1YTctYjY2YS1lMzM1ODc1YjQ5ODYiLCJzdWIiOiJiZW5AZ3RpLmltIiwiZXhwIjoxODY5NzQwNDkwLCJpc3MiOiJodHRwczovL2dpZnR1cC5hcHAvIiwiYXVkIjoiaHR0cHM6Ly9naWZ0dXAuYXBwLyJ9.0yrgQ5naXkILzfAKVwCWht6h2hZx5KmtI0eIKAd5ZXM")
	]

	orders = orders.sort((a, b) => {
		return new Date(a.createdOn) - new Date(b.createdOn);
	})

	res.status(200).json(orders)
}
