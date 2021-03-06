import Repository from "./repository.js";
import moment from "moment";
import Posted from "../posted.js";

const getOrders = async (supplier, apiKey) => {
	try {
		let giftCards = [];
		const limit = 100;
		let offset = 0;
		let stop = false;

		do {
			const response = await Repository.getGiftCards(apiKey, limit, offset);
			giftCards.push(...response.data.giftCards);

			if(response.data.hasMore){
				offset = offset + limit;
			} else {
				stop = true;
			}
		} while(!stop);

		giftCards = giftCards.filter((giftCard) => {
			return !giftCard.fulfilledOn && giftCard.postalFulfilment;
		})
		giftCards = giftCards.map((giftCard) => {
			return {
				...giftCard,
				supplier
			};
		})

		let orders = giftCards.map((giftCard) => {
			return {
				...giftCard.order,
				supplier: giftCard.supplier
			}
		}).filter((order, index, array) => {
			return array.findIndex(o => o.id == order.id) == index
		});

		orders = orders.filter((order) => {
			if(order.supplier === "HARBOURLIGHTS"){
				return !Posted.includes(order.orderNumber);
			} else {
				return true;
			}
		})

		orders = orders.map((order) => {
			let cards = [];

			giftCards.forEach((giftCard) => {
				if(giftCard.orderId === order.id) cards.push({
					...giftCard,
					description: giftCard.description.includes("Choose an amount...") ? giftCard.description.split("Choose an amount...")[0] + "Gift Card" : giftCard.description,
					oldCode: giftCard.code,
					code: ""
				})
			})

			const addressTo = cards[0].postalFulfilment.address.name;
			const address = `${cards[0].postalFulfilment.address.address1 ? cards[0].postalFulfilment.address.address1 : ""}\r\n${cards[0].postalFulfilment.address.address2 ? cards[0].postalFulfilment.address.address2 : ""}\r\n${cards[0].postalFulfilment.address.city ? cards[0].postalFulfilment.address.city : ""}\r\n${cards[0].postalFulfilment.address.state ? cards[0].postalFulfilment.address.state : ""}\r\n${cards[0].postalFulfilment.address.postalCode ? cards[0].postalFulfilment.address.postalCode.toUpperCase() : ""}`;
			const message = cards[0].message;
			const to = cards[0].recipientName ? cards[0].recipientName : order.purchaserName;
			const from = order.purchaserName;
			const expiry = moment(giftCards[0].expiresOn).format("DD MMMM YYYY")

			return {
				...order,
				addressTo,
				address,
				message,
				to,
				from,
				expiry,
				giftCards: cards
			}
		})

		return orders;
	} catch(error) {
		throw error;
	}
}

export {
	getOrders
}