import fees from '../json/fees.json';
import orders from '../json/orders.json';
import { Fee, OrderItem } from './interfaces';

/* 
    This function is to get the fee info from fees.json using order type 
    (Real Property Recording or Birth Certificate)
*/
function getOrderItemDetails(orderType: string) {
    return fees.filter((feeItem) => {
        return feeItem.order_item_type === orderType;
    }).shift();
}

function getOrderItemAmounts(orderItemDetails: OrderItem, pages: number) {
    // This is the total of the single order
    let total = 0;
    if(pages > 1) {
        // I will get the fee amounts for additional pages
        if (orderItemDetails.fees !== undefined) {
            const extraPages: string = orderItemDetails.fees.filter((fee: Fee) => {
                return fee.type === 'per-page';
            }).shift()?.amount!;
            const amount = parseInt(extraPages) * (pages - 1);
            total += amount;
        }
    }
    // I will get the fee amounts for the first page
    const pageAmount: string = orderItemDetails.fees.filter((fee: Fee) => {
        return fee.type === 'flat';
    }).shift()?.amount!;
    total += parseInt(pageAmount);

    // Returning the total
    return total;
}

function getPricesOfEachOrder() {
    orders.forEach((order) => {
        console.log(`Order ID: ${order.order_number}`);
        // This will be the total of each Order Id
        let total = 0;
        order.order_items.forEach((orderItem, index) => {
            const pages = orderItem.pages;
            const orderItemType = orderItem.type;
            // Get item details by order-item type
            const orderItemDetails = getOrderItemDetails(orderItemType);
            // Getting the amount of single order
            const amount = getOrderItemAmounts(orderItemDetails!, pages);
            // Adding the amount of a single order-item to the total count, then I will display it
            total += amount;
            console.log(`Order Item ${index + 1}: $${amount}`);
        })
        // This is the total amount of the order
        console.log(`Order total: $${total}`);
    })
}

function getDistByOrderItem(orderItemDetails: OrderItem, multiplier: number) {
    const distribAmount: number[] = []
    orderItemDetails.distributions.forEach((distribution) => {
        // Displaying the fund detail and their amount, taking care of the number of reports in the order (multiplier)
        const funds = `Fund ${distribution.name} - $${parseInt(distribution.amount) * multiplier}`
        console.log(funds);
        distribAmount.push(parseInt(distribution.amount) * multiplier)
    });
    // This array with distributions will be util for calculating the totals by fee
    return distribAmount;
}

function getDistributions() {
    // These two arrays will store the totals by fund, for Real Property Recording & Birth Certificate
    let totalRealPropRecords: number[] = [0,0,0,0];
    let totalDistBirthCerts: number[] = [0,0,0,0];
    orders.forEach((order) => {
        console.log(`Order ID: ${order.order_number}`);
        
        // I will count how many Real Prop Recording and Birth Certs are in a Order
        const countRealProp = order.order_items.filter((obj) => obj.type === 'Real Property Recording').length;
        const countBirthCerts = order.order_items.filter((obj) => obj.type === 'Birth Certificate').length;

        if (countRealProp > 0) {
            // Getting info from fees.json for Real Property Recording
            const orderItemInfo = getOrderItemDetails('Real Property Recording');
            // Getting the distribution amounts
            const distributions = getDistByOrderItem(orderItemInfo!, countRealProp);
            // Adding the new distribution amounts to the total count in line 71
            const sum = totalRealPropRecords.map((number, index) => {
                return (number + distributions[index]);
            });
            totalRealPropRecords = sum;
        }

        if (countBirthCerts > 0) {
            // Getting info from fees.json for Birth Certificate
            const orderItemInfo = getOrderItemDetails('Birth Certificate');
            // Getting the distribution amounts
            const distributions = getDistByOrderItem(orderItemInfo!, countBirthCerts);
            // Adding the "Other" fund
            const otherFunds = 1 * countBirthCerts;
            console.log(`Fund Other - $${otherFunds}`);
            distributions.push(otherFunds);
            // Adding the new distribution amounts to the total count in line 71
            const sum = totalDistBirthCerts.map((number, index) => {
                return (number + distributions[index]);
            });
            totalDistBirthCerts = sum;
        }
    });
    // Displaying the total distributions for the Real Property Recording and Birth Certificate
    console.log("Total distributions")
    console.log(`
        Fund Recording Fee - $${totalRealPropRecords[0]}
        Fund Records Management and Preservation Fee - $${totalRealPropRecords[1]}
        Fund Records Archive Fee - $${totalRealPropRecords[2]}
        Fund Courthouse Security - $${totalRealPropRecords[3]}
    `);
    console.log(`
        Fund County Clerk Fee - $${totalDistBirthCerts[0]}
        Fund Vital Statistics Fee - $${totalDistBirthCerts[1]}
        Fund Vital Statistics Preservation Fee - $${totalDistBirthCerts[2]}
        Fund Other - $${totalDistBirthCerts[3]}
    `);
}

function main() {
    getPricesOfEachOrder();
    console.log('**--------**')
    getDistributions();
}

main();