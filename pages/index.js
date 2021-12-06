import { Component } from "react";
import axios from 'axios';
import moment from 'moment';
import Repository from "../data/repository.js";

class Home extends Component {

	state = {
		loading: true,
		orders: [],
		input: "",
		active: ""
	}

	async componentDidMount() {
		window.addEventListener("keypress", this.keyPress);
		await this.fetchOrders();
	}

	fetchOrders = async () => {
		const orders = await axios.get("/api/orders");
		await this.setState({
			loading: false,
			orders: orders.data
		})
		await this.selectOrder(orders.data[0]?.id)
	}

	selectOrder = async (id) => {
		this.setState({
			active: id
		})
	}

	updateAddressTo = async (event) => {
		let orders = this.state.orders.map((order) => {
			return {
				...order,
				addressTo: order.id === event.target.name ? event.target.value : order.addressTo
			}
		})

		this.setState({ orders })
	}

	updateAddress = async (event) => {
		let orders = this.state.orders.map((order) => {
			return {
				...order,
				address: order.id === event.target.name ? event.target.value : order.address
			}
		})

		this.setState({ orders })
	}

	updateTo = async (event) => {
		let orders = this.state.orders.map((order) => {
			return {
				...order,
				to: order.id === event.target.name ? event.target.value : order.to
			}
		})

		this.setState({ orders })
	}

	updateFrom = async (event) => {
		let orders = this.state.orders.map((order) => {
			return {
				...order,
				from: order.id === event.target.name ? event.target.value : order.from
			}
		})

		this.setState({ orders })
	}

	updateMessage = async (event) => {
		let orders = this.state.orders.map((order) => {
			return {
				...order,
				message: order.id === event.target.name ? event.target.value : order.message
			}
		})

		this.setState({ orders })
	}

	updateCode = async (event) => {
		let order = this.state.orders.filter((order) => {
			return order.id === this.state.active
		})[0];
		let giftCards = order.giftCards.map((giftCard) => {
			return {
				...giftCard,
				code: giftCard.oldCode === event.target.name ? event.target.value : giftCard.code
			}
		});

		let orders = this.state.orders.map((order) => {
			return {
				...order,
				giftCards: order.id === this.state.active ? giftCards : order.giftCards
			}
		})

		this.setState({ orders });
	}

	printAddress = async () => {
		const order = this.state.orders.filter((order) => {
			return order.id === this.state.active
		})[0];

		let data = {
			to: order.addressTo,
			address: order.address
		};
		if(order.supplier === "HARBOURLIGHTS"){
			data.template = "HarbourLightsAddress";
		} else if(order.supplier === "LOVEIOM"){
			data.template = "LoveIOMAddress";
		}

		await axios.post("http://localhost:1000/", data);
	}

	printCardCarrier = async () => {
		const order = this.state.orders.filter((order) => {
			return order.id === this.state.active
		})[0];

		let data = {};
		data.to = order.to;
		data.to = order.to?.length ? `To: ${order.to}` : "";
		data.message = order.message;
		data.expiry = order.expiry;

		if(order.supplier === "HARBOURLIGHTS"){
			data.item = order.giftCards[0].description;
			data.description = order.giftCards[0].subTitle;

			if(order.selectedRecipient === "SomeoneElse"){
				data.template = "HarbourLightsGift";
				data.from = order.from?.length ? `From: ${order.from}` : "";
			} else {
				data.template = "HarbourLightsSelf";
			}
		} else if(order.supplier === "LOVEIOM"){
			data.value = parseFloat(order.giftCards[0].initialValue).toFixed(2);

			if(order.selectedRecipient === "SomeoneElse"){
				data.template = "LoveIOMGift";
				data.from = order.from?.length ? `From: ${order.from}` : "";

			} else {
				data.template = "LoveIOMSelf";
			}
		}

		await axios.post("http://localhost:1000/", data);
	}

