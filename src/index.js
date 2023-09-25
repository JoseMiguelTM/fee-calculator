const fees = require('../json/fees.json');
const orders = require('../json/orders.json');

function getOrderItemDetails(orderType) {
    return fees.filter((feeItem) => {
        return feeItem.order_item_type === orderType;
    }).shift();
}

function getOrderItemAmounts(orderFees, pages) {
    return orderFees.fees.filter((orderFee) => {
        if(pages > 1) {
            return orderFee.type === 'per-page'
        } else {
            return orderFee.type === 'flat'
        }
    }).shift().amount;
}

function getPricesOfEachOrder() {
    orders.forEach((order) => {
        console.log(`Order ID: ${order.order_number}`);
        let total = 0;
        order.order_items.forEach((orderItem) => {
            const pages = orderItem.pages;
            if (pages > 1) {
                const orderItemType = orderItem.type;
                const orderItemFees = getOrderItemDetails(orderItemType);
                const amounts = getOrderItemAmounts(orderItemFees, pages);
                console.log(amounts);
            }
        })
        // console.log(total)
    })
}

function main() {
    getPricesOfEachOrder();
}

main();