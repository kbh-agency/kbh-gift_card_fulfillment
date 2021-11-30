import Repository from "./repository.js";
import moment from "moment";
import Posted from "../posted.js";

const getOrders = async (supplier, apiKey) => {
	try {
		let giftCards = await Repository.getGiftCards(apiKey, 100, 0);
		giftCards = giftCards.data.giftCards;
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
			return !Posted.includes(order.orderNumber);
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
			const expiry = order.supplier === "LOVEIOM" ? "04 January 2023" : moment(giftCards[0].expiresOn).format("DD MMMM YYYY")

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