	fulfil = async () => {
		try {
			const order = this.state.orders.filter((order) => {
				return order.id === this.state.active
			})[0];

			const codes = order.giftCards.map((giftCard) => {
				if(!giftCard.code) throw new Error("Gift Card Missing");
				if(order.supplier === "LOVEIOM" && ((giftCard.code.length !== 6) || (giftCard.code.charAt(1) !== "P"))) throw new Error("Wrong Card Scanned");
				if(order.supplier === "HARBOURLIGHTS" && giftCard.code.length !== 8) throw new Error("Wrong Card Scanned");

				return {
					oldCode: giftCard.oldCode,
					newCode: giftCard.code
				}
			})

			const duplicatesRemoved = codes.filter((order, index, array) => {
				return array.findIndex(o => o.newCode == order.newCode) == index
			});

			if(duplicatesRemoved.length !== codes.length) throw new Error("Duplicate Cards Scanned");

			await Repository.fulfilOrder(order.id, order.supplier, codes);

			await this.fetchOrders();
		} catch(error){
			alert(error);
		}
	}

	render() {
		const order = this.state.orders.filter((order) => {
			return order.id === this.state.active
		})[0];

		return (
			<div className="container">
				<div className="orders">
					<h1>Orders ({this.state.orders.length})</h1>
					{this.state.loading && <p>Loading...</p>}
					<div className={this.state.loading ? "loading" : ""}>
						{this.state.orders.length ?
							this.state.orders.map((order) => {
								return (
									<div className={`order ${this.state.active === order.id ? "active" : ""}`} onClick={this.selectOrder.bind(this, order.id)}>
										<p>{order.supplier} #{order.orderNumber}</p>
										<p>{order.purchaserName} ({order.purchaserEmail})</p>
										<p>{order.giftCards.length} Card{order.giftCards.length > 1 ? "s" : ""}</p>
										<p>{moment(order.createdOn).format("HH:mm on DD MMMM YYYY")}</p>
									</div>
								)
							})
							: !this.state.loading ?
								<div className="order">
									<p>No Orders To Show</p>
								</div>
							:
								""
						}
					</div>
				</div>
				{order && !this.state.loading &&
					<div className="drawer">
						<div>
							<h2>{order.supplier} #{order.orderNumber}</h2>
							<p>{moment(order.createdOn).format("HH:mm on DD MMMM YYYY")}</p>
							<p>{order.purchaserName} ({order.purchaserEmail})</p>
						</div>
						<div>
							<h2>1. Address Label</h2>
							<input type="text" value={order.addressTo} name={order.id} onChange={this.updateAddressTo} />
							<textarea value={order.address} name={order.id} onChange={this.updateAddress} />
							<button onClick={this.printAddress}>Print Address Label</button>
						</div>
						<div>
							<h2>2. Card Carrier Label</h2>

							{order.selectedRecipient === "SomeoneElse" &&
								<div className="field">
									<p>From:</p>
									<input type="text" value={order.from} name={order.id} onChange={this.updateFrom} />
								</div>
							}

							<div className="field">
								<p>To:</p>
								<input type="text" value={order.to} name={order.id} onChange={this.updateTo} />
							</div>

							{order.supplier === "LOVEIOM" ?
								<div className="field">
									<p>Value:</p>
									<input type="text" value={`£${parseFloat(order.giftCards[0].initialValue).toFixed(2)}`} disabled={true} />
								</div>
							:
								<>
									<div className="field">
										<p>Item:</p>
										<input type="text" value={order.giftCards[0].description} disabled={true} />
									</div>

									<div className="field">
										<p>Description:</p>
										<textarea value={order.giftCards[0].subTitle} disabled={true} />
									</div>
								</>
							}

							<div className="field">
								<p>Expiry:</p>
								<input type="text" value={order.expiry} disabled={true} />
							</div>

							{order.selectedRecipient === "SomeoneElse" &&
								<div className="field">
									<p>Gift Message:</p>
									<textarea value={order.message} name={order.id} onChange={this.updateMessage}/>
								</div>
							}

							<button onClick={this.printCardCarrier}>Print Card Carrier Label</button>
						</div>
						<div>
							<h2>3. Fulfil Order</h2>
							{order.giftCards.map((giftCard) => {
								return (
									<div className="giftCard">
										<p>{giftCard.oldCode}</p>

										<p>></p>

										<input type="text" value={giftCard.code} onChange={this.updateCode} name={giftCard.oldCode} />
									</div>
								)
							})}
							<button onClick={this.fulfil}>Mark as Fulfilled</button>
						</div>
					</div>
				}
			</div>
		)
	}
}

export default Home;
